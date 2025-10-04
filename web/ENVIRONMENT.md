# Environment Variables Configuration

This document describes the environment variables used by the GovChain web application for secure configuration.

## Required Environment Variables

### Blockchain Configuration
- `CHAIN_ID`: The blockchain chain identifier (default: "govchain")
- `BLOCKCHAIN_NODE`: RPC endpoint for blockchain node (default: "tcp://localhost:26657")
- `BLOCKCHAIN_API`: REST API endpoint for blockchain (default: "http://localhost:1317")

### Security-Critical Variables
These variables contain sensitive information and should be secured in production:

- `BLOCKCHAIN_SUBMITTER`: Account name for submitting transactions (default: "alice")
- `BLOCKCHAIN_KEYRING_BACKEND`: Keyring backend type (default: "test")
- `BLOCKCHAIN_BINARY`: Path to the blockchain binary (default: "~/govchain-blockchain/govchaind")

### IPFS Configuration
- `IPFS_API_URL`: IPFS API endpoint (default: "http://localhost:5001")
- `IPFS_GATEWAY_URL`: IPFS gateway for file access (default: "http://localhost:8080")

### Public Variables (Safe for client-side)
- `NEXT_PUBLIC_APP_NAME`: Application display name
- `NEXT_PUBLIC_BLOCKCHAIN_API`: Public blockchain API endpoint
- `NEXT_PUBLIC_IPFS_GATEWAY`: Public IPFS gateway URL
- `NEXT_PUBLIC_INDEXER_API`: Public indexer API endpoint

## Setup Instructions

### Local Development
1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` as needed for your local setup.

### Production Deployment
1. Set environment variables securely through your deployment platform
2. Never commit `.env.local` or production `.env` files to version control
3. Use secure secret management for `BLOCKCHAIN_SUBMITTER` and `BLOCKCHAIN_KEYRING_BACKEND`

## Security Best Practices

1. **Account Security**: The `BLOCKCHAIN_SUBMITTER` should be a dedicated service account with minimal required permissions
2. **Keyring Backend**: In production, consider using more secure keyring backends than "test"
3. **Access Control**: Ensure blockchain node and IPFS endpoints are properly secured
4. **Environment Isolation**: Use different accounts and endpoints for development/staging/production

## Docker Deployment

When using Docker Compose, environment variables are configured in the `docker-compose.yml` file. For production:

1. Create a separate `docker-compose.prod.yml` with production values
2. Use Docker secrets or external configuration management
3. Override default values with secure production credentials

**Note for Docker deployment**: The `BLOCKCHAIN_BINARY` path needs to be accessible within the container. Consider:
- Mounting the blockchain binary as a volume
- Installing the blockchain binary within the container
- Using a blockchain service accessible via network APIs instead of local binary