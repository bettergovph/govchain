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
  pinCount: number;
  creator: string;
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
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'text/csv': 'csv',
  'application/json': 'json',
  'text/plain': 'text',
  'application/pdf': 'pdf',
  'text/html': 'html',
  'application/xml': 'xml',
  'text/xml': 'xml',
} as const;

export type PreviewType = typeof MIME_TYPE_PREVIEWS[keyof typeof MIME_TYPE_PREVIEWS] | 'unknown';