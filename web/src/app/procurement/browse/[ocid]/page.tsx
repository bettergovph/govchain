'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  GitCommitHorizontal,
  Landmark,
  ReceiptText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STAGES = ['planning', 'tender', 'award', 'contract', 'implementation'];
const STAGE_COPY: Record<string, string> = {
  planning: 'Budget and rationale',
  tender: 'Opportunity published',
  award: 'Supplier selected',
  contract: 'Agreement signed',
  implementation: 'Payments and delivery',
};

function pick<T = any>(value: any, snake: string, camel?: string): T | undefined {
  return value?.[snake] ?? value?.[camel || snake];
}

function primaryTag(release: any) {
  return release?.tag?.[0] || 'unclassified';
}

function stageFromRelease(release: any) {
  const tag = primaryTag(release);
  if (STAGES.includes(tag)) return tag;
  if (tag === 'implementationUpdate') return 'implementation';
  if (tag === 'contractUpdate') return 'contract';
  if (tag === 'awardUpdate') return 'award';
  if ((release.contracts || []).some((contract: any) => contract.implementation)) return 'implementation';
  if ((release.contracts || []).length > 0) return 'contract';
  if ((release.awards || []).length > 0) return 'award';
  if (release.tender) return 'tender';
  if (release.planning) return 'planning';
  return tag;
}

function compiled(process: any) {
  return pick(process, 'compiled_release', 'compiledRelease') || {};
}

function releaseDate(release: any) {
  const value = release?.chain_timestamp || release?.date;
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDistanceToNow(date, { addSuffix: true });
}

function exactDate(release: any) {
  const value = release?.chain_timestamp || release?.date;
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function dateValue(value: any) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function valueLabel(value: any) {
  if (!value?.amount) return '—';
  const amount = Number(value.amount);
  if (!Number.isFinite(amount)) return `${value.amount} ${value.currency || ''}`.trim();
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: value.currency || 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function processValue(process: any) {
  const release = compiled(process);
  return release.contracts?.[0]?.value || release.awards?.[0]?.value || release.tender?.value;
}

function processTitle(process: any) {
  const release = compiled(process);
  return release.tender?.title || release.awards?.[0]?.title || release.contracts?.[0]?.title || 'Untitled procurement';
}

function buyerName(process: any) {
  const release = compiled(process);
  return release.buyer?.name || release.tender?.procuring_entity?.name || 'Unknown buyer';
}

function txHash(release: any) {
  return pick<string>(release, 'tx_hash', 'txHash') || '';
}

function blockHeight(release: any) {
  return pick<string>(release, 'block_height', 'blockHeight') || '';
}

function shortHash(hash: string) {
  if (!hash) return '—';
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function releaseSummary(release: any) {
  const tag = stageFromRelease(release);
  if (tag === 'planning') {
    return release.planning?.budget?.description || release.planning?.rationale || 'Planning release';
  }
  if (tag === 'tender') {
    return [
      release.tender?.title,
      release.tender?.procurement_method,
      release.tender?.status,
    ].filter(Boolean).join(' · ') || 'Tender release';
  }
  if (tag === 'award') {
    const suppliers = (release.awards || [])
      .flatMap((award: any) => award.suppliers || [])
      .map((supplier: any) => supplier.name)
      .filter(Boolean);
    return suppliers.length > 0 ? suppliers.join(', ') : `${(release.awards || []).length} award(s)`;
  }
  if (tag === 'contract') {
    return `${(release.contracts || []).length} contract(s) · ${valueLabel(release.contracts?.[0]?.value)}`;
  }
  if (tag === 'implementation') {
    const totals = (release.contracts || []).reduce(
      (acc: any, contract: any) => {
        acc.transactions += contract.implementation?.transactions?.length || 0;
        acc.milestones += contract.implementation?.milestones?.length || 0;
        return acc;
      },
      { transactions: 0, milestones: 0 }
    );
    return `${totals.transactions} payment(s) · ${totals.milestones} milestone(s)`;
  }
  return release.tender?.title || release.id || 'Release';
}

function stageIcon(stage: string) {
  if (stage === 'award') return <Landmark className="h-4 w-4" />;
  if (stage === 'contract') return <ReceiptText className="h-4 w-4" />;
  if (stage === 'implementation') return <CheckCircle2 className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function timelineStatus(stage: string, currentStage: string, count: number) {
  const currentIndex = STAGES.indexOf(currentStage);
  const stageIndex = STAGES.indexOf(stage);

  if (count === 0) return 'pending';
  if (stage === currentStage) return 'current';
  if (currentIndex >= 0 && stageIndex >= 0 && stageIndex < currentIndex) return 'complete';
  return 'complete';
}

function statusIcon(status: string) {
  if (status === 'current') return <Clock className="h-4 w-4" />;
  if (status === 'complete') return <CheckCircle2 className="h-4 w-4" />;
  return <Circle className="h-4 w-4" />;
}

function messageBody(release: any) {
  return {
    '@type': '/govchain.procurement.v1.MsgSubmitRelease',
    creator: release?.publisher_address || '',
    release,
  };
}

function formattedMessageBody(release: any) {
  return JSON.stringify(messageBody(release), null, 2);
}

function blockLabel(release: any) {
  const height = blockHeight(release);
  return height ? `Block ${height}` : 'Block —';
}

function displayValue(value: any) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
  return String(value);
}

function participantName(participant: any) {
  return participant?.name || participant?.id || 'Unnamed participant';
}

function supplierNames(award: any) {
  const suppliers = (award?.suppliers || []).map(participantName).filter(Boolean);
  return suppliers.length > 0 ? suppliers.join(', ') : '—';
}

function CompactField({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: any;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 border-t py-2 first:border-t-0 sm:first:border-t', className)}>
      <div className="text-[10px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className={cn('mt-0.5 break-words text-sm', mono && 'font-mono text-xs')}>
        {displayValue(value)}
      </div>
    </div>
  );
}

function CompactList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="border-t pt-2">
      <div className="text-[10px] font-medium uppercase text-muted-foreground">{title}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.slice(0, 8).map((item) => (
          <Badge key={item} variant="outline" className="max-w-full truncate">
            {item}
          </Badge>
        ))}
        {items.length > 8 ? <Badge variant="secondary">+{items.length - 8}</Badge> : null}
      </div>
    </div>
  );
}

