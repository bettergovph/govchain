#!/bin/bash

# OpenGovChain Quick Start Script
# Starts all services for local development

set -e

echo "================================"
echo "OpenGovChain Quick Start"
echo "================================"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v go &> /dev/null; then
    echo "❌ Go not found. Please run: ./scripts/install-prerequisites.sh"
    exit 1
fi

if ! command -v ignite &> /dev/null; then
    echo "❌ Ignite CLI not found. Please run: ./scripts/install-prerequisites.sh"
    exit 1
fi

if ! command -v ipfs &> /dev/null; then
    echo "❌ IPFS not found. Please run: ./scripts/install-prerequisites.sh"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop for WSL2"
    exit 1
fi

echo "✅ All prerequisites installed"
echo ""

# Initialize blockchain if needed
if [ ! -d "govchain" ]; then
    echo "🔧 Blockchain not initialized. Running init-blockchain.sh..."
    chmod +x scripts/init-blockchain.sh
    ./scripts/init-blockchain.sh
fi

# Initialize IPFS if needed
if [ ! -d "$HOME/.ipfs" ]; then
    echo "🔧 Initializing IPFS..."
    ipfs init
fi

# Start Docker services
echo "🐳 Starting Docker services (ChromaDB, Web)..."
docker compose up -d chromadb web

# Wait for ChromaDB to be ready
echo "⏳ Waiting for ChromaDB to start..."
sleep 5

# Start IPFS daemon in background
echo "📦 Starting IPFS daemon..."
if ! pgrep -x "ipfs" > /dev/null; then
    ipfs daemon > /tmp/ipfs.log 2>&1 &
    echo "✅ IPFS daemon started (logs: /tmp/ipfs.log)"
else
    echo "✅ IPFS daemon already running"
fi

# Start blockchain
echo "⛓️  Starting blockchain..."
echo "   This will open in a new terminal. Press Ctrl+C to stop."
echo ""
echo "Run in a new terminal:"
echo "  cd govchain && ignite chain serve"
echo ""

# Start indexer
echo "🔍 To start the indexer, run in another terminal:"
echo "  cd indexer && cp .env.example .env && go run main.go"
echo ""

echo "================================"
echo "✅ Services Started!"
echo "================================"
echo ""
echo "Access points:"
echo "  🌐 Web Interface: http://localhost:8080"
echo "  🔍 Search API: http://localhost:3000"
echo "  📊 ChromaDB Dashboard: http://localhost:6333/dashboard"
echo "  📦 IPFS Gateway: http://localhost:8080/ipfs/<CID>"
echo "  ⛓️  Blockchain API: http://localhost:1317"
echo ""
echo "Next steps:"
echo "  1. Start blockchain: cd govchain && ignite chain serve"
echo "  2. Start indexer: cd indexer && go run main.go"
echo "  3. Upload test data: ./scripts/upload-dataset.sh <file> <title> <desc> <agency> <category>"
echo ""
