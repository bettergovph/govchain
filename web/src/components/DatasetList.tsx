'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Dataset } from '@/types/dataset';
import DatasetCard from '@/components/DatasetCard';

interface DatasetResponse {
  datasets: Dataset[];
  total: number;
  pagination: {
    next_key: string;
    total: string;
  };
}

export default function DatasetList() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'timestamp' | 'agency' | 'fileSize'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [agencyFilter, setAgencyFilter] = useState('__all__');
  const [categoryFilter, setCategoryFilter] = useState('__all__');

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

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/datasets');
      
      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }

      const data: DatasetResponse = await response.json();
      setDatasets(data.datasets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedDatasets = datasets
    .filter(dataset => {
      const matchesSearch = !filter || 
        dataset.title.toLowerCase().includes(filter.toLowerCase()) ||
        dataset.description.toLowerCase().includes(filter.toLowerCase()) ||
        dataset.agency.toLowerCase().includes(filter.toLowerCase()) ||
        dataset.category.toLowerCase().includes(filter.toLowerCase());
      
      const matchesAgency = agencyFilter === '__all__' || dataset.agency === agencyFilter;
      const matchesCategory = categoryFilter === '__all__' || dataset.category === categoryFilter;
      
      return matchesSearch && matchesAgency && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'agency':
          comparison = a.agency.localeCompare(b.agency);
          break;
        case 'fileSize':
          comparison = a.fileSize - b.fileSize;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const clearFilters = () => {
    setFilter('');
    setAgencyFilter('__all__');
    setCategoryFilter('__all__');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                All Datasets
              </CardTitle>
              <CardDescription>
                Browse all datasets uploaded to the blockchain
                {datasets.length > 0 && (
                  <span className="ml-2">
                    ({filteredAndSortedDatasets.length} of {datasets.length} shown)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDatasets}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search datasets..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All agencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All agencies</SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency} value={agency}>
                        {agency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(filter || agencyFilter !== '__all__' || categoryFilter !== '__all__') && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp">Date uploaded</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="fileSize">File size</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="gap-1"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>

            {/* Active Filters */}
            {(agencyFilter !== '__all__' || categoryFilter !== '__all__') && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {agencyFilter !== '__all__' && (
                  <Badge variant="secondary" className="gap-1">
                    <Filter className="h-3 w-3" />
                    {agencyFilter}
                  </Badge>
                )}
                {categoryFilter !== '__all__' && (
                  <Badge variant="secondary" className="gap-1">
                    <Filter className="h-3 w-3" />
                    {categoryFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dataset List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading datasets...</p>
          </div>
        </div>
      ) : filteredAndSortedDatasets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">
              {datasets.length === 0 ? 'No datasets found' : 'No matching datasets'}
            </h3>
            <p className="text-muted-foreground">
              {datasets.length === 0 
                ? 'No datasets have been uploaded to the blockchain yet.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedDatasets.map((dataset) => (
            <DatasetCard key={dataset.index} dataset={dataset} />
          ))}
        </div>
      )}
    </div>
  );
}