function compactFields(release: any) {
  const stage = stageFromRelease(release);
  const hash = txHash(release);
  const tender = release.tender;
  const firstAward = release.awards?.[0];
  const firstContract = release.contracts?.[0];
  const implementation = firstContract?.implementation;
  const planning = release.planning;

  const fields = [
    { label: 'Stage', value: stage },
    { label: 'Message', value: 'Submit procurement release' },
    { label: 'OCID', value: release.ocid, mono: true },
    { label: 'Release ID', value: release.id, mono: true },
    { label: 'Buyer', value: release.buyer?.name || tender?.procuring_entity?.name },
    { label: 'Summary', value: releaseSummary(release), className: 'sm:col-span-2 xl:col-span-3' },
    { label: 'Source date', value: dateValue(release.date) },
    { label: 'On-chain time', value: dateValue(release.chain_timestamp) },
    { label: 'Block', value: blockHeight(release) },
    { label: 'Tx', value: hash ? shortHash(hash) : '—', mono: true },
    { label: 'Publisher', value: release.publisher_address, mono: true, className: 'sm:col-span-2' },
  ];

  if (planning) {
    fields.push(
      { label: 'Planning rationale', value: planning.rationale, className: 'sm:col-span-2 xl:col-span-3' },
      { label: 'Budget', value: valueLabel(planning.budget?.amount) }
    );
  }

  if (tender) {
    fields.push(
      { label: 'Tender status', value: tender.status },
      { label: 'Method', value: tender.procurement_method_details || tender.procurement_method },
      { label: 'Category', value: tender.main_procurement_category },
      { label: 'Estimated value', value: valueLabel(tender.value) },
      { label: 'Tender opens', value: dateValue(tender.tender_period?.start_date) },
      { label: 'Tender closes', value: dateValue(tender.tender_period?.end_date) },
      { label: 'Tenderers', value: tender.number_of_tenderers || (tender.tenderers || []).length },
      { label: 'Documents', value: (tender.documents || []).length }
    );
  }

  if (firstAward) {
    fields.push(
      { label: 'Award', value: firstAward.title, className: 'sm:col-span-2 xl:col-span-3' },
      { label: 'Supplier', value: supplierNames(firstAward) },
      { label: 'Award value', value: valueLabel(firstAward.value) },
      { label: 'Award date', value: dateValue(firstAward.date) }
    );
  }

  if (firstContract) {
    fields.push(
      { label: 'Contract', value: firstContract.title, className: 'sm:col-span-2 xl:col-span-3' },
      { label: 'Contract value', value: valueLabel(firstContract.value) },
      { label: 'Date signed', value: dateValue(firstContract.date_signed) },
      { label: 'Linked award', value: firstContract.award_id, mono: true },
      { label: 'Items', value: (firstContract.items || []).length },
      { label: 'Contract docs', value: (firstContract.documents || []).length },
      { label: 'Milestones', value: (firstContract.milestones || []).length }
    );
  }

  if (implementation) {
    fields.push(
      { label: 'Payments', value: (implementation.transactions || []).length },
      { label: 'Implementation milestones', value: (implementation.milestones || []).length },
      { label: 'Implementation docs', value: (implementation.documents || []).length }
    );
  }

  fields.push(
    { label: 'Organizations', value: (release.parties || []).length },
    { label: 'Awards', value: (release.awards || []).length },
    { label: 'Contracts', value: (release.contracts || []).length },
    { label: 'Related processes', value: (release.related_processes || []).length }
  );

  return fields;
}

