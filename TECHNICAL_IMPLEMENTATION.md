GovChain: Setup & Technical Implementation Guide
For AI Agent Assistance

Document Purpose
This guide is designed to help AI agents (like Claude, ChatGPT, or other LLM-based coding assistants) understand the GovChain project structure and provide accurate implementation assistance. It contains high-level architectural decisions, file organization, and implementation patterns WITHOUT extensive code blocks.

Project Structure Overview
govchain-project/
├── govchain-blockchain/         # Cosmos blockchain (created by init script)
│   ├── app/                     # Blockchain application
│   ├── cmd/                     # CLI binaries
│   ├── proto/                   # Protocol buffers
│   ├── x/datasets/              # Custom datasets module
│   ├── config.yml               # Ignite configuration
│   └── testnet/                 # Testnet configs
│
├── indexer-node/                # Vector search indexer
│   ├── src/                     # Source code
│   ├── package.json             # Dependencies
│   ├── Dockerfile               # Container image
│   └── .env                     # Environment config
│
├── web/                         # Next.js frontend
│   ├── src/app/                 # App router pages
│   ├── src/components/          # React components
│   ├── src/lib/                 # Utility libraries
│   ├── src/types/               # TypeScript types
│   └── package.json             # Dependencies
│
├── scripts/                     # Helper scripts
│   ├── setup-testnet.sh         # Testnet initialization
│   ├── quick-setup.sh           # Volunteer node setup
│   └── upload-dataset.sh        # Dataset upload helper
│
├── docs/                        # Documentation
│   ├── VOLUNTEER_NODE_GUIDE.md  # Node operator manual
│   ├── API_REFERENCE.md         # API documentation
│   └── AGENCY_GUIDE.md          # Upload instructions
│
└── docker-compose.yml           # Multi-service orchestration

Part 1: Prerequisites & Environment Setup
System Requirements
For Development Machine:

Ubuntu 20.04+ (or macOS, WSL2)
8 GB RAM minimum
50 GB free disk space
Internet connection

Software Dependencies:

Go 1.21+ - Blockchain development
Ignite CLI - Cosmos blockchain scaffolding tool
IPFS Kubo - Distributed file storage
Docker & Docker Compose - Container orchestration
Node.js 18+ - Web application and indexer
Git - Version control

Installation Commands Reference
AI agents should guide users to:

Update system packages
Install Go from official source (not apt)
Configure Go PATH variables
Install Ignite CLI via curl script
Download and install IPFS binary
Install Docker and add user to docker group
Verify all installations with version checks


Part 2: Cosmos Blockchain Setup
Scaffolding Structure
The blockchain is created using Ignite CLI with the following architecture:
Chain Initialization:

Chain name: govchain
No default modules (use --no-module flag)
Custom module added: datasets

Module Structure:

Module name: datasets
Contains message types, queries, and keepers
Integrates with standard Cosmos SDK modules

Custom Module Components
Message Types to Create:

CreateEntry Message

Fields: title, description, ipfsCid, mimeType, fileName, fileUrl, fallbackUrl, fileSize, checksumSha256, agency, category, submitter, timestamp, pinCount
Signer field: submitter
Returns: entryId


PinEntry Message

Fields: entryId
Signer field: pinner
Tracks which nodes are hosting data



Storage Types:

Entry Type (using scaffold map)

Auto-incrementing ID
All metadata fields (title, description, ipfsCid, etc.)
Timestamp and submitter tracking
Pin count
Generated automatically with CRUD operations


Pin Type (Custom)

Links entry ID to pinner address
Timestamp of pin creation
Requires custom keeper methods



Query Types:

List all entries (list-entry)
Get entry by ID (show-entry)
Get entries by agency (entries-by-agency)
Get entries by category (entries-by-category)
Get entries by MIME type (entries-by-mimetype)
Get pinners for entry (custom query)

Custom Logic Implementation
Files to Modify:

msg_server_create_dataset.go

Validate IPFS CID format (46-100 characters)
Validate SHA-256 checksum (64 hex characters)
Auto-increment dataset counter
Store dataset with timestamp
Emit structured event with all metadata


msg_server_pin_dataset.go

Check if dataset exists
Prevent duplicate pins from same address
Create pin record with timestamp
Increment dataset pin count
Emit pin event


dataset_count.go (new keeper helper)

GetDatasetCount() method
SetDatasetCount() method
Uses binary encoding for storage


pin.go (new keeper helper)

