#!/bin/bash

# Script to discover available type URLs and endpoints from the blockchain
# Run this from your blockchain directory

set -e

echo "================================"
echo "OpenGovChain Type URL Discovery"
echo "================================"
echo ""

# Check if we're in the blockchain directory
if [ ! -f "config.yml" ]; then
    echo "❌ Error: Run this script from your blockchain directory (where config.yml exists)"
    exit 1
fi

CHAIN_BINARY=$(find . -name "*d" -type f -executable | head -1)
if [ -z "$CHAIN_BINARY" ]; then
    echo "❌ Error: No blockchain binary found. Build the blockchain first with 'ignite chain build'"
    exit 1
fi

echo "🔍 Using binary: $CHAIN_BINARY"
echo ""

# Get available transaction types
echo "📝 Available Transaction Types:"
echo "================================"

# Check if help command shows available tx commands
if $CHAIN_BINARY tx datasets --help 2>/dev/null | grep -E "^\s+(create-entry|update-entry|delete-entry|pin-entry)"; then
    echo "✅ Found dataset transaction commands:"
    $CHAIN_BINARY tx datasets --help | grep -E "^\s+(create-entry|update-entry|delete-entry|pin-entry)" | sed 's/^/  /'
    echo ""
else
    echo "⚠️  Could not find dataset transaction commands"
    echo "   Available tx modules:"
    $CHAIN_BINARY tx --help | grep "Available Commands:" -A 20 | grep -E "^\s+[a-z]" | sed 's/^/  /'
    echo ""
fi

# Check query commands
echo "🔍 Available Query Types:"
echo "========================"

if $CHAIN_BINARY query datasets --help 2>/dev/null | grep -E "^\s+(list-entry|show-entry|entries-by-)"; then
    echo "✅ Found dataset query commands:"
    $CHAIN_BINARY query datasets --help | grep -E "^\s+(list-entry|show-entry|entries-by-)" | sed 's/^/  /'
    echo ""
else
    echo "⚠️  Could not find dataset query commands"
    echo "   Available query modules:"
    $CHAIN_BINARY query --help | grep "Available Commands:" -A 20 | grep -E "^\s+[a-z]" | sed 's/^/  /'
    echo ""
fi

# Try to get the actual type URLs from the help
echo "🏷️  Protobuf Message Types:"
echo "=========================="

# Check if we can find the proto definitions
if [ -d "proto" ]; then
    echo "✅ Found proto definitions:"
    find proto -name "*.proto" -exec grep -l "Msg.*Entry" {} \; | while read file; do
        echo "  📄 $file"
        grep -E "message Msg.*Entry" "$file" | sed 's/^/    /'
    done
    echo ""
else
    echo "⚠️  Proto directory not found"
fi

# Test the REST API endpoints
echo "🌐 Testing REST API Endpoints:"
echo "=============================="

REST_ENDPOINT="http://localhost:1317"

echo "Testing connection to $REST_ENDPOINT..."

# Test basic connection
if curl -s -f "$REST_ENDPOINT/cosmos/base/tendermint/v1beta1/node_info" >/dev/null 2>&1; then
    echo "✅ REST API is accessible"
    
    # Test dataset endpoints
    echo ""
    echo "Testing dataset endpoints:"
    
    endpoints=(
        "/govchain/datasets/v1/entry"
        "/govchain/datasets/entry" 
        "/govchain/datasets/v1beta1/entry"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "$REST_ENDPOINT$endpoint" >/dev/null 2>&1; then
            echo "  ✅ $endpoint"
        else
            echo "  ❌ $endpoint"
        fi
    done
    
else
    echo "❌ REST API not accessible at $REST_ENDPOINT"
    echo "   Make sure the blockchain is running with 'ignite chain serve'"
fi

echo ""
echo "💡 Type URL Pattern Discovery:"
echo "=============================="
echo "Checking actual blockchain for type URLs..."
echo ""

# Test the status endpoint to see discovered URLs
echo "📡 Testing Status API Discovery:"
if curl -s -f "http://localhost:3000/api/status" >/dev/null 2>&1; then
    echo "✅ Status API is accessible - checking discovered type URLs..."
    curl -s "http://localhost:3000/api/status" | jq -r '.blockchain.typeUrls // empty' 2>/dev/null || echo "   (jq not available - check manually)"
    echo ""
    echo "🔍 Discovered endpoints:"
    curl -s "http://localhost:3000/api/status" | jq -r '.blockchain.queryEndpoints // empty' 2>/dev/null || echo "   (jq not available - check manually)"
else
    echo "❌ Status API not accessible at http://localhost:3000/api/status"
    echo "   Make sure the Next.js web app is running with 'npm run dev'"
fi
echo ""
echo "🔗 Query Endpoints Pattern:"
echo "=========================="
echo "REST endpoints that might be available:"
echo "  GET  /govchain/datasets/entry"
echo "  GET  /govchain/datasets/v1/entry"
echo "  GET  /govchain/datasets/entry/{id}"
echo "  GET  /govchain/datasets/entries_by_agency/{agency}"
echo "  GET  /govchain/datasets/entries_by_category/{category}"
echo ""
echo "🔄 Live Discovery Available:"
echo "============================"
echo "For real-time discovery of actual URLs:"
echo "  1. Start your blockchain: ignite chain serve"
echo "  2. Start your web app: npm run dev"
echo "  3. Check status endpoint: curl http://localhost:3000/api/status | jq '.blockchain'"
echo "  4. The system will automatically discover and validate all type URLs"
echo ""