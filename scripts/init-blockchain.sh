#!/bin/bash

# GovChain Blockchain Initialization Script
# Creates the Cosmos blockchain with custom datasets module

set -e

echo "================================"
echo "GovChain Blockchain Initialization"
echo "================================"
echo ""

# Check if Ignite is installed
if ! command -v ignite &> /dev/null; then
    echo "❌ Error: Ignite CLI not found. Please run install-prerequisites.sh first"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "PROJECT.md" ]; then
    echo "❌ Error: Please run this script from the govchain root directory"
    exit 1
fi

# Remove existing blockchain directory if it exists
if [ -d "govchain" ]; then
    echo "⚠️  Existing blockchain directory found. Removing..."
    rm -rf govchain
fi

echo "🔧 Creating new Cosmos blockchain: govchain"
ignite scaffold chain govchain --no-module

cd govchain

echo "🔧 Creating custom datasets module..."
ignite scaffold module datasets

echo "🔧 Adding CreateDataset message type..."
ignite scaffold message create-dataset \
    title:string \
    description:string \
    ipfsCid:string \
    mimeType:string \
    fileName:string \
    fileUrl:string \
    fallbackUrl:string \
    fileSize:uint \
    checksumSha256:string \
    agency:string \
    category:string \
    --module datasets \
    --response datasetId:uint

echo "🔧 Adding PinDataset message type..."
ignite scaffold message pin-dataset \
    datasetId:uint \
    --module datasets

echo "🔧 Adding Dataset storage type..."
ignite scaffold list dataset \
    title:string \
    description:string \
    ipfsCid:string \
    mimeType:string \
    fileName:string \
    fileUrl:string \
    fallbackUrl:string \
    fileSize:uint \
    checksumSha256:string \
    agency:string \
    category:string \
    submitter:string \
    timestamp:int \
    pinCount:uint \
    --module datasets

echo "🔧 Adding queries..."
ignite scaffold query list-datasets --module datasets
ignite scaffold query get-dataset id:uint --module datasets
ignite scaffold query datasets-by-agency agency:string --module datasets
ignite scaffold query datasets-by-category category:string --module datasets
ignite scaffold query datasets-by-mimetype mimeType:string --module datasets

echo ""
echo "================================"
echo "✅ Blockchain scaffolding complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Customize the message handlers in x/datasets/keeper/"
echo "2. Add validation logic"
echo "3. Test with: cd govchain && ignite chain serve"
echo ""
