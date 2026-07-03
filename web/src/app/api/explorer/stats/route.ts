import { NextResponse } from 'next/server';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://157.90.134.175:1317';
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'tcp://157.90.134.175:26657';

function rpcEndpoint() {
  return BLOCKCHAIN_RPC.replace(/^tcp:\/\//, 'http://').replace(/\/$/, '');
}

/**
 * Get blockchain explorer statistics using entry data
 */
export async function GET() {
  try {
    let totalTransactions = 0;
    let totalProcurementProcesses = 0;
    let latestBlockHeight = 0;
    let totalValidators = 1; // Default fallback
    let validators: any[] = [];
    let peerCount = 0;
    const rpc = rpcEndpoint();

    // Get latest block height for blockchain info
    try {
      const statusResponse = await fetch(`${rpc}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        latestBlockHeight = parseInt(statusData.result?.sync_info?.latest_block_height || '0');
      }
    } catch (error) {
      console.log('Could not fetch blockchain status:', error);
    }

    // Get validator/peer information from net_info endpoint
    try {
      const netInfoResponse = await fetch(`${rpc}/net_info`);
      if (netInfoResponse.ok) {
        const netData = await netInfoResponse.json();
        const peers = netData.result?.peers || [];
        peerCount = parseInt(netData.result?.n_peers || '0');

        // In a single-node setup, we have at least 1 validator (ourselves)
        // Plus any connected peers that could be validators
        totalValidators = Math.max(1, peerCount + 1);

        // Transform peer data for validator display
        validators = peers.map((peer: any) => ({
          id: peer.node_info?.id || 'unknown',
          moniker: peer.node_info?.moniker || 'Unknown Validator',
          network: peer.node_info?.network || 'govchain',
          version: peer.node_info?.version || '0.0.0',
          remote_ip: peer.remote_ip || 'unknown',
          is_outbound: peer.is_outbound || false,
          connection_status: peer.connection_status || {}
        }));

        // Add ourselves as the primary validator
        validators.unshift({
          id: 'local-validator',
          moniker: 'Local Validator',
          network: 'govchain',
          version: '1.0.0',
          remote_ip: 'localhost',
          is_outbound: false,
          connection_status: { duration: 'self' }
        });

        console.log(`🔍 Network Info: Found ${peerCount} peers, ${totalValidators} total validators`);
      } else {
        console.error(`Failed to fetch network info: ${netInfoResponse.status}`);
      }
    } catch (error) {
      console.error('Error fetching network info:', error);
    }

    // Count real indexed transactions from CometBFT.
    try {
      const params = new URLSearchParams({
        query: '"tx.height>0"',
        prove: 'false',
        page: '1',
        per_page: '1',
        order_by: '"desc"',
      });
      const txResponse = await fetch(`${rpc}/tx_search?${params.toString()}`, { cache: 'no-store' });

      if (txResponse.ok) {
        const txData = await txResponse.json();
        totalTransactions = Number(txData.result?.total_count || 0);
      } else {
        console.error(`Failed to fetch tx count: ${txResponse.status} ${txResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching tx count:', error);
    }

    // Count procurement processes, which corresponds to imported OCDS releases in
    // the current one-release-per-process import.
    try {
      const processResponse = await fetch(
        `${BLOCKCHAIN_API}/govchain/procurement/v1/process?pagination.limit=1&pagination.count_total=true`,
        { cache: 'no-store' }
      );

      if (processResponse.ok) {
        const processData = await processResponse.json();
        totalProcurementProcesses = Number(processData.pagination?.total || processData.processes?.length || 0);
      } else {
        console.error(`Failed to fetch procurement process count: ${processResponse.status} ${processResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching procurement process count:', error);
    }

    return NextResponse.json({
      totalTransactions,
      totalProcurementProcesses,
      totalBlocks: latestBlockHeight,
      latestHeight: latestBlockHeight,
      totalValidators: totalValidators, // Real validator count from network
      validators: totalValidators, // For backward compatibility
      peerCount: peerCount, // Number of connected peers
      avgBlockTime: '6s', // Placeholder - could be calculated from recent blocks
      blockTime: 6,
      chainId: 'govchain',
      validatorDetails: validators, // Detailed validator information
      source: 'tx_search',
      success: true
    });
  } catch (error) {
    console.error('Error fetching explorer stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch explorer stats',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
