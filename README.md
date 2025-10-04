# GovChain: Decentralized Government Transparency Platform

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Pre--launch-yellow.svg)]()

> **Trustless, censorship-resistant government dataset repository powered by blockchain, IPFS, and AI search**

## 🎯 Mission

Enable any citizen to access, verify, and trust government datasets through decentralized infrastructure operated by volunteers worldwide.

## 🏗️ Architecture

GovChain combines three powerful technologies:

1. **Cosmos Blockchain** - Immutable registry of dataset metadata and provenance
2. **IPFS** - Distributed file storage with content addressing
3. **ChromaDB Vector DB** - AI-powered semantic search

### System Components

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Web UI    │────▶│   Indexer    │────▶│   ChromaDB    │
│  (Search)   │     │ (REST API)   │     │  (Vectors)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│    IPFS     │     │  Blockchain  │
│  (Storage)  │◀────│  (Metadata)  │
└─────────────┘     └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Ubuntu 20.04+ / macOS / WSL2
- 8 GB RAM minimum
- 50 GB free disk space

### Installation

```bash
# Clone the repository
git clone https://github.com/govchain/govchain.git
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
cd govchain
ignite chain serve

# Terminal 2: Start IPFS
ipfs init
ipfs daemon

# Terminal 3: Start ChromaDB
docker run -p 6333:6333 -v $(pwd)/ChromaDB_storage:/ChromaDB/storage ChromaDB/ChromaDB

# Terminal 4: Start indexer
cd indexer
cp .env.example .env
go run main.go

# Terminal 5: Serve web interface
cd web
python3 -m http.server 8000
```

Visit `http://localhost:8000` to access the web interface.

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
├── govchain/          # Cosmos blockchain core
│   ├── x/datasets/    # Custom datasets module
│   ├── proto/         # Protocol buffers
│   └── cmd/           # CLI binaries
├── indexer/           # Vector search service
│   └── main.go        # Go application
├── web/               # Frontend interface
│   └── index.html     # Search UI
├── scripts/           # Helper scripts
└── docs/              # Documentation
```

### Key Technologies

- **Blockchain**: Cosmos SDK, Tendermint BFT
- **Storage**: IPFS (Kubo)
- **Search**: ChromaDB vector database, OpenAI embeddings
- **Backend**: Go 1.21+
- **Frontend**: HTML/CSS/JavaScript (Vanilla)

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
- [ ] Deploy Cosmos blockchain testnet
- [ ] Launch IPFS cluster
- [ ] Build web interface
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
