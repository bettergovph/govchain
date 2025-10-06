import { NextRequest, NextResponse } from 'next/server';
import { uploadToIPFS } from '@/lib/ipfs';
import { UploadRequest, Dataset, TransactionResult, UploadResponse } from '@/types/dataset';
import { getGovChainClient } from '@/lib/govchaind-client';
import crypto from 'crypto';

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const metadataStr = formData.get('metadata') as string;

    if (!metadataStr) {
      return NextResponse.json(
        { error: 'No metadata provided' },
        { status: 400 }
      );
    }

    const metadata: UploadRequest = JSON.parse(metadataStr);

    // Validate required fields
    if (!metadata.title || !metadata.description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, agency, category' },
        { status: 400 }
      );
    }

    // Handle file upload and checksum (if file provided)
    let ipfsResult: { cid: string; size: number } | null = null;
    let checksum = '';
    let fileUrl = '';
    let mimeType = 'text/plain';
    let fileName = 'No file';
    let fileSize = 0;

    if (file) {
      // Upload to IPFS
      ipfsResult = await uploadToIPFS(file);

      // Calculate file checksum
      const buffer = await file.arrayBuffer();
      checksum = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');

      fileUrl = `https://ipfs.io/ipfs/${ipfsResult.cid}`;
      mimeType = file.type || 'application/octet-stream';
      fileName = file.name;
      fileSize = ipfsResult.size;
    }

    // Prepare blockchain submission
    const govchainClient = await getGovChainClient();
    const submitter = metadata.submitter || 'alice'; // Default to alice for development
    const timestamp = Math.floor(Date.now() / 1000);
    const fallbackUrl = metadata.fallbackUrl || '';

    // Create unique entry ID
    const entryId = file ? `entry-${timestamp}-${ipfsResult!.cid.slice(-8)}` : `entry-${timestamp}-${Math.random().toString(36).substr(2, 8)}`;

    // Submit to blockchain using GovChain client
    try {
      const result = await govchainClient.createEntry({
        id: entryId,
        title: metadata.title,
        description: metadata.description,
        ipfsCid: ipfsResult?.cid || '',
        mimeType: mimeType,
        fileName: fileName,
        fileUrl: fileUrl,
        fallbackUrl: fallbackUrl,
        fileSize: fileSize.toString(),
        checksumSha256: checksum,
        agency: metadata.agency,
        category: metadata.category,
        submitter: submitter,
        timestamp: timestamp.toString(),
        pinCount: "0"
      });

      const txhash = result.transactionHash;

      if (!txhash) {
        throw new Error('Transaction submitted but no hash returned');
      }

      // Prepare response dataset object
      const dataset: Dataset = {
        index: txhash,
        title: metadata.title,
        description: metadata.description,
        ipfs_cid: ipfsResult?.cid || '',
        mime_type: mimeType,
        file_name: fileName,
        file_url: fileUrl,
        fallback_url: fallbackUrl,
        file_size: fileSize,
        checksum_sha_256: checksum,
        agency: metadata.agency,
        category: metadata.category,
        submitter: submitter,
        timestamp: timestamp * 1000, // Convert to milliseconds for frontend
        pinCount: 0,
        creator: submitter,
      };

      const responseData: UploadResponse = {
        txhash,
        raw_log: `Transaction successful at height`,
        logs: [],
        dataset,
        summary: {
          transaction: {
            hash: txhash,
            height: 0,
            status: 'success',
            gas_used: '',
            gas_wanted: '',
            timestamp: new Date().toISOString()
          },
          file: {
            name: fileName,
            size: fileSize,
            size_formatted: formatFileSize(fileSize),
            mime_type: mimeType,
            checksum: checksum
          },
          ipfs: {
            cid: ipfsResult?.cid || '',
            gateway_url: fileUrl,
            pinned: !!ipfsResult,
            size: fileSize
          },
          blockchain: {
            entry_id: entryId,
            chain_id: 'govchain',
            module: 'datasets',
            message_type: '/govchain.datasets.v1.MsgCreateEntry',
            creator: submitter
          },
          metadata: {
            title: metadata.title,
            description: metadata.description,
            agency: metadata.agency,
            category: metadata.category,
            submitter: submitter,
            timestamp: timestamp
          }
        }
      };

      return NextResponse.json(responseData);

    } catch (blockchainError) {
      console.error('Blockchain submission failed:', blockchainError);
      throw new Error(`Blockchain transaction failed: ${blockchainError instanceof Error ? blockchainError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error('Upload failed:', error);

    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}