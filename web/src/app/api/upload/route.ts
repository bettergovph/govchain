import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { uploadToIPFS, getIPFSUrl } from '@/lib/ipfs';
import { getBlockchainConfig, executeCommand, extractTransactionHash } from '@/lib/blockchain';

interface UploadRequest {
  title: string;
  description: string;
  agency: string;
  category: string;
  fallbackUrl?: string;
}

async function calculateChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return createHash('sha256').update(Buffer.from(buffer)).digest('hex');
}

async function submitToBlockchain(data: any): Promise<{ txhash: string }> {
  const {
    title,
    description,
    ipfsCid,
    mimeType,
    fileName,
    fileUrl,
    fallbackUrl,
    fileSize,
    checksumSha256,
    agency,
    category
  } = data;

  const config = getBlockchainConfig();
  
  const args = [
    'tx', 'datasets', 'create-dataset',
    title,
    description,
    ipfsCid,
    mimeType,
    fileName,
    fileUrl,
    fallbackUrl || '',
    fileSize.toString(),
    checksumSha256,
    agency,
    category,
    '--from', config.submitter,
    '--chain-id', config.chainId,
    '--node', config.nodeUrl,
    '--keyring-backend', config.keyringBackend,
    '--yes',
    '--output', 'json'
  ];

  const output = await executeCommand(config.binary, args, 60000); // 60 second timeout
  const txhash = extractTransactionHash(output);
  
  if (!txhash) {
    throw new Error('Failed to extract transaction hash from blockchain response');
  }
  
  return { txhash };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string) as UploadRequest;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { title, description, agency, category } = metadata;
    if (!title || !description || !agency || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // File validation
    const maxSize = 100 * 1024 * 1024; // 100MB limit
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 100MB)' },
        { status: 400 }
      );
    }

    // Upload to IPFS
    const { cid: ipfsCid, size: fileSize } = await uploadToIPFS(file);
    
    // Calculate checksum
    const checksumSha256 = await calculateChecksum(file);
    
    // Create file URL
    const fileUrl = getIPFSUrl(ipfsCid);
    
    // Prepare blockchain transaction data
    const transactionData = {
      title,
      description,
      ipfsCid,
      mimeType: file.type || 'application/octet-stream',
      fileName: file.name,
      fileUrl,
      fallbackUrl: metadata.fallbackUrl || '',
      fileSize,
      checksumSha256,
      agency,
      category,
    };

    // Submit to blockchain
    const result = await submitToBlockchain(transactionData);

    return NextResponse.json({
      success: true,
      txhash: result.txhash,
      dataset: {
        ...transactionData,
        timestamp: Date.now(),
        pinCount: 1, // At least one pin (our node)
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}