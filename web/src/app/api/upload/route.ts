import { NextRequest, NextResponse } from 'next/server';
import { getBlockchainConfig, executeCommand, extractTransactionHash } from '@/lib/blockchain';
import { uploadToIPFS } from '@/lib/ipfs';
import { UploadRequest, Dataset, TransactionResult } from '@/types/dataset';
import crypto from 'crypto';

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
    const config = getBlockchainConfig();
    const submitter = metadata.submitter || config.submitter;
    const timestamp = Math.floor(Date.now() / 1000);
    const fileUrl = `https://ipfs.io/ipfs/${ipfsResult.cid}`;
    const fallbackUrl = metadata.fallbackUrl || '';
    
    // Create unique entry ID
    const entryId = `entry-${timestamp}-${ipfsResult.cid.slice(-8)}`;

    // Submit to blockchain using create-entry
    const createEntryArgs = [
      'tx',
      'datasets', 
      'create-entry',
      entryId,                    // Index/Key
      metadata.title,             // Title
      metadata.description,       // Description  
      ipfsResult.cid,            // IPFS CID
      file.type || 'application/octet-stream', // MIME Type
      file.name,                 // File Name
      fileUrl,                   // File URL
      fallbackUrl,               // Fallback URL
      ipfsResult.size.toString(), // File Size
      checksum,                  // Checksum
      metadata.agency,           // Agency
      metadata.category,         // Category
      submitter,                 // Submitter
      timestamp.toString(),      // Timestamp
      '0',                      // Initial Pin Count
      '--from', submitter,
      '--chain-id', config.chainId,
      '--keyring-backend', config.keyringBackend,
      '--gas', 'auto',
      '--gas-adjustment', '1.5',
      '--yes',
      '--output', 'json',
      '--node', config.nodeUrl,
    ];

    const txOutput = await executeCommand(config.binary, createEntryArgs, 30000);
    
    // Extract transaction hash
    const txhash = extractTransactionHash(txOutput);
    
    if (!txhash) {
      throw new Error('Transaction submitted but no hash returned');
    }

    // Prepare response dataset object
    const dataset: Dataset = {
      id: entryId,
      title: metadata.title,
      description: metadata.description,
      ipfsCid: ipfsResult.cid,
      mimeType: file.type || 'application/octet-stream',
      fileName: file.name,
      fileUrl: fileUrl,
      fallbackUrl: fallbackUrl,
      fileSize: ipfsResult.size,
      checksumSha256: checksum,
      agency: metadata.agency,
      category: metadata.category,
      submitter: submitter,
      timestamp: timestamp * 1000, // Convert to milliseconds for frontend
      pinCount: 0,
    };

    const result: TransactionResult & { dataset: Dataset } = {
      txhash,
      raw_log: txOutput,
      logs: [],
      dataset,
    };

    return NextResponse.json(result);

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