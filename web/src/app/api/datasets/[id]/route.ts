import { NextRequest, NextResponse } from 'next/server';
import { Dataset } from '@/types/dataset';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const response = await fetch(
      `${BLOCKCHAIN_API}/govchain/datasets/dataset/${id}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache for 1 minute
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Dataset not found' },
          { status: 404 }
        );
      }
      throw new Error(`Blockchain API returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      dataset: data.Dataset || data,
    });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}