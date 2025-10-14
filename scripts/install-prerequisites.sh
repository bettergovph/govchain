#!/bin/bash

# OpenGovChain Prerequisites Installation Script
# This script installs all required dependencies for development
# Supports both Linux and macOS

set -e

echo "================================"
echo "OpenGovChain Prerequisites Installer"
echo "================================"
echo ""

# Detect operating system
OS="$(uname -s)"
OS_NAME=$(grep "^ID=" /etc/os-release | cut -d'=' -f2)
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "🔍 Detected OS: ${MACHINE}"
echo ""

# Check if running as root (skip for macOS)
if [ "$EUID" -eq 0 ] && [ "$MACHINE" = "Linux" ]; then 
   echo "ERROR: Please do not run this script as root on Linux"
   exit 1
fi

# Update system packages based on OS
if [ "$MACHINE" = "Linux" ]; then
    echo "📦 Updating system packages for Linux distro: $OS_NAME"
    case "$OS_NAME" in
        fedora)
            echo "🐧 Fedora detected!"
            echo "sudo dnf upgrade (change me into a command bitch)"
            ;;
        *)
            echo "⚠️  Unknown Linux distribution: $OS_NAME"
            echo "📦 Updating system packages (Linux)..."
            sudo apt update
            ;;
    esac
elif [ "$MACHINE" = "Mac" ]; then
    echo "📦 Checking for Homebrew (macOS)..."
    if ! command -v brew &> /dev/null; then
        echo "📦 Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo "✅ Homebrew already installed"
    fi
    echo "📦 Updating Homebrew..."
    brew update
else
    echo "❌ Unsupported operating system: ${MACHINE}"
    exit 1
fi

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

# Install curl if needed
if ! command -v curl &> /dev/null; then
    echo "📦 Installing curl..."
    if [ "$MACHINE" = "Linux" ]; then
        case "$OS_NAME" in
            fedora)
                sudo dnf install -y curl
                ;;
            *)
                sudo apt install -y curl || {
                    echo "⚠️  curl installation failed, trying alternative method..."
                    sudo apt remove -y curl 2>/dev/null
                    sudo apt install -y curl
                }
                ;;
        esac

    elif [ "$MACHINE" = "Mac" ]; then
        # curl is usually pre-installed on macOS, but if missing:
        brew install curl
    fi
else
    echo "✅ Curl already installed: $(curl --version)"
fi

# Install build tools if needed
if ! command -v gcc &> /dev/null; then
    echo "📦 Installing build tools..."
    if [ "$MACHINE" = "Linux" ]; then
        sudo apt install -y build-essential || {
            echo "⚠️  build-essential installation failed, trying alternative method..."
            sudo apt install -y gcc g++ make
        }
    elif [ "$MACHINE" = "Mac" ]; then
        # Install Xcode command line tools
        xcode-select --install 2>/dev/null || echo "✅ Xcode command line tools already installed"
    fi
else
    echo "✅ gcc already installed: $(gcc --version)"
fi

# Install Go 1.24+
echo "🔧 Installing Go 1.24+..."
GO_VERSION="1.25.1"
if ! command -v go &> /dev/null; then
    if [ "$MACHINE" = "Linux" ]; then
        wget https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
        sudo rm -rf /usr/local/go
        sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
        rm go${GO_VERSION}.linux-amd64.tar.gz
        
        # Add Go to PATH for Linux
        echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.bashrc
        echo "export GOPATH=\$HOME/go" >> ~/.bashrc
        echo "export PATH=\$PATH:\$GOPATH/bin" >> ~/.bashrc
        export PATH=$PATH:/usr/local/go/bin
        export GOPATH=$HOME/go
        export PATH=$PATH:$GOPATH/bin
    elif [ "$MACHINE" = "Mac" ]; then
        # Use Homebrew for macOS - install latest Go
        brew install go
        
        # Add Go to PATH for macOS
        echo "export PATH=\$PATH:/opt/homebrew/bin" >> ~/.zshrc
        echo "export GOPATH=\$HOME/go" >> ~/.zshrc
        echo "export PATH=\$PATH:\$GOPATH/bin" >> ~/.zshrc
        export PATH=$PATH:/opt/homebrew/bin
        export GOPATH=$HOME/go
        export PATH=$PATH:$GOPATH/bin
    fi
    
    echo "✅ Go installed: $(go version)"
else
    echo "✅ Go already installed: $(go version)"
fi

