# Transaction Query Methods for Cosmos Blockchain

## Problem
The standard `/cosmos/tx/v1beta1/txs` endpoint may return empty results even when transactions exist on the blockchain. This happens when:
1. Transaction indexing is disabled in the node configuration
2. The node is configured with `index_all_keys = false` in `config.toml`
3. The transaction index database is not populated

## Solution: Multiple Query Approaches

I've implemented **three different methods** to query transactions, with automatic fallback:

### Method 1: Transaction Index (Fastest)
**Endpoint**: `/cosmos/tx/v1beta1/txs?pagination.limit=20&order_by=ORDER_BY_DESC`

**Pros**:
- Fastest method
- Supports pagination
- Returns complete transaction data

**Cons**:
- Requires tx indexing to be enabled
- May return empty results if indexing is disabled

**When it works**: When node has `indexer = "kv"` in `config/config.toml`

### Method 2: Event Query by Block Height
**Endpoint**: `/cosmos/tx/v1beta1/txs?events=tx.height=12345`

**Pros**:
- Works even with limited indexing
- Can query specific block heights
- Returns complete transaction data

**Cons**:
- Slower (requires multiple queries)
- Must iterate through block heights

**When it works**: When node has event indexing enabled

### Method 3: Block Scanning with Decode
**Endpoint**: Combination of:
- `/block?height=X` (get raw tx bytes)
- `/cosmos/tx/v1beta1/txs/decode` (decode tx bytes)

**Pros**:
- Always works (doesn't require indexing)
- Direct access to blockchain data
- Most reliable method

**Cons**:
- Slowest method
- Requires multiple API calls per transaction
- May not have full tx metadata (gas used, logs, etc.)

**When it works**: Always (as long as RPC is accessible)

## Implementation

### Main Transaction Endpoint
**File**: `/web/src/app/api/explorer/transactions/route.ts`

**Logic**:
1. Try Method 1 (transaction index) first
2. If empty, fall back to Method 3 (block scanning)
3. Returns transactions with a `source` field indicating which method was used

### Alternative Endpoint
**File**: `/web/src/app/api/explorer/transactions-alt/route.ts`

**Logic**:
- Uses Method 2 (event query)
- Scans last 100 blocks
- Good middle-ground between speed and reliability

### Debug Endpoint
**File**: `/web/src/app/api/explorer/debug/route.ts`

**Usage**: Visit `/api/explorer/debug` to see:
- Which endpoints are accessible
- Whether transactions exist in blocks
- Whether indexing is working
- Recommendations for your setup

## Testing

### 1. Check Debug Endpoint
```bash
curl http://localhost:9004/api/explorer/debug | jq
```

This will show you:
- ✅ RPC status
- ✅ Latest block info
- ✅ Transaction index status
- ✅ Whether txs exist in recent blocks
- ✅ Recommendations

### 2. Test Transaction Queries
```bash
# Method 1: Direct query
curl "http://localhost:1317/cosmos/tx/v1beta1/txs?pagination.limit=5"

# Method 2: Event query
curl "http://localhost:1317/cosmos/tx/v1beta1/txs?events=tx.height=100"

# Method 3: Block query
curl "http://localhost:26657/block?height=100"
```

### 3. Check Browser Console
Open the explorer page and check the browser console for:
```
Transaction data received: {...}
Source: "index" | "blocks" | "event-query"
Transaction count: X
```

## Enabling Transaction Indexing (Optional)

If you want to enable full transaction indexing for better performance:

### Edit `config/config.toml`:
```toml
[tx_index]
indexer = "kv"  # Change from "null" to "kv"
```

### Edit `app.toml`:
```toml
[telemetry]
enabled = true

[api]
enable = true
swagger = true

[grpc]
enable = true
```

### Restart the node:
```bash
# The indexer will rebuild the index from existing blocks
govchaind start
```

## Current Implementation Status

✅ **Automatic Fallback**: The explorer automatically tries multiple methods
✅ **Debug Logging**: Console logs show which method is being used
✅ **Error Handling**: Graceful degradation if methods fail
✅ **Block Scanning**: Works even without indexing
✅ **Performance**: Optimized to minimize API calls

## Recommendations

1. **For Development**: Use block scanning (current default fallback)
2. **For Production**: Enable transaction indexing for better performance
3. **For Public Nodes**: Use event queries as middle ground

## Troubleshooting

### "No transactions found"
1. Check `/api/explorer/debug` to see if txs exist in blocks
2. If txs exist but not showing, indexing might be disabled
3. The fallback block scanning should still work

### "Slow transaction loading"
1. Block scanning is slower than indexing
2. Consider enabling tx indexing (see above)
3. Reduce the number of blocks scanned in the code

### "Empty transaction list but blocks have txs"
1. Check browser console for errors
2. Verify BLOCKCHAIN_API and BLOCKCHAIN_NODE env variables
3. Check CORS settings on the blockchain node

## Environment Variables

Make sure these are set correctly:
```bash
BLOCKCHAIN_API=http://localhost:1317        # REST API endpoint
BLOCKCHAIN_NODE=http://localhost:26657      # Tendermint RPC endpoint
```

For docker:
```yaml
environment:
  - BLOCKCHAIN_API=http://host.docker.internal:1317
  - BLOCKCHAIN_NODE=http://host.docker.internal:26657
```
