#!/bin/bash

# OpenGovChain Faucet Script
# Sends tokens from a funded account to new accounts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================"
echo "OpenGovChain Account Faucet"
echo "================================"
echo ""

# Configuration
CHAIN_ID="${CHAIN_ID:-govchain}"
BLOCKCHAIN_NODE="${BLOCKCHAIN_NODE:-tcp://localhost:26657}"
KEYRING_BACKEND="${KEYRING_BACKEND:-test}"
FAUCET_ACCOUNT="${FAUCET_ACCOUNT:-alice}"  # Default funded account
FAUCET_AMOUNT="${FAUCET_AMOUNT:-1000000stake}"  # Default amount

echo -e "${BLUE}🌐 Chain ID: $CHAIN_ID${NC}"
echo -e "${BLUE}🌐 Node: $BLOCKCHAIN_NODE${NC}"
echo -e "${BLUE}💰 Faucet Account: $FAUCET_ACCOUNT${NC}"
echo -e "${BLUE}💵 Default Amount: $FAUCET_AMOUNT${NC}"
echo ""

# Parse arguments
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 <recipient-account-name> [amount] [from-account]"
    echo ""
    echo "Examples:"
    echo "  $0 myaccount                           # Send 1000000stake from alice to myaccount"
    echo "  $0 myaccount 2000000stake              # Send 2000000stake from alice to myaccount"
    echo "  $0 myaccount 500000stake bob           # Send 500000stake from bob to myaccount"
    echo ""
    echo "Environment variables:"
    echo "  CHAIN_ID=$CHAIN_ID"
    echo "  BLOCKCHAIN_NODE=$BLOCKCHAIN_NODE"
    echo "  KEYRING_BACKEND=$KEYRING_BACKEND"
    echo "  FAUCET_ACCOUNT=$FAUCET_ACCOUNT (default source account)"
    echo "  FAUCET_AMOUNT=$FAUCET_AMOUNT (default amount)"
    echo ""
    exit 1
fi

RECIPIENT_ACCOUNT="$1"
SEND_AMOUNT="${2:-$FAUCET_AMOUNT}"
FROM_ACCOUNT="${3:-$FAUCET_ACCOUNT}"

# Validate recipient account exists in keyring
if ! govchaind keys show "$RECIPIENT_ACCOUNT" --keyring-backend "$KEYRING_BACKEND" &>/dev/null; then
    echo -e "${RED}❌ Error: Recipient account '$RECIPIENT_ACCOUNT' not found in keyring${NC}"
    echo ""
    echo "Available accounts:"
    govchaind keys list --keyring-backend "$KEYRING_BACKEND" || echo "No accounts found"
    echo ""
    echo "Create the account first with: ./scripts/add-account.sh"
    exit 1
fi

# Validate source account exists in keyring
if ! govchaind keys show "$FROM_ACCOUNT" --keyring-backend "$KEYRING_BACKEND" &>/dev/null; then
    echo -e "${RED}❌ Error: Source account '$FROM_ACCOUNT' not found in keyring${NC}"
    echo ""
    echo "Available accounts:"
    govchaind keys list --keyring-backend "$KEYRING_BACKEND"
    exit 1
fi

# Get addresses
RECIPIENT_ADDRESS=$(govchaind keys show "$RECIPIENT_ACCOUNT" --keyring-backend "$KEYRING_BACKEND" --address)
FROM_ADDRESS=$(govchaind keys show "$FROM_ACCOUNT" --keyring-backend "$KEYRING_BACKEND" --address)

echo -e "${YELLOW}📋 Transaction Details:${NC}"
echo -e "   From: $FROM_ACCOUNT ($FROM_ADDRESS)"
echo -e "   To: $RECIPIENT_ACCOUNT ($RECIPIENT_ADDRESS)"
echo -e "   Amount: $SEND_AMOUNT"
echo ""

