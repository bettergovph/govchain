'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileIcon, CheckCircle, AlertCircle, ImageIcon, X } from 'lucide-react';
import { isImageMimeType, getSupportedImageFormats } from '@/types/dataset';

interface UploadForm {
  title: string;
  description: string;
  agency: string;
  category: string;
  fallbackUrl: string;
  submitter: string;
}

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    agency: '',
    category: '',
    fallbackUrl: '',
    submitter: 'alice',
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const agencies = [
    'National',
    'Local',
    'Others',
    'Department of Health and Human Services',
    'Department of Education',
    'Environmental Protection Agency',
    'Department of Agriculture',
    'Department of Transportation',
    'National Institute of Health',
    'Centers for Disease Control',
    'Department of Energy',
  ];

  const categories = [
    'General',
    'Others',
    'Healthcare',
    'Education',
    'Environment',
    'Transportation',
    'Agriculture',
    'Energy',
    'Demographics',
    'Economic',
    'Climate',
    'Research',
  ];

  const handleFileChange = (selectedFile: File) => {
    // Validate file size (100MB limit)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create image preview for image files
    if (isImageMimeType(selectedFile.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!form.title || !form.description) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(form));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
      
      // Reset form
      setFile(null);
      setImagePreview(null);
      setForm({
        title: '',
        description: '',
        agency: '',
        category: '',
        fallbackUrl: '',
        submitter: 'alice',
      });
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Dataset
          </CardTitle>
          <CardDescription>
            Upload a new dataset to the blockchain and IPFS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Dataset File *</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : file 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleInputChange}
                  className="hidden"
                  accept=".csv,.json,.xml,.pdf,.txt,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,image/*"
                />
                
                {!file ? (
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {dragActive ? (
                      <>
                        <Upload className="h-12 w-12 text-blue-500" />
                        <div className="text-blue-600 font-medium">
                          Drop your file here
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-12 w-12 text-gray-400" />
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Click to upload
                          </span>
                          <span className="text-sm text-gray-500"> or drag and drop</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Images: JPG, PNG, GIF, WebP, SVG<br/>
                          Documents: CSV, JSON, XML, PDF, TXT, Excel<br/>
                          (max 100MB)
                        </span>
                      </>
                    )}
                  </label>
                ) : (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-xs max-h-48 rounded-lg border object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    {/* File Info */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      {isImageMimeType(file.type) ? (
                        <ImageIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <FileIcon className="h-4 w-4" />
                      )}
                      <span className="font-medium">{file.name}</span>
                      <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {isImageMimeType(file.type) && (
                      <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md">
                        ✓ Image file detected - will appear in Image Gallery
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Census Data 2024"
                  required
                />
              </div>

              {/* Agency */}
              <div className="space-y-2">
                <Label htmlFor="agency">Agency</Label>
                <Select
                  value={form.agency}
                  onValueChange={(value) => setForm({ ...form, agency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency} value={agency}>
                        {agency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed description of the dataset..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fallback URL */}
            <div className="space-y-2">
              <Label htmlFor="fallbackUrl">Fallback URL (optional)</Label>
              <Input
                id="fallbackUrl"
                type="url"
                value={form.fallbackUrl}
                onChange={(e) => setForm({ ...form, fallbackUrl: e.target.value })}
                placeholder="https://example.com/backup-file.csv"
              />
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Result */}
            {result && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-4">
                    <p className="font-semibold">Dataset uploaded successfully!</p>
                    
                    {/* Transaction Summary */}
                    {result.summary && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h4 className="font-medium text-sm">Upload Summary</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* File Info */}
                          <div>
                            <h5 className="font-medium mb-2">File Information</h5>
                            <div className="space-y-1">
                              <p><span className="text-gray-600">Name:</span> {result.summary.file.name}</p>
                              <p><span className="text-gray-600">Size:</span> {result.summary.file.size_formatted}</p>
                              <p><span className="text-gray-600">Type:</span> {result.summary.file.mime_type}</p>
                              {isImageMimeType(result.summary.file.mime_type) && (
                                <p className="text-green-600 font-medium">✓ Added to Image Gallery</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Blockchain Info */}
                          <div>
                            <h5 className="font-medium mb-2">Blockchain</h5>
                            <div className="space-y-1">
                              <p><span className="text-gray-600">Entry ID:</span> {result.summary.blockchain.entry_id}</p>
                              <p><span className="text-gray-600">Chain:</span> {result.summary.blockchain.chain_id}</p>
                              <p><span className="text-gray-600">Gas Used:</span> {result.summary.transaction.gas_used}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* IPFS Links */}
                        <div>
                          <h5 className="font-medium mb-2">Access Links</h5>
                          <div className="space-y-1">
                            <p className="flex items-center gap-2">
                              <span className="text-gray-600">IPFS:</span>
                              <a 
                                href={result.summary.ipfs.gateway_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-500 text-xs break-all"
                              >
                                {result.summary.ipfs.cid}
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Fallback to basic info if no summary */}
                    {!result.summary && (
                      <div className="text-sm space-y-1">
                        <p><strong>Transaction Hash:</strong> {result.txhash}</p>
                        <p><strong>IPFS CID:</strong> {result.dataset.ipfs_cid}</p>
                        <p><strong>File URL:</strong> 
                          <a 
                            href={result.dataset.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 ml-1"
                          >
                            {result.dataset.file_url}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload Dataset'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}