function PublicMessageBody({ release, releaseNumber }: { release: any; releaseNumber: number }) {
  const parties = (release.parties || []).map((party: any) => {
    const roles = (party.roles || []).length > 0 ? ` (${party.roles.join(', ')})` : '';
    return `${participantName(party)}${roles}`;
  });
  const awards = (release.awards || []).slice(1).map((award: any) => `${award.title || award.id || 'Award'} · ${supplierNames(award)}`);
  const contracts = (release.contracts || []).slice(1).map((contract: any) => `${contract.title || contract.id || 'Contract'} · ${valueLabel(contract.value)}`);

  return (
    <div className="mt-3 border-t pt-3">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
          <Code2 className="h-4 w-4" />
          Message body
        </div>
        <span className="text-xs text-muted-foreground">release {releaseNumber}</span>
      </div>

      <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
        {compactFields(release).map((field) => (
          <CompactField
            key={`${field.label}-${field.value}`}
            label={field.label}
            value={field.value}
            mono={field.mono}
            className={field.className}
          />
        ))}
      </div>

      <div className="mt-2 grid gap-3 md:grid-cols-3">
        <CompactList title="Organizations" items={parties} />
        <CompactList title="More awards" items={awards} />
        <CompactList title="More contracts" items={contracts} />
      </div>

      <details className="mt-3 border-t pt-2">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          Raw JSON message body
        </summary>
        <pre className="mt-2 max-h-[320px] overflow-auto rounded-md bg-muted/40 p-3 text-xs leading-5">
          <code>{formattedMessageBody(release)}</code>
        </pre>
      </details>
    </div>
  );
}

