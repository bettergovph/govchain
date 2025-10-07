# Getting Started with OpenGovChain Blockchain

This guide will help you set up and run your own OpenGovChain blockchain node, whether as a validator or for development purposes.

## 🔧 Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows with WSL2
- **CPU**: 2+ cores recommended
- **Memory**: 4GB+ RAM recommended
- **Storage**: 20GB+ available space
- **Network**: Reliable internet connection

### Required Software
- **Go**: Version 1.19 or later
- **Git**: For version control
- **Ignite CLI**: Cosmos blockchain development tool

## 📦 Installation

### 1. Install Go
```bash
# Download and install Go (if not already installed)
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

### 2. Install Ignite CLI
```bash
curl https://get.ignite.com/cli! | bash
```

### 3. Build the Blockchain
```bash
# Navigate to your blockchain directory
cd ~/govchain-blockchain

# Build the blockchain
ignite chain build

# This creates: govchaind
```

## 🚀 Quick Start

### Option A: New Blockchain Network
If you're starting a new network:

```bash
# Setup the blockchain environment
./setup-env.sh

# Start the blockchain
ignite chain serve
```

### Option B: Join Existing Network
If joining an existing OpenGovChain network:

```bash
# Use the volunteer node script
./join-as-volunteer.sh my-node-name https://example.com/genesis.json

# Start your node
govchaind start
```

## 📝 Basic Operations

### Starting the Blockchain
```bash
# Development mode (with auto-reload)
ignite chain serve

# Production mode
govchaind start

# With custom configuration
govchaind start --home ~/.govchain
```

### Creating Your First Dataset Entry
```bash
# Upload a dataset file
./scripts/upload-dataset.sh \
  "/path/to/file.csv" \
  "Budget Data 2024" \
  "Annual budget allocations" \
  "treasury" \
  "finance"
```

### Querying Data
```bash
# List all entries
govchaind query datasets list-entry

# Show specific entry
govchaind query datasets show-entry 1

# Query by agency
govchaind query datasets entries-by-agency treasury

# Query by category
govchaind query datasets entries-by-category finance

# Query by file type
govchaind query datasets entries-by-mimetype text/csv
```

## 🏛️ Government Agency Setup

### For Government Departments
Government agencies can set up their own nodes or use existing infrastructure:

#### 1. Department Node Setup
```bash
# Initialize department node
govchaind init dept-treasury --chain-id govchain

# Create department keys
govchaind keys add treasury-admin --keyring-backend test

# Join the network (get genesis from main network)
curl -s https://your-network.com/genesis.json > ~/.govchain/config/genesis.json

# Start your department node
govchaind start
```

#### 2. Dataset Submission Workflow
```bash
# 1. Prepare dataset file
# Ensure file is clean, well-formatted, and public-appropriate

# 2. Upload to IPFS (automatic via script)
./scripts/upload-dataset.sh \
  "budget-2024.csv" \
  "Department Budget 2024" \
  "Detailed budget breakdown for fiscal year 2024" \
  "treasury" \
  "budget"

# 3. Verify submission
govchaind query datasets entries-by-agency treasury
```

## 🔧 Advanced Configuration

### Custom Chain Configuration
Edit `config.yml` to customize your blockchain:

```yaml
build:
  main: ./cmd/govchaind
  
validation:
  validation_enabled: true
  
rpc:
  laddr: "tcp://0.0.0.0:26657"
  
p2p:
  laddr: "tcp://0.0.0.0:26656"
```

### Environment Variables
```bash
# Custom home directory
export GOVCHAIN_HOME=~/.govchain

# Chain ID
export CHAIN_ID=govchain

# Keyring backend
export KEYRING_BACKEND=test
```

### Production Deployment
For production deployments:

1. **Secure Keys**: Use `file` or `os` keyring backend
2. **Firewall**: Configure appropriate port access
3. **Monitoring**: Set up node health monitoring
4. **Backup**: Regular backup of validator keys and data
5. **Updates**: Subscribe to network upgrade notifications

## 🌐 Network Participation

### Becoming a Validator
```bash
# Create validator transaction
govchaind tx staking create-validator \
  --amount=1000000stake \
  --pubkey=$(govchaind tendermint show-validator) \
  --moniker="my-validator" \
  --chain-id=govchain \
  --commission-rate="0.05" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --from=validator \
  --keyring-backend=test
```

### Node Maintenance
```bash
# Check node status
govchaind status

# View logs
journalctl -u govchaind -f

# Backup validator key
cp ~/.govchain/config/priv_validator_key.json ~/backup/

# Check synchronization
govchaind status | jq .sync_info
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear build cache
ignite chain build --clear-cache

# Update dependencies
go mod tidy
go mod download
```

#### Node Sync Issues
```bash
# Reset node data (CAUTION: This deletes all data)
govchaind unsafe-reset-all

# Re-download genesis
curl -s https://your-network.com/genesis.json > ~/.govchain/config/genesis.json
```

#### Transaction Failures
```bash
# Check account balance
govchaind query bank balances $(govchaind keys show validator -a --keyring-backend test)

# Check transaction
govchaind query tx <transaction-hash>
```

### Getting Help
- **Logs**: Check `~/.govchain/logs/` for detailed error information
- **Community**: Join the validator network discussions
- **Documentation**: Refer to technical implementation guides
- **Support**: Contact the development team for critical issues

## 📚 Next Steps

1. **Read Technical Implementation**: Understanding the blockchain architecture
2. **Configure Monitoring**: Set up node health and performance monitoring
3. **Join Community**: Connect with other node operators and validators
4. **Contribute**: Help improve the network and documentation

---

Ready to help build a transparent government data infrastructure! 🚀