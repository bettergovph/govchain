#!/bin/bash

# GovChain Blockchain Initialization Script
# Creates the Cosmos blockchain with custom datasets module

set -e

# Auto-confirm Ignite CLI prompts
export IGNITE_CLI_AUTO_CONFIRM=true

echo "================================"
echo "GovChain Blockchain Initialization"
echo "================================"
echo ""
echo "⚠️  WARNING: This script will create a new blockchain project"
echo "   Make sure you understand blockchain development before proceeding."
echo "   This will scaffold a complete Cosmos SDK blockchain with custom modules."
echo ""
read -p "Do you want to continue? (y/N): " proceed
if [ "$proceed" != "y" ] && [ "$proceed" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi
echo ""

# Check if Ignite is installed
if ! command -v ignite &> /dev/null; then
    echo "❌ Error: Ignite CLI not found. Please run install-prerequisites.sh first"
    exit 1
fi

# Check if we're in the right directory
# if [ ! -f "PROJECT.md" ]; then
#     echo "❌ Error: Please run this script from the govchain root directory"
#     exit 1
# fi

# Store the current directory (govchain project root) for later use
GOVCHAIN_PROJECT_DIR="$(pwd)"
export GOVCHAIN_PROJECT_DIR

# Ask for chain name
echo "Blockchain Configuration:"
read -p "Enter blockchain name [default: govchain]: " CHAIN_NAME

# Use default if no input provided
if [ -z "$CHAIN_NAME" ]; then
    CHAIN_NAME="govchain"
fi

# Validate chain name (alphanumeric and hyphens only)
if ! echo "$CHAIN_NAME" | grep -qE '^[a-zA-Z0-9-]+$'; then
    echo "❌ Error: Chain name must contain only letters, numbers, and hyphens"
    exit 1
fi

echo "📋 Chain name: $CHAIN_NAME"
echo ""

# Ask user for blockchain directory location
echo "Directory Configuration:"
read -p "Enter blockchain directory path [default: $HOME/$CHAIN_NAME-blockchain]: " BLOCKCHAIN_PATH

# Use default if no input provided
if [ -z "$BLOCKCHAIN_PATH" ]; then
    BLOCKCHAIN_PATH="$HOME/$CHAIN_NAME-blockchain"
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
echo "🔧 Creating new Cosmos blockchain: $CHAIN_NAME"
PARENT_DIR="$(dirname "$BLOCKCHAIN_PATH")"
BLOCKCHAIN_NAME="$(basename "$BLOCKCHAIN_PATH")"

cd "$PARENT_DIR"
ignite scaffold chain "$CHAIN_NAME" --path "$BLOCKCHAIN_NAME" --no-module

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
ignite scaffold module datasets --yes
git add . && git commit -m "Add datasets module" || echo "⚠️  No changes to commit for datasets module"

echo "🔧 Adding Entry map with CRUD operations..."
ignite scaffold map entry \
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
    --module datasets \
    --yes
git add . && git commit -m "Add Entry map with CRUD operations" || echo "⚠️  No changes to commit for Entry map"

echo "🔧 Adding dataset queries..."
ignite scaffold query entries-by-agency agency:string --module datasets --yes
ignite scaffold query entries-by-category category:string --module datasets --yes
ignite scaffold query entries-by-mimetype mimeType:string --module datasets --yes
git add . && git commit -m "Add dataset queries" || echo "⚠️  No changes to commit for queries"

# Copy essential project files from the setup directory
echo "📋 Copying project documentation and scripts..."
# Get the original govchain project directory (where the script was run from)
if [ -n "$GOVCHAIN_PROJECT_DIR" ]; then
    SETUP_DIR="$GOVCHAIN_PROJECT_DIR"
else
    # Fallback: assume script is in scripts/ subdirectory of project
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    SETUP_DIR="$(dirname "$SCRIPT_DIR")"
fi

echo "📁 Copying from: $SETUP_DIR"

# Copy documentation and scripts only (Docker services stay in original project)
cp "$SETUP_DIR/README.md" .
cp "$SETUP_DIR/GETTING_STARTED.md" .
cp "$SETUP_DIR/TECHNICAL_IMPLEMENTATION.md" .

# Copy scripts (make them relative to blockchain directory)
mkdir -p scripts
cp "$SETUP_DIR/scripts/quick-start.sh" scripts/ 2>/dev/null || echo "⚠️  quick-start.sh not found, skipping"
cp "$SETUP_DIR/scripts/upload-dataset.sh" scripts/ 2>/dev/null || echo "⚠️  upload-dataset.sh not found, skipping"

# Update upload-dataset.sh to work from blockchain directory with new entry structure
if [ -f "scripts/upload-dataset.sh" ]; then
    sed -i.bak "s|govchaind|./build/${CHAIN_NAME}d|g" scripts/upload-dataset.sh 2>/dev/null || \
    sed -i "s|govchaind|./build/${CHAIN_NAME}d|g" scripts/upload-dataset.sh 2>/dev/null || true
    sed -i.bak "s|--chain-id govchain|--chain-id $CHAIN_NAME|g" scripts/upload-dataset.sh 2>/dev/null || \
    sed -i "s|--chain-id govchain|--chain-id $CHAIN_NAME|g" scripts/upload-dataset.sh 2>/dev/null || true
    
    # Update message type from create-dataset to create-entry
    sed -i.bak "s|create-dataset|create-entry|g" scripts/upload-dataset.sh 2>/dev/null || \
    sed -i "s|create-dataset|create-entry|g" scripts/upload-dataset.sh 2>/dev/null || true
    
    echo "✅ Updated upload-dataset.sh for entry structure"
else
    echo "⚠️  upload-dataset.sh not found, skipping updates"
fi

echo "✅ Project files copied successfully"

# Fix config.yml to specify main package path
echo "🔧 Configuring build settings..."
if [ -f "config.yml" ]; then
    # Add build configuration if it doesn't exist
    if ! grep -q "build:" config.yml; then
        echo "" >> config.yml
        echo "build:" >> config.yml
        echo "  main: ./cmd/${CHAIN_NAME}d" >> config.yml
        echo "✅ Added build configuration to config.yml"
    else
        # Update existing build configuration
        sed -i.bak "s|main: .*|main: ./cmd/${CHAIN_NAME}d|g" config.yml 2>/dev/null || \
        sed -i "s|main: .*|main: ./cmd/${CHAIN_NAME}d|g" config.yml 2>/dev/null || true
        echo "✅ Updated build configuration in config.yml"
    fi
else
    echo "⚠️  config.yml not found, creating basic configuration..."
    cat > config.yml << EOF
build:
  main: ./cmd/${CHAIN_NAME}d
EOF
    echo "✅ Created config.yml with build configuration"
fi

# Create a setup script for the blockchain directory
cat > setup-env.sh << EOF
#!/bin/bash

# $CHAIN_NAME Blockchain Environment Setup (Tokenless Configuration)
# Run this script after building the blockchain

set -e

echo "================================"
echo "$CHAIN_NAME Environment Setup (Tokenless)"
echo "================================"
echo ""

# Check if blockchain is built
if [ ! -f "./build/${CHAIN_NAME}d" ]; then
    echo "⚠️  Blockchain not built yet. Building now..."
    ignite chain build
fi

# Initialize blockchain if not already done
if [ ! -d "\$HOME/.$CHAIN_NAME" ]; then
    echo "🔧 Initializing tokenless blockchain..."
    ./build/${CHAIN_NAME}d init mynode --chain-id $CHAIN_NAME
    
    # Create validator key (no tokens needed)
    ./build/${CHAIN_NAME}d keys add validator --keyring-backend test
    
    # Create a tokenless genesis configuration
    # No genesis accounts with stake tokens needed for tokenless network
    echo "📝 Configuring tokenless genesis..."
    
    # Modify genesis.json for tokenless operation
    GENESIS_FILE="\$HOME/.$CHAIN_NAME/config/genesis.json"
    
    # Set minimal staking parameters (validators don't need tokens)
    jq '.app_state.staking.params.bond_denom = ""' "\$GENESIS_FILE" > tmp.json && mv tmp.json "\$GENESIS_FILE"
    jq '.app_state.gov.params.min_deposit = []' "\$GENESIS_FILE" > tmp.json && mv tmp.json "\$GENESIS_FILE"
    jq '.app_state.mint.minter.inflation = "0.000000000000000000"' "\$GENESIS_FILE" > tmp.json && mv tmp.json "\$GENESIS_FILE"
    
    # Create genesis transaction without staking tokens
    ./build/${CHAIN_NAME}d genesis gentx validator 1000000stake --chain-id $CHAIN_NAME --keyring-backend test
    
    # Collect genesis transactions
    ./build/${CHAIN_NAME}d genesis collect-gentxs
    
    echo "✅ Tokenless blockchain configured!"
    echo "🌐 Volunteers can join as validators without tokens"
fi

echo "✅ Blockchain environment ready!"
echo ""
echo "To start the blockchain:"
echo "  ignite chain serve"
echo ""
echo "To start supporting services (run from original govchain directory):"
echo "  cd $SETUP_DIR && docker-compose up -d"
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
cat > join-as-volunteer.sh << EOF
#!/bin/bash

# $CHAIN_NAME Volunteer Node Setup
# Allows volunteers to join the network as validators without tokens

set -e

echo "================================"
echo "$CHAIN_NAME Volunteer Node Setup"
echo "================================"
echo ""

if [ "\$#" -lt 2 ]; then
    echo "Usage: \$0 <node-name> <genesis-file-url>"
    echo ""
    echo "Example:"
    echo "  \$0 volunteer-node-1 https://raw.githubusercontent.com/org/$CHAIN_NAME/main/genesis.json"
    echo ""
    exit 1
fi

NODE_NAME="\$1"
GENESIS_URL="\$2"

echo "📝 Node Name: \$NODE_NAME"
echo "🌐 Genesis URL: \$GENESIS_URL"
echo ""

# Check if blockchain is built
if [ ! -f "./build/${CHAIN_NAME}d" ]; then
    echo "❌ Error: Blockchain not built. Please run: ignite chain build"
    exit 1
fi

# Initialize node
echo "🔧 Initializing volunteer node..."
./build/${CHAIN_NAME}d init "\$NODE_NAME" --chain-id $CHAIN_NAME

# Download genesis file
echo "📥 Downloading genesis file..."
curl -s "\$GENESIS_URL" > "\$HOME/.$CHAIN_NAME/config/genesis.json"

# Create validator key
echo "🔑 Creating validator key..."
./build/${CHAIN_NAME}d keys add validator --keyring-backend test

# Get validator address
VALIDATOR_ADDR=\$(./build/${CHAIN_NAME}d keys show validator -a --keyring-backend test)

echo ""
echo "✅ Volunteer node setup complete!"
echo "================================"
echo ""
echo "📝 Node Details:"
echo "  Name: \$NODE_NAME"
echo "  Validator Address: \$VALIDATOR_ADDR"
echo ""
echo "🚀 To start your volunteer node:"
echo "  ./build/${CHAIN_NAME}d start"
echo ""
echo "🌐 To become a validator:"
echo "  ./build/${CHAIN_NAME}d tx staking create-validator \\\\"
echo "    --amount=1000000stake \\\\"
echo "    --pubkey=\\\$(./build/${CHAIN_NAME}d tendermint show-validator) \\\\"
echo "    --moniker=\"\$NODE_NAME\" \\\\"
echo "    --chain-id=$CHAIN_NAME \\\\"
echo "    --from=validator \\\\"
echo "    --keyring-backend=test"
echo ""
EOF

chmod +x join-as-volunteer.sh
echo "📋 Created join-as-volunteer.sh script"

# Create network configuration documentation
cat > NETWORK_CONFIG.md << EOF
# $CHAIN_NAME Network Configuration

## Tokenless Architecture

$CHAIN_NAME operates as a **tokenless blockchain** designed for public good:

### Key Principles
- **No Economic Barriers**: Volunteers can participate without purchasing tokens
- **Data-Driven Governance**: Decisions based on data quality and community consensus
- **Public Service Mission**: Focus on transparency and government accountability

### Volunteer Node Operators

#### How to Join
1. **Build the blockchain**: \`ignite chain build\`
2. **Join as volunteer**: \`./join-as-volunteer.sh <node-name> <genesis-url>\`
3. **Start your node**: \`./build/${CHAIN_NAME}d start\`

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
- Submit metadata to blockchain as entries
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
echo "🔄 Navigating to blockchain directory..."
cd "$BLOCKCHAIN_PATH"

echo ""
echo "================================"
echo "✅ Tokenless Blockchain Setup Complete!"
echo "================================"
echo ""
echo "📍 Current location: $(pwd)"
echo "📁 Project files available: documentation, scripts/"
echo "🐳 Docker services remain in: $GOVCHAIN_PROJECT_DIR"
echo ""
echo "🌐 Tokenless Network Features:"
echo "  • No tokens required for participation"
echo "  • Volunteer-operated validator network"
echo "  • Data-driven governance model"
echo "  • Public good mission focus"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Complete blockchain setup (in this directory):"
echo "   ./setup-env.sh"
echo ""
echo "2. Start the blockchain (in this directory):"
echo "   ignite chain serve"
echo ""
echo "3. Start supporting services (in separate terminal, from original project):"
echo "   cd $GOVCHAIN_PROJECT_DIR"
echo "   docker-compose up -d"
echo ""
echo "4. Upload your first dataset (from this directory):"
echo "   ./scripts/upload-dataset.sh <file> <title> <description> <agency> <category>"
echo ""
echo "5. Query entries:"
echo "   ./build/${CHAIN_NAME}d query datasets list-entry"
echo "   ./build/${CHAIN_NAME}d query datasets show-entry <id>"
echo "   ./build/${CHAIN_NAME}d query datasets entries-by-agency <agency>"
echo ""
echo "5. Share with volunteers:"
echo "   ./join-as-volunteer.sh"
echo ""
echo "6. Read network documentation:"
echo "   cat NETWORK_CONFIG.md"
echo ""
echo "💡 You are now in the blockchain directory. Start with step 1!"
echo ""
