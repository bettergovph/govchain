# OpenGovChain Web Interface

A Next.js web application for the OpenGovChain dataset portal. This application provides a user-friendly interface for uploading, searching, and managing government datasets on the blockchain.

## Features

### 🔍 **Search & Browse**
- **Natural language search** powered by vector embeddings
- **Filter by agency** and category
- **Semantic similarity** matching
- **Real-time results** from blockchain and indexer APIs

### 📤 **Upload Datasets**
- **Drag-and-drop file upload** with progress tracking
- **Automatic IPFS integration** for decentralized storage
- **Blockchain transaction** submission with metadata
- **File validation** and checksum generation
- **Support for multiple formats**: CSV, JSON, XML, PDF, TXT, Excel

### 📊 **Dataset Management**
- **Browse all datasets** with sorting and filtering
- **Detailed dataset information** including blockchain data
- **File previews** based on MIME type
- **Download capabilities** with multiple access URLs
- **Transaction verification** and blockchain records

### 🎨 **User Experience**
- **Modern UI** built with shadcn/ui components
- **Responsive design** for desktop and mobile
- **Real-time updates** and progress indicators
- **Accessible interface** with proper ARIA labels
- **Dark mode support** (inherits from system)

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Build System**: Next.js App Router

## Getting Started

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   BLOCKCHAIN_API=http://localhost:1317
   INDEXER_API=http://localhost:9002
   NEXT_PUBLIC_BLOCKCHAIN_API=http://localhost:1317
   NEXT_PUBLIC_INDEXER_API=http://localhost:9002
   NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Production

Build and run the production version:

```bash
npm run build
npm start
```

### Docker

Build and run with Docker:

```bash
docker build -t govchain-web .
docker run -p 3000:3000 govchain-web
```

## API Integration

The web interface integrates with several APIs:

### Blockchain API (`/api/datasets`)
- **List datasets**: `GET /api/datasets`
- **Get dataset**: `GET /api/datasets/{id}`
- **Upload dataset**: `POST /api/upload`

### Search API (`/api/search`)
- **Search datasets**: `GET /api/search?q={query}&agency={agency}&category={category}`

### External APIs
- **Blockchain REST API**: Direct integration with Cosmos SDK REST endpoints
- **Indexer API**: Vector search and semantic matching
- **IPFS Gateways**: File download and preview capabilities

## File Upload Process

The upload process follows these steps:

1. **File Selection**: User selects file via drag-drop or file picker
2. **Validation**: File size, type, and form validation
3. **IPFS Upload**: File uploaded to IPFS network, returns CID
4. **Checksum**: SHA-256 hash calculated for verification
5. **Blockchain Transaction**: Metadata submitted to blockchain
6. **Confirmation**: Transaction hash and dataset info returned

## Search Functionality

The search system provides multiple ways to find datasets:

### Natural Language Search
- Powered by vector embeddings and semantic matching
- Examples: "climate change data", "healthcare statistics 2024"

### Filtering Options
- **Agency**: Filter by government agency
- **Category**: Filter by data category
- **Combined**: Use search + filters together

### Fallback Search
- If vector search is unavailable, falls back to text-based search
- Ensures search functionality is always available

## Component Architecture

### Main Components
- **`SearchSection`**: Search interface and results
- **`UploadSection`**: File upload form and progress
- **`DatasetList`**: Browse all datasets with filtering
- **`DatasetCard`**: Individual dataset display with actions

### UI Components
- Built with shadcn/ui for consistent design
- Fully customizable with Tailwind CSS
- Responsive and accessible by default

## Environment Configuration

### Development Environment Variables
```env
# API endpoints
BLOCKCHAIN_API=http://localhost:1317
INDEXER_API=http://localhost:9002

# Public variables (browser accessible)
NEXT_PUBLIC_BLOCKCHAIN_API=http://localhost:1317
NEXT_PUBLIC_INDEXER_API=http://localhost:9002
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io
```

### Production Environment Variables
```env
# Use production endpoints
BLOCKCHAIN_API=https://api.govchain.example.com
INDEXER_API=https://search.govchain.example.com
NEXT_PUBLIC_BLOCKCHAIN_API=https://api.govchain.example.com
NEXT_PUBLIC_INDEXER_API=https://search.govchain.example.com
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io
```

## Deployment

### Docker Compose

The web interface is included in the main docker-compose.yml:

```yaml
web-nextjs:
  build:
    context: ./web-nextjs
    dockerfile: Dockerfile
  ports:
    - "9004:3000"
  environment:
    - BLOCKCHAIN_API=http://host.docker.internal:1317
    - INDEXER_API=http://indexer:3000
  depends_on:
    - indexer
```

### Standalone Deployment

For production deployment, consider:

1. **Build optimization**: Enable Next.js optimizations
2. **CDN integration**: Use for static assets
3. **Load balancing**: Multiple instances behind load balancer
4. **SSL/TLS**: HTTPS termination at load balancer or reverse proxy

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow Next.js conventions for file organization
- Use ESLint and Prettier for code formatting
- Component props should be properly typed

### Component Guidelines
- Keep components focused and reusable
- Use proper error boundaries
- Handle loading and error states
- Follow accessibility best practices

### API Integration
- Always handle API errors gracefully
- Provide fallback options when possible
- Use proper HTTP status codes
- Include user-friendly error messages

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **JavaScript required**: App requires JavaScript enabled
- **ES2020+ features**: Uses modern JavaScript features

## Performance Considerations

- **Code splitting**: Automatic with Next.js App Router
- **Image optimization**: Next.js Image component for IPFS images
- **API caching**: Strategic caching for blockchain data
- **Bundle optimization**: Tree shaking and minification

## Security Features

- **Input validation**: Client and server-side validation
- **XSS protection**: React's built-in XSS protection
- **CSRF protection**: Next.js built-in CSRF protection
- **Content Security Policy**: Configurable CSP headers
- **File upload limits**: Size and type restrictions

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if blockchain/indexer services are running
   - Verify environment variables are correct
   - Check network connectivity

2. **Upload Fails**
   - Verify file size is under 100MB limit
   - Check if IPFS is running and accessible
   - Ensure blockchain has sufficient balance

3. **Search Not Working**
   - Check if indexer service is running
   - Verify vector database is populated
   - Falls back to text search automatically

### Debug Mode

Enable debug logging in development:
```bash
DEBUG=* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of OpenGovChain and follows the same license terms.