# Check source account balance
echo -e "${YELLOW}💰 Checking source account balance...${NC}"
FROM_BALANCE=$(govchaind query bank balances "$FROM_ADDRESS" --node "$BLOCKCHAIN_NODE" --output json 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$FROM_BALANCE" ]; then
    echo -e "${RED}❌ Error: Cannot check balance for source account${NC}"
    exit 1
fi

# Extract stake balance
STAKE_BALANCE=$(echo "$FROM_BALANCE" | jq -r '.balances[] | select(.denom=="stake") | .amount' 2>/dev/null || echo "0")

echo -e "${GREEN}✓ Source account balance: ${STAKE_BALANCE} stake${NC}"

# Validate sufficient balance (basic check for stake tokens)
SEND_AMOUNT_NUM=$(echo "$SEND_AMOUNT" | sed 's/[^0-9]//g')
if [ "$STAKE_BALANCE" -lt "$SEND_AMOUNT_NUM" ]; then
    echo -e "${RED}❌ Error: Insufficient balance. Source has $STAKE_BALANCE stake, trying to send $SEND_AMOUNT_NUM${NC}"
    exit 1
fi

# Check recipient current balance
echo -e "${YELLOW}💰 Checking recipient account balance...${NC}"
RECIPIENT_BALANCE=$(govchaind query bank balances "$RECIPIENT_ADDRESS" --node "$BLOCKCHAIN_NODE" --output json 2>/dev/null || echo '{"balances":[]}')
RECIPIENT_STAKE_BALANCE=$(echo "$RECIPIENT_BALANCE" | jq -r '.balances[] | select(.denom=="stake") | .amount' 2>/dev/null || echo "0")
echo -e "${BLUE}ℹ️ Recipient current balance: ${RECIPIENT_STAKE_BALANCE} stake${NC}"

# Confirm transaction
echo ""
echo -e "${YELLOW}⚠️  About to send $SEND_AMOUNT from $FROM_ACCOUNT to $RECIPIENT_ACCOUNT${NC}"
read -p "Continue? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

# Execute the transfer
echo ""
echo -e "${YELLOW}💸 Sending tokens...${NC}"

# Use timeout to prevent hanging
set +e  # Disable exit on error temporarily
TX_RESULT=$(timeout 30s govchaind tx bank send \
    "$FROM_ADDRESS" \
    "$RECIPIENT_ADDRESS" \
    "$SEND_AMOUNT" \
    --from "$FROM_ACCOUNT" \
    --chain-id "$CHAIN_ID" \
    --keyring-backend "$KEYRING_BACKEND" \
    --node "$BLOCKCHAIN_NODE" \
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
    echo "  - Network connectivity issues"  
    echo "  - Blockchain node problems"
    echo "  - Invalid transaction parameters"
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

# Wait a moment for transaction to be processed
echo ""
echo -e "${YELLOW}⏳ Waiting for transaction to be processed...${NC}"
sleep 3

# Check recipient's new balance
echo -e "${YELLOW}💰 Checking recipient's updated balance...${NC}"
NEW_BALANCE=$(govchaind query bank balances "$RECIPIENT_ADDRESS" --node "$BLOCKCHAIN_NODE" --output json 2>/dev/null || echo '{"balances":[]}')
NEW_STAKE_BALANCE=$(echo "$NEW_BALANCE" | jq -r '.balances[] | select(.denom=="stake") | .amount' 2>/dev/null || echo "0")

echo ""
echo "================================"
echo -e "${GREEN}✅ Faucet Transfer Complete!${NC}"
echo "================================"
echo ""
echo -e "${GREEN}📊 Balance Summary:${NC}"
echo -e "   Recipient: $RECIPIENT_ACCOUNT ($RECIPIENT_ADDRESS)"
echo -e "   Previous balance: ${RECIPIENT_STAKE_BALANCE} stake"
echo -e "   New balance: ${NEW_STAKE_BALANCE} stake"
echo -e "   Received: $SEND_AMOUNT"
echo ""
echo -e "${BLUE}🎉 Account '$RECIPIENT_ACCOUNT' is now funded and ready to use!${NC}"
echo ""
echo "Next steps:"
echo "1. Test with a transaction:"
echo -e "   ${BLUE}./scripts/upload-dataset.sh <file> <title> <desc> <agency> <category> \"\" $RECIPIENT_ACCOUNT${NC}"
echo ""
echo "2. Check balance anytime:"
echo -e "   ${BLUE}govchaind query bank balances $RECIPIENT_ADDRESS --node $BLOCKCHAIN_NODE${NC}"
echo ""