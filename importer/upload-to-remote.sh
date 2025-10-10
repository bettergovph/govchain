#!/bin/bash

# Upload to remote OpenGovChain node
# Usage: ./upload-to-remote.sh <json-file> [submitter] [node-url] [delay-seconds] [--resume] [--start-from=N]

set -e

# Configuration
JSON_FILE="${1}"
SUBMITTER="${2:-alice}"
NODE_URL="${3:-tcp://localhost:26657}"
DELAY_SECONDS="${4:-3}"  # Default 3 second delay between transactions

# Parse additional flags
RESUME_FLAG=""
START_FROM=""

# Process additional arguments for --resume and --start-from
shift 4 2>/dev/null || true  # Remove first 4 args, ignore errors if fewer args
for arg in "$@"; do
    case $arg in
        --resume)
            RESUME_FLAG="--resume"
            ;;
        --start-from=*)
            START_FROM="${arg#*=}"
            ;;
        *)
            echo -e "${RED}❌ Unknown argument: $arg${NC}"
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate arguments
if [ -z "$JSON_FILE" ]; then
    echo -e "${RED}❌ Error: Missing JSON file argument${NC}"
    echo ""
    echo "Usage: $0 <json-file> [submitter] [node-url] [delay-seconds] [--resume] [--start-from=N]"
    echo ""
    echo "Examples:"
    echo "  $0 samples/gaa.json"
    echo "  $0 samples/gaa.json alice"
    echo "  $0 samples/gaa.json alice tcp://localhost:26657"
    echo "  $0 samples/gaa.json alice tcp://localhost:26657 5  # 5 second delay"
    echo "  $0 samples/gaa.json alice tcp://localhost:26657 3 --resume  # Resume from last processed"
    echo "  $0 samples/gaa.json alice tcp://localhost:26657 3 --start-from=100  # Start from record 100"
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
if [ -n "$RESUME_FLAG" ]; then
    echo -e "${YELLOW}🔄 Resume Mode:${NC} Enabled (will continue from last processed record)"
fi
if [ -n "$START_FROM" ]; then
    echo -e "${YELLOW}📍 Start From Record:${NC} $START_FROM"
fi
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

# Check if resume mode is requested and show last processed index
if [ -n "$RESUME_FLAG" ]; then
    echo -e "${YELLOW}Checking for previous upload progress...${NC}"
    PROGRESS_LOG="./logs/upload-progress.jsonl"
    if [ -f "$PROGRESS_LOG" ]; then
        # Find the last successful record index
        LAST_INDEX=$(grep '"status":"success"' "$PROGRESS_LOG" | tail -1 | grep -o '"index":[0-9]*' | cut -d':' -f2 || echo "-1")
        if [ "$LAST_INDEX" != "-1" ]; then
            NEXT_RECORD=$((LAST_INDEX + 1))
            echo -e "${GREEN}✓ Found previous progress: last successful record was $((LAST_INDEX + 1))${NC}"
            echo -e "${YELLOW}📍 Will resume from record $((NEXT_RECORD + 1))${NC}"
        else
            echo -e "${YELLOW}⚠️  No successful records found in progress log, starting from beginning${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No progress log found, starting from beginning${NC}"
    fi
    echo ""
fi

# Run the upload script with enhanced sequence management
echo ""
echo -e "${YELLOW}Starting upload with sequence management...${NC}"
echo -e "${YELLOW}⚠️  Using ${DELAY_SECONDS}s delays to prevent sequence mismatch errors${NC}"
if [ -n "$RESUME_FLAG" ]; then
    echo -e "${YELLOW}🔄 Resume mode enabled - will skip already processed records${NC}"
fi
if [ -n "$START_FROM" ]; then
    echo -e "${YELLOW}📍 Starting from record $START_FROM${NC}"
fi
echo ""

# Build the command with optional flags
COMMAND_ARGS=("$JSON_FILE" "$SUBMITTER")
if [ -n "$RESUME_FLAG" ]; then
    COMMAND_ARGS+=("$RESUME_FLAG")
fi

# Execute the upload script
BLOCKCHAIN_NODE="$NODE_URL" \
CHAIN_ID="govchain" \
KEYRING_BACKEND="test" \
TRANSACTION_DELAY="$DELAY_SECONDS" \
node upload-gaa.js "${COMMAND_ARGS[@]}"

echo ""
echo -e "${GREEN}✅ Upload complete!${NC}"
