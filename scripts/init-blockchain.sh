#!/bin/bash

# GovChain Blockchain Initialization Script
# Creates the Cosmos blockchain with custom datasets module

set -e

echo "================================"
echo "GovChain Blockchain Initialization"
echo "================================"
echo ""

# Check if Ignite is installed
if ! command -v ignite &> /dev/null; then
    echo "❌ Error: Ignite CLI not found. Please run install-prerequisites.sh first"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "PROJECT.md" ]; then
    echo "❌ Error: Please run this script from the govchain root directory"
    exit 1
fi

# Ask user for blockchain directory location
echo "Where would you like to create the blockchain?"
echo "(This avoids path conflicts with the current project directory)"
echo ""
read -p "Enter path [default: $HOME/govchain-blockchain]: " BLOCKCHAIN_PATH

# Use default if no input provided
if [ -z "$BLOCKCHAIN_PATH" ]; then
    BLOCKCHAIN_PATH="$HOME/govchain-blockchain"
fi

# Expand tilde to home directory if used
BLOCKCHAIN_PATH=$(eval echo "$BLOCKCHAIN_PATH")

echo "📍 Blockchain will be created at: $BLOCKCHAIN_PATH"
echo ""

# Remove existing blockchain directory if it exists
if [ -d "$BLOCKCHAIN_PATH" ]; then
    echo "⚠️  Existing blockchain directory found at $BLOCKCHAIN_PATH"
    read -p "Remove it and continue? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo "Removing existing directory..."
        rm -rf "$BLOCKCHAIN_PATH"
    else
        echo "Cancelled. If you want to continue with existing directory, please remove it manually."
        exit 1
    fi
fi

# Create parent directory if it doesn't exist
mkdir -p "$(dirname "$BLOCKCHAIN_PATH")"

# Create blockchain project in the specified directory
echo "🔧 Creating new Cosmos blockchain: govchain"
PARENT_DIR="$(dirname "$BLOCKCHAIN_PATH")"
BLOCKCHAIN_NAME="$(basename "$BLOCKCHAIN_PATH")"

cd "$PARENT_DIR"
ignite scaffold chain govchain --path "$BLOCKCHAIN_NAME" --no-module

cd "$BLOCKCHAIN_PATH"

# Initialize git repository and make initial commit to avoid scaffolding prompts
echo "💾 Initializing git repository..."
git init

# Only add and commit if there are changes
if ! git diff --cached --quiet 2>/dev/null || ! git diff --quiet 2>/dev/null; then
    git add .
    git commit -m "Initial blockchain scaffold" || echo "⚠️  No changes to commit"
else
    echo "⚠️  No changes to commit, continuing..."
fi

echo "🔧 Creating custom datasets module..."
ignite scaffold module datasets
git add . && git commit -m "Add datasets module" || echo "⚠️  No changes to commit for datasets module"

echo "🔧 Adding CreateDataset message type..."
ignite scaffold message create-dataset \
    title:string \
    description:string \
    ipfsCid:string \
    mimeType:string \
    fileName:string \
    fileUrl:string \
    fallbackUrl:string \
    fileSize:uint \
    checksumSha256:string \
    agency:string \
    category:string \
    --module datasets \
    --response datasetId:uint
git add . && git commit -m "Add CreateDataset message type" || echo "⚠️  No changes to commit for CreateDataset"

echo "🔧 Adding PinDataset message type..."
ignite scaffold message pin-dataset \
    datasetId:uint \
    --module datasets
git add . && git commit -m "Add PinDataset message type" || echo "⚠️  No changes to commit for PinDataset"

echo "🔧 Adding Dataset storage type..."
ignite scaffold list stored-dataset \
    title:string \
    description:string \
    ipfsCid:string \
    mimeType:string \
    fileName:string \
    fileUrl:string \
    fallbackUrl:string \
    fileSize:uint \
    checksumSha256:string \
    agency:string \
    category:string \
    submitter:string \
    timestamp:int \
    pinCount:uint \
    --module datasets
git add . && git commit -m "Add StoredDataset storage type" || echo "⚠️  No changes to commit for Dataset storage"

echo "🔧 Adding queries..."
ignite scaffold query stored-datasets-by-agency agency:string --module datasets
ignite scaffold query stored-datasets-by-category category:string --module datasets
ignite scaffold query stored-datasets-by-mimetype mimeType:string --module datasets
git add . && git commit -m "Add dataset queries" || echo "⚠️  No changes to commit for queries"

# Copy essential project files from the setup directory
echo "📋 Copying project files and dependencies..."
SETUP_DIR="$OLDPWD"

