# Status Script Documentation

The `scripts/status.sh` script provides comprehensive health checking for your GovChain deployment.

## Quick Start

```bash
# Basic status check
./scripts/status.sh

# Verbose output with full details
./scripts/status.sh -v

# Show detailed dataset information
./scripts/status.sh -d

# Show help
./scripts/status.sh -h
```

## What It Checks

### 🔧 Basic Connectivity
- ✅ Blockchain binary exists and is executable
- ✅ Blockchain node connectivity (RPC)
- ✅ Blockchain REST API accessibility
- ✅ IPFS API connectivity
- ✅ IPFS Gateway functionality
- ✅ Indexer service health

### 📊 Blockchain Status
- Node information and sync status
- Available keyring accounts
- Chain configuration details
- Block height and network info

### 🗃️ Dataset Module
- Dataset module availability
- Parameter configuration
- Dataset count and sample data
- CLI query functionality

### 🔍 Search Service
- Indexer health status
- Search functionality testing
- Result count verification
- API response validation

## Environment Variables

You can customize the script behavior with these environment variables:

```bash
# Blockchain configuration
export CHAIN_ID="govchain"
export NODE_URL="tcp://localhost:26657"
export API_URL="http://localhost:1317"

# Service endpoints
export INDEXER_URL="http://localhost:9002"
export IPFS_API="http://localhost:5001"
export IPFS_GATEWAY="http://localhost:8080"

# Binary location
export BLOCKCHAIN_BINARY="~/govchain-blockchain/govchaind"
```

## Common Issues and Solutions

### Blockchain Not Running
```bash
# Start the blockchain
cd ~/govchain-blockchain
./build/govchaind start
```

### IPFS Not Available
```bash
# Initialize and start IPFS
ipfs init
ipfs daemon
```

### Indexer Service Down
```bash
# Check Docker services
docker-compose ps
docker-compose logs indexer
```

### Web App "Not Implemented" Error

If your web app shows "not implemented", check:

1. **Blockchain API accessibility**:
   ```bash
   curl http://localhost:1317/govchain/datasets/v1/entry
   ```

2. **Environment variables in web app**:
   - Check `.env.local` has correct `BLOCKCHAIN_API` URL
   - Verify `BLOCKCHAIN_SUBMITTER` account exists

3. **CORS issues**:
   - REST API should allow cross-origin requests
   - Check browser developer tools for CORS errors

4. **Dataset module**:
   - Verify module is properly installed in blockchain
   - Check if any datasets exist to query

## Expected Output

### ✅ Healthy System
```
🔧 Basic Connectivity Tests
==================================
🧪 Blockchain binary exists... ✓ PASS
🧪 Blockchain node connectivity... ✓ PASS
🧪 Blockchain REST API... ✓ PASS
🧪 IPFS API connectivity... ✓ PASS
🧪 IPFS Gateway... ✓ PASS
🧪 Indexer service health... ✓ PASS

📊 Blockchain Status Information
==================================
✓ Found 3 datasets

🎉 All systems operational!
```

### ⚠️ Issues Found
```
🔧 Basic Connectivity Tests
==================================
🧪 Blockchain binary exists... ✓ PASS
🧪 Blockchain node connectivity... ✗ FAIL
🧪 Blockchain REST API... ✗ FAIL

⚠️ Some tests failed. Common fixes:
🔧 If blockchain tests failed:
  • Start the blockchain: cd ~/govchain-blockchain && ./build/govchaind start
```

## Integration with CI/CD

You can use this script in automated testing:

```bash
# Exit code 0 = all tests passed
# Exit code > 0 = number of failed tests
./scripts/status.sh
echo "Exit code: $?"
```

## Debugging Web App Issues

When the web app shows "not implemented":

1. **Run status check**:
   ```bash
   ./scripts/status.sh -v
   ```

2. **Check specific endpoints**:
   ```bash
   # Test dataset listing
   curl -v http://localhost:1317/govchain/datasets/v1/entry
   
   # Test specific dataset
   curl -v http://localhost:1317/govchain/datasets/v1/entry/1
   ```

3. **Verify accounts**:
   ```bash
   ~/govchain-blockchain/govchaind keys list --keyring-backend test
   ```

4. **Check web app logs**:
   ```bash
   # If using Docker
   docker-compose logs web
   
   # If running locally
   npm run dev
   ```

This script gives you a complete picture of your GovChain system health and helps identify exactly where issues might be occurring.