#!/bin/bash

# GovChain Dataset Upload Script
# Simplifies uploading datasets to IPFS and registering on blockchain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "GovChain Dataset Upload Tool"
echo "================================"
echo ""

# Check if IPFS is running
if ! ipfs id &> /dev/null; then
    echo -e "${RED}❌ Error: IPFS daemon is not running${NC}"
    echo "Please start IPFS with: ipfs daemon"
    exit 1
fi

# Check if blockchain CLI is available
if ! command -v govchaind &> /dev/null; then
    echo -e "${RED}❌ Error: govchaind not found${NC}"
    echo "Please build the blockchain first"
    exit 1
fi

# Parse arguments
if [ "$#" -lt 5 ]; then
    echo "Usage: $0 <file> <title> <description> <agency> <category> [submitter-key]"
    echo ""
    echo "Example:"
    echo "  $0 data.csv \"Climate Data 2024\" \"Annual climate measurements\" \"NOAA\" \"climate\" alice"
    echo ""
    exit 1
fi

FILE_PATH="$1"
TITLE="$2"
DESCRIPTION="$3"
AGENCY="$4"
CATEGORY="$5"
SUBMITTER="${6:-alice}"

# Validate file exists
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}❌ Error: File not found: $FILE_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📄 File: $FILE_PATH${NC}"
echo -e "${YELLOW}📝 Title: $TITLE${NC}"
echo -e "${YELLOW}🏛️  Agency: $AGENCY${NC}"
echo -e "${YELLOW}📁 Category: $CATEGORY${NC}"
echo ""

# Calculate file size
FILE_SIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH")
echo -e "${GREEN}📊 File size: $FILE_SIZE bytes${NC}"

# Calculate SHA-256 checksum
echo "🔐 Calculating checksum..."
CHECKSUM=$(sha256sum "$FILE_PATH" | awk '{print $1}' || shasum -a 256 "$FILE_PATH" | awk '{print $1}')
echo -e "${GREEN}✓ Checksum: $CHECKSUM${NC}"

# Upload to IPFS
echo "📤 Uploading to IPFS..."
IPFS_CID=$(ipfs add -Q "$FILE_PATH")
echo -e "${GREEN}✓ IPFS CID: $IPFS_CID${NC}"

# Pin the file
echo "📌 Pinning to local IPFS node..."
ipfs pin add "$IPFS_CID" > /dev/null
echo -e "${GREEN}✓ Pinned successfully${NC}"

# Submit to blockchain
echo "⛓️  Submitting to blockchain..."
TX_RESULT=$(govchaind tx datasets create-dataset \
    "$TITLE" \
    "$DESCRIPTION" \
    "$IPFS_CID" \
    "$FILE_SIZE" \
    "$CHECKSUM" \
    "$AGENCY" \
    "$CATEGORY" \
    --from "$SUBMITTER" \
    --chain-id govchain \
    --yes \
    --output json 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Transaction submitted successfully${NC}"
    
    # Extract transaction hash if available
    TX_HASH=$(echo "$TX_RESULT" | jq -r '.txhash' 2>/dev/null || echo "")
    if [ -n "$TX_HASH" ] && [ "$TX_HASH" != "null" ]; then
        echo -e "${GREEN}📋 Transaction hash: $TX_HASH${NC}"
    fi
else
    echo -e "${RED}❌ Transaction failed${NC}"
    echo "$TX_RESULT"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Dataset uploaded successfully!${NC}"
echo "================================"
echo ""
echo "Dataset Details:"
echo "  Title: $TITLE"
echo "  IPFS CID: $IPFS_CID"
echo "  Checksum: $CHECKSUM"
echo "  Size: $FILE_SIZE bytes"
echo ""
echo "Access your dataset:"
echo "  IPFS Gateway: https://ipfs.io/ipfs/$IPFS_CID"
echo "  Local Gateway: http://localhost:8080/ipfs/$IPFS_CID"
echo ""
echo "Verify on blockchain:"
echo "  govchaind query datasets list-datasets"
echo ""