# Copy Docker Compose and related infrastructure
cp "$SETUP_DIR/docker-compose.yml" .
cp -r "$SETUP_DIR/indexer" .
cp -r "$SETUP_DIR/web" .

# Copy documentation
cp "$SETUP_DIR/README.md" .
cp "$SETUP_DIR/PROJECT.md" .
cp "$SETUP_DIR/GETTING_STARTED.md" .
cp "$SETUP_DIR/TECHNICAL_IMPLEMENTATION.md" .
cp "$SETUP_DIR/LICENSE" .

# Copy scripts (make them relative to blockchain directory)
mkdir -p scripts
cp "$SETUP_DIR/scripts/upload-dataset.sh" scripts/
cp "$SETUP_DIR/scripts/quick-start.sh" scripts/ 2>/dev/null || echo "⚠️  quick-start.sh not found, skipping"
cp "$SETUP_DIR/scripts/fix-dependencies.sh" scripts/ 2>/dev/null || echo "⚠️  fix-dependencies.sh not found, skipping"

# Update upload-dataset.sh to work from blockchain directory
sed -i.bak 's|govchaind|./build/govchaind|g' scripts/upload-dataset.sh 2>/dev/null || \
sed -i 's|govchaind|./build/govchaind|g' scripts/upload-dataset.sh 2>/dev/null || true

echo "✅ Project files copied successfully"

# Create a setup script for the blockchain directory
cat > setup-env.sh << 'EOF'
#!/bin/bash

# GovChain Blockchain Environment Setup (Tokenless Configuration)
# Run this script after building the blockchain

set -e

echo "================================"
echo "GovChain Environment Setup (Tokenless)"
echo "================================"
echo ""

# Check if blockchain is built
if [ ! -f "./build/govchaind" ]; then
    echo "⚠️  Blockchain not built yet. Building now..."
    ignite chain build
fi

# Initialize blockchain if not already done
if [ ! -d "$HOME/.govchain" ]; then
    echo "🔧 Initializing tokenless blockchain..."
    ./build/govchaind init mynode --chain-id govchain
    
    # Create validator key (no tokens needed)
    ./build/govchaind keys add validator --keyring-backend test
    
    # Create a tokenless genesis configuration
    # No genesis accounts with stake tokens needed for tokenless network
    echo "📝 Configuring tokenless genesis..."
    
    # Modify genesis.json for tokenless operation
    GENESIS_FILE="$HOME/.govchain/config/genesis.json"
    
    # Set minimal staking parameters (validators don't need tokens)
    jq '.app_state.staking.params.bond_denom = ""' "$GENESIS_FILE" > tmp.json && mv tmp.json "$GENESIS_FILE"
    jq '.app_state.gov.params.min_deposit = []' "$GENESIS_FILE" > tmp.json && mv tmp.json "$GENESIS_FILE"
    jq '.app_state.mint.minter.inflation = "0.000000000000000000"' "$GENESIS_FILE" > tmp.json && mv tmp.json "$GENESIS_FILE"
    
    # Create genesis transaction without staking tokens
    ./build/govchaind genesis gentx validator 1000000stake --chain-id govchain --keyring-backend test
    
    # Collect genesis transactions
    ./build/govchaind genesis collect-gentxs
    
    echo "✅ Tokenless blockchain configured!"
    echo "🌐 Volunteers can join as validators without tokens"
fi

echo "✅ Blockchain environment ready!"
echo ""
echo "To start the blockchain:"
echo "  ignite chain serve"
echo ""
echo "To start supporting services:"
echo "  docker-compose up -d"
echo ""
echo "📋 Volunteer Node Operators:"
echo "  - No tokens required to participate"
echo "  - Governance is based on data contribution"
echo "  - Validators secure the network through consensus"
echo ""
EOF

chmod +x setup-env.sh
echo "📋 Created setup-env.sh script"

# Create volunteer node joining script
cat > join-as-volunteer.sh << 'EOF'
#!/bin/bash

# GovChain Volunteer Node Setup
# Allows volunteers to join the network as validators without tokens

set -e

echo "================================"
echo "GovChain Volunteer Node Setup"
echo "================================"
echo ""

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <node-name> <genesis-file-url>"
    echo ""
    echo "Example:"
    echo "  $0 volunteer-node-1 https://raw.githubusercontent.com/org/govchain/main/genesis.json"
    echo ""
    exit 1
fi

NODE_NAME="$1"
GENESIS_URL="$2"

echo "📝 Node Name: $NODE_NAME"
echo "🌐 Genesis URL: $GENESIS_URL"
echo ""

