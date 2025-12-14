export interface Dataset {
  index: string;
  title: string;
  description: string;
  ipfs_cid: string;
  mime_type: string;
  file_name: string;
  file_url: string;
  fallback_url: string;
  file_size: number;
  checksum_sha_256: string;
  agency: string;
  category: string;
  submitter: string;
  timestamp: number;
  pin_count: number;
  creator: string;
  tx_hash?: string;
}

export interface BlockchainResponse {
  entry?: Dataset[];
  pagination: {
    next_key: string;
    total: string;
  };
}

export interface SearchResponse {
  query: string;
  count: number;
  results: Dataset[];
}

export interface TransactionResult {
  txhash: string;
  raw_log: string;
  logs: Array<{
    events: Array<{
      type: string;
      attributes: Array<{
        key: string;
        value: string;
      }>;
    }>;
  }>;
}

export interface UploadResponse extends TransactionResult {
  dataset: Dataset;
  summary?: {
    transaction: {
      hash: string;
      height: number;
      status: string;
      gas_used: string;
      gas_wanted: string;
      timestamp: string;
    };
    file: {
      name: string;
      size: number;
      size_formatted: string;
      mime_type: string;
      checksum: string;
    };
    ipfs: {
      cid: string;
      gateway_url: string;
      pinned: boolean;
      size: number;
    };
    blockchain: {
      entry_id: string;
      chain_id: string;
      module: string;
      message_type: string;
      creator: string;
    };
    metadata: {
      title: string;
      description: string;
      agency: string;
      category: string;
      submitter: string;
      timestamp: number;
    };
  };
}

export interface UploadRequest {
  title: string;
  description: string;
  agency: string;
  category: string;
  fallbackUrl?: string;
  submitter?: string;
}

export const MIME_TYPE_PREVIEWS = {
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  'image/tiff': 'image',
  'text/csv': 'csv',
  'application/json': 'json',
  'text/plain': 'text',
  'application/pdf': 'pdf',
  'text/html': 'html',
  'application/xml': 'xml',
  'text/xml': 'xml',
} as const;

export type PreviewType = typeof MIME_TYPE_PREVIEWS[keyof typeof MIME_TYPE_PREVIEWS] | 'unknown';

// Helper function to check if a mime type is an image
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

// Helper function to get supported image formats
export function getSupportedImageFormats(): string[] {
  return Object.keys(MIME_TYPE_PREVIEWS).filter(mime => MIME_TYPE_PREVIEWS[mime as keyof typeof MIME_TYPE_PREVIEWS] === 'image');
}
