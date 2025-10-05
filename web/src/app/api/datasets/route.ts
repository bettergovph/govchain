import { NextRequest, NextResponse } from 'next/server';
import { getCosmJSClient } from '@/lib/cosmjs-client';
import { Dataset, BlockchainResponse, isImageMimeType } from '@/types/dataset';

const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API || 'http://localhost:1317';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const agency = searchParams.get('agency');
    const category = searchParams.get('category');
    const mimeType = searchParams.get('mimeType');
    const imagesOnly = searchParams.get('images') === 'true';
    const query = searchParams.get('q');
    
    // Use CosmJS client for queries
    const cosmjsClient = getCosmJSClient();
    let data = await cosmjsClient.queryAllEntries(limit, offset);
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
      pagination: data.pagination,
      total: datasets.length,
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