#!/bin/bash

# GovChain Complete Account Setup
# Creates account and funds it in one go

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================"
echo "GovChain Complete Account Setup"
echo "================================"
echo ""

# Configuration
CHAIN_ID="${CHAIN_ID:-govchain}"
BLOCKCHAIN_NODE="${BLOCKCHAIN_NODE:-tcp://localhost:26657}"
KEYRING_BACKEND="${KEYRING_BACKEND:-test}"
FAUCET_ACCOUNT="${FAUCET_ACCOUNT:-alice}"
FAUCET_AMOUNT="${FAUCET_AMOUNT:-1000000stake}"

echo -e "${BLUE}This script will:${NC}"
echo "1. Import/create an account from mnemonic"
echo "2. Check the account balance"
echo "3. Fund the account if needed"
echo "4. Verify the account is ready to use"
echo ""

if [ "$#" -eq 0 ]; then
    read -p "Enter account name: " ACCOUNT_NAME
    echo ""
    echo -e "${YELLOW}Please enter your mnemonic phrase:${NC}"
    read -p "Mnemonic: " MNEMONIC
    echo ""
    read -p "Fund amount (default: $FAUCET_AMOUNT): " CUSTOM_AMOUNT
    FUND_AMOUNT="${CUSTOM_AMOUNT:-$FAUCET_AMOUNT}"
else
    ACCOUNT_NAME="$1"
    MNEMONIC="$2"
    FUND_AMOUNT="${3:-$FAUCET_AMOUNT}"
fi

if [ -z "$ACCOUNT_NAME" ] || [ -z "$MNEMONIC" ]; then
    echo -e "${RED}❌ Error: Account name and mnemonic are required${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Setup Details:${NC}"
echo -e "   Account name: $ACCOUNT_NAME"
echo -e "   Fund amount: $FUND_AMOUNT"
echo -e "   Faucet source: $FAUCET_ACCOUNT"
echo ""

# Step 1: Import account
echo -e "${YELLOW}📝 Step 1: Importing account...${NC}"

# Check if account already exists
if govchaind keys show "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" &>/dev/null; then
    echo -e "${YELLOW}⚠️  Account '$ACCOUNT_NAME' already exists${NC}"
    read -p "Overwrite existing account? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        govchaind keys delete "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" --yes
        echo -e "${GREEN}✓ Existing account deleted${NC}"
    else
        echo "Using existing account..."
    fi
fi

# Import the account
if ! govchaind keys show "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" &>/dev/null; then
    if echo "$MNEMONIC" | govchaind keys add "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" --recover --interactive=false; then
        echo -e "${GREEN}✅ Account imported successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to import account${NC}"
        exit 1
    fi
fi

# Get account address
ACCOUNT_ADDRESS=$(govchaind keys show "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" --address)
echo -e "${GREEN}Account address: $ACCOUNT_ADDRESS${NC}"

# Step 2: Check balance
echo ""
echo -e "${YELLOW}💰 Step 2: Checking account balance...${NC}"

ACCOUNT_BALANCE=$(govchaind query bank balances "$ACCOUNT_ADDRESS" --node "$BLOCKCHAIN_NODE" --output json 2>/dev/null || echo '{"balances":[]}')
STAKE_BALANCE=$(echo "$ACCOUNT_BALANCE" | jq -r '.balances[] | select(.denom=="stake") | .amount' 2>/dev/null || echo "0")

if [ "$STAKE_BALANCE" = "0" ] || [ -z "$STAKE_BALANCE" ] || [ "$STAKE_BALANCE" = "null" ]; then
    echo -e "${YELLOW}⚠️  Account has no balance (${STAKE_BALANCE} stake)${NC}"
    NEEDS_FUNDING=true
else
    echo -e "${GREEN}✅ Account has funds: $STAKE_BALANCE stake${NC}"
    NEEDS_FUNDING=false
fi

