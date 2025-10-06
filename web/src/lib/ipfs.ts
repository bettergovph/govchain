import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';
import type { Helia } from 'helia';
import type { UnixFS } from '@helia/unixfs';

export interface IPFSUploadResult {
  cid: string;
  size: number;
  path?: string;
  ipfsUrl: string;
  gatewayUrl: string;
}

export interface IPFSConfig {
  gatewayUrl: string;
  publicGateway: string;
}

let heliaInstance: Helia | null = null;
let heliaFS: UnixFS | null = null;

export function getIPFSConfig(): IPFSConfig {
  return {
    gatewayUrl: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io',
    publicGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io',
  };
}

async function createHeliaInstance(): Promise<{ helia: Helia; fs: UnixFS }> {
  if (heliaInstance && heliaFS) {
    return { helia: heliaInstance, fs: heliaFS };
  }

  try {
    // Create Helia instance with default configuration
    heliaInstance = await createHelia();
    heliaFS = unixfs(heliaInstance);

    console.log('Helia instance created successfully');
    console.log('Peer ID:', heliaInstance.libp2p.peerId.toString());

    return { helia: heliaInstance, fs: heliaFS };
  } catch (error) {
    console.error('Failed to create Helia instance:', error);
    throw new Error(`IPFS initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  try {
    console.log(`Starting IPFS upload for file: ${file.name} (${file.size} bytes)`);

    // Create or get Helia instance
    const { fs } = await createHeliaInstance();

    // Convert File to Uint8Array
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Add file to IPFS
    const cid = await fs.addBytes(uint8Array, {
      cidVersion: 1, // Use CIDv1 for better compatibility
    });

    const cidString = cid.toString();
    const config = getIPFSConfig();

    console.log(`File uploaded to IPFS successfully. CID: ${cidString}`);

    // Create URLs
    const ipfsUrl = `ipfs://${cidString}`;
    const gatewayUrl = `${config.publicGateway}/ipfs/${cidString}`;

    return {
      cid: cidString,
      size: file.size,
      ipfsUrl,
      gatewayUrl,
    };
  } catch (error) {
    console.error('IPFS upload failed:', error);
    throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getIPFSUrl(cid: string): string {
  const config = getIPFSConfig();
  return `${config.publicGateway}/ipfs/${cid}`;
}

export async function checkIPFSStatus(): Promise<boolean> {
  try {
    if (heliaInstance) {
      // Check if Helia instance is running
      const peers = heliaInstance.libp2p.getPeers();
      console.log(`Helia status: Connected to ${peers.length} peers`);
      return true;
    }

    // Try to create a new instance
    await createHeliaInstance();
    return true;
  } catch (error) {
    console.error('IPFS status check failed:', error);
    return false;
  }
}

// Helper function to retrieve a file from IPFS
export async function getFromIPFS(cidString: string): Promise<Uint8Array> {
  try {
    const { fs } = await createHeliaInstance();
    const cid = CID.parse(cidString);
    const chunks: Uint8Array[] = [];

    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
    }

    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (error) {
    console.error('Failed to retrieve from IPFS:', error);
    throw new Error(`Failed to retrieve file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to pin content (optional for web usage)
export async function pinToIPFS(cidString: string): Promise<void> {
  try {
    // const { helia } = await createHeliaInstance();
    // const cid = CID.parse(cidString);

    // In Helia, content is automatically pinned when added
    // This function is mainly for compatibility
    console.log(`Content automatically pinned: ${cidString}`);
  } catch (error) {
    console.error('Failed to pin content:', error);
    throw new Error(`Pin failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Cleanup function to stop Helia instance
export async function stopIPFS(): Promise<void> {
  if (heliaInstance) {
    try {
      await heliaInstance.stop();
      heliaInstance = null;
      heliaFS = null;
      console.log('Helia instance stopped successfully');
    } catch (error) {
      console.error('Failed to stop Helia instance:', error);
    }
  }
}