SetPin() method
HasPin() method
GetPinsForDataset() method
Uses prefix store for organization


errors.go

Define custom error codes
ErrInvalidIPFSCid
ErrInvalidChecksum
ErrDatasetNotFound
ErrAlreadyPinned



Protocol Buffer Definitions
Files to Create:

proto/govchain/datasets/pin.proto

Define Pin message structure
Fields: dataset_id, pinner, timestamp
Generates Go types



Configuration Files
config.yml (Ignite):

Defines accounts for testing
Sets initial token balances
Configures validators for testnet

genesis.json modifications:

Custom staking parameters
Governance parameters
Module-specific configurations


Part 3: Vector Search Indexer Setup
Architecture Pattern
The indexer is a separate Go service that:

Polls blockchain API every 30 seconds
Fetches new/updated datasets
Generates text embeddings
Stores vectors in ChromaDB
Provides REST API for search

Indexer Components
Main Application (main.go):

Indexer Struct

ChromaDBClient: Connection to vector DB
openaiClient: For embeddings (optional)
blockchainAPI: URL to Cosmos REST API
collectionName: ChromaDB collection identifier


Initialization (NewIndexer)

Load environment variables
Connect to ChromaDB (with retry logic)
Connect to OpenAI (if API key provided)
Initialize ChromaDB collection if not exists


Collection Setup (initCollection)

Check if collection exists
Create with 1536 dimensions (OpenAI ada-002)
Use Cosine distance metric


Embedding Generation (generateEmbedding)

Takes text input (concatenated metadata)
Calls OpenAI API or fallback to pseudo-embedding
Returns float32 array of 1536 dimensions


Indexing (indexDataset)

Concatenate title, description, agency, category
Generate embedding vector
Create ChromaDB point with ID = dataset ID
Store all metadata as payload
Upsert to collection


Search (searchDatasets)

Generate embedding for query text
Query ChromaDB with vector similarity
Apply filters if provided
Return dataset metadata from payload


Polling (fetchAndIndexAll)

HTTP GET to blockchain API
Parse JSON response
Index each dataset
Log progress and errors


Background Worker (startPolling)

Run in goroutine
Ticker with configurable interval
Call fetchAndIndexAll repeatedly


REST API (Gin framework)

GET /search?q=query&limit=10&agency=X&category=Y
GET /health
POST /reindex
CORS enabled for web access



Dependencies (package.json)
Required packages:

next: React framework
react: UI library
typescript: Type safety
tailwindcss: Styling
lucide-react: Icons
date-fns: Date utilities

Environment Configuration (.env.local)
Variables needed:

CHAIN_ID: Blockchain chain ID
BLOCKCHAIN_NODE: RPC endpoint
BLOCKCHAIN_API: REST endpoint
IPFS_GATEWAY: IPFS gateway URL

Docker Configuration
Dockerfile:

Multi-stage build (builder + runtime)
Use golang:1.21-alpine for small image
Expose port 3000
Run compiled binary

docker-compose.yml:

Service: ChromaDB (official image)
Service: indexer (custom build)
Volume for ChromaDB persistence
Network linking
Port mappings


Part 4: IPFS Integration
Installation & Configuration
Setup Steps:

Download Kubo (go-ipfs) binary
Initialize IPFS repository
Configure storage limits
Start daemon (background or systemd)

Key Configuration:

Datastore.StorageMax: Set based on available space
Gateway: Enable for HTTP access
API: Configure port (default 5001)
Swarm: P2P port (default 4001)

Usage Patterns
Upload Dataset:

Add file to IPFS: ipfs add <file>
Returns CID (content identifier)
Pin to ensure persistence
Submit CID to blockchain

Download Dataset:

Query blockchain for CID
Retrieve from IPFS: ipfs get <CID>
Verify checksum matches blockchain

Pin Dataset (Volunteer):

Get CID from blockchain query
Pin content: ipfs pin add <CID>
Submit PinDataset transaction
Node now serves content

Systemd Service
Create service file for automatic startup:

Service name: ipfs.service
ExecStart: ipfs daemon
Restart policy: on-failure
User: Non-root account


Part 5: Web Interface
Technology Stack

Next.js with App Router
React with TypeScript
Tailwind CSS for styling
API routes for backend integration

Key Features

Search Interface

Text input for queries
Submit triggers vector search API
Display results with metadata
Real-time search with debouncing


Dataset Display

Card-based layout with detailed modal
Shows title, description, metadata
Displays IPFS CID and checksum
Download button to IPFS gateway


