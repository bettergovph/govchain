import { NextRequest, NextResponse } from 'next/server';
import { Dataset, BlockchainResponse } from '@/types/dataset';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    
    const response = await fetch(
      `${BLOCKCHAIN_API}/govchain/datasets/dataset?pagination.limit=${limit}&pagination.offset=${offset}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 } // Cache for 30 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`Blockchain API returned ${response.status}`);
    }

    const data: BlockchainResponse = await response.json();
    
    return NextResponse.json({
      datasets: data.Dataset || [],
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