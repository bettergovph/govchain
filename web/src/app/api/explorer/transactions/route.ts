import { NextRequest, NextResponse } from 'next/server';

const RAW_BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';

function rpcEndpoint() {
  return RAW_BLOCKCHAIN_RPC.replace(/^tcp:\/\//, 'http://').replace(/\/$/, '');
}

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function eventAttributes(event: any) {
  const attributes: Record<string, string> = {};

  for (const attr of event?.attributes || []) {
    if (typeof attr?.key === 'string') {
      attributes[attr.key] = typeof attr.value === 'string' ? attr.value : String(attr.value ?? '');
    }
  }

  return attributes;
}

function summarizeTx(tx: any, blockTime?: string) {
  const events = tx.tx_result?.events || [];
  const actionCounts = new Map<string, number>();
  const releaseEvents = [];

  for (const event of events) {
    const attributes = eventAttributes(event);

    if (event.type === 'message' && attributes.action) {
      actionCounts.set(attributes.action, (actionCounts.get(attributes.action) || 0) + 1);
    }

    if (event.type === 'release_submitted') {
      releaseEvents.push({
        ocid: attributes.ocid,
        releaseId: attributes.release_id,
        publisher: attributes.publisher,
      });
    }
  }

  const messages = Array.from(actionCounts.entries()).map(([typeUrl, count]) => ({
    '@type': typeUrl,
    count,
  }));

  const firstRelease = releaseEvents[0];
  const lastRelease = releaseEvents[releaseEvents.length - 1];

  return {
    txhash: tx.hash,
    height: tx.height,
    index: tx.index,
    code: Number(tx.tx_result?.code || 0),
    timestamp: blockTime || '',
    tx: {
      body: {
        messages,
        memo: '',
      },
    },
    gas_used: String(tx.tx_result?.gas_used || '0'),
    gas_wanted: String(tx.tx_result?.gas_wanted || '0'),
    raw_log: tx.tx_result?.log || '',
    release_count: releaseEvents.length,
    first_release: firstRelease,
    last_release: lastRelease,
    release_samples: releaseEvents.slice(0, 5),
  };
}

async function getBlockTimes(rpc: string, heights: string[]) {
  const uniqueHeights = Array.from(new Set(heights));
  const entries = await Promise.all(
    uniqueHeights.map(async (height) => {
      try {
        const response = await fetch(`${rpc}/block?height=${encodeURIComponent(height)}`, {
          cache: 'no-store',
        });

        if (!response.ok) return [height, ''] as const;

        const data = await response.json();
        return [height, data.result?.block?.header?.time || ''] as const;
      } catch {
        return [height, ''] as const;
      }
    })
  );

  return Object.fromEntries(entries);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = clampInt(searchParams.get('page'), 1, 1, 1000000);
    const limit = clampInt(searchParams.get('limit'), 20, 1, 100);
    const height = searchParams.get('height');
    const rpc = rpcEndpoint();

    const query = height ? `tx.height=${height}` : 'tx.height>0';
    const params = new URLSearchParams({
      query: `"${query}"`,
      prove: 'false',
      page: String(page),
      per_page: String(limit),
      order_by: '"desc"',
    });

    const response = await fetch(`${rpc}/tx_search?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch transactions from RPC', details: body.slice(0, 500) },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = data.result || {};
    const txs = result.txs || [];
    const blockTimes = await getBlockTimes(rpc, txs.map((tx: any) => String(tx.height)));
    const transactions = txs.map((tx: any) => summarizeTx(tx, blockTimes[String(tx.height)]));
    const total = Number(result.total_count || transactions.length);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      latestHeight: transactions[0]?.height ? Number(transactions[0].height) : 0,
      source: 'tx_search',
      success: true,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