# Install Ignite CLI
echo "🔧 Installing Ignite CLI..."
if ! command -v ignite &> /dev/null; then
    if [ "$MACHINE" = "Linux" ]; then
        curl https://get.ignite.com/cli! | bash
        sudo mv ignite /usr/local/bin/
    elif [ "$MACHINE" = "Mac" ]; then
        curl https://get.ignite.com/cli! | bash
        # Move to a location in PATH (no sudo needed on macOS)
        mkdir -p /usr/local/bin 2>/dev/null || true
        mv ignite /usr/local/bin/ 2>/dev/null || {
            # If /usr/local/bin is not writable, try user's local bin
            mkdir -p ~/bin
            mv ignite ~/bin/
            echo "export PATH=\$PATH:~/bin" >> ~/.zshrc
            export PATH=$PATH:~/bin
        }
    fi
    echo "✅ Ignite CLI installed: $(ignite version)"
else
    echo "✅ Ignite CLI already installed: $(ignite version)"
fi

# Install IPFS Kubo
echo "🔧 Installing IPFS Kubo..."
IPFS_VERSION="v0.24.0"
KUBO_TAR="kubo_${IPFS_VERSION}_linux-amd64.tar.gz"
KUBO_URL="https://dist.ipfs.tech/kubo/${IPFS_VERSION}/${KUBO_TAR}"
if ! command -v ipfs &> /dev/null; then
    if [ "$MACHINE" = "Linux" ]; then
        echo "📥 Downloading Kubo from: $KUBO_URL"
        # Clean up old files first (in-case it failed)
        rm -f "$KUBO_TAR"
        wget "$KUBO_URL"

        # Verify it downloaded correctly
        if ! tar -tzf "$KUBO_TAR" &>/dev/null; then
            echo "❌ Download failed or file corrupted. Retrying... (using Curl)"
            rm -f "$KUBO_TAR"
            curl -L -o "$KUBO_TAR" "$KUBO_URL"
        fi

        echo "📦 Extracting..."
        tar -xvzf kubo_${IPFS_VERSION}_linux-amd64.tar.gz

        cd kubo
        sudo bash install.sh
        cd ..

        rm -rf kubo "${KUBO_TAR}"
    elif [ "$MACHINE" = "Mac" ]; then
        # Detect architecture for macOS
        ARCH=$(uname -m)
        if [ "$ARCH" = "arm64" ]; then
            IPFS_ARCH="darwin-arm64"
        else
            IPFS_ARCH="darwin-amd64"
        fi

        KUBO_TAR="kubo_${IPFS_VERSION}_${IPFS_ARCH}.tar.gz"
        KUBO_URL="https://dist.ipfs.tech/kubo/${IPFS_VERSION}/${KUBO_TAR}"

        echo "📥 Downloading Kubo from: $KUBO_URL"
        curl -O "$KUBO_URL"
        tar -xvzf "$KUBO_TAR"
        cd kubo
        sudo bash install.sh
        cd ..
        rm -rf kubo "$KUBO_TAR"
    fi
    echo "✅ IPFS installed: $(ipfs version)"
else
    echo "✅ IPFS already installed: $(ipfs version)"
fi

# Check Docker
echo "🔧 Checking Docker..."
if ! command -v docker &> /dev/null; then
    if [ "$MACHINE" = "Linux" ]; then
        echo "⚠️  Docker not found. Please install Docker Desktop for WSL2:"
        echo "   https://docs.docker.com/desktop/wsl/"
        echo ""
        echo "   After installation, enable WSL integration in Docker Desktop settings."
    elif [ "$MACHINE" = "Mac" ]; then
        echo "⚠️  Docker not found. Please install Docker Desktop for macOS:"
        echo "   https://docs.docker.com/desktop/mac/install/"
        echo ""
        echo "   You can also install via Homebrew:"
        echo "   brew install --cask docker"
    fi
    echo "✅ Docker installed: $(docker --version)"
else
    echo "✅ Docker already installed: $(docker --version)"
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

# Provide OS-specific restart instructions
if [ "$MACHINE" = "Linux" ]; then
    echo "⚠️  IMPORTANT: Please restart your terminal or run:"
    echo "   source ~/.bashrc"
elif [ "$MACHINE" = "Mac" ]; then
    echo "⚠️  IMPORTANT: Please restart your terminal or run:"
    echo "   source ~/.zshrc"
fi

echo ""
echo "Then verify installations with:"
echo "   go version"
echo "   ignite version"
echo "   ipfs version"
echo "   docker --version"
echo ""
