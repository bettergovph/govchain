import { NextRequest, NextResponse } from 'next/server';

const RAW_BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || process.env.BLOCKCHAIN_REST || 'http://localhost:1317';

function restEndpoint() {
  return RAW_BLOCKCHAIN_API.replace(/\/$/, '');
}

async function fetchJson(path: string) {
  const response = await fetch(`${restEndpoint()}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status}: ${body.slice(0, 500)}`);
  }
  return response.json();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ocid: string }> }
) {
  try {
    const { ocid } = await params;
    const encoded = encodeURIComponent(ocid);
    const [processData, releasesData, recordData] = await Promise.all([
      fetchJson(`/govchain/procurement/v1/process/${encoded}`),
      fetchJson(`/govchain/procurement/v1/releases/${encoded}`),
      fetchJson(`/govchain/procurement/v1/ocds/records/${encoded}`).catch(() => null),
    ]);

    return NextResponse.json({
      process: processData.process,
      releases: releasesData.releases || [],
      recordPackage: recordData,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch procurement process', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
