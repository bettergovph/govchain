# Blockchain Explorer

A comprehensive blockchain explorer for the OpenGovChain Cosmos blockchain that provides real-time monitoring of transactions, blocks, and network statistics.

## Features

### 📊 Overview Dashboard
- **Real-time Statistics**: View latest block height, total transactions, active validators, and chain ID
- **Recent Transactions**: Quick view of the 5 most recent transactions with status indicators
- **Recent Blocks**: Display of the latest 5 blocks with transaction counts and timestamps
- **Auto-refresh**: Data automatically updates every 10 seconds

### 💸 Transaction Explorer
- **Transaction List**: Paginated view of all blockchain transactions
- **Transaction Details**: Click any transaction to view complete details including:
  - Transaction hash and status (success/failed)
  - Block height and timestamp
  - Gas used and gas wanted
  - All messages and operations
  - Fee information
  - Execution events
  - Raw logs
- **Status Indicators**: Visual indicators for successful (green) and failed (red) transactions
- **Message Types**: Display of transaction message types (e.g., CreateEntry, Send, etc.)

### 🧱 Block Explorer
- **Block List**: Paginated view of all blocks
- **Block Details**: View block information including:
  - Block height and hash
  - Number of transactions
  - Block proposer address
  - Timestamp
- **Navigation**: Easy pagination through blocks

### 🔍 Search Functionality
- **Search by Transaction Hash**: Look up specific transactions
- **Search by Block Height**: Find blocks by their height number
- **Smart Search**: Automatically detects whether input is a hash or block number

## API Endpoints

### Statistics
```
GET /api/explorer/stats
```
Returns blockchain statistics including latest height, total transactions, validators, and chain ID.

### Transactions
```
GET /api/explorer/transactions?page=1&limit=20
GET /api/explorer/transactions?height=12345
```
Fetch paginated transactions or transactions for a specific block height.

### Transaction Details
```
GET /api/explorer/transaction/[hash]
```
Get complete details for a specific transaction by hash.

### Blocks
```
GET /api/explorer/blocks?page=1&limit=20
GET /api/explorer/blocks?height=12345
```
Fetch paginated blocks or a specific block by height.

## Usage

### Accessing the Explorer
Navigate to `/explorer` in the web application to access the blockchain explorer.

### Viewing Transactions
1. Go to the **Transactions** tab
2. Browse the paginated list of transactions
3. Click on any transaction hash to view detailed information
4. Use pagination controls to navigate through transaction history

### Viewing Blocks
1. Go to the **Blocks** tab
2. Browse the paginated list of blocks
3. View block details including proposer and transaction count
4. Use pagination controls to navigate through block history

### Searching
1. Use the search bar at the top of the explorer
2. Enter a transaction hash (64 character hex string) or block height (number)
3. Press Enter or click the Search button
4. View the results in the appropriate tab

## Technical Details

### Frontend Components
- **`/web/src/app/explorer/page.tsx`**: Main explorer page with tabs for overview, transactions, and blocks
- **`/web/src/app/explorer/tx/[hash]/page.tsx`**: Detailed transaction view page

### API Routes
- **`/web/src/app/api/explorer/stats/route.ts`**: Blockchain statistics endpoint
- **`/web/src/app/api/explorer/transactions/route.ts`**: Transaction list endpoint
- **`/web/src/app/api/explorer/transaction/[hash]/route.ts`**: Single transaction details endpoint
- **`/web/src/app/api/explorer/blocks/route.ts`**: Block list endpoint

### Data Sources
The explorer connects to:
- **Cosmos REST API** (default: `http://localhost:1317`) - For transaction and validator data
- **Tendermint RPC** (default: `http://localhost:26657`) - For block and status data

### Environment Variables
Configure the following in your `.env` or docker-compose:
```bash
BLOCKCHAIN_API=http://localhost:1317
BLOCKCHAIN_NODE=http://localhost:26657
```

## UI Components Used
- **shadcn/ui**: Card, Table, Badge, Button, Input, Tabs, Separator
- **Lucide Icons**: Activity, Box, Hash, CheckCircle2, XCircle, etc.
- **date-fns**: For timestamp formatting

## Features in Development
- [ ] Advanced filtering (by message type, status, date range)
- [ ] Validator details page
- [ ] Network statistics graphs
- [ ] Export transaction data
- [ ] WebSocket support for real-time updates
- [ ] Account/address explorer

## Performance Considerations
- Pagination limits results to 20 items per page by default
- Auto-refresh interval set to 10 seconds to balance freshness with API load
- Transaction hashes and addresses are truncated for better UI display
- Lazy loading of detailed transaction data

## Browser Support
The explorer is built with modern web technologies and supports:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing
When adding new features to the explorer:
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add loading states for async operations
5. Ensure mobile responsiveness
6. Update this documentation
