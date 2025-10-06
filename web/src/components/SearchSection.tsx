'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Filter, Download, ExternalLink, FileText, Clock, Building } from 'lucide-react';
import { Dataset, SearchResponse } from '@/types/dataset';
import DatasetCard from '@/components/DatasetCard';

export default function SearchSection() {
  const [query, setQuery] = useState('');
  const [agency, setAgency] = useState('__all__');
  const [category, setCategory] = useState('__all__');
  const [results, setResults] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const searchParams = new URLSearchParams({ q: query });
      if (agency && agency !== '__all__') searchParams.set('agency', agency);
      if (category && category !== '__all__') searchParams.set('category', category);
      
      const response = await fetch(`/api/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setAgency('__all__');
    setCategory('__all__');
    setResults([]);
    setSearchPerformed(false);
    setError(null);
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Search Datasets
          </CardTitle>
          <CardDescription>
            Find government datasets using natural language search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Search for datasets... (e.g., 'climate change data', 'healthcare statistics')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-lg h-12"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agency</label>
                <Select value={agency} onValueChange={setAgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="All agencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All agencies</SelectItem>
                    {agencies.map((ag) => (
                      <SelectItem key={ag} value={ag}>
                        {ag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(agency !== '__all__' || category !== '__all__') && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {agency !== '__all__' && (
                  <Badge variant="secondary" className="gap-1">
                    <Building className="h-3 w-3" />
                    {agency}
                  </Badge>
                )}
                {category !== '__all__' && (
                  <Badge variant="secondary" className="gap-1">
                    <Filter className="h-3 w-3" />
                    {category}
                  </Badge>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results
              {!loading && results.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({results.length} found)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No datasets found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map((dataset) => (
                  <DatasetCard key={dataset.timestamp} dataset={dataset} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      {!searchPerformed && (
        <Card>
          <CardHeader>
            <CardTitle>Search Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Natural Language Search</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• "climate change data from EPA"</li>
                  <li>• "healthcare statistics 2024"</li>
                  <li>• "education funding by state"</li>
                  <li>• "transportation safety records"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Filter Options</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Filter by government agency</li>
                  <li>• Filter by data category</li>
                  <li>• Combine with search terms</li>
                  <li>• Use semantic similarity matching</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}