# Check if blockchain is built
if [ ! -f "./build/govchaind" ]; then
    echo "❌ Error: Blockchain not built. Please run: ignite chain build"
    exit 1
fi

# Initialize node
echo "🔧 Initializing volunteer node..."
./build/govchaind init "$NODE_NAME" --chain-id govchain

# Download genesis file
echo "📥 Downloading genesis file..."
curl -s "$GENESIS_URL" > "$HOME/.govchain/config/genesis.json"

# Create validator key
echo "🔑 Creating validator key..."
./build/govchaind keys add validator --keyring-backend test

# Get validator address
VALIDATOR_ADDR=$(./build/govchaind keys show validator -a --keyring-backend test)

echo ""
echo "✅ Volunteer node setup complete!"
echo "================================"
echo ""
echo "📝 Node Details:"
echo "  Name: $NODE_NAME"
echo "  Validator Address: $VALIDATOR_ADDR"
echo ""
echo "🚀 To start your volunteer node:"
echo "  ./build/govchaind start"
echo ""
echo "🌐 To become a validator:"
echo "  ./build/govchaind tx staking create-validator \\"
echo "    --amount=1000000stake \\"
echo "    --pubkey=\$(./build/govchaind tendermint show-validator) \\"
echo "    --moniker=\"$NODE_NAME\" \\"
echo "    --chain-id=govchain \\"
echo "    --from=validator \\"
echo "    --keyring-backend=test"
echo ""
EOF

chmod +x join-as-volunteer.sh
echo "📋 Created join-as-volunteer.sh script"

# Create network configuration documentation
cat > NETWORK_CONFIG.md << 'EOF'
# GovChain Network Configuration

## Tokenless Architecture

GovChain operates as a **tokenless blockchain** designed for public good:

### Key Principles
- **No Economic Barriers**: Volunteers can participate without purchasing tokens
- **Data-Driven Governance**: Decisions based on data quality and community consensus
- **Public Service Mission**: Focus on transparency and government accountability

### Volunteer Node Operators

#### How to Join
1. **Build the blockchain**: `ignite chain build`
2. **Join as volunteer**: `./join-as-volunteer.sh <node-name> <genesis-url>`
3. **Start your node**: `./build/govchaind start`

#### Requirements
- Reliable internet connection
- Basic server hardware (2+ cores, 4GB+ RAM)
- Commitment to network uptime
- Storage for blockchain data

#### Responsibilities
- Validate transactions
- Participate in consensus
- Maintain node uptime
- Support data integrity

### Future Tokenomics

Tokenomics will be introduced later based on:
- Network growth and stability
- Community governance decisions
- Sustainable incentive mechanisms
- Regulatory compliance

### Data Submission

Government datasets can be submitted without tokens:
- Upload to IPFS
- Submit metadata to blockchain
- Community validates quality
- No fees for public data

### Governance Model

Decisions made through:
- **Volunteer Consensus**: Node operators vote
- **Data Quality Metrics**: Contribution-based weight
- **Public Input**: Community proposals
- **Transparency**: All decisions on-chain

EOF

echo "📋 Created NETWORK_CONFIG.md documentation"

# Navigate to the blockchain directory
echo ""
echo "🔄 Navigating to blockchain directory..."
cd "$BLOCKCHAIN_PATH"

echo ""
echo "================================"
echo "✅ Tokenless Blockchain Setup Complete!"
echo "================================"
echo ""
echo "📍 Current location: $(pwd)"
echo "📁 Project files available: docker-compose.yml, indexer/, web/, docs, scripts/"
echo ""
echo "🌐 Tokenless Network Features:"
echo "  • No tokens required for participation"
echo "  • Volunteer-operated validator network"
echo "  • Data-driven governance model"
echo "  • Public good mission focus"
echo ""
echo "🚀 Next Steps (run these commands):"
echo ""
echo "1. Complete blockchain setup:"
echo "   ./setup-env.sh"
echo ""
echo "2. Start the blockchain:"
echo "   ignite chain serve"
echo ""
echo "3. In another terminal, start supporting services:"
echo "   docker-compose up -d"
echo ""
echo "4. Upload your first dataset:"
echo "   ./scripts/upload-dataset.sh <file> <title> <description> <agency> <category>"
echo ""
echo "5. Share with volunteers:"
echo "   ./join-as-volunteer.sh"
echo ""
echo "6. Read network documentation:"
echo "   cat NETWORK_CONFIG.md"
echo ""
echo "💡 You are now in the blockchain directory. Start with step 1!"
echo ""
