import { NextRequest, NextResponse } from 'next/server';

const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const height = searchParams.get('height');

    let blocks = [];
    let latestHeight = 0;

    // Get latest block height
    const statusResponse = await fetch(`${BLOCKCHAIN_RPC}/status`);
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      latestHeight = parseInt(statusData.result?.sync_info?.latest_block_height || '0');
    }

    if (height) {
      // Fetch a specific block
      const blockResponse = await fetch(`${BLOCKCHAIN_RPC}/block?height=${height}`);
      if (blockResponse.ok) {
        const blockData = await blockResponse.json();
        blocks = [blockData.result];
      }
    } else {
      // Fetch recent blocks
      const startHeight = Math.max(1, latestHeight - (page - 1) * limit);
      const endHeight = Math.max(1, startHeight - limit + 1);

      for (let h = startHeight; h >= endHeight && h > 0; h--) {
        try {
          const blockResponse = await fetch(`${BLOCKCHAIN_RPC}/block?height=${h}`);
          if (blockResponse.ok) {
            const blockData = await blockResponse.json();
            blocks.push(blockData.result);
          }
        } catch (error) {
          console.error(`Error fetching block ${h}:`, error);
        }
      }
    }

    return NextResponse.json({
      blocks,
      pagination: {
        page,
        limit,
        total: latestHeight,
        totalPages: Math.ceil(latestHeight / limit),
      },
      latestHeight,
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocks', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
