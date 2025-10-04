# Getting Started with GovChain

This guide will help you get GovChain running on your local machine in under 30 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Operating System**: Ubuntu 20.04+, macOS, or Windows with WSL2
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 50 GB free
- **Internet**: Stable connection for downloads

## Quick Start (Automated)

### Step 1: Clone Repository

```bash
git clone https://github.com/govchain/govchain.git
cd govchain
```

### Step 2: Install Prerequisites

```bash
chmod +x scripts/install-prerequisites.sh
./scripts/install-prerequisites.sh
```

This installs:
- Go 1.21+
- Ignite CLI
- IPFS Kubo
- Docker (if not present)

**⚠️ Important:** After installation, restart your terminal or run:
```bash
source ~/.bashrc
```

### Step 3: Verify Installation

```bash
go version        # Should show 1.21+
ignite version    # Should show latest
ipfs version      # Should show 0.24+
docker --version  # Should show version
```

### Step 4: Initialize Blockchain

```bash
chmod +x scripts/init-blockchain.sh
./scripts/init-blockchain.sh
```

This creates the Cosmos blockchain with the custom datasets module.

### Step 5: Start Services

Open **5 terminal windows** and run these commands:

**Terminal 1 - Blockchain:**
```bash
cd govchain
ignite chain serve
```

Wait for: `✔ Blockchain is running`

**Terminal 2 - IPFS:**
```bash
ipfs init  # Only needed first time
ipfs daemon
```

Wait for: `Daemon is ready`

**Terminal 3 - ChromaDB (Vector Database):**
```bash
docker run -p 6333:6333 -v $(pwd)/ChromaDB_storage:/ChromaDB/storage ChromaDB/ChromaDB
```

Wait for: `ChromaDB is ready`

**Terminal 4 - Indexer:**
```bash
cd indexer
cp .env.example .env
go mod download
go run main.go
```

Wait for: `Server starting on port 3000`

**Terminal 5 - Web Server:**
```bash
cd web
python3 -m http.server 8000
```

Or use any web server you prefer.

### Step 6: Access GovChain

Open your browser and visit:

🌐 **http://localhost:8000**

You should see the GovChain search interface!

## Testing Your Setup

### Upload a Test Dataset

Create a test file:
```bash
echo "Name,Age,City
Alice,30,NYC
Bob,25,LA" > test-data.csv
```

Upload it:
```bash
chmod +x scripts/upload-dataset.sh
./scripts/upload-dataset.sh \
  test-data.csv \
  "Test Dataset" \
  "Sample demographic data for testing" \
  "Test Agency" \
  "demographics" \
  alice
```

### Search for Your Dataset

1. Go to http://localhost:8000
2. Type "test" in the search box
3. Click Search
4. You should see your dataset!

### Download and Verify

1. Click the "Download" button
2. The file downloads from IPFS
3. Click "Verify" to see blockchain record

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Web Browser                     │
│              http://localhost:8000               │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Indexer    │  │  Blockchain  │
│  Port 3000   │  │  Port 1317   │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 │
┌──────────────┐         │
│   ChromaDB     │         │
│  Port 6333   │         │
└──────────────┘         │
                         │
                         ▼
                  ┌──────────────┐
                  │     IPFS     │
                  │  Port 8080   │
                  └──────────────┘
```

## Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Web UI | http://localhost:8000 | Search and browse datasets |
| Search API | http://localhost:3000 | Vector search endpoint |
| Blockchain API | http://localhost:1317 | Query blockchain data |
| Blockchain RPC | http://localhost:26657 | Direct blockchain access |
| ChromaDB Dashboard | http://localhost:6333/dashboard | Vector DB admin |
| IPFS Gateway | http://localhost:8080/ipfs/{CID} | Download files |
| IPFS API | http://localhost:5001 | IPFS commands |

## Common Commands

### Blockchain

```bash
# Query all datasets
govchaind query datasets list-datasets

# Query specific dataset
govchaind query datasets get-dataset 1

# Check account balance
govchaind query bank balances $(govchaind keys show alice -a)

# View transaction
govchaind query tx <TX_HASH>
```

### IPFS

```bash
# Check IPFS status
ipfs id

# List pinned files
ipfs pin ls

# Get file
ipfs get <CID>

# Check storage usage
ipfs repo stat
```

### Indexer

```bash
# Health check
curl http://localhost:3000/health

# Search datasets
curl "http://localhost:3000/search?q=climate&limit=5"

# Trigger reindex
curl -X POST http://localhost:3000/reindex
```

## Troubleshooting

### Port Already in Use

If you see "address already in use":

```bash
# Find process using port
lsof -i :3000  # Replace with your port

