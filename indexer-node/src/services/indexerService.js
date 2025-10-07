const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');
const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class IndexerService {
  constructor() {
    this.chromaClient = null;
    this.collection = null;
    this.openaiClient = null;
    this.blockchainAPI = process.env.BLOCKCHAIN_API || 'http://localhost:1317';
    this.collectionName = process.env.COLLECTION_NAME || 'govchain_datasets';
    this.useOpenAI = false;
    this.chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
  }

  async initialize() {
    try {
      // Initialize Chroma client
      logger.info(`Connecting to Chroma at ${this.chromaUrl}...`);
      this.chromaClient = new ChromaClient({
        path: this.chromaUrl
      });

      // Test connection with retry logic
      let retries = 5;
      while (retries > 0) {
        try {
          await this.chromaClient.heartbeat();
          logger.info('Connected to Chroma successfully');
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            throw new Error(`Failed to connect to Chroma after 5 attempts: ${error.message}`);
          }
          logger.warn(`Chroma connection failed, retrying in 2s... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Initialize OpenAI if API key is provided
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        this.openaiClient = new OpenAI({ apiKey: openaiKey });
        this.useOpenAI = true;
        logger.info('OpenAI API key found, using real embeddings');
      } else {
        logger.info('No OpenAI API key, using Chroma default embeddings');
      }

      // Initialize collection
      await this.initCollection();

    } catch (error) {
      logger.error('Failed to initialize IndexerService:', error);
      throw error;
    }
  }

  async initCollection() {
    try {
      // Try to get existing collection
      try {
        this.collection = await this.chromaClient.getCollection({
          name: this.collectionName
        });
        logger.info(`Collection '${this.collectionName}' already exists`);
      } catch (error) {
        // Collection doesn't exist, create it
        logger.info(`Creating collection '${this.collectionName}'...`);

        this.collection = await this.chromaClient.createCollection({
          name: this.collectionName,
          metadata: {
            description: 'OpenGovChain datasets vector search collection',
            created: new Date().toISOString()
          }
        });
        logger.info('Collection created successfully');
      }
    } catch (error) {
      logger.error('Failed to initialize collection:', error);
      throw error;
    }
  }

  async generateEmbedding(text) {
    if (this.useOpenAI) {
      return await this.generateOpenAIEmbedding(text);
    }
    // Return null to let Chroma handle embedding generation
    return null;
  }

  async generateOpenAIEmbedding(text) {
    try {
      const response = await this.openaiClient.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('OpenAI embedding error:', error);
      throw new Error(`Failed to generate OpenAI embedding: ${error.message}`);
    }
  }

  async indexDataset(dataset) {
    try {
      // Create searchable text
      const searchText = [
        dataset.title,
        dataset.description,
        dataset.agency,
        dataset.category
      ].filter(Boolean).join(' ');

      // Prepare document data - let Chroma handle embeddings
      const documentData = {
        ids: [dataset.id],
        documents: [searchText],
        metadatas: [{
          id: dataset.id,
          title: dataset.title,
          description: dataset.description,
          ipfsCid: dataset.ipfsCid,
          fileSize: dataset.fileSize,
          checksumSha256: dataset.checksumSha256,
          agency: dataset.agency,
          category: dataset.category,
          submitter: dataset.submitter,
          timestamp: dataset.timestamp,
          pinCount: dataset.pinCount
        }]
      };

      // Upsert document
      await this.collection.upsert(documentData);

      logger.info(`Indexed dataset: ${dataset.id} - ${dataset.title}`);
    } catch (error) {
      logger.error(`Failed to index dataset ${dataset.id}:`, error);
      throw error;
    }
  }

  async fetchAndIndexAll() {
    try {
      const url = `${this.blockchainAPI}/govchain/datasets/v1/entry`;
      logger.info(`Fetching datasets from ${url}`);

      const response = await axios.get(url, {
        timeout: 30000 // 30 second timeout
      });

      if (response.status !== 200) {
        throw new Error(`Blockchain API returned status ${response.status}`);
      }

      const { Dataset: datasets } = response.data;

      if (!datasets || !Array.isArray(datasets)) {
        logger.warn('No datasets found in blockchain response');
        return;
      }

      logger.info(`Found ${datasets.length} datasets to index`);

      // Index datasets in batches
      const batchSize = 10;
      for (let i = 0; i < datasets.length; i += batchSize) {
        const batch = datasets.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(dataset => this.indexDataset(dataset))
        );

        // Small delay between batches
        if (i + batchSize < datasets.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info(`Indexing completed for ${datasets.length} datasets`);
    } catch (error) {
      if (error.response && error.response.status === 501) {
        logger.warn('Blockchain API endpoint not yet implemented - skipping indexing');
        return;
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        logger.warn('Blockchain API not available - skipping indexing');
        return;
      }
      logger.error('Failed to fetch and index datasets:', error.message);
      // Don't throw - let the service continue running
    }
  }

  async searchDatasets({ query, limit = 10, agency, category }) {
    try {
      // Build where clause for filtering
      let whereClause = {};
      if (agency || category) {
        if (agency && category) {
          whereClause = {
            $and: [
              { agency: { $eq: agency } },
              { category: { $eq: category } }
            ]
          };
        } else if (agency) {
          whereClause = { agency: { $eq: agency } };
        } else if (category) {
          whereClause = { category: { $eq: category } };
        }
      }

      // Prepare query parameters
      const queryParams = {
        nResults: limit,
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        queryTexts: [query] // Always use query text, let Chroma handle embeddings
      };

      // Perform search
      const results = await this.collection.query(queryParams);

      // Transform results
      const datasets = [];
      const { ids, documents, metadatas, distances } = results;

      if (ids && ids[0]) {
        for (let i = 0; i < ids[0].length; i++) {
          const metadata = metadatas[0][i];
          datasets.push({
            id: metadata.id,
            title: metadata.title,
            description: metadata.description,
            ipfsCid: metadata.ipfsCid,
            fileSize: metadata.fileSize,
            checksumSha256: metadata.checksumSha256,
            agency: metadata.agency,
            category: metadata.category,
            submitter: metadata.submitter,
            timestamp: metadata.timestamp,
            pinCount: metadata.pinCount,
            score: distances ? distances[0][i] : undefined
          });
        }
      }

      return {
        query,
        count: datasets.length,
        results: datasets
      };
    } catch (error) {
      logger.error('Search failed:', error);
      throw error;
    }
  }

  async getCollectionInfo() {
    try {
      const count = await this.collection.count();
      return {
        name: this.collectionName,
        count,
        embeddingModel: this.useOpenAI ? 'text-embedding-ada-002' : 'chroma-default'
      };
    } catch (error) {
      logger.error('Failed to get collection info:', error);
      throw error;
    }
  }

  async close() {
    // Chroma client doesn't need explicit cleanup
    logger.info('IndexerService closed');
  }
}

module.exports = IndexerService;