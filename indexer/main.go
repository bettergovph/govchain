package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	openai "github.com/sashabaranov/go-openai"
	"github.com/qdrant/go-client/qdrant"
)

// Dataset represents a government dataset from the blockchain
type Dataset struct {
	ID             string `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	IpfsCid        string `json:"ipfsCid"`
	FileSize       uint64 `json:"fileSize"`
	ChecksumSha256 string `json:"checksumSha256"`
	Agency         string `json:"agency"`
	Category       string `json:"category"`
	Submitter      string `json:"submitter"`
	Timestamp      int64  `json:"timestamp"`
	PinCount       uint64 `json:"pinCount"`
}

// BlockchainResponse represents the response from blockchain API
type BlockchainResponse struct {
	Datasets   []Dataset `json:"Dataset"`
	Pagination struct {
		NextKey string `json:"next_key"`
		Total   string `json:"total"`
	} `json:"pagination"`
}

// SearchRequest represents a search query
type SearchRequest struct {
	Query    string `form:"q" binding:"required"`
	Limit    int    `form:"limit"`
	Agency   string `form:"agency"`
	Category string `form:"category"`
}

// SearchResponse represents search results
type SearchResponse struct {
	Query   string    `json:"query"`
	Count   int       `json:"count"`
	Results []Dataset `json:"results"`
}

// Indexer manages the vector search indexing
type Indexer struct {
	qdrantClient   *qdrant.Client
	openaiClient   *openai.Client
	blockchainAPI  string
	collectionName string
	useOpenAI      bool
}

// NewIndexer creates a new indexer instance
func NewIndexer() (*Indexer, error) {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	qdrantURL := getEnv("QDRANT_URL", "localhost:6333")
	blockchainAPI := getEnv("BLOCKCHAIN_API", "http://localhost:1317")
	openaiKey := os.Getenv("OPENAI_API_KEY")
	collectionName := getEnv("COLLECTION_NAME", "govchain_datasets")

	// Initialize Qdrant client
	log.Printf("Connecting to Qdrant at %s...", qdrantURL)
	qdrantClient, err := qdrant.NewClient(&qdrant.Config{
		Host: qdrantURL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Qdrant: %w", err)
	}

	// Initialize OpenAI client if API key is provided
	var openaiClient *openai.Client
	useOpenAI := false
	if openaiKey != "" {
		openaiClient = openai.NewClient(openaiKey)
		useOpenAI = true
		log.Println("OpenAI API key found, using real embeddings")
	} else {
		log.Println("No OpenAI API key, using pseudo-embeddings")
	}

	indexer := &Indexer{
		qdrantClient:   qdrantClient,
		openaiClient:   openaiClient,
		blockchainAPI:  blockchainAPI,
		collectionName: collectionName,
		useOpenAI:      useOpenAI,
	}

	// Initialize collection
	if err := indexer.initCollection(); err != nil {
		return nil, fmt.Errorf("failed to initialize collection: %w", err)
	}

	return indexer, nil
}

// initCollection creates the Qdrant collection if it doesn't exist
func (idx *Indexer) initCollection() error {
	ctx := context.Background()

	// Check if collection exists
	collections, err := idx.qdrantClient.ListCollections(ctx)
	if err != nil {
		return fmt.Errorf("failed to list collections: %w", err)
	}

	exists := false
	for _, col := range collections {
		if col.Name == idx.collectionName {
			exists = true
			break
		}
	}

	if !exists {
		log.Printf("Creating collection: %s", idx.collectionName)
		err = idx.qdrantClient.CreateCollection(ctx, &qdrant.CreateCollection{
			CollectionName: idx.collectionName,
			VectorsConfig: qdrant.NewVectorsConfig(&qdrant.VectorParams{
				Size:     1536, // OpenAI ada-002 dimension
				Distance: qdrant.Distance_Cosine,
			}),
		})
		if err != nil {
			return fmt.Errorf("failed to create collection: %w", err)
		}
		log.Println("Collection created successfully")
	} else {
		log.Println("Collection already exists")
	}

	return nil
}

// generateEmbedding creates a vector embedding for text
func (idx *Indexer) generateEmbedding(text string) ([]float32, error) {
	if idx.useOpenAI {
		return idx.generateOpenAIEmbedding(text)
	}
	return idx.generatePseudoEmbedding(text), nil
}

// generateOpenAIEmbedding uses OpenAI API for embeddings
func (idx *Indexer) generateOpenAIEmbedding(text string) ([]float32, error) {
	ctx := context.Background()
	resp, err := idx.openaiClient.CreateEmbeddings(ctx, openai.EmbeddingRequest{
		Input: []string{text},
		Model: openai.AdaEmbeddingV2,
	})
	if err != nil {
		return nil, fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("no embedding returned")
	}

	return resp.Data[0].Embedding, nil
}

// generatePseudoEmbedding creates a simple hash-based embedding (fallback)
func (idx *Indexer) generatePseudoEmbedding(text string) []float32 {
	// Simple deterministic pseudo-embedding based on text hash
	// This is just for testing without OpenAI API
	embedding := make([]float32, 1536)
	text = strings.ToLower(text)
	
	// Seed with text hash
	hash := 0
	for _, c := range text {
		hash = hash*31 + int(c)
	}
	
	rng := rand.New(rand.NewSource(int64(hash)))
	for i := range embedding {
		embedding[i] = rng.Float32()*2 - 1 // Range: -1 to 1
	}
	
	// Normalize
	var sum float32
	for _, v := range embedding {
		sum += v * v
	}
	norm := float32(1.0 / (float64(sum) + 0.0001))
	for i := range embedding {
		embedding[i] *= norm
	}
	
	return embedding
}

// indexDataset indexes a single dataset into Qdrant
func (idx *Indexer) indexDataset(dataset Dataset) error {
	ctx := context.Background()

	// Concatenate searchable text
	searchText := fmt.Sprintf("%s %s %s %s",
		dataset.Title,
		dataset.Description,
		dataset.Agency,
		dataset.Category,
	)

	// Generate embedding
	embedding, err := idx.generateEmbedding(searchText)
	if err != nil {
		return fmt.Errorf("failed to generate embedding: %w", err)
	}

	// Convert dataset ID to uint64
	datasetID, err := strconv.ParseUint(dataset.ID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid dataset ID: %w", err)
	}

	// Create point
	point := &qdrant.PointStruct{
		Id: qdrant.NewIDNum(datasetID),
		Vectors: qdrant.NewVectors(embedding...),
		Payload: qdrant.NewValueMap(map[string]any{
			"id":             dataset.ID,
			"title":          dataset.Title,
			"description":    dataset.Description,
			"ipfsCid":        dataset.IpfsCid,
			"fileSize":       dataset.FileSize,
			"checksumSha256": dataset.ChecksumSha256,
			"agency":         dataset.Agency,
			"category":       dataset.Category,
			"submitter":      dataset.Submitter,
			"timestamp":      dataset.Timestamp,
			"pinCount":       dataset.PinCount,
		}),
	}

	// Upsert point
	_, err = idx.qdrantClient.Upsert(ctx, &qdrant.UpsertPoints{
		CollectionName: idx.collectionName,
		Points:         []*qdrant.PointStruct{point},
	})
	if err != nil {
		return fmt.Errorf("failed to upsert point: %w", err)
	}

	log.Printf("Indexed dataset: %s - %s", dataset.ID, dataset.Title)
	return nil
}

// fetchAndIndexAll fetches all datasets from blockchain and indexes them
func (idx *Indexer) fetchAndIndexAll() error {
	url := fmt.Sprintf("%s/govchain/datasets/dataset", idx.blockchainAPI)
	
	log.Printf("Fetching datasets from %s", url)
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to fetch datasets: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("blockchain API returned status %d: %s", resp.StatusCode, string(body))
	}

	var blockchainResp BlockchainResponse
	if err := json.NewDecoder(resp.Body).Decode(&blockchainResp); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	log.Printf("Found %d datasets to index", len(blockchainResp.Datasets))

	// Index each dataset
	for _, dataset := range blockchainResp.Datasets {
		if err := idx.indexDataset(dataset); err != nil {
			log.Printf("Error indexing dataset %s: %v", dataset.ID, err)
			continue
		}
	}

	return nil
}

// startPolling starts the background polling worker
func (idx *Indexer) startPolling(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		// Initial fetch
		if err := idx.fetchAndIndexAll(); err != nil {
			log.Printf("Initial indexing error: %v", err)
		}

		// Periodic polling
		for range ticker.C {
			if err := idx.fetchAndIndexAll(); err != nil {
				log.Printf("Polling error: %v", err)
			}
		}
	}()
	log.Printf("Started polling blockchain every %v", interval)
}

// searchDatasets performs semantic search
func (idx *Indexer) searchDatasets(req SearchRequest) (*SearchResponse, error) {
	ctx := context.Background()

	// Generate query embedding
	embedding, err := idx.generateEmbedding(req.Query)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	// Set default limit
	limit := uint64(req.Limit)
	if limit == 0 {
		limit = 10
	}

	// Build filters
	var filter *qdrant.Filter
	if req.Agency != "" || req.Category != "" {
		conditions := []*qdrant.Condition{}
		
		if req.Agency != "" {
			conditions = append(conditions, &qdrant.Condition{
				ConditionOneOf: &qdrant.Condition_Field{
					Field: &qdrant.FieldCondition{
						Key: "agency",
						Match: &qdrant.Match{
							MatchValue: &qdrant.Match_Keyword{
								Keyword: req.Agency,
							},
						},
					},
				},
			})
		}
		
		if req.Category != "" {
			conditions = append(conditions, &qdrant.Condition{
				ConditionOneOf: &qdrant.Condition_Field{
					Field: &qdrant.FieldCondition{
						Key: "category",
						Match: &qdrant.Match{
							MatchValue: &qdrant.Match_Keyword{
								Keyword: req.Category,
							},
						},
					},
				},
			})
		}
		
		filter = &qdrant.Filter{
			Must: conditions,
		}
	}

	// Search
	searchResult, err := idx.qdrantClient.Query(ctx, &qdrant.QueryPoints{
		CollectionName: idx.collectionName,
		Query:          qdrant.NewQuery(embedding...),
		Limit:          &limit,
		Filter:         filter,
		WithPayload:    qdrant.NewWithPayload(true),
	})
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	// Convert results
	results := make([]Dataset, 0, len(searchResult))
	for _, point := range searchResult {
		payload := point.GetPayload()
		
		dataset := Dataset{
			ID:             getStringFromPayload(payload, "id"),
			Title:          getStringFromPayload(payload, "title"),
			Description:    getStringFromPayload(payload, "description"),
			IpfsCid:        getStringFromPayload(payload, "ipfsCid"),
			FileSize:       getUint64FromPayload(payload, "fileSize"),
			ChecksumSha256: getStringFromPayload(payload, "checksumSha256"),
			Agency:         getStringFromPayload(payload, "agency"),
			Category:       getStringFromPayload(payload, "category"),
			Submitter:      getStringFromPayload(payload, "submitter"),
			Timestamp:      getInt64FromPayload(payload, "timestamp"),
			PinCount:       getUint64FromPayload(payload, "pinCount"),
		}
		results = append(results, dataset)
	}

	return &SearchResponse{
		Query:   req.Query,
		Count:   len(results),
		Results: results,
	}, nil
}

// Helper functions to extract values from Qdrant payload
func getStringFromPayload(payload map[string]*qdrant.Value, key string) string {
	if val, ok := payload[key]; ok {
		if strVal := val.GetStringValue(); strVal != "" {
			return strVal
		}
	}
	return ""
}

func getUint64FromPayload(payload map[string]*qdrant.Value, key string) uint64 {
	if val, ok := payload[key]; ok {
		if intVal := val.GetIntegerValue(); intVal != 0 {
			return uint64(intVal)
		}
	}
	return 0
}

func getInt64FromPayload(payload map[string]*qdrant.Value, key string) int64 {
	if val, ok := payload[key]; ok {
		return val.GetIntegerValue()
	}
	return 0
}

// getEnv gets environment variable with default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	log.Println("Starting GovChain Indexer...")

	// Create indexer
	indexer, err := NewIndexer()
	if err != nil {
		log.Fatalf("Failed to create indexer: %v", err)
	}

	// Start polling
	pollingInterval := 30 * time.Second
	indexer.startPolling(pollingInterval)

	// Setup REST API
	router := gin.Default()

	// Enable CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"service": "govchain-indexer",
		})
	})

	// Search endpoint
	router.GET("/search", func(c *gin.Context) {
		var req SearchRequest
		if err := c.ShouldBindQuery(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		results, err := indexer.searchDatasets(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, results)
	})

	// Manual reindex endpoint
	router.POST("/reindex", func(c *gin.Context) {
		go func() {
			if err := indexer.fetchAndIndexAll(); err != nil {
				log.Printf("Manual reindex error: %v", err)
			}
		}()
		c.JSON(http.StatusOK, gin.H{"message": "Reindexing started"})
	})

	// Start server
	port := getEnv("PORT", "3000")
	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
