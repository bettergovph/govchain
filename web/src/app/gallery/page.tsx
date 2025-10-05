'use client';

import { useState, useEffect } from 'react';
import { Dataset } from '@/types/dataset';
import ImageGallery from '@/components/ImageGallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileImage } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/datasets');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.status}`);
      }
      
      const data = await response.json();
      setDatasets(data.results || []);
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Image Gallery</h1>
        </div>
        
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Gallery</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDatasets} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileImage className="h-8 w-8" />
              Image Gallery
            </h1>
            <p className="text-gray-600 mt-1">
              Browse and explore image datasets stored on the blockchain
            </p>
          </div>
        </div>
        
        <Link href="/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </Link>
      </div>

      {/* Gallery Component */}
      <ImageGallery datasets={datasets} loading={loading} />
      
      {/* Footer Info */}
      {!loading && datasets.length > 0 && (
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            All images are stored on IPFS and referenced on the GovChain blockchain.
            <br />
            Data integrity is ensured through cryptographic hashing and decentralized storage.
          </p>
        </div>
      )}
    </div>
  );
}