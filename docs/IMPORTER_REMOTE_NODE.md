# Connecting Importer to Remote Blockchain Node

## Summary

The importer script has been updated to support connecting to remote blockchain nodes via environment variables.

## Changes Made

### 1. Updated `upload-gaa.js`
Added support for environment variables:
- `BLOCKCHAIN_NODE` - RPC endpoint (default: `tcp://localhost:26657`)
- `CHAIN_ID` - Chain identifier (default: `govchain`)
- `KEYRING_BACKEND` - Keyring type (default: `test`)

The script now includes the `--node` flag in the `govchaind` command.

### 2. Created Helper Script
**File**: `importer/upload-to-remote.sh`

Easy-to-use script that:
- Tests node connectivity before upload
- Sets environment variables automatically
- Provides clear error messages
- Shows upload progress

### 3. Documentation
- **`importer/README.md`** - Complete usage guide
- **`importer/.env.example`** - Example environment configuration

## Usage

### Method 1: Helper Script (Recommended)

```bash
cd importer

# Upload to remote node
./upload-to-remote.sh samples/gaa.json alice tcp://157.90.134.175:26657

# Or use default remote node (157.90.134.175:26657)
./upload-to-remote.sh samples/gaa.json alice
```

### Method 2: Environment Variables

```bash
cd importer

# Set environment variables
export BLOCKCHAIN_NODE=tcp://157.90.134.175:26657
export CHAIN_ID=govchain
export KEYRING_BACKEND=test

# Run upload
node upload-gaa.js samples/gaa.json alice
```

### Method 3: Inline Variables

```bash
cd importer

BLOCKCHAIN_NODE=tcp://157.90.134.175:26657 \
node upload-gaa.js samples/gaa.json alice
```

## Verification

After uploading, verify the data on the remote node:

```bash
# Check node status
curl http://157.90.134.175:26657/status

# Query uploaded entries
govchaind query datasets list-entry \
  --node tcp://157.90.134.175:26657

# Query by category
govchaind query datasets entries-by-category GAA \
  --node tcp://157.90.134.175:26657
```

## Configuration Examples

### Local Development
```bash
BLOCKCHAIN_NODE=tcp://localhost:26657
CHAIN_ID=govchain
KEYRING_BACKEND=test
```

### Remote Production Node
```bash
BLOCKCHAIN_NODE=tcp://157.90.134.175:26657
CHAIN_ID=govchain
KEYRING_BACKEND=file  # Use 'file' or 'os' in production
```

### Docker Environment
```bash
BLOCKCHAIN_NODE=tcp://host.docker.internal:26657
CHAIN_ID=govchain
KEYRING_BACKEND=test
```

## Troubleshooting

### Connection Issues

**Problem**: "Cannot connect to node"
```bash
# Test connectivity
curl http://157.90.134.175:26657/status

# Check if port is open
nc -zv 157.90.134.175 26657
```

**Problem**: "account not found"
```bash
# Ensure account exists in keyring
govchaind keys list --keyring-backend test

# Add account if needed
govchaind keys add alice --keyring-backend test
```

**Problem**: "insufficient fees"
```bash
# Check account balance
govchaind query bank balances $(govchaind keys show alice -a --keyring-backend test) \
  --node tcp://157.90.134.175:26657

# Fund account if needed (on testnet)
```

### Keyring Issues

**Problem**: "keyring is not initialized"
```bash
# Initialize keyring
govchaind config keyring-backend test

# Or specify in command
KEYRING_BACKEND=test node upload-gaa.js samples/gaa.json alice
```

## Security Best Practices

1. **Never use `test` keyring in production**
   - Use `file` or `os` backend
   - Protect your keys with passwords

2. **Use environment variables for sensitive data**
   - Don't hardcode node URLs
   - Don't commit `.env` files to git

3. **Verify node authenticity**
   - Ensure you're connecting to the correct node
   - Use HTTPS/TLS when available

4. **Limit account permissions**
   - Use dedicated accounts for uploads
   - Don't use validator keys for transactions

## Files Created

- ✅ `importer/upload-gaa.js` - Updated with remote node support
- ✅ `importer/upload-to-remote.sh` - Helper script for easy uploads
- ✅ `importer/README.md` - Complete usage documentation
- ✅ `importer/.env.example` - Example configuration
- ✅ `docs/IMPORTER_REMOTE_NODE.md` - This documentation