Upload Interface

File upload with drag-and-drop
Form validation
Progress tracking
Success/error feedback


API Integration

Next.js API routes (localhost:3000/api)
Fetch from blockchain API via server-side calls
Use IPFS gateway for downloads



File Structure
src/app/:

page.tsx: Main dashboard
api/: Server-side API routes
layout.tsx: Root layout

src/components/:

DatasetCard.tsx: Individual dataset display
DatasetList.tsx: Dataset browsing
UploadSection.tsx: File upload interface
SearchSection.tsx: Search functionality

src/lib/:

blockchain.ts: Blockchain interaction utilities
ipfs.ts: IPFS integration
utils.ts: Common utilities

src/types/:

dataset.ts: TypeScript interfaces

Build process uses Next.js compilation

Part 6: Helper Scripts
setup-testnet.sh
Purpose: Initialize multi-node testnet
Steps:

Build blockchain binary
Run testnet init-files command
Customize genesis.json parameters
Copy genesis to all validator directories
Output instructions for starting nodes

quick-setup.sh
Purpose: One-command volunteer node setup
Steps:

Check if running as root (exit if yes)
Install system dependencies (apt packages)
Install Go if not present
Clone repository
Build blockchain binary
Prompt for node name (moniker)
Initialize node configuration
Download genesis file from URL
Configure persistent peers
Create systemd service file
Enable and start service

upload-dataset.sh
Purpose: Simplify dataset upload for agencies
Parameters:

File path
Title
Description
Agency
Category

Steps:

Validate file exists
Calculate file size
Generate SHA-256 checksum
Upload to IPFS, get CID
Submit CreateDataset transaction
Display confirmation with CID


Part 7: Testnet Deployment
Genesis Configuration
Initial Validators:

Define 3-5 validator nodes
Assign bonded stake amounts
Configure initial accounts with balances

Chain Parameters:

Chain ID: govchain-testnet-1
Bond denomination: stake
Minimum deposit for governance
Staking parameters

Network Topology
Seed Nodes:

2-3 always-online nodes
Public IP addresses
High bandwidth
Listed in persistent_peers

Validator Nodes:

Run by core team and early volunteers
Configured with private validator keys
External address set to public IP
Prometheus metrics enabled

Archive Nodes:

Optional full history nodes
For API access and indexing
No need to validate

Service Configuration
Systemd Service:

Service name: govchaind.service
ExecStart: path to binary + start command
WorkingDirectory: home directory
Restart policy: on-failure
LimitNOFILE: 4096+

Firewall Rules:

Port 26656: P2P (required)
Port 26657: RPC (optional, for queries)
Port 1317: REST API (optional, for apps)
Port 4001: IPFS swarm (required for IPFS)


Part 8: Volunteer Node Guide Structure
Document Sections

Introduction

Purpose of the network
Role of volunteers
Expected commitment


System Requirements

Minimum and recommended specs
Operating system compatibility
Network requirements


Step-by-Step Setup

Installing dependencies
Building binaries
Initializing node
Downloading genesis
Configuring peers
Starting service


Optional IPFS Setup

Installing IPFS
Configuration
Pinning datasets
Registering pins on-chain


Becoming a Validator

Creating wallet
Requesting testnet tokens
Submitting create-validator transaction
Understanding responsibilities


Monitoring & Maintenance

Checking sync status
Viewing logs
Resource monitoring
Updating software


Troubleshooting

Common errors and solutions
How to reset node
Disk space management
Network connectivity issues


Support & Community

Discord/forum links
GitHub issues
FAQ section




Part 9: Production Deployment Considerations
Security Hardening
Blockchain:

Enable firewall (ufw/iptables)
Restrict RPC access to localhost or VPN
Use strong validator keys
Regular security updates
Rate limiting on public endpoints

IPFS:

Configure storage limits
Block malicious content (optional)
Bandwidth throttling
Private swarm option (if needed)

Indexer:

API rate limiting
Input validation
HTTPS/TLS for production
Authentication for admin endpoints

Monitoring Stack
Prometheus Metrics:

Blockchain node metrics
IPFS metrics
Indexer service metrics
System metrics (CPU, RAM, disk)

Grafana Dashboards:

Network health overview
Validator performance
Storage utilization
Search query statistics

Alerting:

Node down alerts
High block time
Low peer count
Disk space warnings

Backup Strategy
Blockchain:

Regular state snapshots
Genesis file backup
Validator keys (encrypted)

IPFS:

