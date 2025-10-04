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
import { Upload, FileIcon, CheckCircle, AlertCircle } from 'lucide-react';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!form.title || !form.description || !form.agency || !form.category) {
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
    <div className="max-w-4xl mx-auto space-y-6">
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv,.json,.xml,.pdf,.txt,.xlsx,.xls"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileIcon className="h-12 w-12 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    <span className="text-sm text-gray-500"> or drag and drop</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    CSV, JSON, XML, PDF, TXT, Excel (max 100MB)
                  </span>
                </label>
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileIcon className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
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
                <Label htmlFor="agency">Agency *</Label>
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

              {/* Submitter */}
              <div className="space-y-2">
                <Label htmlFor="submitter">Submitter Key</Label>
                <Input
                  id="submitter"
                  value={form.submitter}
                  onChange={(e) => setForm({ ...form, submitter: e.target.value })}
                  placeholder="alice"
                />
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
                  <div className="space-y-2">
                    <p>Dataset uploaded successfully!</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Transaction Hash:</strong> {result.txhash}</p>
                      <p><strong>IPFS CID:</strong> {result.dataset.ipfsCid}</p>
                      <p><strong>File URL:</strong> 
                        <a 
                          href={result.dataset.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 ml-1"
                        >
                          {result.dataset.fileUrl}
                        </a>
                      </p>
                    </div>
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