import { NextRequest, NextResponse } from 'next/server';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';

/**
 * Fetch transactions from dataset entries using the REST endpoint
 * This gives us actual dataset-related transactions with tx_hash from entries
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log(`Fetching entries with limit=${limit}, offset=${offset}`);

    // Query dataset entries directly from blockchain REST API
    const entriesResponse = await fetch(
      `${BLOCKCHAIN_API}/govchain/datasets/v1/entry?pagination.limit=${limit}&pagination.offset=${offset}&pagination.reverse=true`
    );

    if (!entriesResponse.ok) {
      console.error('Failed to fetch entries:', entriesResponse.status, entriesResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch entries from blockchain' },
        { status: 500 }
      );
    }

    const entriesData = await entriesResponse.json();
    console.log('Entries response:', {
      entryCount: entriesData.entry?.length || 0,
      paginationTotal: entriesData.pagination?.total || 0
    });

    const entries = entriesData.entry || [];
    const pagination = entriesData.pagination || {};

    // Transform entries to transaction-like objects for the explorer
    const transactions = entries.map((entry: any) => {
      // Use actual transaction hash if available, otherwise create a meaningful identifier
      const txHash = entry.tx_hash || entry.txHash || entry.index || `entry-${entry.timestamp || Date.now()}`;
      
      return {
        txhash: txHash,
        height: entry.block_height || entry.height || '0', // Use actual block height if available
        code: 0, // Assume success since entry exists
        timestamp: entry.timestamp ? new Date(parseInt(entry.timestamp) * 1000).toISOString() : new Date().toISOString(),
        tx: {
          body: {
            messages: [{
              '@type': '/govchain.datasets.v1.MsgCreateEntry',
              title: entry.title,
              description: entry.description,
              agency: entry.agency,
              category: entry.category,
              submitter: entry.submitter,
              ipfs_cid: entry.ipfs_cid,
              mime_type: entry.mime_type,
              file_name: entry.file_name,
              file_url: entry.file_url,
              fallback_url: entry.fallback_url,
              file_size: entry.file_size,
              checksum_sha_256: entry.checksum_sha_256,
              pin_count: entry.pin_count
            }],
            memo: `Dataset Entry: ${entry.title}`
          }
        },
        gas_used: entry.gas_used || '0',
        gas_wanted: entry.gas_wanted || '0',
        raw_log: entry.raw_log || `Dataset entry created: ${entry.title}`,
        entry_data: entry // Include the full entry data for reference
      };
    });

    const totalCount = parseInt(pagination.total || '0');
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
      },
      latestHeight: 0, // We don't track height from entries
      source: 'entries',
      success: true
    });
  } catch (error) {
    console.error('Error fetching entry transactions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch entry transactions', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
