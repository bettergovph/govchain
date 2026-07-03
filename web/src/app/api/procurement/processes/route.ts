import { NextRequest, NextResponse } from 'next/server';

const RAW_BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || process.env.BLOCKCHAIN_REST || 'http://localhost:1317';

function restEndpoint() {
  return RAW_BLOCKCHAIN_API.replace(/\/$/, '');
}

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = clampInt(searchParams.get('page'), 1, 1, 1000000);
    const limit = clampInt(searchParams.get('limit'), 25, 1, 100);
    const offset = (page - 1) * limit;

    const params = new URLSearchParams({
      'pagination.limit': String(limit),
      'pagination.offset': String(offset),
      'pagination.count_total': 'true',
    });

    const response = await fetch(`${restEndpoint()}/govchain/procurement/v1/process?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch procurement processes', details: body.slice(0, 500) },
        { status: response.status }
      );
    }

    const data = await response.json();
    const total = Number(data.pagination?.total || data.processes?.length || 0);

    return NextResponse.json({
      processes: data.processes || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch procurement processes', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
