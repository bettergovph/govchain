#!/bin/bash

# GovChain Account Import Script
# Imports an account from mnemonic seed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================"
echo "GovChain Account Import Tool"
echo "================================"
echo ""

# Check if blockchain CLI is available
if ! command -v govchaind &> /dev/null; then
    echo -e "${RED}❌ Error: govchaind not found${NC}"
    echo "Please ensure the blockchain is built and govchaind is in your PATH"
    exit 1
fi

# Configuration
CHAIN_ID="${CHAIN_ID:-govchain}"
KEYRING_BACKEND="${KEYRING_BACKEND:-test}"

echo -e "${BLUE}🌐 Chain ID: $CHAIN_ID${NC}"
echo -e "${BLUE}🔑 Keyring Backend: $KEYRING_BACKEND${NC}"
echo ""

# Parse arguments or prompt for input
if [ "$#" -eq 0 ]; then
    # Interactive mode
    echo "Interactive Mode - Please provide the following information:"
    echo ""
    
    read -p "Enter account name (e.g., alice, bob, validator): " ACCOUNT_NAME
    
    if [ -z "$ACCOUNT_NAME" ]; then
        echo -e "${RED}❌ Error: Account name is required${NC}"
        exit 1
    fi
    
    # Validate account name
    if ! echo "$ACCOUNT_NAME" | grep -qE '^[a-zA-Z0-9_-]+$'; then
        echo -e "${RED}❌ Error: Account name must contain only letters, numbers, underscores, and hyphens${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}📝 Account name: $ACCOUNT_NAME${NC}"
    echo ""
    
    # Check if account already exists
    if govchaind keys show "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" &>/dev/null; then
        echo -e "${YELLOW}⚠️  Account '$ACCOUNT_NAME' already exists${NC}"
        read -p "Do you want to overwrite it? This will DELETE the existing account (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo "Cancelled."
            exit 0
        fi
        
        # Delete existing account
        echo "Deleting existing account..."
        govchaind keys delete "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" --yes
        echo -e "${GREEN}✓ Existing account deleted${NC}"
        echo ""
    fi
    
    echo -e "${YELLOW}🔐 Mnemonic Import${NC}"
    echo "Please enter your mnemonic seed phrase (12-24 words):"
    echo "Example: word1 word2 word3 ... word12"
    echo ""
    echo -e "${YELLOW}⚠️  Warning: Your mnemonic will be visible on screen. Make sure no one is watching.${NC}"
    echo ""
    read -p "Mnemonic: " MNEMONIC
    
    if [ -z "$MNEMONIC" ]; then
        echo -e "${RED}❌ Error: Mnemonic is required${NC}"
        exit 1
    fi
    
    # Basic validation - check word count
    WORD_COUNT=$(echo "$MNEMONIC" | wc -w | tr -d ' ')
    if [ "$WORD_COUNT" -lt 12 ] || [ "$WORD_COUNT" -gt 24 ]; then
        echo -e "${RED}❌ Error: Mnemonic should contain 12-24 words (found $WORD_COUNT)${NC}"
        exit 1
    fi
    
elif [ "$#" -eq 2 ]; then
    # Command line mode
    ACCOUNT_NAME="$1"
    MNEMONIC="$2"
    
    # Validate account name
    if ! echo "$ACCOUNT_NAME" | grep -qE '^[a-zA-Z0-9_-]+$'; then
        echo -e "${RED}❌ Error: Account name must contain only letters, numbers, underscores, and hyphens${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📝 Account name: $ACCOUNT_NAME${NC}"
    
    # Check if account already exists
    if govchaind keys show "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" &>/dev/null; then
        echo -e "${YELLOW}⚠️  Account '$ACCOUNT_NAME' already exists${NC}"
        echo -e "${RED}❌ Error: Account already exists. Use interactive mode to overwrite.${NC}"
        exit 1
    fi
else
    echo "Usage: $0 [account-name] [mnemonic]"
    echo ""
    echo "Examples:"
    echo "  # Interactive mode (recommended for security)"
    echo "  $0"
    echo ""
    echo "  # Command line mode (mnemonic visible in shell history)"
    echo "  $0 alice \"word1 word2 word3 ... word12\""
    echo ""
    echo "Environment variables:"
    echo "  CHAIN_ID=govchain (default)"
    echo "  KEYRING_BACKEND=test (default)"
    echo ""
    exit 1
fi

echo ""
echo "🔄 Importing account from mnemonic..."

# Import the account using echo to pipe the mnemonic
# This avoids having the mnemonic visible in the command line
if echo "$MNEMONIC" | govchaind keys add "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" --recover --interactive=false; then
    echo -e "${GREEN}✅ Account imported successfully!${NC}"
else
    echo -e "${RED}❌ Failed to import account${NC}"
    echo "This could be due to:"
    echo "  - Invalid mnemonic phrase"
    echo "  - Incorrect word count"
    echo "  - Corrupted mnemonic"
    exit 1
fi

echo ""

# Show account details
echo "================================"
echo -e "${GREEN}📋 Account Details${NC}"
echo "================================"

# Get account address
ACCOUNT_ADDRESS=$(govchaind keys show "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" --address)
echo -e "${GREEN}Account Name: $ACCOUNT_NAME${NC}"
echo -e "${GREEN}Address: $ACCOUNT_ADDRESS${NC}"

# Show public key
echo ""
echo "🔑 Public Key Info:"
govchaind keys show "$ACCOUNT_NAME" --keyring-backend "$KEYRING_BACKEND" --pubkey

echo ""
echo "================================"
echo -e "${GREEN}✅ Account Setup Complete${NC}"
echo "================================"

# Show next steps
echo ""
echo "Next Steps:"
echo "1. Check account balance:"
echo -e "   ${BLUE}govchaind query bank balances $ACCOUNT_ADDRESS${NC}"
echo ""
echo "2. List all accounts:"
echo -e "   ${BLUE}govchaind keys list --keyring-backend $KEYRING_BACKEND${NC}"
echo ""
echo "3. Use this account for transactions:"
echo -e "   ${BLUE}govchaind tx ... --from $ACCOUNT_NAME --keyring-backend $KEYRING_BACKEND${NC}"
echo ""

# Additional info if this is not the test keyring
if [ "$KEYRING_BACKEND" != "test" ]; then
    echo -e "${YELLOW}⚠️  Note: You're using keyring backend '$KEYRING_BACKEND'${NC}"
    echo "Make sure to specify --keyring-backend $KEYRING_BACKEND in future commands"
    echo ""
fi

echo "🎉 Account '$ACCOUNT_NAME' is ready to use!"