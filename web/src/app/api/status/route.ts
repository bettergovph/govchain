import { NextResponse } from 'next/server';
import { checkIPFSStatus } from '@/lib/ipfs';
import { executeCommand, getBlockchainConfig } from '@/lib/blockchain';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  message?: string;
}

async function checkBlockchainStatus(): Promise<ServiceStatus> {
  try {
    const config = getBlockchainConfig();
    await executeCommand('govchaind', ['status'], 5000);
    return {
      name: 'Blockchain (govchaind)',
      status: 'healthy',
      message: `Connected to ${config.chainId}`,
    };
  } catch (error) {
    return {
      name: 'Blockchain (govchaind)',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkIndexerStatus(): Promise<ServiceStatus> {
  try {
    const indexerUrl = process.env.INDEXER_API || 'http://localhost:9002';
    const response = await fetch(`${indexerUrl}/health`, { 
      signal: AbortSignal.timeout(5000) 
    });
    
    if (response.ok) {
      return {
        name: 'Indexer API',
        status: 'healthy',
        message: `Connected to ${indexerUrl}`,
      };
    } else {
      return {
        name: 'Indexer API',
        status: 'unhealthy',
        message: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: 'Indexer API',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function checkBlockchainAPIStatus(): Promise<ServiceStatus> {
  try {
    const apiUrl = process.env.BLOCKCHAIN_API || 'http://localhost:1317';
    const response = await fetch(`${apiUrl}/cosmos/base/tendermint/v1beta1/node_info`, {
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        name: 'Blockchain API',
        status: 'healthy',
        message: `Connected to ${data.default_node_info?.network || 'unknown network'}`,
      };
    } else {
      return {
        name: 'Blockchain API',
        status: 'unhealthy',
        message: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: 'Blockchain API',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

export async function GET() {
  try {
    // Check all services in parallel
    const [ipfsHealthy, blockchainStatus, indexerStatus, apiStatus] = await Promise.all([
      checkIPFSStatus(),
      checkBlockchainStatus(),
      checkIndexerStatus(),
      checkBlockchainAPIStatus(),
    ]);

    const services: ServiceStatus[] = [
      {
        name: 'IPFS',
        status: ipfsHealthy ? 'healthy' : 'unhealthy',
        message: ipfsHealthy ? 'IPFS daemon is running' : 'IPFS daemon not accessible',
      },
      blockchainStatus,
      apiStatus,
      indexerStatus,
    ];

    const overallHealthy = services.every(service => service.status === 'healthy');

    return NextResponse.json({
      status: overallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
      configuration: {
        chainId: process.env.CHAIN_ID || 'govchain',
        blockchainAPI: process.env.BLOCKCHAIN_API || 'http://localhost:1317',
        indexerAPI: process.env.INDEXER_API || 'http://localhost:9002',
        ipfsGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io',
      },
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}