Pin list export
Critical content backup to Arweave
Redundant pinning services

Database:

ChromaDB collection snapshots
Configuration backups

Scaling Considerations
Horizontal Scaling:

Multiple indexer instances behind load balancer
Read replicas for blockchain queries
IPFS cluster for distributed pinning

Vertical Scaling:

Increase node resources as state grows
SSD required for blockchain state
RAM for IPFS caching

Optimization:

Pruning old blockchain states
IPFS garbage collection
Database indexing for queries


Part 10: API Reference Structure
Blockchain REST API
Endpoints:

GET /govchain/datasets/v1/entry - List all
GET /govchain/datasets/v1/entry/{id} - Get by ID
GET /govchain/datasets/v1/entrys-by-agency/{agency} - Filter
POST /cosmos/tx/v1beta1/txs - Submit transaction

Response Format:

JSON
Includes pagination
Contains dataset metadata

Search API
Endpoints:

GET /search?q=query&limit=10&agency=X&category=Y
GET /health
POST /reindex (admin)

Request Parameters:

q: Search query string (required)
limit: Number of results (optional, default 10)
agency: Filter by agency (optional)
category: Filter by category (optional)

Response Format:

JSON
Contains query, count, results array
Each result has full dataset metadata

IPFS Gateway
Public Gateways:

https://ipfs.io/ipfs/{CID}
https://cloudflare-ipfs.com/ipfs/{CID}
https://gateway.pinata.cloud/ipfs/{CID}

Local Gateway:

http://localhost:8080/ipfs/{CID}


Part 11: Development Workflow
Local Testing Environment

Start Blockchain:

Navigate to blockchain directory (~/govchain-blockchain)
Use ignite chain serve
Runs single validator
Creates test accounts
Auto-restarts on code changes


Start IPFS:

Run ipfs daemon in background
Accessible on localhost:5001 (API)
Gateway on localhost:8080


Start Indexer:

Run npm start in indexer-node directory
Polls blockchain every 30s
API on localhost:3001


Start Web Application:

Run npm run dev in web directory
Next.js dev server with hot reload
API on localhost:3000



Testing Workflow

Create Test Dataset:

Create dummy file
Add to IPFS
Submit CreateEntry transaction
Verify on blockchain


Test Search:

Wait for indexer to poll (or trigger reindex)
Query search API
Verify results contain entry


Test Download:

Get IPFS CID from search results
Download via gateway
Verify checksum



Debugging Tools

Blockchain logs: govchaind status
Transaction queries: govchaind query tx {hash}
IPFS diagnostics: ipfs diag sys
ChromaDB admin UI: http://localhost:6333/dashboard
Browser DevTools for frontend


Part 12: Key Implementation Patterns
Event-Driven Architecture
Pattern: Blockchain emits events → Indexer listens → Updates search DB
Implementation:

Cosmos module emits structured events
Indexer polls REST API (simpler than WebSocket)
Extract new datasets from response
Generate embeddings
Update vector database

Alternative: Use Cosmos SDK event subscriptions (more complex but real-time)
Data Validation Pattern
Three Layers:

Frontend: Client-side validation for UX
Blockchain: Cryptographic validation, state checks
Indexer: Re-validation before indexing

Example Validations:

IPFS CID format (base58, correct length)
SHA-256 checksum (64 hex characters)
File size reasonable (< 10 GB per dataset)
Title/description length limits

Error Handling Pattern
Blockchain:

Return specific error types
Include human-readable messages
Log errors with context

Indexer:

Retry on network errors
Skip and log on data errors
Continue processing other items

Frontend:

Display user-friendly errors
Provide retry options
Log to console for debugging

Caching Strategy
IPFS:

Recently accessed content cached automatically
Popular datasets served faster
Gateway caching (HTTP headers)

Search Results:

No caching (always fresh from vector DB)
Could add Redis layer for popular queries

Blockchain Queries:

Cache static data (genesis, params)
Fresh data for dynamic queries


Part 13: Integration Points
Blockchain ↔ IPFS
Connection: CID stored on-chain, content on IPFS
Data Flow:

Upload file → IPFS
Get CID → Store on blockchain
Query blockchain → Get CID
Retrieve from IPFS → Download content

Blockchain ↔ Indexer
Connection: REST API polling
Data Flow:

New dataset created on blockchain
Indexer polls API periodically
Fetches new datasets
Indexes into vector DB

Alternative: WebSocket subscription (real-time)
Indexer ↔ Frontend
Connection: REST API
Data Flow:

