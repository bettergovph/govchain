# GovChain: Decentralized Government Transparency Platform

[![Status](https://img.shields.io/badge/Status-Pre--launch-yellow.svg)]()

A base blockchain platform for government transparency - tokenless by default, extensible with custom modules for tokenomics, governance, and blockchain utilities.

## 🎯 Mission

GovChain is a foundational blockchain platform designed to store and manage government datasets with complete transparency. Built on Cosmos SDK, it provides a base layer that agencies can extend with custom modules for tokenomics, governance, financial transactions, and other blockchain utilities based on their specific needs.

## 🌟 Key Features

### Flexible & Extensible Architecture
- **Tokenless by Default**: No economic barriers to start - anyone can participate
- **Optional Tokenomics**: Easily add custom tokens, staking, or economic models when needed
- **Modular Design**: Built on Cosmos SDK for easy extension and customization
- **Public Good Focus**: Core platform designed for transparency, not profit

### Government Data Management
- **Immutable Records**: Government datasets stored permanently on blockchain
- **IPFS Integration**: Efficient file storage with content addressing
- **Rich Metadata**: Comprehensive dataset information and categorization
- **Query Capabilities**: Search by agency, category, and file type

### Decentralized & Extensible Network
- **Cosmos SDK**: Built on proven, modular blockchain technology
- **Validator Network**: Volunteer nodes secure the network (can be extended with staking)
- **IBC Compatible**: Connect to other Cosmos chains and ecosystems
- **Open Source**: Fully transparent and auditable code
- **Extensible**: Add governance, smart contracts, DeFi, or custom modules

## 🏗️ Architecture

GovChain combines three powerful technologies:

1. **Cosmos Blockchain** - Immutable registry of dataset metadata and provenance
2. **IPFS** - Distributed file storage with content addressing
3. **ChromaDB Vector DB** - AI-powered semantic search

### System Components

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│             │────▶│   Indexer    │────▶│  Blockchain │
│  (Web UI)   │     │ (REST API)   │     │ (Metadata)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    IPFS     │     │   ChromaDB   │     │    IPFS     │
│  (Storage)  │◀───│  (Vectors)   │     │  (Storage)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 🚀 Quick Start

This repository only includes the setup script for creating a new chain and a sample web application to browse and interact with the chain.

For running a node, please check https://github.com/bettergovph/govchaind

### Prerequisites

- Ubuntu 20.04+ / macOS / WSL2
- 8 GB RAM minimum
- 50 GB free disk space

### Installation

```bash
# Clone the repository
git clone https://github.com/bettergovph/govchain.git
cd govchain

# Install prerequisites
chmod +x scripts/install-prerequisites.sh
./scripts/install-prerequisites.sh

# Restart terminal or reload shell
source ~/.bashrc
```

### Run Local Development Environment

```bash
# Terminal 1: Start blockchain
cd ~/govchain-blockchain

ignite chain build # Build/rebuild the blockchain binary
ignite chain serve

# Terminal 2: Start IPFS
ipfs init
ipfs daemon
```

### Run Web Application Manually

```bash
# Terminal 3: Start indexer (optional)
cd indexer-node
npm install
npm start

# Terminal 4: Start web application
cd web
npm install
npm run dev
```

### Run Web Application using Docker

```bash
docker compose up -d
```

Visit `http://localhost:3000` to access the web interface.

## 📚 Documentation
- [Getting Started](docs/blockchain/GETTING_STARTED.md)
- [Chain README](docs/blockchain/README.md)
- [Technical Implementation](docs/blockchain/TECHNICAL_IMPLEMENTATION.md) - Development guide
- [Volunteer Node Guide](docs/blockchain/VOLUNTEER_NODE_GUIDE.md) - Run a node
- [Extensibility Guide](docs/EXTENSIBILITY.md) - **NEW!** Add governance, tokens, and custom features
- [Blockchain Explorer](docs/BLOCKCHAIN_EXPLORER.md) - Explorer documentation

## 🛠️ Development

### Project Structure

```
govchain/
├── indexer-node/          # Vector search service
│   └── src/               # Node.js application
├── web/                   # Next.js frontend
│   ├── src/app/           # Next.js app router
│   └── src/components/    # React components
├── scripts/               # Helper scripts
└── docs/                  # Documentation
govchain-blockchain/   # Cosmos blockchain (created by init script)
├── x/datasets/        # Custom datasets module
├── proto/             # Protocol buffers
└── cmd/               # CLI binaries
```

### Key Technologies

- **Blockchain**: Cosmos SDK with entry-based storage
- **Storage**: IPFS (Kubo)
- **Search**: ChromaDB vector database, OpenAI embeddings
- **Backend**: Node.js, Next.js API routes
- **Frontend**: Next.js with React and TypeScript

## 🌟 Features

### ✅ Dataset Management
- Upload datasets to IPFS
- Register metadata on blockchain
- Automatic checksum verification (SHA-256)
- Immutable audit trail

### ✅ Data Discovery
- Semantic search with natural language
- Filter by agency, category, date
- Find similar datasets
- Browse by category

### ✅ Data Retrieval
- Download from any IPFS gateway
- Verify file integrity via blockchain
- Multiple redundant copies
- No single point of failure

### ✅ Transparency & Trust
- Immutable dataset history
- Public verification
- Track data replication
- Open-source codebase

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🔒 Security

- **Blockchain**: Tendermint BFT consensus, 2/3+ validator agreement
- **Data Integrity**: SHA-256 checksums, content-addressed storage
- **Access**: Public read access, verified agency uploads
- **Privacy**: No personal data on-chain

Report security issues to: volunteers@bettergov.ph

## 🌐 Community

- **Website**: https://bettergov.ph
- **GitHub**: https://github.com/bettergovph/govchain
- **Discord**: https://discord.gg/bettergovph

## 🔧 Extensibility

GovChain is a **base platform** that agencies can extend with additional modules:

### ✅ Native Extensions (Built-in to Cosmos SDK)
- **Governance Module** (`x/gov`): On-chain voting, proposals, and democratic decision-making
- **Token Economics** (`x/bank`, `x/staking`, `x/mint`): Custom tokens, staking, rewards
- **IBC Integration**: Cross-chain communication with 50+ Cosmos chains
- **Financial Transactions** (`x/bank`, `x/feegrant`): Payments, transfers, fee grants
- **Custom Modules**: Build agency-specific features using Cosmos SDK framework

### 🔧 Available Integrations (Require Setup)
- **Smart Contracts** (CosmWasm): Deploy Rust-based contracts (widely adopted, battle-tested)
- **Advanced DeFi**: Integrate third-party modules (e.g., Umee lending, Osmosis DEX)

### ⚙️ Requires Custom Development
- **Escrow Services**: Custom module development
- **Complex Loan Management**: Build or integrate third-party modules
- **Agency-Specific Features**: Custom module development

### Cosmos SDK Ecosystem
Leverage the modular Cosmos SDK:
- `x/gov` - On-chain governance ✅
- `x/staking` - Proof of Stake consensus ✅
- `x/bank` - Token transfers ✅
- `x/distribution` - Reward distribution ✅
- `x/authz` - Authorization grants ✅
- `x/feegrant` - Fee allowances ✅
- CosmWasm - Smart contract platform (integration required)
- IBC - Inter-blockchain communication ✅

## 💡 Why GovChain?

### Traditional Government Data Portals:
- ❌ Can be censored or taken offline
- ❌ Can be tampered with
- ❌ Have single points of failure
- ❌ Require trust in centralized operators
- ❌ Limited to basic data storage

### GovChain:
- ✅ Cannot be censored (distributed worldwide)
- ✅ Cannot be tampered with (cryptographic verification)
- ✅ Cannot go offline (redundant copies)
- ✅ Requires no trust (open-source, verifiable)
- ✅ Extensible with governance, tokens, and custom features
- ✅ Built on proven Cosmos SDK technology

## 🚀 For Agencies

### Start Simple, Extend as Needed

1. **Deploy Base Platform**: Start with tokenless data transparency
2. **Add Governance**: Enable community voting and proposals
3. **Introduce Tokens**: Add economic incentives when ready
4. **Build Custom Features**: Extend with agency-specific modules
5. **Connect to Ecosystem**: Use IBC to interact with other chains

### Example Use Cases

**Basic Deployment**:
- Government dataset transparency
- Immutable record keeping
- Public data access

**With Governance**:
- Citizen voting on budget allocations
- Proposal-based policy changes
- Democratic decision-making

**With Tokenomics**:
- Incentivize data contributions
- Reward validators and participants
- Enable marketplace features

**With Financial Modules**:
- Government disbursements
- Transparent fund tracking
- Loan and grant management
- Procurement and payments

---

**Built with ❤️ for democratic accountability in the digital age**

## 📜 License

This project is open source and available under the MIT License. See LICENSE file for details.

---

**GovChain by BetterGov.ph**: A foundational blockchain platform for government transparency - extend it to meet your needs.