import { NextRequest, NextResponse } from 'next/server';
import { SearchResponse } from '@/types/dataset';

const INDEXER_API = process.env.INDEXER_API || 'http://localhost:9002';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '10';
    const agency = searchParams.get('agency');
    const category = searchParams.get('category');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Build search URL
    const searchUrl = new URL('/search', INDEXER_API);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('limit', limit);
    if (agency) searchUrl.searchParams.set('agency', agency);
    if (category) searchUrl.searchParams.set('category', category);

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Don't cache search results - always fresh
    });

    if (!response.ok) {
      // Fallback to direct blockchain search if indexer is unavailable
      console.warn('Indexer unavailable, falling back to blockchain API');
      
      const blockchainResponse = await fetch(
        `${process.env.BLOCKCHAIN_API || 'http://localhost:1317'}/govchain/datasets/dataset`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );

      if (blockchainResponse.ok) {
        const data = await blockchainResponse.json();
        const datasets = data.Dataset || [];
        
        // Simple text-based filtering as fallback
        const filtered = datasets.filter((dataset: any) => {
          const searchText = `${dataset.title} ${dataset.description} ${dataset.agency} ${dataset.category}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

        return NextResponse.json({
          query,
          count: filtered.length,
          results: filtered.slice(0, parseInt(limit)),
          fallback: true,
        });
      }

      throw new Error('Both indexer and blockchain API unavailable');
    }

    const data: SearchResponse = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching datasets:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}