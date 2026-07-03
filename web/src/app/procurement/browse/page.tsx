'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, ChevronLeft, ChevronRight, FileSearch, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STAGES = ['planning', 'tender', 'award', 'contract', 'implementation'];

function pick<T = any>(value: any, snake: string, camel?: string): T | undefined {
  return value?.[snake] ?? value?.[camel || snake];
}

function compiled(process: any) {
  return pick(process, 'compiled_release', 'compiledRelease') || {};
}

function stageList(process: any) {
  const release = compiled(process);
  const stages = [];
  if (release.planning) stages.push('planning');
  if (release.tender) stages.push('tender');
  if ((release.awards || []).length > 0) stages.push('award');
  if ((release.contracts || []).length > 0) stages.push('contract');
  if ((release.contracts || []).some((contract: any) => contract.implementation)) stages.push('implementation');
  return stages.length > 0 ? stages : [pick(process, 'current_stage', 'currentStage') || 'pending'];
}

function processTitle(process: any) {
  const release = compiled(process);
  return release.tender?.title || release.awards?.[0]?.title || release.contracts?.[0]?.title || 'Untitled procurement';
}

function buyerName(process: any) {
  const release = compiled(process);
  return release.buyer?.name || release.tender?.procuring_entity?.name || 'Unknown buyer';
}

function valueLabel(process: any) {
  const release = compiled(process);
  const value = release.contracts?.[0]?.value || release.awards?.[0]?.value || release.tender?.value;
  if (!value?.amount) return '—';
  const amount = Number(value.amount);
  if (!Number.isFinite(amount)) return `${value.amount} ${value.currency || ''}`.trim();
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: value.currency || 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function updatedLabel(process: any) {
  const height = pick(process, 'updated_at_block', 'updatedAtBlock');
  const date = compiled(process).chain_timestamp || compiled(process).date;
  if (date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }
  return height ? `Block ${height}` : '—';
}

export default function ProcurementPage() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/procurement/processes?page=${pagination.page}&limit=${pagination.limit}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load procurement processes');
        if (!cancelled) {
          setProcesses(data.processes || []);
          setPagination(data.pagination || pagination);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pagination.page, pagination.limit]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return processes;
    return processes.filter((process) => {
      const haystack = [
        process.ocid,
        processTitle(process),
        buyerName(process),
        pick(process, 'current_stage', 'currentStage'),
      ].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [processes, query]);

  const completedStages = processes.reduce((sum, process) => sum + stageList(process).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Procurement Browse</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination.total.toLocaleString()} contracting processes indexed on-chain
          </p>
        </div>
        <div className="flex w-full gap-2 lg:w-[420px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="OCID, buyer, title"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-md">
          <CardHeader className="pb-2">
            <CardDescription>Processes</CardDescription>
            <CardTitle className="text-2xl">{pagination.total.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-md">
          <CardHeader className="pb-2">
            <CardDescription>Visible Releases</CardDescription>
            <CardTitle className="text-2xl">{completedStages.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-md">
          <CardHeader className="pb-2">
            <CardDescription>Page</CardDescription>
            <CardTitle className="text-2xl">{pagination.page.toLocaleString()} / {pagination.totalPages.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-md">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSearch className="h-4 w-4" />
            Contracting Processes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OCID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Stages</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && filtered.length === 0 ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7}>
                        <div className="h-5 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No matching processes
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((process) => (
                    <TableRow key={process.ocid}>
                      <TableCell className="font-mono text-xs">{process.ocid}</TableCell>
                      <TableCell className="max-w-[320px] truncate font-medium">{processTitle(process)}</TableCell>
                      <TableCell className="max-w-[260px] truncate text-muted-foreground">{buyerName(process)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {STAGES.map((stage) => (
                            <Badge
                              key={stage}
                              variant={stageList(process).includes(stage) ? 'default' : 'outline'}
                              className="capitalize"
                            >
                              {stage}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{valueLabel(process)}</TableCell>
                      <TableCell className="text-muted-foreground">{updatedLabel(process)}</TableCell>
                      <TableCell>
                        <Button asChild size="icon-sm" variant="ghost" aria-label={`Open ${process.ocid}`}>
                          <Link href={`/procurement/browse/${encodeURIComponent(process.ocid)}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
