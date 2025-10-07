# OpenGovChain Data Importer

Upload datasets to the OpenGovChain blockchain.

## Prerequisites

1. **govchaind CLI** must be installed and in your PATH
2. **Keyring** must be configured with the submitter account

## Configuration

### Option 1: Environment Variables (Recommended for Remote Nodes)

Create a `.env` file or export environment variables:

```bash
# Connect to remote blockchain node
export BLOCKCHAIN_NODE=tcp://localhost:26657
export CHAIN_ID=govchain
export KEYRING_BACKEND=test
```

### Option 2: Default (Local Node)

If no environment variables are set, the script connects to:
- **Node**: `tcp://localhost:26657`
- **Chain ID**: `govchain`
- **Keyring**: `test`

## Quick Start

### Upload to Remote Node (Easiest)

```bash
# Make the script executable (first time only)
chmod +x upload-to-remote.sh

# Upload to remote node
./upload-to-remote.sh samples/gaa.json alice tcp://localhost:26657

# Or use default remote node
./upload-to-remote.sh samples/gaa.json alice
```

### Upload GAA Records (Manual)

```bash
# Using environment variables
export BLOCKCHAIN_NODE=tcp://localhost:26657
node upload-gaa.js samples/gaa.json alice

# Or inline
BLOCKCHAIN_NODE=tcp://localhost:26657 node upload-gaa.js samples/gaa.json alice
```

### Arguments

```
node upload-gaa.js <json-file> [submitter]
```

- **json-file**: Path to JSON file containing array of records
- **submitter**: Account name in keyring (default: `alice`)

## Examples

### Connect to Local Node
```bash
node upload-gaa.js samples/gaa.json alice
```

### Connect to Remote Node
```bash
BLOCKCHAIN_NODE=tcp://localhost:26657 \
CHAIN_ID=govchain \
node upload-gaa.js samples/gaa.json alice
```

### Using .env File
```bash
# Create .env file
cat > .env << EOF
BLOCKCHAIN_NODE=tcp://localhost:26657
CHAIN_ID=govchain
KEYRING_BACKEND=test
EOF

# Load and run
export $(cat .env | xargs)
node upload-gaa.js samples/gaa.json alice
```

## Data Format

The JSON file should contain an array of GAA records:

```json
[
  {
    "DSC": "Description",
    "UACS_SOBJ_DSC": "Object Description",
    "UACS_DPT_DSC": "Department Name",
    "AMOUNT": "1000000"
  }
]
```

## Output

The script will:
1. ✅ Validate the JSON file
2. ✅ Process each record
3. ✅ Submit transactions to the blockchain
4. ✅ Display transaction hashes
5. ✅ Show summary statistics

## Verification

After upload, verify the data:

```bash
# List all entries
govchaind query datasets list-entry --node tcp://localhost:26657

# Query by category
govchaind query datasets entries-by-category GAA --node tcp://localhost:26657
```

## Troubleshooting

### "govchaind not found"
Install the blockchain CLI:
```bash
cd blockchain
ignite chain build
```

### "account not found"
Create the account in your keyring:
```bash
govchaind keys add alice --keyring-backend test
```

### "connection refused"
Check that the blockchain node is running and accessible:
```bash
curl http://localhost:26657/status
```

### "insufficient fees"
The script uses `--gas auto --gas-adjustment 1.5` to automatically calculate fees.
If this fails, you may need to fund the account or adjust gas settings.

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `BLOCKCHAIN_NODE` | RPC endpoint of blockchain node | `tcp://localhost:26657` |
| `CHAIN_ID` | Chain identifier | `govchain` |
| `KEYRING_BACKEND` | Keyring backend type | `test` |

## Security Notes

- **Never use `test` keyring in production**
- Use `file` or `os` keyring backend for production
- Keep your mnemonic/keys secure
- Use environment variables instead of hardcoding credentials
