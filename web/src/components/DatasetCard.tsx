'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Calendar,
  Building,
  Tag,
  Hash,
  Code,
  ListOrdered,
  Layers,
  HardDrive,
  Shield,
  Users,
  Clock,
  Image,
  FileType
} from 'lucide-react';
import { Dataset, MIME_TYPE_PREVIEWS, PreviewType, isImageMimeType } from '@/types/dataset';
import { formatDistanceToNow } from 'date-fns';
import { tryParseData } from '@/lib/utils';
import { FinancialSummaryCard, HierarchicalCard, DetailListCard } from './DescriptionShaper';

interface DatasetCardProps {
  dataset: Dataset;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('financial');

  const parsedData = useMemo(() => tryParseData(dataset.description), [dataset.description,]);
  const modes = [
    { id: 'financial', label: 'Financial', Icon: DollarSign },
    { id: 'hierarchical', label: 'Hierarchy', Icon: Layers },
    { id: 'detailed', label: 'Details', Icon: ListOrdered },
    { id: 'raw', label: 'Raw', Icon: Code },
  ];

  const getPreviewType = (mimeType: string): PreviewType => {
    return MIME_TYPE_PREVIEWS[mimeType as keyof typeof MIME_TYPE_PREVIEWS] || 'unknown';
  };

