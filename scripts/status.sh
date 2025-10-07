#!/bin/bash

# OpenGovChain Status Checker
# Verifies blockchain connectivity and dataset querying functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHAIN_ID="${CHAIN_ID:-govchain}"
NODE_URL="${NODE_URL:-${BLOCKCHAIN_NODE:-tcp://localhost:26657}}"
API_URL="${API_URL:-${BLOCKCHAIN_API:-http://localhost:1317}}"
INDEXER_URL="${INDEXER_URL:-http://localhost:3001}"
IPFS_API="${IPFS_API:-http://localhost:5001}"
IPFS_GATEWAY="${IPFS_GATEWAY:-http://localhost:8080}"
BLOCKCHAIN_BINARY="${BLOCKCHAIN_BINARY:-~/govchain-blockchain/govchaind}"

# Expand tilde in binary path
BLOCKCHAIN_BINARY=$(eval echo "$BLOCKCHAIN_BINARY")

echo "=================================="
echo "🔍 OpenGovChain Status Checker"
echo "=================================="
echo ""
echo "Configuration:"
echo "  Chain ID: $CHAIN_ID"
echo "  Node URL: $NODE_URL"
echo "  API URL: $API_URL"
echo "  Indexer URL: $INDEXER_URL"
echo "  Binary: $BLOCKCHAIN_BINARY"
echo ""

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_failure="${3:-false}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "🧪 $test_name... "
    
    if eval "$test_command" &>/dev/null; then
        if [ "$expected_failure" = "true" ]; then
            echo -e "${RED}UNEXPECTED SUCCESS${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        else
            echo -e "${GREEN}✓ PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        fi
    else
        if [ "$expected_failure" = "true" ]; then
            echo -e "${GREEN}✓ EXPECTED FAILURE${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}✗ FAIL${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi
}

# Helper function to run detailed test with output
run_detailed_test() {
    local test_name="$1"
    local test_command="$2"
    local show_output="${3:-false}"
    
    echo ""
    echo -e "${BLUE}$test_name${NC}"
    echo "Command: $test_command"
    echo "----------------------------------------"
    
    if output=$(eval "$test_command" 2>&1); then
        echo -e "${GREEN}✓ SUCCESS${NC}"
        if [ "$show_output" = "true" ]; then
            echo "$output"
        else
            echo "$output" | head -10
            if [ $(echo "$output" | wc -l) -gt 10 ]; then
                echo "... (output truncated, use -v for full output)"
            fi
        fi
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "$output"
    fi
    echo ""
}

# Parse command line arguments
VERBOSE=false
SHOW_DATASETS=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--datasets)
            SHOW_DATASETS=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose     Show full command outputs"
            echo "  -d, --datasets    Show detailed dataset information"
            echo "  -h, --help        Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  CHAIN_ID          Blockchain chain ID (default: govchain)"
            echo "  NODE_URL          Blockchain node URL (default: tcp://localhost:26657)"
            echo "  API_URL           Blockchain API URL (default: http://localhost:1317)"
            echo "  INDEXER_URL       Indexer service URL (default: http://localhost:9002)"
            echo "  BLOCKCHAIN_BINARY Path to blockchain binary (default: ~/govchain-blockchain/govchaind)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h for help"
            exit 1
            ;;
    esac
done

echo "🔧 Basic Connectivity Tests"
echo "=================================="

# Test 1: Check if blockchain binary exists
run_test "Blockchain binary exists" "test -f '$BLOCKCHAIN_BINARY' && test -x '$BLOCKCHAIN_BINARY'"

# Test 2: Check blockchain node connectivity
run_test "Blockchain node connectivity" "curl -s --connect-timeout 5 '$NODE_URL/status' | grep -q 'latest_block_height'"

# Test 3: Check blockchain REST API
run_test "Blockchain REST API" "curl -s --connect-timeout 5 '$API_URL/cosmos/base/tendermint/v1beta1/node_info' | grep -q 'network'"

# Test 4: Check IPFS API
run_test "IPFS API connectivity" "curl -s --connect-timeout 5 '$IPFS_API/api/v0/version' | grep -q 'Version'"

# Test 5: Check IPFS Gateway
run_test "IPFS Gateway" "curl -s --connect-timeout 5 '$IPFS_GATEWAY/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn' | head -1 | grep -q 'Hello'"

# Test 6: Check Indexer service
run_test "Indexer service health" "curl -s --connect-timeout 5 '$INDEXER_URL/health' | grep -q 'status'"

echo ""
echo "📊 Blockchain Status Information"
echo "=================================="

# Get blockchain status using binary
if [ -f "$BLOCKCHAIN_BINARY" ] && [ -x "$BLOCKCHAIN_BINARY" ]; then
    run_detailed_test "Blockchain Node Status" "'$BLOCKCHAIN_BINARY' status --node '$NODE_URL'" "$VERBOSE"
    
    # Test account queries
    run_detailed_test "Available Keys" "'$BLOCKCHAIN_BINARY' keys list --keyring-backend test" "$VERBOSE"
else
    echo -e "${RED}⚠️  Blockchain binary not found, skipping CLI tests${NC}"
fi

# Get chain info via REST API
run_detailed_test "Chain Information" "curl -s '$API_URL/cosmos/base/tendermint/v1beta1/node_info'" "$VERBOSE"

echo "🗃️  Dataset Module Tests"
echo "=================================="

# Test dataset module availability
run_detailed_test "Dataset Module Parameters" "curl -s '$API_URL/govchain/datasets/params'" "$VERBOSE"

# Test dataset queries
echo ""
echo -e "${BLUE}Dataset Query Tests${NC}"
echo "----------------------------------------"