# Step 3: Fund if needed
if [ "$NEEDS_FUNDING" = true ]; then
    echo ""
    echo -e "${YELLOW}💸 Step 3: Funding account...${NC}"
    
    # Check if faucet account exists and has funds
    if ! govchaind keys show "$FAUCET_ACCOUNT" --keyring-backend "$KEYRING_BACKEND" &>/dev/null; then
        echo -e "${RED}❌ Error: Faucet account '$FAUCET_ACCOUNT' not found in keyring${NC}"
        echo "Please make sure the faucet account is imported first."
        exit 1
    fi
    
    FAUCET_ADDRESS=$(govchaind keys show "$FAUCET_ACCOUNT" --keyring-backend "$KEYRING_BACKEND" --address)
    FAUCET_BALANCE=$(govchaind query bank balances "$FAUCET_ADDRESS" --node "$BLOCKCHAIN_NODE" --output json 2>/dev/null)
    FAUCET_STAKE_BALANCE=$(echo "$FAUCET_BALANCE" | jq -r '.balances[] | select(.denom=="stake") | .amount' 2>/dev/null || echo "0")
    
    echo -e "${BLUE}Faucet account ($FAUCET_ACCOUNT) balance: $FAUCET_STAKE_BALANCE stake${NC}"
    
    # Extract numeric amount for comparison
    FUND_AMOUNT_NUM=$(echo "$FUND_AMOUNT" | sed 's/[^0-9]//g')
    
    if [ "$FAUCET_STAKE_BALANCE" -lt "$FUND_AMOUNT_NUM" ]; then
        echo -e "${RED}❌ Error: Faucet account has insufficient funds${NC}"
        echo "Faucet has: $FAUCET_STAKE_BALANCE stake"
        echo "Trying to send: $FUND_AMOUNT_NUM stake"
        exit 1
    fi
    
    # Execute funding transaction
    echo -e "${YELLOW}Sending $FUND_AMOUNT from $FAUCET_ACCOUNT to $ACCOUNT_NAME...${NC}"
    
    TX_RESULT=$(timeout 30s govchaind tx bank send \
        "$FAUCET_ADDRESS" \
        "$ACCOUNT_ADDRESS" \
        "$FUND_AMOUNT" \
        --from "$FAUCET_ACCOUNT" \
        --chain-id "$CHAIN_ID" \
        --keyring-backend "$KEYRING_BACKEND" \
        --node "$BLOCKCHAIN_NODE" \
        --gas auto \
        --gas-adjustment 1.5 \
        --yes \
        --output json 2>&1)
    
    if [ $? -eq 0 ]; then
        TX_HASH=$(echo "$TX_RESULT" | jq -r '.txhash' 2>/dev/null || echo "")
        echo -e "${GREEN}✅ Funding transaction successful!${NC}"
        [ -n "$TX_HASH" ] && echo -e "${GREEN}Transaction hash: $TX_HASH${NC}"
        
        # Wait for transaction to be processed
        echo -e "${YELLOW}⏳ Waiting for transaction to be processed...${NC}"
        sleep 3
    else
        echo -e "${RED}❌ Funding transaction failed${NC}"
        echo "$TX_RESULT"
        exit 1
    fi
else
    echo ""
    echo -e "${GREEN}✅ Step 3: Account already has sufficient funds${NC}"
fi

# Step 4: Verify final setup
echo ""
echo -e "${YELLOW}🔍 Step 4: Verifying final setup...${NC}"

# Check final balance
FINAL_BALANCE=$(govchaind query bank balances "$ACCOUNT_ADDRESS" --node "$BLOCKCHAIN_NODE" --output json 2>/dev/null || echo '{"balances":[]}')
FINAL_STAKE_BALANCE=$(echo "$FINAL_BALANCE" | jq -r '.balances[] | select(.denom=="stake") | .amount' 2>/dev/null || echo "0")

echo ""
echo "================================"
echo -e "${GREEN}✅ Account Setup Complete!${NC}"
echo "================================"
echo ""
echo -e "${GREEN}📊 Account Summary:${NC}"
echo -e "   Name: ${YELLOW}$ACCOUNT_NAME${NC}"
echo -e "   Address: ${YELLOW}$ACCOUNT_ADDRESS${NC}"
echo -e "   Balance: ${YELLOW}$FINAL_STAKE_BALANCE stake${NC}"
echo ""
echo -e "${BLUE}🎉 Account '$ACCOUNT_NAME' is ready to use!${NC}"
echo ""
echo "Example usage:"
echo -e "${BLUE}./scripts/upload-dataset.sh file.csv \"Title\" \"Description\" \"Agency\" \"Category\" \"\" $ACCOUNT_NAME${NC}"
echo ""
echo -e "${BLUE}cd importer && node upload-gaa.js samples/gaa.json $ACCOUNT_NAME${NC}"
echo ""