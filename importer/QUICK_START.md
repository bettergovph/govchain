# Quick Start Guide

## Upload to Remote Node

### One-Line Command
```bash
./upload-to-remote.sh samples/gaa.json alice tcp://157.90.134.175:26657
```

### Step by Step

1. **Navigate to importer directory**
   ```bash
   cd importer
   ```

2. **Make script executable** (first time only)
   ```bash
   chmod +x upload-to-remote.sh
   ```

3. **Run upload**
   ```bash
   ./upload-to-remote.sh samples/gaa.json alice
   ```

## Environment Variables

```bash
# Set once, use multiple times
export BLOCKCHAIN_NODE=tcp://157.90.134.175:26657
export CHAIN_ID=govchain

# Now run uploads
node upload-gaa.js samples/gaa.json alice
```

## Verify Upload

```bash
# Check latest entries
govchaind query datasets list-entry \
  --node tcp://157.90.134.175:26657 \
  --output json | jq

# Or via REST API
curl http://157.90.134.175:1317/govchain/datasets/v1/entry
```

## Common Commands

| Task | Command |
|------|---------|
| Upload to remote | `./upload-to-remote.sh samples/gaa.json alice` |
| Upload to local | `node upload-gaa.js samples/gaa.json alice` |
| List entries | `govchaind query datasets list-entry --node tcp://157.90.134.175:26657` |
| Check node status | `curl http://157.90.134.175:26657/status` |
| List keys | `govchaind keys list --keyring-backend test` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "govchaind not found" | Build blockchain: `cd blockchain && ignite chain build` |
| "account not found" | Add key: `govchaind keys add alice --keyring-backend test` |
| "connection refused" | Check node is running: `curl http://157.90.134.175:26657/status` |
| "insufficient fees" | Fund account or check balance |

## Need Help?

See full documentation: [README.md](./README.md)
