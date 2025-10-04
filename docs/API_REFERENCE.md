# GovChain API Reference

Complete API documentation for GovChain services.

## Blockchain REST API

Base URL: `http://localhost:1317` (development)

### List All Datasets

```http
GET /govchain/datasets/v1/entry
```

**Response:**
```json
{
  "Dataset": [
    {
      "id": "1",
      "title": "Climate Data 2024",
      "description": "Annual climate measurements",
      "ipfsCid": "QmXxx...",
      "fileSize": "1024000",
      "checksumSha256": "abc123...",
      "agency": "NOAA",
      "category": "climate",
      "submitter": "cosmos1xxx...",
      "timestamp": "1704067200",
      "pinCount": "3"
    }
  ],
  "pagination": {
    "next_key": null,
    "total": "1"
  }
}
```

### Get Dataset by ID

```http
GET /govchain/datasets/v1/entry/{id}
```

**Parameters:**
- `id` (path) - Dataset ID

**Response:**
```json
{
  "Dataset": {
    "id": "1",
    "title": "Climate Data 2024",
    ...
  }
}
```

### Get Datasets by Agency

```http
GET /govchain/datasets/v1/entrys-by-agency/{agency}
```

**Parameters:**
- `agency` (path) - Agency name (e.g., "NOAA", "CDC")

**Response:**
```json
{
  "datasets": [...]
}
```

### Submit Transaction

```http
POST /cosmos/tx/v1beta1/txs
```

**Body:**
```json
{
  "tx": {...},
  "mode": "BROADCAST_MODE_SYNC"
}
```

Use CLI for easier transaction submission:
```bash
govchaind tx datasets create-dataset \
  "Title" "Description" "CID" 1024 "checksum" "Agency" "Category" \
  --from alice --chain-id govchain --yes
```

## Search Indexer API

Base URL: `http://localhost:3000` (development)

### Search Datasets

```http
GET /search?q={query}&limit={limit}&agency={agency}&category={category}
```

**Parameters:**
- `q` (required) - Search query string
- `limit` (optional) - Number of results (default: 10)
- `agency` (optional) - Filter by agency
- `category` (optional) - Filter by category

**Example:**
```bash
curl "http://localhost:3000/search?q=climate&limit=5&agency=NOAA"
```

**Response:**
```json
{
  "query": "climate",
  "count": 5,
  "results": [
    {
      "id": "1",
      "title": "Climate Data 2024",
      "description": "Annual climate measurements",
      "ipfsCid": "QmXxx...",
      "fileSize": 1024000,
      "checksumSha256": "abc123...",
      "agency": "NOAA",
      "category": "climate",
      "submitter": "cosmos1xxx...",
      "timestamp": 1704067200,
      "pinCount": 3
    }
  ]
}
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "govchain-indexer"
}
```

### Manual Reindex

```http
POST /reindex
```

Triggers a manual reindexing of all datasets from the blockchain.

**Response:**
```json
{
  "message": "Reindexing started"
}
```

## IPFS Gateway API

### Download File

```http
GET https://ipfs.io/ipfs/{CID}
```

**Alternative Gateways:**
- `https://cloudflare-ipfs.com/ipfs/{CID}`
- `https://gateway.pinata.cloud/ipfs/{CID}`
- `http://localhost:8080/ipfs/{CID}` (local)

**Example:**
```bash
curl -O https://ipfs.io/ipfs/QmXxx...
```

### Add File (Local)

```bash
ipfs add <file>
```

**Response:**
```
added QmXxx... <filename>
```

### Pin File (Local)

```bash
ipfs pin add <CID>
```

## CLI Commands

### Blockchain Commands

**Query all datasets:**
```bash
govchaind query datasets list-datasets
```

**Query specific dataset:**
```bash
govchaind query datasets get-dataset 1
```

**Query by agency:**
```bash
govchaind query datasets datasets-by-agency NOAA
```

**Create dataset:**
```bash
govchaind tx datasets create-dataset \
  "Title" \
  "Description" \
  "QmXxx..." \
  1024000 \
  "abc123..." \
  "NOAA" \
  "climate" \
  --from alice \
  --chain-id govchain \
  --yes
```

**Pin dataset:**
```bash
govchaind tx datasets pin-dataset 1 \
  --from bob \
  --chain-id govchain \
  --yes
```

### IPFS Commands

**Initialize:**
```bash
ipfs init
```

**Start daemon:**
```bash
ipfs daemon
```

**Add file:**
```bash
ipfs add myfile.csv
```

**Get file:**
```bash
ipfs get QmXxx...
```

**Pin file:**
```bash
ipfs pin add QmXxx...
```

**List pins:**
```bash
ipfs pin ls
```

## Error Codes

### Blockchain Errors

| Code | Message | Description |
|------|---------|-------------|
| 2 | invalid IPFS CID | CID format is invalid |
| 3 | invalid checksum | SHA-256 checksum format is invalid |
| 4 | dataset not found | Dataset ID doesn't exist |
| 5 | already pinned | User already pinned this dataset |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limits

Development environment has no rate limits.

Production recommendations:
- Search API: 100 requests/minute per IP
- Blockchain API: 1000 requests/minute per IP
- IPFS Gateway: 10 GB/day per IP

## Authentication

Current version: **No authentication required**

All endpoints are publicly accessible for reading.

Dataset submission requires a blockchain account with tokens for transaction fees.

## Webhooks

Not currently supported. Use polling or WebSocket subscriptions for real-time updates.

## SDKs

### JavaScript/TypeScript

```javascript
// Search datasets
const response = await fetch('http://localhost:3000/search?q=climate');
const data = await response.json();
console.log(data.results);

// Get dataset from blockchain
const response = await fetch('http://localhost:1317/govchain/datasets/v1/entry/1');
const dataset = await response.json();

// Download from IPFS
window.open(`https://ipfs.io/ipfs/${dataset.Dataset.ipfsCid}`);
```

### Python

```python
import requests

# Search datasets
response = requests.get('http://localhost:3000/search', params={'q': 'climate'})
results = response.json()['results']

# Get dataset
response = requests.get('http://localhost:1317/govchain/datasets/v1/entry/1')
dataset = response.json()['Dataset']

# Download from IPFS
import urllib.request
urllib.request.urlretrieve(
    f"https://ipfs.io/ipfs/{dataset['ipfsCid']}", 
    'dataset.csv'
)
```

### Go

```go
package main

import (
    "encoding/json"
    "net/http"
)

type SearchResponse struct {
    Query   string    `json:"query"`
    Results []Dataset `json:"results"`
}

func searchDatasets(query string) (*SearchResponse, error) {
    resp, err := http.Get("http://localhost:3000/search?q=" + query)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result SearchResponse
    err = json.NewDecoder(resp.Body).Decode(&result)
    return &result, err
}
```

## Support

- **Documentation**: https://docs.govchain.io
- **GitHub Issues**: https://github.com/govchain/govchain/issues
- **Discord**: https://discord.gg/govchain

## Changelog

### v1.0.0 (2025-10-04)
- Initial API release
- Blockchain REST endpoints
- Vector search API
- IPFS integration