export default function ProcurementDetailPage() {
  const params = useParams<{ ocid: string }>();
  const ocid = decodeURIComponent(params.ocid);
  const [process, setProcess] = useState<any>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/procurement/process/${encodeURIComponent(ocid)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load process');
        if (!cancelled) {
          setProcess(data.process);
          setReleases(data.releases || []);
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
  }, [ocid]);

  const grouped = useMemo(() => {
    const groups = new Map<string, any[]>();
    for (const release of releases) {
      const stage = stageFromRelease(release);
      groups.set(stage, [...(groups.get(stage) || []), release]);
    }
    return groups;
  }, [releases]);

  if (loading && !process) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/procurement/browse">
            <ArrowLeft className="h-4 w-4" />
            Procurement Browse
          </Link>
        </Button>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error || 'Process not found'}
        </div>
      </div>
    );
  }

  const release = compiled(process);
  const currentStage = pick<string>(process, 'current_stage', 'currentStage') || primaryTag(release);
  const orderedStages = [...STAGES, ...Array.from(grouped.keys()).filter((stage) => !STAGES.includes(stage))];
  const completedStageCount = STAGES.filter((stage) => (grouped.get(stage)?.length || 0) > 0).length;
  const latestRelease = releases[releases.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/procurement/browse">
              <ArrowLeft className="h-4 w-4" />
              Procurement Browse
            </Link>
          </Button>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="capitalize">{currentStage}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{process.ocid}</span>
            </div>
            <h1 className="max-w-4xl text-2xl font-bold tracking-normal">{processTitle(process)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{buyerName(process)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/api/procurement/releases/${encodeURIComponent(process.ocid)}`} target="_blank" rel="noreferrer">
              Releases
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/procurement/process/${encodeURIComponent(process.ocid)}`} target="_blank" rel="noreferrer">
              JSON
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="rounded-md border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription>Lifecycle Releases</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <GitCommitHorizontal className="h-5 w-5 text-emerald-600" />
              {releases.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-md border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Lifecycle Progress</CardDescription>
            <CardTitle className="text-2xl">{completedStageCount} / {STAGES.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-md border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Awards</CardDescription>
            <CardTitle className="text-2xl">{(release.awards || []).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-md border-l-4 border-l-slate-500">
          <CardHeader className="pb-2">
            <CardDescription>Current Value</CardDescription>
            <CardTitle className="text-2xl">{valueLabel(processValue(process))}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Box className="h-4 w-4" />
              Lifecycle Timeline
            </CardTitle>
            <CardDescription>{latestRelease ? `${blockLabel(latestRelease)} latest` : 'Waiting for releases'}</CardDescription>
          </CardHeader>
          <CardContent>
            {STAGES.map((stage) => {
              const count = grouped.get(stage)?.length || 0;
              const status = timelineStatus(stage, currentStage, count);
              return (
                <div key={stage} className="relative flex gap-3 pb-5 last:pb-0">
                  <div className="flex w-7 flex-col items-center">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border bg-background',
                        status === 'complete' && 'border-emerald-500 bg-emerald-50 text-emerald-700',
                        status === 'current' && 'border-blue-500 bg-blue-50 text-blue-700',
                        status === 'pending' && 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      {statusIcon(status)}
                    </div>
                    {stage !== STAGES[STAGES.length - 1] && (
                      <div
                        className={cn(
                          'mt-2 h-full min-h-8 w-px bg-border',
                          (status === 'complete' || status === 'current') && 'bg-emerald-400'
                        )}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 rounded-md border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {stageIcon(stage)}
                        <span className="truncate text-sm font-medium capitalize">{stage}</span>
                      </div>
                      <Badge variant={count > 0 ? 'default' : 'outline'}>{count}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{STAGE_COPY[stage]}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-5">
          {orderedStages.map((stage) => {
            const stageReleases = grouped.get(stage) || [];
            const status = timelineStatus(stage, currentStage, stageReleases.length);
            return (
              <section
                key={stage}
                className={cn(
                  'border-l-4 pl-4',
                  status === 'complete' && 'border-l-emerald-500',
                  status === 'current' && 'border-l-blue-500',
                  status === 'pending' && 'border-l-muted'
                )}
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold capitalize">
                      {stageIcon(stage)}
                      {stage}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {STAGE_COPY[stage] || 'Additional release stage'} · {stageReleases.length} release{stageReleases.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Badge
                    variant={status === 'pending' ? 'outline' : 'default'}
                    className="w-fit capitalize"
                  >
                    {status}
                  </Badge>
                </div>
                <div>
                  {stageReleases.length === 0 ? (
                    <div className="border-t py-3 text-sm text-muted-foreground">
                      No release recorded
                    </div>
                  ) : (
                    stageReleases.map((item, index) => {
                      const hash = txHash(item);
                      return (
                        <div key={item.id} className="border-t py-3 first:border-t-0">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {item.id}
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                  {primaryTag(item)}
                                </Badge>
                                <span className="text-xs text-muted-foreground" title={exactDate(item)}>
                                  {releaseDate(item)}
                                </span>
                              </div>
                              <p className="text-sm font-medium">{releaseSummary(item)}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="gap-1">
                                <GitCommitHorizontal className="h-3 w-3" />
                                {blockLabel(item)}
                              </Badge>
                              {hash ? (
                                <Button asChild variant="outline" size="sm" className="font-mono">
                                  <Link href={`/explorer/tx/${hash}`}>
                                    {shortHash(hash)}
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>

                          <PublicMessageBody release={item} releaseNumber={index + 1} />
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
