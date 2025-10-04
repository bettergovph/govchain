#!/bin/bash

# GovChain Prerequisites Installation Script
# This script installs all required dependencies for development

set -e

echo "================================"
echo "GovChain Prerequisites Installer"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "ERROR: Please do not run this script as root"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# # Fix broken packages first
# echo "🔧 Fixing any broken packages..."
# sudo apt --fix-broken install -y
# sudo dpkg --configure -a

# # Update package lists and upgrade
# echo "📦 Upgrading existing packages..."
# sudo apt upgrade -y

# Install basic dependencies
# echo "📦 Installing basic dependencies..."
# sudo apt install -y wget git jq

# # Install curl separately (if needed)
if ! command -v curl &> /dev/null; then
    echo "📦 Installing curl..."
    sudo apt install -y curl || {
        echo "⚠️  curl installation failed, trying alternative method..."
        sudo apt remove -y curl 2>/dev/null
        sudo apt install -y curl
    }
fi

# Install build-essential separately (if needed)
if ! command -v gcc &> /dev/null; then
    echo "📦 Installing build-essential..."
    sudo apt install -y build-essential || {
        echo "⚠️  build-essential installation failed, trying alternative method..."
        sudo apt install -y gcc g++ make
    }
fi

# Install Go 1.21
echo "🔧 Installing Go 1.21..."
GO_VERSION="1.21.6"
if ! command -v go &> /dev/null; then
    wget https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    rm go${GO_VERSION}.linux-amd64.tar.gz
    
    # Add Go to PATH
    echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.bashrc
    echo "export GOPATH=\$HOME/go" >> ~/.bashrc
    echo "export PATH=\$PATH:\$GOPATH/bin" >> ~/.bashrc
    export PATH=$PATH:/usr/local/go/bin
    export GOPATH=$HOME/go
    export PATH=$PATH:$GOPATH/bin
    
    echo "✅ Go installed: $(go version)"
else
    echo "✅ Go already installed: $(go version)"
fi

# Install Ignite CLI
echo "🔧 Installing Ignite CLI..."
if ! command -v ignite &> /dev/null; then
    curl https://get.ignite.com/cli! | bash
    sudo mv ignite /usr/local/bin/
    echo "✅ Ignite CLI installed: $(ignite version)"
else
    echo "✅ Ignite CLI already installed: $(ignite version)"
fi

# Install IPFS Kubo
echo "🔧 Installing IPFS Kubo..."
IPFS_VERSION="v0.24.0"
if ! command -v ipfs &> /dev/null; then
    wget https://dist.ipfs.tech/kubo/${IPFS_VERSION}/kubo_${IPFS_VERSION}_linux-amd64.tar.gz
    tar -xvzf kubo_${IPFS_VERSION}_linux-amd64.tar.gz
    cd kubo
    sudo bash install.sh
    cd ..
    rm -rf kubo kubo_${IPFS_VERSION}_linux-amd64.tar.gz
    echo "✅ IPFS installed: $(ipfs version)"
else
    echo "✅ IPFS already installed: $(ipfs version)"
fi

# Check Docker
echo "🔧 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Please install Docker Desktop for WSL2:"
    echo "   https://docs.docker.com/desktop/wsl/"
    echo ""
    echo "   After installation, enable WSL integration in Docker Desktop settings."
else
    echo "✅ Docker installed: $(docker --version)"
fi

# Check Docker Compose
if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        echo "✅ Docker Compose installed: $(docker compose version)"
    else
        echo "⚠️  Docker Compose not found"
    fi
fi

echo ""
echo "================================"
echo "✅ Prerequisites installation complete!"
echo "================================"
echo ""
echo "⚠️  IMPORTANT: Please restart your terminal or run:"
echo "   source ~/.bashrc"
echo ""
echo "Then verify installations with:"
echo "   go version"
echo "   ignite version"
echo "   ipfs version"
echo "   docker --version"
echo ""
