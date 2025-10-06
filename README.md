# GovChain: Decentralized Government Transparency Platform

[![Status](https://img.shields.io/badge/Status-Pre--launch-yellow.svg)]()

A tokenless, public good blockchain for government data transparency and accountability.

## 🎯 Mission

GovChain is a decentralized blockchain network designed to store and manage government datasets with complete transparency. Our mission is to create an open, accessible platform where government data can be stored immutably and accessed by all citizens.

## 🌟 Key Features

### Tokenless Architecture
- **No Economic Barriers**: Anyone can participate without purchasing tokens
- **Volunteer-Operated**: Community-driven validator network
- **Public Good Focus**: Designed for transparency, not profit

### Government Data Management
- **Immutable Records**: Government datasets stored permanently on blockchain
- **IPFS Integration**: Efficient file storage with content addressing
- **Rich Metadata**: Comprehensive dataset information and categorization
- **Query Capabilities**: Search by agency, category, and file type

### Decentralized Network
- **Cosmos SDK**: Built on proven blockchain technology
- **Validator Network**: Volunteer nodes secure the network
- **Consensus Driven**: Community governance model
- **Open Source**: Fully transparent and auditable code

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
│  (Storag e) │◀────│  (Vectors)   │     │  (Storage)  │
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
git clone https://github.com/bettergov/govchain.git
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

- [Project Overview](PROJECT.md) - Complete project specification
- [Technical Implementation](TECHNICAL_IMPLEMENTATION.md) - Development guide
- [API Reference](docs/API_REFERENCE.md) - REST API documentation
- [Volunteer Node Guide](docs/VOLUNTEER_NODE_GUIDE.md) - Run a node
- [Agency Upload Guide](docs/AGENCY_GUIDE.md) - Submit datasets

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

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📊 Roadmap

### Phase 1: Testnet & Pilot (Months 1-6)
- [x] Project specification
- [x] Entry-based blockchain structure
- [x] Next.js web application
- [x] IPFS integration
- [ ] Deploy Cosmos blockchain testnet
- [ ] Launch IPFS cluster
- [ ] Partner with pilot agencies
- [ ] Recruit 20-30 volunteers

### Phase 2: Public Beta (Months 7-12)
- [ ] Expand to 20-30 validators
- [ ] Launch grant program
- [ ] Onboard 5-10 agencies
- [ ] Advanced search features
- [ ] Mobile app

### Phase 3: Mainnet Launch (Year 2)
- [ ] Launch mainnet (50+ validators)
- [ ] 100+ IPFS pinners
- [ ] Full API documentation
- [ ] Developer grants program
- [ ] 10+ government partnerships

## 🔒 Security

- **Blockchain**: Tendermint BFT consensus, 2/3+ validator agreement
- **Data Integrity**: SHA-256 checksums, content-addressed storage
- **Access**: Public read access, verified agency uploads
- **Privacy**: No personal data on-chain

Report security issues to: security@govchain.io

## 📈 Success Metrics

**Year 1 Goals:**
- 10+ government agencies
- 10,000+ datasets indexed
- 30+ volunteer nodes
- 99.9%+ uptime

## 📄 License

- Blockchain code: Apache 2.0
- Indexer: MIT
- Web interface: MIT
- Documentation: Creative Commons

## 🌐 Community

- **Website**: https://govchain.io (TBD)
- **GitHub**: https://github.com/govchain
- **Discord**: https://discord.gg/govchain (TBD)
- **Twitter**: @govchain (TBD)
- **Email**: contact@govchain.io

## 💡 Why GovChain?

Traditional government data portals:
- ❌ Can be censored or taken offline
- ❌ Can be tampered with
- ❌ Have single points of failure
- ❌ Require trust in centralized operators

GovChain:
- ✅ Cannot be censored (distributed worldwide)
- ✅ Cannot be tampered with (cryptographic verification)
- ✅ Cannot go offline (redundant copies)
- ✅ Requires no trust (open-source, verifiable)

---

**Built with ❤️ for democratic accountability in the digital age**

Version: 1.0.0  
Status: Pre-launch Development  
Last Updated: 2025-10-04

## 📜 License

This project is open source and available under the MIT License. See LICENSE file for details.

---

**GovChain by BetterGov.ph**: Empowering transparency through decentralized government data.