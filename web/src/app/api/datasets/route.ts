import { NextRequest, NextResponse } from 'next/server';
import { getCosmJSClient } from '@/lib/cosmjs-client';
import { Dataset, BlockchainResponse } from '@/types/dataset';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Use CosmJS client for queries
    const cosmjsClient = getCosmJSClient();
    const data = await cosmjsClient.queryAllEntries(limit, offset);
    
    return NextResponse.json({
      datasets: data.entry || [],
      pagination: data.pagination,
      total: parseInt(data.pagination?.total || '0'),
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}