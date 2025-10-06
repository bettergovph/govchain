# GovChain Volunteer Node Operator Guide

Welcome! This guide will help you set up and run a GovChain node to support government data transparency.

## Why Run a Node?

By running a GovChain node, you:

- **Support transparency**: Help preserve government datasets
- **Ensure availability**: Provide redundant storage and access
- **Build reputation**: Earn on-chain recognition for contributions
- **Join the community**: Connect with transparency advocates worldwide

## Node Types

### 1. Validator Node
- **Role**: Validate transactions and produce blocks
- **Requirements**: 4-8 CPU cores, 16-32 GB RAM, 200 GB SSD
- **Cost**: $20-40/month (VPS)
- **Commitment**: High uptime required (>99%)

### 2. IPFS Pinner Node
- **Role**: Store and serve dataset files
- **Requirements**: 2+ CPU cores, 8 GB RAM, 1-10 TB HDD
- **Cost**: $5-20/month
- **Commitment**: Moderate (can go offline temporarily)

### 3. Archive Node
- **Role**: Provide full blockchain history for queries
- **Requirements**: 4 CPU cores, 16 GB RAM, 500 GB SSD
- **Cost**: $30-50/month
- **Commitment**: High availability recommended

## Prerequisites

### System Requirements

**Minimum:**
- Ubuntu 20.04+ / Debian 11+ / macOS
- 4 GB RAM
- 100 GB free disk space
- 10 Mbps internet connection

**Recommended:**
- Ubuntu 22.04 LTS
- 8 GB RAM
- 500 GB SSD
- 100 Mbps internet connection

### Software Dependencies

- Go 1.21+
- Git
- Build tools (gcc, make)
- IPFS Kubo (for pinning nodes)

## Quick Setup

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install basic tools
sudo apt install -y curl wget git build-essential jq

# Install Go 1.21
wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
source ~/.bashrc

# Verify installation
go version
```

#### Step 2: Build Blockchain Binary

```bash
# Clone repository
git clone https://github.com/bettergov/govchaind.git
cd govchaind

# Build binary
ignite chain build

# Verify binary
govchaind version
```

#### Step 3: Initialize Node

```bash
# Initialize node (replace 'my-node' with your moniker)
govchaind init my-node --chain-id govchain-1

# Download genesis file
wget https://raw.githubusercontent.com/bettergovph/govchaind/main/genesis.json \
  -O ~/.govchain/config/genesis.json

# Verify genesis
govchaind validate-genesis
```

#### Step 4: Configure Node

```bash
# Edit config.toml
nano ~/.govchain/config/config.toml
```

**Key settings:**

```toml
# Persistent peers (seed nodes)
persistent_peers = "node1@ip1:26656,node2@ip2:26656"

# External address (your public IP)
external_address = "tcp://YOUR_PUBLIC_IP:26656"

# Prometheus metrics
prometheus = true
```

#### Step 5: Create Systemd Service

```bash
sudo tee /etc/systemd/system/govchaind.service > /dev/null <<EOF
[Unit]
Description=GovChain Node
After=network-online.target

[Service]
User=$USER
ExecStart=$(which govchaind) start
Restart=on-failure
RestartSec=3
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable govchaind
sudo systemctl start govchaind
```

#### Step 6: Verify Node is Running

```bash
# Check status
sudo systemctl status govchaind

# View logs
sudo journalctl -u govchaind -f

# Check sync status
govchaind status | jq .SyncInfo
```

## Becoming a Validator

### Step 1: Create Wallet

```bash
# Create new wallet
govchaind keys add validator

# Or recover existing wallet
govchaind keys add validator --recover
```

**⚠️ IMPORTANT:** Save your mnemonic phrase securely!

### Step 2: Fund Wallet

**Testnet:**
Request tokens in Discord #faucet channel:
```
!faucet <your-address>
```

**Mainnet:**
Request tokens from the agency or organization

### Step 3: Create Validator

```bash
govchaind tx staking create-validator \
  --amount=1000000stake \
  --pubkey=$(govchaind tendermint show-validator) \
  --moniker="My Node" \
  --chain-id=govchain-1 \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --gas="auto" \
  --gas-adjustment=1.5 \
  --from=validator
```

### Step 4: Verify Validator Status

```bash
# Check validator info
govchaind query staking validator $(govchaind keys show validator --bech val -a)

# Check if in active set
govchaind query tendermint-validator-set | grep $(govchaind tendermint show-address)
```

## Running an IPFS Pinner Node

### Step 1: Install IPFS

```bash
# Download IPFS
wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.24.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh

# Initialize IPFS
ipfs init

# Configure storage limit
ipfs config Datastore.StorageMax 1TB
```

### Step 2: Start IPFS Daemon

```bash
# Create systemd service
sudo tee /etc/systemd/system/ipfs.service > /dev/null <<EOF
[Unit]
Description=IPFS Daemon
After=network.target

[Service]
User=$USER
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable ipfs
sudo systemctl start ipfs
```

### Step 3: Pin Datasets (WIP)

```bash
# Query blockchain for datasets
govchaind query datasets list-datasets

# Pin a dataset by CID
ipfs pin add QmXxx...

# Register pin on blockchain
govchaind tx datasets pin-dataset 1 --from validator --chain-id govchain-1
```

### Step 4: Automate Pinning (WIP)

Create a script to automatically pin new datasets:

```bash
#!/bin/bash
# auto-pin.sh

