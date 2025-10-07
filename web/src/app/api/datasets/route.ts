import { NextRequest, NextResponse } from 'next/server';
import { getCosmJSClient } from '@/lib/cosmjs-client';
import { Dataset, BlockchainResponse, isImageMimeType } from '@/types/dataset';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Handle both old and new pagination parameters
    const paginationLimit = searchParams.get('pagination.limit');
    const paginationKey = searchParams.get('pagination.key');
    const paginationReverse = searchParams.get('pagination.reverse');

    // Fallback to old parameters
    const limit = parseInt(paginationLimit || searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const agency = searchParams.get('agency');
    const category = searchParams.get('category');
    const mimeType = searchParams.get('mimeType');
    const imagesOnly = searchParams.get('images') === 'true';
    const query = searchParams.get('q');

    // Build query parameters for blockchain API
    const apiParams = new URLSearchParams({
      'pagination.limit': limit.toString(),
    });

    if (paginationKey) {
      apiParams.set('pagination.key', paginationKey);
    }

    if (paginationReverse === 'true') {
      apiParams.set('pagination.reverse', 'true');
    }

    // Query the blockchain API directly with pagination
    const response = await fetch(
      `${BLOCKCHAIN_API}/govchain/datasets/v1/entry?${apiParams.toString()}`,
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

    const data = await response.json();
    let datasets = data.entry || [];

    // Apply filters
    if (agency) {
      datasets = datasets.filter((d: Dataset) => d.agency === agency);
    }

    if (category) {
      datasets = datasets.filter((d: Dataset) => d.category === category);
    }

    if (mimeType) {
      datasets = datasets.filter((d: Dataset) => d.mime_type === mimeType);
    }

    if (imagesOnly) {
      datasets = datasets.filter((d: Dataset) => isImageMimeType(d.mime_type));
    }

    if (query) {
      const lowercaseQuery = query.toLowerCase();
      datasets = datasets.filter((d: Dataset) =>
        d.title.toLowerCase().includes(lowercaseQuery) ||
        d.description.toLowerCase().includes(lowercaseQuery) ||
        d.file_name.toLowerCase().includes(lowercaseQuery) ||
        d.agency.toLowerCase().includes(lowercaseQuery) ||
        d.category.toLowerCase().includes(lowercaseQuery)
      );
    }

    return NextResponse.json({
      datasets: datasets,
      results: datasets, // For compatibility with SearchResponse interface
      pagination: data.pagination || {
        next_key: '',
        total: datasets.length.toString()
      },
      total: parseInt(data.pagination?.total || datasets.length.toString()),
      filters: {
        agency,
        category,
        mimeType,
        imagesOnly,
        query,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}