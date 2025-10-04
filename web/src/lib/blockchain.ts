import { spawn } from 'child_process';

export interface BlockchainConfig {
  chainId: string;
  nodeUrl: string;
  apiUrl: string;
  submitter: string;
  keyringBackend: string;
  binary: string;
}

export function getBlockchainConfig(): BlockchainConfig {
  return {
    chainId: process.env.CHAIN_ID || 'govchain',
    nodeUrl: process.env.BLOCKCHAIN_NODE || 'tcp://localhost:26657',
    apiUrl: process.env.BLOCKCHAIN_API || 'http://localhost:1317',
    submitter: process.env.BLOCKCHAIN_SUBMITTER || 'alice',
    keyringBackend: process.env.BLOCKCHAIN_KEYRING_BACKEND || 'test',
    binary: process.env.BLOCKCHAIN_BINARY || 'govchaind',
  };
}

export async function executeCommand(command: string, args: string[], timeout: number = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Command failed (code ${code}): ${errorOutput || output}`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to execute command: ${error.message}`));
    });

    // Timeout handling
    const timer = setTimeout(() => {
      process.kill();
      reject(new Error(`Command timeout after ${timeout}ms`));
    }, timeout);

    process.on('close', () => {
      clearTimeout(timer);
    });
  });
}

export function extractTransactionHash(output: string): string | null {
  try {
    // Try parsing as JSON first
    const result = JSON.parse(output);
    if (result.txhash) {
      return result.txhash;
    }
  } catch (error) {
    // Not JSON, try regex
  }

  // Try extracting with regex
  const patterns = [
    /txhash:\s*([A-F0-9]{64})/i,
    /"txhash"\s*:\s*"([A-F0-9]{64})"/i,
    /hash:\s*([A-F0-9]{64})/i,
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}