# Kill process
kill -9 <PID>
```

### Blockchain Won't Start

```bash
# Reset blockchain data
cd govchain
ignite chain serve --reset-once
```

### IPFS Daemon Won't Start

```bash
# Check if already running
ps aux | grep ipfs

# Kill existing daemon
pkill ipfs

# Restart
ipfs daemon
```

### Indexer Can't Connect to ChromaDB

```bash
# Check if ChromaDB is running
docker ps | grep ChromaDB

# Restart ChromaDB
docker restart <container_id>
```

### Search Returns No Results

```bash
# Manually trigger reindex
curl -X POST http://localhost:3000/reindex

# Check indexer logs
# Look for errors in Terminal 4
```

## Next Steps

### For Developers

1. **Explore the code**
   - Read `TECHNICAL_IMPLEMENTATION.md`
   - Browse `govchain/x/datasets/`
   - Check `indexer/main.go`

2. **Make changes**
   - Modify the blockchain module
   - Enhance the search algorithm
   - Improve the web UI

3. **Contribute**
   - Read `CONTRIBUTING.md`
   - Pick an issue from GitHub
   - Submit a pull request

### For Node Operators

1. **Read the guide**
   - See `docs/VOLUNTEER_NODE_GUIDE.md`

2. **Set up a validator**
   - Follow the validator setup steps
   - Join the testnet

3. **Run an IPFS pinner**
   - Pin important datasets
   - Register on blockchain

### For Government Agencies

1. **Read the guide**
   - See `docs/AGENCY_GUIDE.md`

2. **Upload datasets**
   - Use the upload script
   - Verify on blockchain

3. **Monitor usage**
   - Check pin counts
   - Track downloads

## Development Workflow

### Making Changes to Blockchain

```bash
cd govchain

# Edit code in x/datasets/

# Rebuild
ignite chain serve

# Test
govchaind tx datasets create-dataset ...
```

### Making Changes to Indexer

```bash
cd indexer

# Edit main.go

# Run
go run main.go

# Test
curl "http://localhost:3000/search?q=test"
```

### Making Changes to Web UI

```bash
cd web

# Edit index.html

# Refresh browser (no rebuild needed)
```

## Using Docker Compose (Alternative)

Instead of running services separately, use Docker Compose:

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

**Note:** Blockchain still needs to run separately with `ignite chain serve`

## Production Deployment

For production deployment, see:

- **Deployment Guide**: `docs/DEPLOYMENT.md` (coming soon)
- **Security Guide**: `docs/SECURITY.md` (coming soon)
- **Scaling Guide**: `docs/SCALING.md` (coming soon)

## Resources

### Documentation

- **Project Overview**: `PROJECT.md`
- **Technical Details**: `TECHNICAL_IMPLEMENTATION.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Contributing**: `CONTRIBUTING.md`

### Community

- **Discord**: https://discord.gg/govchain
- **GitHub**: https://github.com/govchain/govchain
- **Forum**: https://forum.govchain.io
- **Twitter**: @govchain

### Support

- **Email**: support@govchain.io
- **GitHub Issues**: https://github.com/govchain/govchain/issues
- **Discord #help**: Real-time support

## FAQ

**Q: Do I need to run all services?**
A: For development, yes. For production, services can be distributed across multiple servers.

**Q: How much disk space do I need?**
A: Minimum 50 GB. More if you plan to pin many datasets.

**Q: Can I run this on Windows?**
A: Yes, using WSL2 (Windows Subsystem for Linux).

**Q: How do I stop all services?**
A: Press Ctrl+C in each terminal window.

**Q: Can I use a different port?**
A: Yes, edit the configuration files or environment variables.

**Q: Is this ready for production?**
A: This is a development version. Production deployment requires additional security and scaling considerations.

**Q: Where is data stored?**
A: Blockchain data in `~/.govchain/`, IPFS data in `~/.ipfs/`, ChromaDB data in `./ChromaDB_storage/`

**Q: How do I reset everything?**
A: Delete `~/.govchain/`, `~/.ipfs/`, and `./ChromaDB_storage/`, then start over.

## Getting Help

If you're stuck:

1. **Check the logs** - Look for error messages in each terminal
2. **Search issues** - Someone may have had the same problem
3. **Ask in Discord** - Community is happy to help
4. **Create an issue** - If you found a bug

---

**Welcome to GovChain! Let's build transparent government infrastructure together. 🏛️**

Version: 1.0  
Last Updated: 2025-10-04