while true; do
  # Get unpinned datasets
  DATASETS=$(govchaind query datasets list-datasets --output json | jq -r '.Dataset[] | select(.pinCount < 3) | .ipfsCid')
  
  for CID in $DATASETS; do
    echo "Pinning $CID..."
    ipfs pin add $CID
    # Register on blockchain
    DATASET_ID=$(govchaind query datasets list-datasets --output json | jq -r ".Dataset[] | select(.ipfsCid==\"$CID\") | .id")
    govchaind tx datasets pin-dataset $DATASET_ID --from validator --chain-id govchain-1 --yes
  done
  
  sleep 3600 # Check every hour
done
```

## Monitoring Your Node

### Check Node Health

```bash
# Sync status
govchaind status | jq .SyncInfo.catching_up

# Latest block
govchaind status | jq .SyncInfo.latest_block_height

# Peer count
govchaind status | jq .NodeInfo.other.n_peers

# Validator status
govchaind query staking validator $(govchaind keys show validator --bech val -a)
```

### Monitor Resources

```bash
# CPU and memory
htop

# Disk usage
df -h

# Network usage
iftop
```

### Set Up Prometheus + Grafana (Optional)

```bash
# Install Prometheus
sudo apt install prometheus

# Configure to scrape node metrics
# Edit /etc/prometheus/prometheus.yml
# Add:
#   - job_name: 'govchain'
#     static_configs:
#       - targets: ['localhost:26660']

# Install Grafana
sudo apt install grafana

# Import GovChain dashboard
# Dashboard ID: TBD
```

## Maintenance

### Update Node Software

```bash
# Stop node
sudo systemctl stop govchaind

# Pull latest code
cd ~/govchaind
git pull

# Rebuild
ignite chain build

# Restart node
sudo systemctl start govchaind
```

### Backup Validator Keys

```bash
# Backup private validator key
cp ~/.govchain/config/priv_validator_key.json ~/backup/

# Backup wallet
govchaind keys export validator > ~/backup/validator.key
```

**⚠️ Store backups securely and offline!**

### Reset Node (if needed)

```bash
# Stop node
sudo systemctl stop govchaind

# Reset data (keeps config)
govchaind tendermint unsafe-reset-all

# Restart
sudo systemctl start govchaind
```

## Troubleshooting

### Node Won't Sync

**Check peers:**
```bash
govchaind status | jq .NodeInfo.other.n_peers
```

If 0 peers, update persistent_peers in config.toml.

**Check logs:**
```bash
sudo journalctl -u govchaind -f --lines 100
```

### High Memory Usage

Reduce cache size in app.toml:
```toml
[state-sync]
snapshot-interval = 1000
snapshot-keep-recent = 2
```

### Disk Full

**Enable pruning** in app.toml:
```toml
[base]
pruning = "custom"
pruning-keep-recent = "100"
pruning-interval = "10"
```

### Validator Jailed

```bash
# Check reason
govchaind query slashing signing-info $(govchaind tendermint show-validator)

# Unjail (after fixing issue)
govchaind tx slashing unjail --from validator --chain-id govchain-1
```

## Security Best Practices

1. **Use a firewall:**
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 26656/tcp # P2P
sudo ufw enable
```

2. **Disable RPC on public interface:**
```toml
# config.toml
[rpc]
laddr = "tcp://127.0.0.1:26657"
```

3. **Use SSH keys, not passwords**

4. **Keep validator keys offline** (use a signer service)

5. **Regular security updates:**
```bash
sudo apt update && sudo apt upgrade -y
```

## Rewards & Recognition

### Current Phase: Volunteer

- On-chain reputation tracking
- Public leaderboard
- Community recognition

### Future Phases:

**Phase 2 (Year 2):**
- Quarterly grants: $500-2000
- Based on uptime and data served

**Phase 3 (Year 3+):**
- Token-based rewards
- Governance voting rights

## Support & Community

- **Discord**: https://discord.gg/govchain
- **Forum**: https://forum.govchain.io
- **GitHub Issues**: https://github.com/govchain/govchain/issues
- **Email**: support@govchain.io

### Community Calls

Monthly community calls:
- **When**: First Wednesday of each month, 6 PM UTC
- **Where**: Discord voice channel
- **Topics**: Updates, Q&A, governance

## FAQ

**Q: What happens if my node goes offline?**
A: Validator nodes may be jailed after extended downtime. IPFS nodes can go offline without penalty.

**Q: How much can I earn?**
A: Currently volunteer-based. Future phases will include grants and token rewards.

**Q: Can I run multiple nodes?**
A: Yes! You can run both a validator and IPFS pinner.

**Q: What if I don't have a static IP?**
A: Use a dynamic DNS service or VPS provider.

**Q: How do I upgrade my node?**
A: Follow upgrade announcements in Discord. Usually requires stopping node, updating binary, and restarting.

## Next Steps

1. ✅ Set up your node
2. ✅ Join Discord community
3. ✅ Introduce yourself in #introductions
4. ✅ Start pinning datasets
5. ✅ Participate in governance
6. ✅ Help onboard other volunteers

---

**Thank you for supporting government transparency! 🏛️**

Version: 1.0  
Last Updated: 2025-10-04
