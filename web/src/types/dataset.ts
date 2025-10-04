export interface Dataset {
  id: string;
  title: string;
  description: string;
  ipfsCid: string;
  mimeType: string;
  fileName: string;
  fileUrl: string;
  fallbackUrl: string;
  fileSize: number;
  checksumSha256: string;
  agency: string;
  category: string;
  submitter: string;
  timestamp: number;
  pinCount: number;
}

export interface BlockchainResponse {
  Dataset: Dataset[];
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