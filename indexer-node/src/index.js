const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

const IndexerService = require('./services/indexerService');
const logger = require('./utils/logger');

class IndexerApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.indexer = null;

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Origin', 'Content-Type'],
      credentials: true
    }));

    // Logging
    this.app.use(morgan('combined'));

    // JSON parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'govchain-indexer',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Search endpoint
    this.app.get('/search', async (req, res) => {
      try {
        const { q: query, limit = 10, agency, category } = req.query;

        if (!query) {
          return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const results = await this.indexer.searchDatasets({
          query,
          limit: parseInt(limit),
          agency,
          category
        });

        res.json(results);
      } catch (error) {
        logger.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
      }
    });

    // Manual reindex endpoint
    this.app.post('/reindex', async (req, res) => {
      try {
        // Run reindexing in background
        setImmediate(async () => {
          try {
            await this.indexer.fetchAndIndexAll();
            logger.info('Manual reindexing completed');
          } catch (error) {
            logger.error('Manual reindexing failed:', error);
          }
        });

        res.json({ message: 'Reindexing started' });
      } catch (error) {
        logger.error('Reindex trigger error:', error);
        res.status(500).json({ error: 'Failed to trigger reindexing' });
      }
    });

    // Collection info endpoint
    this.app.get('/collection/info', async (req, res) => {
      try {
        const info = await this.indexer.getCollectionInfo();
        res.json(info);
      } catch (error) {
        logger.error('Collection info error:', error);
        res.status(500).json({ error: 'Failed to get collection info' });
      }
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  async initialize() {
    try {
      // Initialize indexer service
      this.indexer = new IndexerService();
      await this.indexer.initialize();

      // Setup polling schedule (every 30 seconds)
      const pollingInterval = process.env.POLLING_INTERVAL || '*/30 * * * * *';
      cron.schedule(pollingInterval, async () => {
        try {
          await this.indexer.fetchAndIndexAll();
        } catch (error) {
          logger.error('Scheduled indexing failed:', error.message);
        }
      });

      logger.info(`Scheduled polling every 30 seconds`);

      // Initial indexing (non-blocking)
      try {
        await this.indexer.fetchAndIndexAll();
      } catch (error) {
        logger.warn('Initial indexing failed - service will continue running:', error.message);
      }

    } catch (error) {
      logger.error('Failed to initialize indexer:', error);
      throw error;
    }
  }

  async start() {
    try {
      await this.initialize();

      this.app.listen(this.port, () => {
        logger.info(`🚀 GovChain Indexer running on port ${this.port}`);
        logger.info(`📊 Health check: http://localhost:${this.port}/health`);
        logger.info(`🔍 Search endpoint: http://localhost:${this.port}/search?q=<query>`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    logger.info('Shutting down gracefully...');
    if (this.indexer) {
      await this.indexer.close();
    }
    process.exit(0);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  if (app) await app.shutdown();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received');
  if (app) await app.shutdown();
});

// Start the application
const app = new IndexerApp();
app.start().catch(error => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

module.exports = IndexerApp;