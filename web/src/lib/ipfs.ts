import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { executeCommand } from './blockchain';

export interface IPFSUploadResult {
  cid: string;
  size: number;
}

export interface IPFSConfig {
  apiUrl: string;
  gatewayUrl: string;
}

export function getIPFSConfig(): IPFSConfig {
  return {
    apiUrl: process.env.IPFS_API_URL || 'http://localhost:5001',
    gatewayUrl: process.env.IPFS_GATEWAY_URL || 'http://localhost:8080',
  };
}

export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  const buffer = await file.arrayBuffer();
  const tempPath = join(tmpdir(), `upload-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  
  try {
    // Write file to temporary location
    await writeFile(tempPath, Buffer.from(buffer));
    
    // Check if IPFS is running
    try {
      await executeCommand('ipfs', ['id'], 5000);
    } catch (error) {
      throw new Error('IPFS daemon is not running. Please start IPFS with: ipfs daemon');
    }
    
    // Upload to IPFS
    const cid = await executeCommand('ipfs', ['add', '-Q', tempPath]);
    
    if (!cid) {
      throw new Error('IPFS upload failed - no CID returned');
    }
    
    // Pin the file
    try {
      await executeCommand('ipfs', ['pin', 'add', cid], 10000);
    } catch (error) {
      console.warn('Failed to pin file, but upload succeeded:', error);
    }
    
    return {
      cid: cid.trim(),
      size: file.size,
    };
  } finally {
    // Clean up temporary file
    try {
      await unlink(tempPath);
    } catch (error) {
      console.warn('Failed to clean up temp file:', error);
    }
  }
}

export function getIPFSUrl(cid: string): string {
  const config = getIPFSConfig();
  const publicGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io';
  return `${publicGateway}/ipfs/${cid}`;
}

export async function checkIPFSStatus(): Promise<boolean> {
  try {
    await executeCommand('ipfs', ['id'], 5000);
    return true;
  } catch (error) {
    return false;
  }
}