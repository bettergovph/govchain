'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Banknote,
  Box,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  GitCommitHorizontal,
  Landmark,
  ListChecks,
  ReceiptText,
  Tag,
  Users,
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

function Field({
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
    <div className={cn('rounded-md border bg-background px-3 py-2', className)}>
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className={cn('mt-1 break-words text-sm font-medium', mono && 'font-mono text-xs')}>
        {displayValue(value)}
      </div>
    </div>
  );
}

function PublicSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border bg-muted/20 p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

function PlanningContent({ release }: { release: any }) {
  const planning = release.planning;
  if (!planning) return null;
  const budget = planning.budget || {};

  return (
    <PublicSection title="Planning" icon={<ListChecks className="h-4 w-4" />}>
      <div className="grid gap-2 md:grid-cols-2">
        <Field label="Rationale" value={planning.rationale} className="md:col-span-2" />
        <Field label="Budget description" value={budget.description} />
        <Field label="Budget amount" value={valueLabel(budget.amount)} />
      </div>
    </PublicSection>
  );
}

function TenderContent({ release }: { release: any }) {
  const tender = release.tender;
  if (!tender) return null;

  return (
    <PublicSection title="Tender" icon={<FileText className="h-4 w-4" />}>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Title" value={tender.title} className="md:col-span-2 xl:col-span-3" />
        <Field label="Status" value={tender.status} />
        <Field label="Procurement method" value={tender.procurement_method_details || tender.procurement_method} />
        <Field label="Category" value={tender.main_procurement_category} />
        <Field label="Estimated value" value={valueLabel(tender.value)} />
        <Field label="Procuring entity" value={tender.procuring_entity?.name} />
        <Field label="Tenderers" value={tender.number_of_tenderers || (tender.tenderers || []).length} />
        <Field label="Tender starts" value={dateValue(tender.tender_period?.start_date)} />
        <Field label="Tender closes" value={dateValue(tender.tender_period?.end_date)} />
        <Field label="Documents" value={(tender.documents || []).length} />
      </div>
    </PublicSection>
  );
}

function AwardsContent({ release }: { release: any }) {
  const awards = release.awards || [];
  if (awards.length === 0) return null;

  return (
    <PublicSection title="Awards" icon={<Landmark className="h-4 w-4" />}>
      <div className="space-y-2">
        {awards.map((award: any, awardIndex: number) => (
          <div key={award.id || awardIndex} className="rounded-md border bg-background p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">{award.id || `award-${awardIndex + 1}`}</Badge>
              <Badge variant="secondary" className="capitalize">{award.status || 'award'}</Badge>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Award title" value={award.title} className="md:col-span-2 xl:col-span-3" />
              <Field label="Supplier" value={supplierNames(award)} />
              <Field label="Award value" value={valueLabel(award.value)} />
              <Field label="Award date" value={dateValue(award.date)} />
            </div>
          </div>
        ))}
      </div>
    </PublicSection>
  );
}

function ContractsContent({ release }: { release: any }) {
  const contracts = release.contracts || [];
  if (contracts.length === 0) return null;

  return (
    <PublicSection title="Contracts" icon={<ReceiptText className="h-4 w-4" />}>
      <div className="space-y-2">
        {contracts.map((contract: any, contractIndex: number) => (
          <div key={contract.id || contractIndex} className="rounded-md border bg-background p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">{contract.id || `contract-${contractIndex + 1}`}</Badge>
              <Badge variant="secondary" className="capitalize">{contract.status || 'contract'}</Badge>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Contract title" value={contract.title} className="md:col-span-2 xl:col-span-3" />
              <Field label="Contract value" value={valueLabel(contract.value)} />
              <Field label="Date signed" value={dateValue(contract.date_signed)} />
              <Field label="Linked award" value={contract.award_id} mono />
              <Field label="Items" value={(contract.items || []).length} />
              <Field label="Documents" value={(contract.documents || []).length} />
              <Field label="Milestones" value={(contract.milestones || []).length} />
            </div>
          </div>
        ))}
      </div>
    </PublicSection>
  );
}

function ImplementationContent({ release }: { release: any }) {
  const implementationContracts = (release.contracts || []).filter((contract: any) => contract.implementation);
  if (implementationContracts.length === 0) return null;

  return (
    <PublicSection title="Implementation" icon={<CheckCircle2 className="h-4 w-4" />}>
      <div className="space-y-2">
        {implementationContracts.map((contract: any, contractIndex: number) => {
          const implementation = contract.implementation || {};
          const transactions = implementation.transactions || [];
          const milestones = implementation.milestones || [];
          return (
            <div key={contract.id || contractIndex} className="rounded-md border bg-background p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono">{contract.id || `contract-${contractIndex + 1}`}</Badge>
                <Badge variant="secondary">implementation</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <Field label="Payments" value={transactions.length} />
                <Field label="Milestones" value={milestones.length} />
                <Field label="Documents" value={(implementation.documents || []).length} />
              </div>
            </div>
          );
        })}
      </div>
    </PublicSection>
  );
}

