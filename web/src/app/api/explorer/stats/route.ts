import { NextResponse } from 'next/server';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';

export async function GET() {
  try {
    const stats: any = {
      latestHeight: 0,
      totalTransactions: 0,
      chainId: '',
      validators: 0,
      blockTime: 0,
    };

    // Get chain status
    const statusResponse = await fetch(`${BLOCKCHAIN_RPC}/status`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      const syncInfo = statusData.result?.sync_info;
      stats.latestHeight = parseInt(syncInfo?.latest_block_height || '0');
      stats.chainId = statusData.result?.node_info?.network || '';
      stats.blockTime = parseFloat(syncInfo?.latest_block_time || '0');
    }

    // Get validator count
    try {
      const validatorsResponse = await fetch(`${BLOCKCHAIN_API}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`);
      if (validatorsResponse.ok) {
        const validatorsData = await validatorsResponse.json();
        stats.validators = validatorsData.validators?.length || 0;
      }
    } catch (error) {
      console.error('Error fetching validators:', error);
    }

    // Estimate total transactions (approximate based on recent blocks)
    try {
      const recentTxsResponse = await fetch(`${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs?pagination.limit=1`);
      if (recentTxsResponse.ok) {
        const txsData = await recentTxsResponse.json();
        stats.totalTransactions = parseInt(txsData.pagination?.total || '0');
      }
    } catch (error) {
      console.error('Error fetching transaction count:', error);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blockchain stats', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
