import { NextRequest, NextResponse } from 'next/server';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';

// Helper to decode base64 tx and get hash
function getTxHash(txBytes: string): string {
  // For display purposes, we'll use a truncated version of the base64
  // In production, you'd properly hash this with SHA256
  return txBytes.substring(0, 64);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const height = searchParams.get('height');

    let transactions: any[] = [];
    let totalCount = 0;
    let latestHeight = 0;

    // Get latest block height
    const statusResponse = await fetch(`${BLOCKCHAIN_RPC}/status`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      latestHeight = parseInt(statusData.result?.sync_info?.latest_block_height || '0');
    }

    // Try REST API first (if tx indexing is enabled)
    const offset = (page - 1) * limit;
    try {
      const txsResponse = await fetch(
        `${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs?pagination.limit=${limit}&pagination.offset=${offset}&order_by=ORDER_BY_DESC`
      );

      if (txsResponse.ok) {
        const txsData = await txsResponse.json();
        transactions = txsData.tx_responses || [];
        totalCount = parseInt(txsData.pagination?.total || '0');
        
        // If we got transactions from the index, return them
        if (transactions.length > 0) {
          return NextResponse.json({
            transactions,
            pagination: {
              page,
              limit,
              total: totalCount,
              totalPages: Math.ceil(totalCount / limit),
            },
            latestHeight,
            source: 'index',
          });
        }
      }
    } catch (error) {
      console.log('Transaction index not available, falling back to block scanning');
    }

    // Fallback: Scan recent blocks for transactions
    console.log('Scanning blocks for transactions...');
    const blocksToScan = Math.min(limit, 50); // Scan up to 50 blocks
    const startHeight = Math.max(1, latestHeight - (page - 1) * blocksToScan);
    const endHeight = Math.max(1, startHeight - blocksToScan + 1);

    for (let h = startHeight; h >= endHeight && h > 0; h--) {
      try {
        const blockResponse = await fetch(`${BLOCKCHAIN_RPC}/block?height=${h}`);
        if (!blockResponse.ok) continue;

        const blockData = await blockResponse.json();
        const block = blockData.result?.block;
        const txs = block?.data?.txs || [];

        // Process each transaction in the block
        for (const txBase64 of txs) {
          try {
            // Decode the transaction using the REST API
            const decodeTxResponse = await fetch(
              `${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs/decode`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tx_bytes: txBase64 }),
              }
            );

            if (decodeTxResponse.ok) {
              const decodedData = await decodeTxResponse.json();
              
              // Try to get the actual tx hash by searching for it
              const searchResponse = await fetch(
                `${BLOCKCHAIN_API}/cosmos/tx/v1beta1/txs?events=tx.height=${h}`
              );
              
              let txhash = getTxHash(txBase64);
              let txResponse: any = null;
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                const matchingTx = searchData.tx_responses?.find((tx: any) => 
                  tx.height === h.toString()
                );
                if (matchingTx) {
                  txhash = matchingTx.txhash;
                  txResponse = matchingTx;
                }
              }

              transactions.push({
                txhash,
                height: h.toString(),
                code: txResponse?.code || 0,
                timestamp: block.header?.time || new Date().toISOString(),
                tx: decodedData.tx || { body: { messages: [], memo: '' } },
                gas_used: txResponse?.gas_used || '0',
                gas_wanted: txResponse?.gas_wanted || '0',
                raw_log: txResponse?.raw_log || '',
              });
            }
          } catch (txError) {
            console.error(`Error processing tx in block ${h}:`, txError);
          }
        }
      } catch (blockError) {
        console.error(`Error fetching block ${h}:`, blockError);
      }
    }

    totalCount = latestHeight; // Approximate total

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / blocksToScan),
      },
      latestHeight,
      source: 'blocks',
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
