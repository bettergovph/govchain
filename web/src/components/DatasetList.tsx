'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, RefreshCw, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [nextKey, setNextKey] = useState<string>('');
  const [prevKeys, setPrevKeys] = useState<string[]>([]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = !!nextKey || currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

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
    fetchDatasets(1); // Reset to first page when component mounts
  }, [pageSize]);

  // Reset to first page when filters or sorting change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      setPrevKeys([]);
      setNextKey('');
      fetchDatasets(1);
    } else {
      fetchDatasets(1);
    }
  }, [agencyFilter, categoryFilter, sortBy, sortOrder]);

  // Add debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
        setPrevKeys([]);
        setNextKey('');
        fetchDatasets(1);
      } else {
        fetchDatasets(1);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filter]);

  const fetchDatasets = async (page: number = currentPage, key: string = '') => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters for pagination and sorting
      const params = new URLSearchParams({
        'pagination.limit': pageSize.toString(),
        'pagination.reverse': sortBy === 'timestamp' && sortOrder === 'desc' ? 'true' : 'false',
        'sortBy': sortBy,
        'sortOrder': sortOrder,
      });

      // Add pagination key if provided
      if (key) {
        params.set('pagination.key', key);
      }

      // Add filters if set
      if (agencyFilter !== '__all__') {
        params.set('agency', agencyFilter);
      }

      if (categoryFilter !== '__all__') {
        params.set('category', categoryFilter);
      }

      if (filter.trim()) {
        params.set('q', filter.trim());
      }

      const response = await fetch(`/api/datasets?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }

      const data: DatasetResponse = await response.json();
      setDatasets(data.datasets || []);
      setTotalItems(parseInt(data.pagination?.total || '0'));
      setNextKey(data.pagination?.next_key || '');
      setCurrentPage(page);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets');
    } finally {
      setLoading(false);
    }
  };

  // Pagination navigation functions
  const goToNextPage = () => {
    if (hasNextPage && nextKey) {
      setPrevKeys([...prevKeys, nextKey]);
      fetchDatasets(currentPage + 1, nextKey);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      const newPrevKeys = [...prevKeys];
      const prevKey = newPrevKeys.pop() || '';
      setPrevKeys(newPrevKeys);
      fetchDatasets(currentPage - 1, prevKey);
    }
  };

  const refreshDatasets = () => {
    setCurrentPage(1);
    setPrevKeys([]);
    setNextKey('');
    fetchDatasets(1);
  };

  // Since sorting and filtering are now done server-side, we just use the datasets as-is
  const filteredAndSortedDatasets = datasets;

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
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                All Datasets
              </CardTitle>
              <CardDescription>
                Browse all datasets uploaded to the blockchain
                {totalItems > 0 && (
                  <span className="ml-2">
                    (Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems})
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDatasets}
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
                  placeholder="Search datasets... (coming soon)"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  disabled
                />
              </div>

              <div className="flex gap-2 flex-wrap">
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
            <div className="flex items-center gap-4 flex-wrap">
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
        <>
          <div className="grid gap-4">
            {filteredAndSortedDatasets.map((dataset) => (
              <DatasetCard key={dataset.index} dataset={dataset} />
            ))}
          </div>

          {/* Pagination Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({totalItems} total entries)
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                      setPrevKeys([]);
                      setNextKey('');
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={!hasPrevPage || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={!hasNextPage || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}