User enters search query
Frontend calls indexer API
Indexer returns results
Frontend displays datasets
User clicks download → IPFS gateway

External Integrations (Future)

Arweave: Permanent backup storage
Filecoin: Incentivized storage deals
The Graph: Blockchain indexing
Oracle Networks: Off-chain data verification


Part 14: Common AI Agent Assistance Scenarios
Scenario 1: "Help me set up the blockchain"
AI should guide through:

Installing prerequisites
Running Ignite scaffold commands
Creating custom module structure
Implementing message handlers
Testing locally with ignite chain serve

Scenario 2: "My indexer won't connect to ChromaDB"
AI should check:

Is ChromaDB running? (docker ps)
Correct URL in .env file
Port accessibility (firewall)
Network configuration in Docker
Review error logs

Scenario 3: "How do I add a new query type?"
AI should explain:

Use Ignite scaffold query command
Implement keeper method
Add to proto definitions
Test via CLI and REST API

Scenario 4: "Search returns no results"
AI should debug:

Is indexer running and polling?
Check indexer logs for errors
Verify embeddings are generated
Test ChromaDB collection has data
Check query embedding generation

Scenario 5: "I want to add metadata filtering"
AI should guide:

Update search function in indexer
Add filter parameters to API endpoint
Build ChromaDB filter conditions
Update frontend to send filters
Test with various filter combinations


Part 15: File Modification Checklist
When AI agents help implement features, they should track these files:
Adding New Dataset Field
Files to modify:

proto/govchain/datasets/v1/entry.proto - Add field
Message handler - Include in storage logic
Indexer payload - Add to vector DB metadata
Frontend - Display in UI
Upload script - Accept new parameter

Adding New Query
Files to modify:

Scaffold with Ignite CLI
keeper/query_*.go - Implement logic
API documentation
Frontend to consume endpoint

Adding New Message Type
Files to modify:

Scaffold with Ignite CLI
keeper/msg_server_*.go - Implement handler
Validation in errors.go
Event emission
CLI command (if needed)
Frontend integration

Modifying Indexer
Files to modify:

indexer/main.go - Update logic
.env - New configuration variables
docker-compose.yml - If dependencies change
API documentation


Part 16: Testing Guidelines
Unit Tests
Blockchain:

Test message validation
Test keeper methods
Test query functions
Mock external dependencies

Indexer:

Test embedding generation
Test search logic
Test error handling
Mock ChromaDB and blockchain APIs

Integration Tests

Full workflow: Upload → Index → Search → Download
Multi-node validator consensus
IPFS pinning and retrieval
API endpoint responses

Load Tests

Concurrent dataset uploads
Search query performance
IPFS gateway throughput
Blockchain transaction rate

Test Data
Create realistic test datasets:

Various file sizes (1 KB to 1 GB)
Different agencies and categories
Edge cases (empty descriptions, special characters)
Historical timestamps


Part 17: Documentation Maintenance
Keep Updated

API Reference - After any endpoint changes
Volunteer Guide - When setup process changes
Architecture Diagrams - After major refactoring
Changelog - For every release

Documentation Structure

README.md - Quick start and overview
CONTRIBUTING.md - How to contribute code
ARCHITECTURE.md - System design details
API.md - Complete API reference
DEPLOYMENT.md - Production setup guide
FAQ.md - Common questions


Summary for AI Agents
This project consists of three main services:

Cosmos Blockchain (govchain/)

Stores dataset metadata and provenance
Built with Ignite CLI and Cosmos SDK
Custom module: x/datasets
Key operations: CreateDataset, PinDataset


Vector Search Indexer (indexer/)

Go application using Gin framework
Polls blockchain, indexes to ChromaDB
Provides semantic search API
Uses OpenAI embeddings (or fallback)


IPFS Network

Stores actual dataset files
Content-addressed, distributed
Volunteer-operated pinning nodes



Supporting Components:

Web interface (simple HTML/JS)
Helper scripts (bash)
Documentation (markdown)
Docker orchestration

Key Integration Points:

Blockchain stores IPFS CIDs
Indexer reads blockchain via REST API
Frontend queries both indexer and blockchain
IPFS provides file downloads

Development Workflow:

Start all services locally
Test with dummy data
Verify full data flow
Deploy to testnet
Recruit volunteers
Monitor and iterate

When helping users, AI agents should:

Reference this structure
Provide targeted file modifications
Explain architectural decisions
Guide through debugging systematically
Suggest best practices from this guide