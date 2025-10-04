# GovChain Indexer

Vector search service for GovChain datasets using Qdrant and OpenAI embeddings.

## Features

- Polls blockchain API for new datasets
- Generates semantic embeddings
- Stores vectors in Qdrant
- Provides REST API for search
- Supports filtering by agency and category

## Prerequisites

- Go 1.21+
- Qdrant running (Docker or local)
- GovChain blockchain running

## Setup

```bash
# Install dependencies
go mod download

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Running

### Local Development

```bash
# Start Qdrant
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant

# Run indexer
go run main.go
```

### Docker

```bash
# Build image
docker build -t govchain-indexer .

# Run container
docker run -p 3000:3000 --env-file .env govchain-indexer
```

## API Endpoints

### Search Datasets

```bash
GET /search?q=climate&limit=10&agency=NOAA&category=environment

Response:
{
  "query": "climate",
  "count": 5,
  "results": [
    {
      "id": "1",
      "title": "Climate Data 2024",
      "description": "Annual climate measurements",
      "ipfsCid": "QmXxx...",
      "agency": "NOAA",
      "category": "environment"
    }
  ]
}
```

### Health Check

```bash
GET /health

Response:
{
  "status": "healthy",
  "service": "govchain-indexer"
}
```

### Manual Reindex

```bash
POST /reindex

Response:
{
  "message": "Reindexing started"
}
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| QDRANT_URL | Qdrant connection string | localhost:6333 |
| BLOCKCHAIN_API | Blockchain REST endpoint | http://localhost:1317 |
| OPENAI_API_KEY | OpenAI API key (optional) | - |
| COLLECTION_NAME | Qdrant collection name | govchain_datasets |
| PORT | Server port | 3000 |

## Architecture

```
Blockchain API → Indexer → Qdrant
                    ↓
                REST API → Frontend
```

1. **Polling**: Fetches datasets from blockchain every 30 seconds
2. **Embedding**: Generates 1536-dim vectors (OpenAI or pseudo)
3. **Storage**: Upserts to Qdrant collection
4. **Search**: Semantic similarity search with filters

## Development

### Adding New Fields

1. Update `Dataset` struct in `main.go`
2. Add field to payload in `indexDataset()`
3. Extract field in `searchDatasets()`

### Changing Polling Interval

Edit `pollingInterval` in `main()`:

```go
pollingInterval := 60 * time.Second // Change to 60 seconds
```

## Troubleshooting

### "Failed to connect to Qdrant"

- Ensure Qdrant is running: `docker ps`
- Check QDRANT_URL in .env
- Verify port 6333 is accessible

### "Blockchain API returned status 404"

- Ensure blockchain is running
- Check BLOCKCHAIN_API in .env
- Verify endpoint: `curl http://localhost:1317/govchain/datasets/dataset`

### "No embedding returned"

- Check OPENAI_API_KEY is valid
- Or remove key to use pseudo-embeddings
- Check API quota/limits

## License

MIT