# Query all datasets
echo "🔍 Querying all datasets..."
DATASET_RESPONSE=$(curl -s "$API_URL/govchain/datasets/stored-dataset" 2>/dev/null || echo "")

if [ -n "$DATASET_RESPONSE" ]; then
    # Try to parse JSON response
    if echo "$DATASET_RESPONSE" | grep -q '"StoredDataset"'; then
        DATASET_COUNT=$(echo "$DATASET_RESPONSE" | grep -o '"StoredDataset":\[.*\]' | grep -o '{[^}]*}' | wc -l | tr -d ' ')
        echo -e "${GREEN}✓ Found $DATASET_COUNT datasets${NC}"
        
        if [ "$SHOW_DATASETS" = "true" ] || [ "$VERBOSE" = "true" ]; then
            echo ""
            echo "Dataset Response:"
            if command -v jq &> /dev/null; then
                echo "$DATASET_RESPONSE" | jq '.'
            else
                echo "$DATASET_RESPONSE"
            fi
        else
            # Show first dataset if available
            if [ "$DATASET_COUNT" -gt 0 ]; then
                echo ""
                echo "Sample dataset (first one):"
                if command -v jq &> /dev/null; then
                    echo "$DATASET_RESPONSE" | jq '.StoredDataset[0] // empty'
                else
                    echo "$DATASET_RESPONSE" | head -5
                fi
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  API responded but no datasets found${NC}"
        if [ "$VERBOSE" = "true" ]; then
            echo "Response: $DATASET_RESPONSE"
        fi
    fi
else
    echo -e "${RED}✗ Failed to query datasets${NC}"
fi

# Test dataset queries using CLI if available
if [ -f "$BLOCKCHAIN_BINARY" ] && [ -x "$BLOCKCHAIN_BINARY" ]; then
    echo ""
    run_detailed_test "CLI Dataset Query" "'$BLOCKCHAIN_BINARY' query datasets list-stored-dataset --node '$NODE_URL' --chain-id '$CHAIN_ID' --output json" "$VERBOSE"
    
    # Test custom queries
    echo ""
    echo "🔍 Testing custom query endpoints..."
    
    # Test agency filter endpoint
    echo "Testing stored-datasets-by-agency endpoint..."
    AGENCY_RESPONSE=$(curl -s "$API_URL/govchain/datasets/stored-datasets-by-agency/NOAA" 2>/dev/null || echo "")
    if [ -n "$AGENCY_RESPONSE" ]; then
        echo -e "${GREEN}✓ Agency filter endpoint responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Agency filter endpoint not responding${NC}"
    fi
    
    # Test category filter endpoint  
    echo "Testing stored-datasets-by-category endpoint..."
    CATEGORY_RESPONSE=$(curl -s "$API_URL/govchain/datasets/stored-datasets-by-category/climate" 2>/dev/null || echo "")
    if [ -n "$CATEGORY_RESPONSE" ]; then
        echo -e "${GREEN}✓ Category filter endpoint responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Category filter endpoint not responding${NC}"
    fi
fi

echo ""
echo "🔍 Search Service Tests"
echo "=================================="

# Test indexer search functionality
run_detailed_test "Indexer Health Check" "curl -s '$INDEXER_URL/health'" "$VERBOSE"

# Test search functionality
echo ""
echo "🔍 Testing search functionality..."
SEARCH_RESPONSE=$(curl -s "$INDEXER_URL/search?q=test&limit=5" 2>/dev/null || echo "")

if [ -n "$SEARCH_RESPONSE" ]; then
    if echo "$SEARCH_RESPONSE" | grep -q '"results"'; then
        RESULT_COUNT=$(echo "$SEARCH_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
        echo -e "${GREEN}✓ Search working, found $RESULT_COUNT results${NC}"
        
        if [ "$VERBOSE" = "true" ]; then
            echo ""
            echo "Search Response:"
            if command -v jq &> /dev/null; then
                echo "$SEARCH_RESPONSE" | jq '.'
            else
                echo "$SEARCH_RESPONSE"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Search API responded but format unexpected${NC}"
        if [ "$VERBOSE" = "true" ]; then
            echo "Response: $SEARCH_RESPONSE"
        fi
    fi
else
    echo -e "${RED}✗ Search service not responding${NC}"
fi

echo ""
echo "📝 Summary Report"
echo "=================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $TOTAL_TESTS"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All systems operational!${NC}"
    echo ""
    echo "✅ Your OpenGovChain is ready for:"
    echo "  • File uploads via web interface"
    echo "  • Dataset queries and search"
    echo "  • IPFS file storage and retrieval"
    echo "  • Blockchain transaction submission"
    echo ""
    echo "🌐 Access URLs:"
    echo "  • Web Interface: http://localhost:9004 (if running)"
    echo "  • Blockchain API: $API_URL"
    echo "  • Search API: $INDEXER_URL"
    echo "  • IPFS Gateway: $IPFS_GATEWAY"
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Common fixes:${NC}"
    echo ""
    echo "🔧 If blockchain tests failed:"
    echo "  • Start the blockchain: cd ~/govchain-blockchain && ./build/govchaind start"
    echo "  • Check the binary path: $BLOCKCHAIN_BINARY"
    echo "  • Verify ports are not blocked by firewall"
    echo ""
    echo "🔧 If IPFS tests failed:"
    echo "  • Start IPFS daemon: ipfs daemon"
    echo "  • Initialize IPFS: ipfs init (if first time)"
    echo ""
    echo "🔧 If indexer tests failed:"
    echo "  • Check indexer service is running on port 9002"
    echo "  • Verify ChromaDB is accessible"
    echo ""
    echo "🔧 For more help:"
    echo "  • Check logs: docker-compose logs"
    echo "  • Run with verbose output: $0 -v"
fi

# Exit with appropriate code
exit $TESTS_FAILED