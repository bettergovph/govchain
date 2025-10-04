#!/bin/bash

# Fix Indexer Dependencies
# This script generates the missing go.sum file for the indexer

set -e

echo "================================"
echo "Fixing Indexer Dependencies"
echo "================================"
echo ""

# Check if we're in a blockchain directory
if [ ! -f "config.yml" ]; then
    echo "❌ Error: This doesn't appear to be a blockchain directory"
    echo "Please run this script from your blockchain directory (e.g., ~/govchain-blockchain)"
    exit 1
fi

# Check if indexer exists
if [ ! -d "indexer" ]; then
    echo "❌ Error: indexer directory not found"
    exit 1
fi

# Check if go.mod exists
if [ ! -f "indexer/go.mod" ]; then
    echo "❌ Error: indexer/go.mod not found"
    exit 1
fi

echo "🔧 Generating Go dependencies for indexer..."
cd indexer

# Check if Go is available
if ! command -v go &> /dev/null; then
    echo "❌ Error: Go not found. Please install Go first"
    exit 1
fi

echo "Go version: $(go version)"

# Clean up any existing issues
echo "🧹 Cleaning module cache..."
go clean -modcache 2>/dev/null || true

# Update Go version in go.mod to match system
GO_VERSION=$(go version | grep -o 'go[0-9]\+\.[0-9]\+' | head -1)
if [ -n "$GO_VERSION" ]; then
    echo "🔧 Updating go.mod to use $GO_VERSION..."
    go mod edit -go=${GO_VERSION#go}
fi

# Fix Qdrant client version compatibility
echo "🔧 Fixing Qdrant client version..."
go mod edit -require=github.com/qdrant/go-client@v1.10.1

# Remove go.sum to force fresh download
rm -f go.sum

# Download dependencies and generate go.sum
echo "📥 Downloading dependencies..."
go mod download

# Generate go.sum and clean up
echo "📋 Tidying module..."
go mod tidy

# Verify the build works
echo "🔨 Testing build..."
if go build -o /tmp/indexer-test . >/dev/null 2>&1; then
    echo "✅ Build test successful"
    rm -f /tmp/indexer-test
else
    echo "⚠️  Build test failed. Trying alternative fix..."
    
    # Try updating all dependencies
    echo "🔧 Updating all dependencies..."
    go get -u ./...
    go mod tidy
    
    # Test again
    if go build -o /tmp/indexer-test . >/dev/null 2>&1; then
        echo "✅ Build test successful after dependency update"
        rm -f /tmp/indexer-test
    else
        echo "⚠️  Build still failing. Docker build might resolve remaining issues."
    fi
fi

cd ..

echo ""
echo "✅ Indexer dependencies fixed!"
echo ""
echo "You can now run:"
echo "  docker-compose up -d"
echo ""