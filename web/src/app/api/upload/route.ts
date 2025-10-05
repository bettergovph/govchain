import { NextRequest, NextResponse } from 'next/server';
import { uploadToIPFS } from '@/lib/ipfs';
import { UploadRequest, Dataset, TransactionResult, UploadResponse } from '@/types/dataset';
import { getCosmJSClient } from '@/lib/cosmjs-client';
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
    const file = formData.get('file') as File;
    const metadataStr = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!metadataStr) {
      return NextResponse.json(
        { error: 'No metadata provided' },
        { status: 400 }
      );
    }

    const metadata: UploadRequest = JSON.parse(metadataStr);

    // Validate required fields
    if (!metadata.title || !metadata.description || !metadata.agency || !metadata.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, agency, category' },
        { status: 400 }
      );
    }

    // Upload to IPFS
    const ipfsResult = await uploadToIPFS(file);
    
    // Calculate file checksum
    const buffer = await file.arrayBuffer();
    const checksum = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');

    // Prepare blockchain submission
    const cosmjsClient = getCosmJSClient();
    const submitter = metadata.submitter || 'alice'; // Default to alice for development
    const timestamp = Math.floor(Date.now() / 1000);
    const fileUrl = `https://ipfs.io/ipfs/${ipfsResult.cid}`;
    const fallbackUrl = metadata.fallbackUrl || '';
    
    // Create unique entry ID
    const entryId = `entry-${timestamp}-${ipfsResult.cid.slice(-8)}`;

    // Submit to blockchain using CosmJS
    try {
      const result = await cosmjsClient.createEntry({
        index: entryId,
        title: metadata.title,
        description: metadata.description,
        ipfsCid: ipfsResult.cid,
        mimeType: file.type || 'application/octet-stream',
        fileName: file.name,
        fileUrl: fileUrl,
        fallbackUrl: fallbackUrl,
        fileSize: ipfsResult.size.toString(),
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
        index: entryId,
        title: metadata.title,
        description: metadata.description,
        ipfs_cid: ipfsResult.cid,
        mime_type: file.type || 'application/octet-stream',
        file_name: file.name,
        file_url: fileUrl,
        fallback_url: fallbackUrl,
        file_size: ipfsResult.size,
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
        raw_log: `Transaction successful at height ${result.height}`,
        logs: [],
        dataset,
        summary: {
          transaction: {
            hash: txhash,
            height: result.height,
            status: 'success',
            gas_used: result.gasUsed.toString(),
            gas_wanted: result.gasWanted.toString(),
            timestamp: new Date().toISOString()
          },
          file: {
            name: file.name,
            size: ipfsResult.size,
            size_formatted: formatFileSize(ipfsResult.size),
            mime_type: file.type || 'application/octet-stream',
            checksum: checksum
          },
          ipfs: {
            cid: ipfsResult.cid,
            gateway_url: fileUrl,
            pinned: true,
            size: ipfsResult.size
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