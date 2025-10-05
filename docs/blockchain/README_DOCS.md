# Blockchain Documentation Separation

This directory contains blockchain-specific documentation that gets copied to the generated blockchain directory during installation.

## Structure

```
docs/blockchain/
├── README.md                    # Blockchain-specific project overview
├── GETTING_STARTED.md          # Blockchain setup and development guide  
└── TECHNICAL_IMPLEMENTATION.md # Technical architecture and implementation
```

## Purpose

These files are **blockchain-specific** versions of the main project documentation, designed for:

1. **Generated Blockchain Directories**: Files copied to `~/govchain-blockchain` during setup
2. **Node Operators**: Documentation for running blockchain nodes
3. **Government Agencies**: Guides for submitting datasets
4. **Volunteer Validators**: Instructions for joining the network

## Key Differences from Main Project Docs

### Main Project (`/README.md`, `/GETTING_STARTED.md`, `/TECHNICAL_IMPLEMENTATION.md`)
- **Scope**: Full GovChain ecosystem (web app, indexer, blockchain, IPFS)
- **Audience**: Developers, system administrators, full deployment
- **Focus**: Complete platform setup and integration

### Blockchain Docs (`/docs/blockchain/*.md`)
- **Scope**: Blockchain node and network only
- **Audience**: Node operators, validators, government agencies
- **Focus**: Blockchain operation, dataset submission, network participation

## Installation Integration

The `init-blockchain.sh` script copies these files to the blockchain directory:

```bash
# Before: Copied webapp-specific files
cp "$SETUP_DIR/README.md" .
cp "$SETUP_DIR/GETTING_STARTED.md" .
cp "$SETUP_DIR/TECHNICAL_IMPLEMENTATION.md" .

# After: Copies blockchain-specific files
cp "$SETUP_DIR/docs/blockchain/README.md" .
cp "$SETUP_DIR/docs/blockchain/GETTING_STARTED.md" .
cp "$SETUP_DIR/docs/blockchain/TECHNICAL_IMPLEMENTATION.md" .
```

## Benefits

1. **Clear Separation**: Blockchain docs focus only on blockchain functionality
2. **Customizable Installation**: Blockchain directory at `~/govchain-blockchain` has relevant docs
3. **Audience-Specific**: Each documentation set serves its intended audience
4. **Maintainability**: Changes to blockchain docs don't affect main project docs

## Content Overview

### README.md (Blockchain)
- Tokenless blockchain mission and architecture
- Government data transparency focus
- Volunteer validator network information
- Network participation guides

### GETTING_STARTED.md (Blockchain)
- Node setup and configuration
- Government agency onboarding
- Dataset submission workflows
- Validator participation guide

### TECHNICAL_IMPLEMENTATION.md (Blockchain)
- Cosmos SDK module architecture
- IPFS integration details
- Security implementation
- API reference and development guide

---

This separation ensures that users who install the blockchain component receive documentation tailored to their needs, while the main project documentation covers the full ecosystem.