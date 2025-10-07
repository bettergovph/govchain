#!/bin/bash

# Upload to remote OpenGovChain node
# Usage: ./upload-to-remote.sh <json-file> [submitter] [node-url]

set -e

# Configuration
JSON_FILE="${1}"
SUBMITTER="${2:-alice}"
NODE_URL="${3:-tcp://localhost:26657}"
DELAY_SECONDS="${4:-3}"  # Default 3 second delay between transactions

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate arguments
if [ -z "$JSON_FILE" ]; then
    echo -e "${RED}❌ Error: Missing JSON file argument${NC}"
    echo ""
    echo "Usage: $0 <json-file> [submitter] [node-url] [delay-seconds]"
    echo ""
    echo "Examples:"
    echo "  $0 samples/gaa.json"
    echo "  $0 samples/gaa.json alice"
    echo "  $0 samples/gaa.json alice tcp://localhost:26657"
    echo "  $0 samples/gaa.json alice tcp://localhost:26657 5  # 5 second delay"
    echo ""
    exit 1
fi

# Check if file exists
if [ ! -f "$JSON_FILE" ]; then
    echo -e "${RED}❌ Error: File not found: $JSON_FILE${NC}"
    exit 1
fi

# Display configuration
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}OpenGovChain Remote Upload${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""
echo -e "${YELLOW}📄 File:${NC} $JSON_FILE"
echo -e "${YELLOW}🔑 Submitter:${NC} $SUBMITTER"
echo -e "${YELLOW}🌐 Node:${NC} $NODE_URL"
echo -e "${YELLOW}⏱️  Transaction Delay:${NC} $DELAY_SECONDS seconds"
echo ""

# Test node connectivity
echo -e "${YELLOW}Testing node connectivity...${NC}"
if curl -s --max-time 5 "${NODE_URL/tcp:/http:}/status" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Node is accessible${NC}"
else
    echo -e "${RED}❌ Cannot connect to node: $NODE_URL${NC}"
    echo -e "${YELLOW}💡 Tip: Make sure the node is running and accessible${NC}"
    exit 1
fi

# Run the upload script with enhanced sequence management
echo ""
echo -e "${YELLOW}Starting upload with sequence management...${NC}"
echo -e "${YELLOW}⚠️  Using ${DELAY_SECONDS}s delays to prevent sequence mismatch errors${NC}"
echo ""

BLOCKCHAIN_NODE="$NODE_URL" \
CHAIN_ID="govchain" \
KEYRING_BACKEND="test" \
TRANSACTION_DELAY="$DELAY_SECONDS" \
node upload-gaa.js "$JSON_FILE" "$SUBMITTER"

echo ""
echo -e "${GREEN}✅ Upload complete!${NC}"