function PartiesContent({ release }: { release: any }) {
  const parties = release.parties || [];
  if (parties.length === 0) return null;

  return (
    <PublicSection title="Organizations" icon={<Users className="h-4 w-4" />}>
      <div className="grid gap-2 md:grid-cols-2">
        {parties.slice(0, 8).map((party: any, partyIndex: number) => (
          <div key={party.id || partyIndex} className="rounded-md border bg-background px-3 py-2">
            <div className="text-sm font-medium">{participantName(party)}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {(party.roles || []).length > 0 ? party.roles.join(', ') : 'Participant'}
            </div>
          </div>
        ))}
      </div>
      {parties.length > 8 ? (
        <p className="mt-2 text-xs text-muted-foreground">+{parties.length - 8} more organization{parties.length - 8 === 1 ? '' : 's'}</p>
      ) : null}
    </PublicSection>
  );
}

function PublicMessageBody({ release, releaseNumber }: { release: any; releaseNumber: number }) {
  const hash = txHash(release);
  const stage = stageFromRelease(release);

  return (
    <div className="mt-4 overflow-hidden rounded-md border bg-background">
      <div className="flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Code2 className="h-4 w-4" />
          Public Message Body
        </div>
        <span className="text-xs text-muted-foreground">release {releaseNumber}</span>
      </div>

      <div className="space-y-3 p-3">
        <PublicSection title="Chain Message" icon={<GitCommitHorizontal className="h-4 w-4" />}>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Message type" value="Submit procurement release" />
            <Field label="Lifecycle stage" value={stage} />
            <Field label="OCID" value={release.ocid} mono />
            <Field label="Release ID" value={release.id} mono />
            <Field label="Publisher" value={release.publisher_address} mono className="md:col-span-2" />
            <Field label="Block" value={blockHeight(release)} />
            <Field label="Transaction" value={hash ? shortHash(hash) : '—'} mono />
          </div>
        </PublicSection>

        <PublicSection title="Release Summary" icon={<Tag className="h-4 w-4" />}>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Public summary" value={releaseSummary(release)} className="md:col-span-2 xl:col-span-4" />
            <Field label="Buyer" value={release.buyer?.name || release.tender?.procuring_entity?.name} />
            <Field label="Source date" value={dateValue(release.date)} />
            <Field label="On-chain timestamp" value={dateValue(release.chain_timestamp)} />
            <Field label="Language" value={release.language || 'en'} />
          </div>
        </PublicSection>

        <TenderContent release={release} />
        <AwardsContent release={release} />
        <ContractsContent release={release} />
        <ImplementationContent release={release} />
        <PlanningContent release={release} />
        <PartiesContent release={release} />

        <PublicSection title="Quick Counts" icon={<Banknote className="h-4 w-4" />}>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Organizations" value={(release.parties || []).length} />
            <Field label="Awards" value={(release.awards || []).length} />
            <Field label="Contracts" value={(release.contracts || []).length} />
            <Field label="Related processes" value={(release.related_processes || []).length} />
          </div>
        </PublicSection>

        <details className="rounded-md border bg-muted/20">
          <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium">
            <Code2 className="h-4 w-4" />
            Raw JSON message body
          </summary>
          <pre className="max-h-[420px] overflow-auto border-t bg-background p-3 text-xs leading-5">
            <code>{formattedMessageBody(release)}</code>
          </pre>
        </details>
      </div>
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

        <div className="space-y-4">
          {orderedStages.map((stage) => {
            const stageReleases = grouped.get(stage) || [];
            const status = timelineStatus(stage, currentStage, stageReleases.length);
            return (
              <Card
                key={stage}
                className={cn(
                  'rounded-md',
                  status === 'complete' && 'border-l-4 border-l-emerald-500',
                  status === 'current' && 'border-l-4 border-l-blue-500',
                  status === 'pending' && 'border-l-4 border-l-muted'
                )}
              >
                <CardHeader className="gap-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base capitalize">
                        {stageIcon(stage)}
                        {stage}
                      </CardTitle>
                      <CardDescription>
                        {STAGE_COPY[stage] || 'Additional release stage'} · {stageReleases.length} release{stageReleases.length === 1 ? '' : 's'}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={status === 'pending' ? 'outline' : 'default'}
                      className="capitalize"
                    >
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stageReleases.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      No release recorded
                    </div>
                  ) : (
                    stageReleases.map((item, index) => {
                      const hash = txHash(item);
                      return (
                        <div key={item.id} className="rounded-md border bg-muted/20 p-4">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
