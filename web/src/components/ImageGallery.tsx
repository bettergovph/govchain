'use client';

import { useState, useEffect } from 'react';
import { Dataset, isImageMimeType } from '@/types/dataset';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Calendar,
  Building,
  Tag,
  User,
  FileImage,
  Eye,
  ZoomIn,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ImageGalleryProps {
  datasets?: Dataset[];
  loading?: boolean;
}

interface ImageModalProps {
  dataset: Dataset;
  isOpen: boolean;
  onClose: () => void;
}

function ImageModal({ dataset, isOpen, onClose }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            {dataset.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Image */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={dataset.file_url} 
              alt={dataset.title}
              className="w-full max-h-[60vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = dataset.fallback_url || '/placeholder-image.png';
              }}
            />
          </div>
          
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">File Information</h4>
              <div className="space-y-1">
                <p><span className="text-gray-600">Name:</span> {dataset.file_name}</p>
                <p><span className="text-gray-600">Size:</span> {formatFileSize(dataset.file_size)}</p>
                <p><span className="text-gray-600">Type:</span> {dataset.mime_type}</p>
                <p><span className="text-gray-600">IPFS:</span> 
                  <code className="ml-1 text-xs bg-gray-100 px-1 rounded">{dataset.ipfs_cid}</code>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Dataset Information</h4>
              <div className="space-y-1">
                <p><span className="text-gray-600">Agency:</span> {dataset.agency}</p>
                <p><span className="text-gray-600">Category:</span> {dataset.category}</p>
                <p><span className="text-gray-600">Submitter:</span> {dataset.submitter}</p>
                <p><span className="text-gray-600">Date:</span> {new Date(dataset.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {dataset.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{dataset.description}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(dataset.file_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = dataset.file_url;
                link.download = dataset.file_name;
                link.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ImageGallery({ datasets = [], loading = false }: ImageGalleryProps) {
  const [filteredImages, setFilteredImages] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<Dataset | null>(null);

  // Filter images from datasets
  const imageDatasets = datasets.filter(dataset => isImageMimeType(dataset.mime_type));

  // Get unique categories and agencies
  const categories = [...new Set(imageDatasets.map(d => d.category))];
  const agencies = [...new Set(imageDatasets.map(d => d.agency))];

  useEffect(() => {
    let filtered = imageDatasets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(dataset => 
        dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(dataset => dataset.category === selectedCategory);
    }

    // Filter by agency
    if (selectedAgency) {
      filtered = filtered.filter(dataset => dataset.agency === selectedAgency);
    }

    setFilteredImages(filtered);
  }, [imageDatasets, searchTerm, selectedCategory, selectedAgency]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Image Gallery</h2>
          <p className="text-gray-600">
            {filteredImages.length} of {imageDatasets.length} images
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <FileImage className="h-3 w-3 mr-1" />
          Images Only
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={selectedAgency}
          onChange={(e) => setSelectedAgency(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">All Agencies</option>
          {agencies.map(agency => (
            <option key={agency} value={agency}>{agency}</option>
          ))}
        </select>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No images found</h3>
          <p className="text-gray-500">
            {imageDatasets.length === 0 
              ? "No images have been uploaded yet." 
              : "Try adjusting your search filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((dataset) => (
            <Card 
              key={dataset.index} 
              className="group cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => setSelectedImage(dataset)}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                  <img 
                    src={dataset.file_url} 
                    alt={dataset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = dataset.fallback_url || '/placeholder-image.png';
                    }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(dataset.file_url, '_blank');
                        }}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{dataset.title}</h3>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{dataset.agency}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span className="truncate">{dataset.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(dataset.timestamp).toLocaleDateString()}</span>
                    </div>
                    <span>{formatFileSize(dataset.file_size)}</span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {dataset.mime_type.split('/')[1].toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          dataset={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}