import { NextResponse } from 'next/server';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';

/**
 * Get blockchain explorer statistics using entry data
 */
export async function GET() {
  try {
    let totalEntries = 0;
    let latestBlockHeight = 0;
    let recentEntries: any[] = [];

    // Get latest block height for blockchain info
    try {
      const statusResponse = await fetch(`${BLOCKCHAIN_RPC}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        latestBlockHeight = parseInt(statusData.result?.sync_info?.latest_block_height || '0');
      }
    } catch (error) {
      console.log('Could not fetch blockchain status:', error);
    }

    // Get total entries and recent data from the entry endpoint
    try {
      const entriesResponse = await fetch(
        `${BLOCKCHAIN_API}/govchain/datasets/v1/entry?pagination.limit=10&pagination.reverse=true`,
        {
          cache: 'no-store', // Ensure fresh data
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        const entries = entriesData.entry || [];
        const pagination = entriesData.pagination || {};

        totalEntries = parseInt(pagination.total || '0');
        recentEntries = entries;

        console.log(`📊 Stats API: Found ${totalEntries} total entries, ${entries.length} recent entries`);
        console.log(`🔍 Pagination data:`, pagination);
        console.log(`🔍 Sample entries:`, entries.slice(0, 2));
      } else {
        console.error(`Failed to fetch entries for stats: ${entriesResponse.status} ${entriesResponse.statusText}`);
        const errorText = await entriesResponse.text();
        console.error('Error response body:', errorText);
      }
    } catch (error) {
      console.error('Error fetching entries for stats:', error);
    }

    // Calculate some basic statistics
    const uniqueAgencies = new Set(recentEntries.map(entry => entry.agency)).size;
    const uniqueCategories = new Set(recentEntries.map(entry => entry.category)).size;

    // Recent activity (entries from last 24 hours)
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentActivity = recentEntries.filter(entry => {
      if (!entry.timestamp) return false;
      const entryTime = parseInt(entry.timestamp) * 1000;
      return entryTime > last24Hours;
    }).length;

    return NextResponse.json({
      totalTransactions: totalEntries, // Use entries as "transactions"
      totalBlocks: latestBlockHeight,
      latestHeight: latestBlockHeight,
      totalValidators: 1, // Placeholder - would need additional endpoint
      validators: 1,
      avgBlockTime: '6s', // Placeholder - could be calculated from recent blocks
      blockTime: 6,
      chainId: 'govchain',
      recentActivity,
      uniqueAgencies,
      uniqueCategories,
      latestEntries: recentEntries.slice(0, 5).map(entry => {
        // Transform entries to look like transactions for the explorer
        return {
          txhash: entry.index || `entry-${entry.timestamp}`,
          timestamp: entry.timestamp ? new Date(parseInt(entry.timestamp) * 1000).toISOString() : new Date().toISOString(),
          type: 'MsgCreateEntry',
          title: entry.title,
          agency: entry.agency,
          category: entry.category,
          submitter: entry.submitter
        };
      }),
      source: 'entries',
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