  const getFileIcon = (mimeType: string) => {
    const previewType = getPreviewType(mimeType);
    switch (previewType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileType className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true });
  };

  const isDownloadable = (mimeType: string) => {
    // Hide download for text/plain and other non-downloadable types
    const nonDownloadableTypes = ['text/plain', 'application/json'];
    return !nonDownloadableTypes.includes(mimeType);
  };

  const downloadFile = () => {
    window.open(dataset.file_url, '_blank');
  };

  const viewOnBlockchain = () => {
    // Link to our blockchain explorer with the dataset index
    // In the explorer, we can look up the transaction by entry index
    window.open(`/explorer/tx/${dataset.tx_hash}`, '_blank');
  };

  const renderActiveView = () => {
    // Only render cards if the data was successfully parsed
    if (parsedData) {
      switch (viewMode) {
        case 'financial':
          return <FinancialSummaryCard data={parsedData} />;
        case 'hierarchical':
          return <HierarchicalCard data={parsedData} />;
        case 'detailed':
          return <DetailListCard data={parsedData} />;
        case 'raw':
          // Display the raw JSON string with wrapping enabled
          return (
            <pre className="p-4 w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
              {dataset.description}
            </pre>
          );
        default:
          return null;
      }
    }
    // Fallback for plain text description (when parsedData is null)
    return (
      <div className='mb-4'>
        <span className='font-medium block mb-1 text-sm'>Description:</span>
        <p className='text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line border-l-4 border-blue-500 pl-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded'>
          {dataset.description}
        </p>
      </div>
    );
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        {/* Image Preview for image files */}
        {isImageMimeType(dataset.mime_type) && (
          <div className="aspect-video relative overflow-hidden bg-gray-100">
            <img
              src={dataset.file_url}
              alt={dataset.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            // onError={(e) => {
            //   const target = e.target as HTMLImageElement;
            //   target.src = dataset.fallback_url || '/placeholder-image.png';
            // }}
            />

            {/* Image overlay with type badge */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/50 text-white border-none">
                <Image className="h-3 w-3 mr-1" />
                {dataset.mime_type.split('/')[1].toUpperCase()}
              </Badge>
            </div>

            {/* Quick action overlay */}
            <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="secondary"
                className="bg-black/50 text-white border-none hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(dataset.file_url, '_blank');
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 line-clamp-2">
                {dataset.title}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {dataset.description}
              </CardDescription>
            </div>
            {!isImageMimeType(dataset.mime_type) && (
              <div className="flex items-center gap-1 text-muted-foreground ml-4">
                {getFileIcon(dataset.mime_type)}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="gap-1">
              <Building className="h-3 w-3" />
              {dataset.agency}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Tag className="h-3 w-3" />
              {dataset.category}
            </Badge>
            {dataset.pinCount > 0 && (
              <Badge variant="default" className="gap-1">
                <Users className="h-3 w-3" />
                {dataset.pinCount} pins
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {formatFileSize(dataset.file_size)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(dataset.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {isDownloadable(dataset.mime_type) && (
              <Button size="sm" onClick={downloadFile} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(true)}
              className={isDownloadable(dataset.mime_type) ? '' : 'flex-1'}
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={viewOnBlockchain}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFileIcon(dataset.mime_type)}
              {dataset.title}
            </DialogTitle>
            <DialogDescription>
              Complete dataset information and metadata
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-semibold mb-3">Basic Information</h3>

              {/* 👇 NEW: Full-width Description Block */}
              {parsedData ? (
                // --- DATA IS JSON: Show Tabs and Selected View ---
                <div className="mb-6 border-y dark:border-gray-700 py-6">
                  
                  {/* View Mode Tabs (Now with icons) */}
                  <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    {modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`py-2 px-3 text-sm font-medium transition-colors duration-200 rounded-t-lg flex items-center justify-center
                          ${viewMode === mode.id
                            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-gray-50 dark:bg-gray-800'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                      >
                        {/* Icon Component */}
                        <mode.Icon className="w-5 h-5 mr-1" />
                        
                        {/* Label (Hidden on small screens to save space) */}
                        <span className="hidden sm:inline">{mode.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Card / View */}
                  <div className="flex justify-center w-full">
                    {renderActiveView()}
                  </div>

                </div>
              ) : (
                renderActiveView()      
              )}
              {/* 👆 END NEW: Full-width Description Block */}

              <div className="grid gap-3">
              {/* <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Description:</span>
                  <span className="col-span-2">{dataset.description}</span>
                </div> */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Agency:</span>
                  <span className="col-span-2">{dataset.agency}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Category:</span>
                  <span className="col-span-2">{dataset.category}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Submitter:</span>
                  <span className="col-span-2">{dataset.submitter}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* File Information */}
            <div>
              <h3 className="font-semibold mb-3">File Information</h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Filename:</span>
                  <span className="col-span-2 font-mono">{dataset.file_name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">MIME Type:</span>
                  <span className="col-span-2 font-mono">{dataset.mime_type}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">File Size:</span>
                  <span className="col-span-2">{formatFileSize(dataset.file_size)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Uploaded:</span>
                  <span className="col-span-2">{new Date(dataset.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Blockchain Information */}
            <div>
              <h3 className="font-semibold mb-3">Blockchain Information</h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Dataset ID:</span>
                  <span className="col-span-2 font-mono">{dataset.index}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">IPFS CID:</span>
                  <span className="col-span-2 font-mono break-all">{dataset.ipfs_cid}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">SHA-256:</span>
                  <span className="col-span-2 font-mono break-all">{dataset.checksum_sha_256}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">Pin Count:</span>
                  <span className="col-span-2">{dataset.pinCount} nodes</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* File URLs */}
            <div>
              <h3 className="font-semibold mb-3">Access URLs</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Primary (IPFS):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-muted p-2 rounded break-all">
                      {dataset.file_url}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(dataset.file_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {dataset.fallback_url && (
                  <div>
                    <label className="text-sm font-medium">Fallback:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-xs bg-muted p-2 rounded break-all">
                        {dataset.fallback_url}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(dataset.fallback_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {isDownloadable(dataset.mime_type) && (
                <Button onClick={downloadFile} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              )}
              <Button
                variant="outline"
                onClick={viewOnBlockchain}
                className={isDownloadable(dataset.mime_type) ? '' : 'flex-1'}
              >
                <Hash className="h-4 w-4 mr-2" />
                View on Chain
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
