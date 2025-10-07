import { NextRequest, NextResponse } from 'next/server';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';

/**
 * Alternative transaction fetching that queries by block height events
 * This works even when tx indexing might be limited
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let transactions: any[] = [];
    let latestHeight = 0;

    // Get latest block height
    const statusResponse = await fetch(`${BLOCKCHAIN_RPC}/status`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      latestHeight = parseInt(statusData.result?.sync_info?.latest_block_height || '0');
    }

    // Query transactions by scanning recent block heights
    const blocksToCheck = 100; // Check last 100 blocks
    const startBlock = Math.max(1, latestHeight - (page - 1) * blocksToCheck);
    const endBlock = Math.max(1, startBlock - blocksToCheck);

    console.log(`Querying transactions from blocks ${endBlock} to ${startBlock}`);

    // Query transactions using block height events
    for (let height = startBlock; height >= endBlock && transactions.length < limit; height--) {
      try {
        const eventQuery = `tx.height=${height}`;
        const txsResponse = await fetch(
          `${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs?events=${encodeURIComponent(eventQuery)}&pagination.limit=100`
        );

        if (txsResponse.ok) {
          const txsData = await txsResponse.json();
          const blockTxs = txsData.tx_responses || [];
          
          for (const tx of blockTxs) {
            if (transactions.length < limit) {
              transactions.push(tx);
            }
          }
        }
      } catch (error) {
        console.error(`Error querying block ${height}:`, error);
      }
    }

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: latestHeight * 2, // Rough estimate
        totalPages: Math.ceil((latestHeight * 2) / limit),
      },
      latestHeight,
      source: 'event-query',
      blocksScanned: startBlock - endBlock,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
