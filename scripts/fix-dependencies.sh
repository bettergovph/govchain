#!/bin/bash

# Quick fix for Ubuntu package dependency issues
# Run this before install-prerequisites.sh

set -e

echo "================================"
echo "Fixing Ubuntu Package Dependencies"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "ERROR: Please do not run this script as root"
   exit 1
fi

echo "🔧 Step 1: Fixing broken packages..."
sudo apt --fix-broken install -y
sudo dpkg --configure -a

echo "🔧 Step 2: Cleaning package cache..."
sudo apt clean
sudo apt autoclean

echo "🔧 Step 3: Updating package lists..."
sudo apt update

echo "🔧 Step 4: Attempting to upgrade held packages..."
sudo apt upgrade -y

echo "🔧 Step 5: Removing conflicting curl version..."
sudo apt remove -y curl 2>/dev/null || true

echo "🔧 Step 6: Installing fresh curl..."
sudo apt install -y curl

echo "🔧 Step 7: Installing build tools individually..."
sudo apt install -y gcc g++ make libc6-dev

echo ""
echo "================================"
echo "✅ Dependencies fixed!"
echo "================================"
echo ""
echo "Now you can run:"
echo "  ./scripts/install-prerequisites.sh"
echo ""
