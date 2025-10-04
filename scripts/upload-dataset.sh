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
    echo "Please build the blockchain first by running:"
    echo "  cd blockchain && ignite chain build"
    exit 1
fi

# Parse arguments
if [ "$#" -lt 5 ]; then
    echo "Usage: $0 <file> <title> <description> <agency> <category> [fallback-url] [submitter-key]"
    echo ""
    echo "Example:"
    echo "  $0 README.md \"Climate Data 2024\" \"Annual climate measurements\" \"NOAA\" \"climate\" \"https://backup.noaa.gov/data.csv\" alice"
    echo ""
    exit 1
fi

FILE_PATH="$1"
TITLE="$2"
DESCRIPTION="$3"
AGENCY="$4"
CATEGORY="$5"
FALLBACK_URL="${6:-}"
SUBMITTER="${7:-alice}"

# Validate file exists
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}❌ Error: File not found: $FILE_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📄 File: $FILE_PATH${NC}"
echo -e "${YELLOW}📝 Title: $TITLE${NC}"
echo -e "${YELLOW}🏛️  Agency: $AGENCY${NC}"
echo -e "${YELLOW}📁 Category: $CATEGORY${NC}"
if [ -n "$FALLBACK_URL" ]; then
    echo -e "${YELLOW}🔗 Fallback URL: $FALLBACK_URL${NC}"
fi
echo ""

# Calculate file size
FILE_SIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH")
echo -e "${GREEN}📊 File size: $FILE_SIZE bytes${NC}"

# Extract filename
FILE_NAME=$(basename "$FILE_PATH")
echo -e "${GREEN}📄 Filename: $FILE_NAME${NC}"

# Detect MIME type
echo "🔍 Detecting MIME type..."
if command -v file &> /dev/null; then
    MIME_TYPE=$(file -b --mime-type "$FILE_PATH")
else
    # Fallback MIME type detection based on file extension
    case "${FILE_PATH##*.}" in
        csv) MIME_TYPE="text/csv" ;;
        json) MIME_TYPE="application/json" ;;
        xml) MIME_TYPE="application/xml" ;;
        pdf) MIME_TYPE="application/pdf" ;;
        txt) MIME_TYPE="text/plain" ;;
        html|htm) MIME_TYPE="text/html" ;;
        jpg|jpeg) MIME_TYPE="image/jpeg" ;;
        png) MIME_TYPE="image/png" ;;
        *) MIME_TYPE="application/octet-stream" ;;
    esac
fi
echo -e "${GREEN}✓ MIME type: $MIME_TYPE${NC}"

# Create file URL from IPFS CID (will be set after upload)
# This will be updated after we get the IPFS CID

# Calculate SHA-256 checksum
echo "🔐 Calculating checksum..."
CHECKSUM=$(sha256sum "$FILE_PATH" | awk '{print $1}' || shasum -a 256 "$FILE_PATH" | awk '{print $1}')
echo -e "${GREEN}✓ Checksum: $CHECKSUM${NC}"

# Upload to IPFS
echo "📤 Uploading to IPFS..."
IPFS_CID=$(ipfs add -Q "$FILE_PATH")
echo -e "${GREEN}✓ IPFS CID: $IPFS_CID${NC}"

# Create file URL from IPFS CID
FILE_URL="https://ipfs.io/ipfs/$IPFS_CID"
echo -e "${GREEN}🔗 File URL: $FILE_URL${NC}"

# Pin the file
echo "📌 Pinning to local IPFS node..."
ipfs pin add "$IPFS_CID" > /dev/null
echo -e "${GREEN}✓ Pinned successfully${NC}"

# Submit to blockchain
echo "⛓️  Submitting to blockchain..."

# Get current timestamp
TIMESTAMP=$(date +%s)

# Debug: Print the command that will be executed
echo "Debug: About to execute transaction..."
echo "Submitter: $SUBMITTER"
echo "Timestamp: $TIMESTAMP"
echo "Parameter count check..."
echo "Checking command signature:"
govchaind tx datasets create-entry --help 2>/dev/null | head -10 || echo "Help not available"
echo ""

# Add timeout and better error handling
set +e  # Disable exit on error temporarily

# Try with auto-generated index first
echo "Attempting transaction with auto-generated index..."
TX_RESULT=$(timeout 30s govchaind tx datasets create-entry \
    "entry-$(date +%s)" \
    "$TITLE" \
    "$DESCRIPTION" \
    "$IPFS_CID" \
    "$MIME_TYPE" \
    "$FILE_NAME" \
    "$FILE_URL" \
    "$FALLBACK_URL" \
    "$FILE_SIZE" \
    "$CHECKSUM" \
    "$AGENCY" \
    "$CATEGORY" \
    "$SUBMITTER" \
    "$TIMESTAMP" \
    "0" \
    --from "$SUBMITTER" \
    --chain-id govchain \
    --keyring-backend test \
    --gas auto \
    --gas-adjustment 1.5 \
    --yes \
    --output json 2>&1)

TX_EXIT_CODE=$?
set -e  # Re-enable exit on error

# Check transaction result
if [ $TX_EXIT_CODE -eq 124 ]; then
    echo -e "${RED}❌ Transaction timed out after 30 seconds${NC}"
    echo "This might indicate:"
    echo "  - Blockchain node is not running"
    echo "  - Network connectivity issues"
    echo "  - Invalid command parameters"
    echo "Raw output: $TX_RESULT"
    exit 1
elif [ $TX_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Transaction submitted successfully${NC}"
    
    # Extract transaction hash if available
    TX_HASH=$(echo "$TX_RESULT" | jq -r '.txhash' 2>/dev/null || echo "")
    if [ -n "$TX_HASH" ] && [ "$TX_HASH" != "null" ]; then
        echo -e "${GREEN}📋 Transaction hash: $TX_HASH${NC}"
    fi
else
    echo -e "${RED}❌ Transaction failed (exit code: $TX_EXIT_CODE)${NC}"
    echo "Raw output:"
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
echo "  Filename: $FILE_NAME"
echo "  MIME Type: $MIME_TYPE"
echo "  IPFS CID: $IPFS_CID"
echo "  Checksum: $CHECKSUM"
echo "  Size: $FILE_SIZE bytes"
if [ -n "$FALLBACK_URL" ]; then
    echo "  Fallback URL: $FALLBACK_URL"
fi
echo ""
echo "Access your dataset:"
echo "  Primary URL: $FILE_URL"
echo "  Local Gateway: http://localhost:8080/ipfs/$IPFS_CID"
echo ""
echo "Verify on blockchain:"
echo "  govchaind query datasets list-entry"
echo "  govchaind query datasets entries-by-agency $AGENCY"
echo "  govchaind query datasets entries-by-category $CATEGORY"
echo ""
