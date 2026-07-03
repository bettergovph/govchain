import { NextRequest, NextResponse } from 'next/server';

const RAW_BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || process.env.BLOCKCHAIN_REST || 'http://localhost:1317';

function restEndpoint() {
  return RAW_BLOCKCHAIN_API.replace(/\/$/, '');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ocid: string }> }
) {
  try {
    const { ocid } = await params;
    const response = await fetch(`${restEndpoint()}/govchain/procurement/v1/releases/${encodeURIComponent(ocid)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch releases', details: body.slice(0, 500) },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      releases: data.releases || [],
      pagination: data.pagination,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch releases', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
