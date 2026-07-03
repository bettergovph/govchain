import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  Globe,
  Shield,
  ArrowRight,
  Blocks,
  Database,
  Landmark,
  MapPin,
  HardHat,
  Search,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Link2,
  Clock,
  FolderOpen,
  Ruler,
  ExternalLink,
  BookOpen,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title:
    "OC4IDS - Open Contracting for Infrastructure on Blockchain - OpenGovChain",
  description:
    "Blockchain-backed implementation of the Open Contracting for Infrastructure Data Standard (OC4IDS) for transparent, verifiable infrastructure project monitoring.",
};

export default function OC4IDSPage() {
  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Home
        </Link>
      </div>

      {/* Hero */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            OC4IDS 0.9
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Blocks className="h-3 w-3" />
            Infrastructure Module
          </Badge>
        </div>

        <h1 className="text-4xl font-bold text-foreground leading-tight">
          Open Contracting for Infrastructure Data Standard (OC4IDS) on
          Blockchain
        </h1>

        <p className="text-xl text-muted-foreground max-w-3xl">
          OpenGovChain&apos;s infrastructure module implements the{" "}
          <a href="https://standard.open-contracting.org/infrastructure/latest/en/" target="_blank" rel="noopener noreferrer" className="underline decoration-primary/40 hover:decoration-primary underline-offset-2"><strong>Open Contracting for Infrastructure Data Standard (OC4IDS)</strong></a>{" "}
          — bringing transparency to public infrastructure projects by linking
          project-level data with procurement processes on an immutable
          blockchain.
        </p>

        <p className="text-muted-foreground max-w-3xl">
          Infrastructure projects are among the largest public investments a
          government makes. OC4IDS on blockchain ensures that every project —
          from roads and bridges to schools and hospitals — has a verifiable,
          tamper-proof record from identification through completion.
        </p>
      </div>

      {/* What is OC4IDS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">What is OC4IDS?</CardTitle>
          <CardDescription>
            The data standard that connects infrastructure project data with
            procurement, maintained by the Open Contracting Partnership and
            CoST Infrastructure Transparency Initiative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The{" "}
            <a href="https://standard.open-contracting.org/infrastructure/latest/en/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2"><strong>Open Contracting for Infrastructure Data Standard (OC4IDS)</strong></a>{" "}
            builds on{" "}
            <a href="https://standard.open-contracting.org/latest/en/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">OCDS</a>{" "}
            to provide a{" "}
            <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">framework for disclosing data</a>{" "}
            about infrastructure projects. Developed in partnership with the{" "}
            <a href="https://infrastructuretransparency.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2"><strong>CoST – Infrastructure Transparency Initiative</strong></a>, it
            enables governments to publish structured data about projects,
            their associated procurement processes, and physical progress.
          </p>
          <p className="text-muted-foreground">
            OC4IDS bridges the gap between procurement data and{" "}
            <a href="https://standard.open-contracting.org/infrastructure/latest/en/cost/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">project outcomes</a>,
            making it possible to track whether infrastructure
            projects are delivered on time, on budget, and to specification —
            from the initial project identification through to completion.
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href="https://standard.open-contracting.org/infrastructure/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                OC4IDS Documentation
              </Button>
            </a>
            <a
              href="https://infrastructuretransparency.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                CoST Initiative
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Project Lifecycle */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Infrastructure Project Lifecycle On-Chain
        </h2>
        <p className="text-muted-foreground">
          Every phase of an{" "}
          <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/codelists/#projectstatus" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">infrastructure project lifecycle</a>{" "}
          is recorded as immutable
          blockchain transactions, creating a permanent and verifiable record.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              phase: "Project Identification",
              icon: FolderOpen,
              description:
                "A new infrastructure project is registered on-chain with its title, purpose, sector, type, locations, and public authority.",
              txName: "CreateProject",
            },
            {
              phase: "Budget & Planning",
              icon: BarChart3,
              description:
                "Budget allocations, timelines, and project classification data are committed to the ledger for public visibility.",
              txName: "CreateProject",
            },
            {
              phase: "Procurement Linkage",
              icon: Link2,
              description:
                "Contracting processes (OCDS) are linked to the infrastructure project, connecting procurement data to physical outcomes.",
              txName: "LinkContractingProcess",
            },
            {
              phase: "Document Attachment",
              icon: FileText,
              description:
                "Environmental assessments, permits, designs, and other documents are attached with IPFS storage and on-chain hash verification.",
              txName: "AttachDocument",
            },
            {
              phase: "Progress Monitoring",
              icon: TrendingUp,
              description:
                "Physical and financial progress is tracked with measurable observations, KPIs, and milestone updates.",
              txName: "UpdateProgress",
            },
            {
              phase: "Completion & Evaluation",
              icon: CheckCircle2,
              description:
                "Final project status, completion dates, actual costs vs. budget, and evaluation metrics are recorded permanently.",
              txName: "UpdateProject",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={item.phase}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{item.phase}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Msg/{item.txName}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lifecycle Flow Diagram */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Infrastructure Project Flow
          </CardTitle>
          <CardDescription>
            How an infrastructure project progresses through{" "}
            <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/codelists/#projectstatus" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">OC4IDS project statuses</a>,
            with linked procurement processes and continuous monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project status flow */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Project Status Progression</p>
            <div className="flex flex-col md:flex-row items-stretch gap-0">
              {[
                {
                  name: "Identification",
                  color: "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50",
                  iconColor: "text-sky-600 dark:text-sky-400",
                  dotColor: "bg-sky-500",
                  data: ["Project title & purpose", "Sector classification", "Geographic locations", "Public authority"],
                },
                {
                  name: "Preparation",
                  color: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
                  iconColor: "text-amber-600 dark:text-amber-400",
                  dotColor: "bg-amber-500",
                  data: ["Budget allocation", "Project timeline", "Environmental assessment", "Design & feasibility"],
                },
                {
                  name: "Implementation",
                  color: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50",
                  iconColor: "text-emerald-600 dark:text-emerald-400",
                  dotColor: "bg-emerald-500",
                  data: ["Physical progress %", "Financial disbursements", "Contractor performance", "Milestone tracking"],
                },
                {
                  name: "Completion",
                  color: "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/50",
                  iconColor: "text-violet-600 dark:text-violet-400",
                  dotColor: "bg-violet-500",
                  data: ["Final project status", "Actual vs. planned cost", "Completion date", "Evaluation & handover"],
                },
              ].map((phase, i, arr) => (
                <div key={phase.name} className="contents">
                  <div className="flex-1 min-w-0">
                    <div className={`border-2 rounded-xl p-4 h-full ${phase.color}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${phase.dotColor}`}>
                          {i + 1}
                        </div>
                        <h4 className={`font-semibold text-sm ${phase.iconColor}`}>{phase.name}</h4>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {phase.data.map((d) => (
                          <li key={d} className="flex items-start gap-1.5">
                            <CheckCircle2 className={`h-3 w-3 mt-0.5 flex-shrink-0 ${phase.iconColor} opacity-60`} />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex items-center justify-center py-2 md:py-0 md:px-1">
                      <ArrowRight className="h-5 w-5 text-muted-foreground/40 hidden md:block" />
                      <ArrowDown className="h-5 w-5 text-muted-foreground/40 md:hidden" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Continuous activity tracks */}
          <div className="border-t pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Continuous Activities Throughout Lifecycle</p>
            <div className="grid gap-3 md:grid-cols-3">
              {/* Procurement Linkage */}
              <div className="p-4 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-300">Procurement Linkage</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  OCDS contracting processes are linked to the project via{" "}
                  <span className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/50 px-1 rounded">Msg/LinkContractingProcess</span>,
                  connecting procurement data to physical outcomes.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] font-mono gap-1">
                    <ArrowRight className="h-2.5 w-2.5" />
                    OCDS Module
                  </Badge>
                </div>
              </div>

              {/* Document Management */}
              <div className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300">Document Attachment</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Environmental assessments, permits, designs, and reports are attached with IPFS storage and on-chain hash verification via{" "}
                  <span className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900/50 px-1 rounded">Msg/AttachDocument</span>.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] font-mono gap-1">
                    <Shield className="h-2.5 w-2.5" />
                    IPFS + On-Chain Hash
                  </Badge>
                </div>
              </div>

              {/* Progress Monitoring */}
              <div className="p-4 border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">Progress Monitoring</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Physical and financial progress is tracked with measurable{" "}
                  <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#metric" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">metrics</a>{" "}
                  and{" "}
                  <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#observation" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">observations</a>{" "}
                  via <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/50 px-1 rounded">Msg/UpdateProgress</span>.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] font-mono gap-1">
                    <TrendingUp className="h-2.5 w-2.5" />
                    KPIs & Observations
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg text-xs text-muted-foreground">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Every project update is recorded as an immutable blockchain transaction.
              The{" "}
              <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#project-schema" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">OC4IDS project schema</a>{" "}
              ensures that budget, timeline, location, procurement, and progress data are captured in a structured,
              internationally comparable format that can never be altered or deleted.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* On-Chain Data Model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">On-Chain Data Model</CardTitle>
          <CardDescription>
            Key data structures for infrastructure project transparency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <HardHat className="h-5 w-5 text-primary" />
                Infrastructure Project
              </h3>
              <p className="text-sm text-muted-foreground">
                The core data structure, based on the{" "}
                <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#project-schema" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">OC4IDS project schema</a>.
                Each project captures everything from
                identification through completion, including linked
                procurement processes.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">id:</span>{" "}
                  project_id
                </div>
                <div>
                  <span className="text-muted-foreground">title:</span> string
                </div>
                <div>
                  <span className="text-muted-foreground">status:</span>{" "}
                  identification | preparation | implementation | completion
                </div>
                <div>
                  <span className="text-muted-foreground">sector:</span>{" "}
                  string[]
                </div>
                <div>
                  <span className="text-muted-foreground">type:</span>{" "}
                  construction | rehabilitation | replacement | expansion
                </div>
                <div>
                  <span className="text-muted-foreground">budget:</span> Budget
                </div>
                <div>
                  <span className="text-muted-foreground">locations:</span>{" "}
                  Location[]
                </div>
                <div>
                  <span className="text-muted-foreground">
                    contracting_processes:
                  </span>{" "}
                  ContractingProcessSummary[]
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location Data
              </h3>
              <p className="text-sm text-muted-foreground">
                Rich{" "}
                <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#location" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">geospatial data</a>{" "}
                for each project, supporting addresses,{" "}
                <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/codelists/#geometrytype" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">gazetteer identifiers, and geometry</a>{" "}
                coordinates for precise
                location tracking.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">id:</span> string
                </div>
                <div>
                  <span className="text-muted-foreground">description:</span>{" "}
                  string
                </div>
                <div>
                  <span className="text-muted-foreground">region:</span> string
                </div>
                <div>
                  <span className="text-muted-foreground">address:</span>{" "}
                  street, locality, region, country
                </div>
                <div>
                  <span className="text-muted-foreground">geometry:</span> type,
                  coordinates
                </div>
                <div>
                  <span className="text-muted-foreground">gazetteer:</span>{" "}
                  scheme, identifiers
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                Metrics &amp; Observations
              </h3>
              <p className="text-sm text-muted-foreground">
                Measurable{" "}
                <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#metric" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">indicators</a>{" "}
                that track physical and financial progress
                over time with structured{" "}
                <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#observation" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">observation data</a>.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">metric.id:</span>{" "}
                  string
                </div>
                <div>
                  <span className="text-muted-foreground">metric.title:</span>{" "}
                  e.g. &quot;Physical progress&quot;
                </div>
                <div>
                  <span className="text-muted-foreground">
                    observation.measure:
                  </span>{" "}
                  numeric value
                </div>
                <div>
                  <span className="text-muted-foreground">
                    observation.unit:
                  </span>{" "}
                  %, currency, etc.
                </div>
                <div>
                  <span className="text-muted-foreground">
                    observation.period:
                  </span>{" "}
                  start_date, end_date
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Contracting Process Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                Summarized procurement data linked from the{" "}
                <a href="https://standard.open-contracting.org/latest/en/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">OCDS</a>{" "}
                procurement module, following the{" "}
                <a href="https://standard.open-contracting.org/infrastructure/latest/en/reference/#contractingprocesssummary" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">contracting process summary</a>{" "}
                schema to connect contracts to the infrastructure project
                they serve.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">id:</span> string
                </div>
                <div>
                  <span className="text-muted-foreground">ocid:</span>{" "}
                  linked OCDS process
                </div>
                <div>
                  <span className="text-muted-foreground">status:</span> string
                </div>
                <div>
                  <span className="text-muted-foreground">tender:</span>{" "}
                  TenderSummary
                </div>
                <div>
                  <span className="text-muted-foreground">contracts:</span>{" "}
                  ContractSummary[]
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Bridge Between OCDS and OC4IDS */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            Bridging Procurement and Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            One of the most powerful features of OpenGovChain is the on-chain
            link between OCDS procurement processes and OC4IDS infrastructure
            projects. This enables:
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-background rounded-lg border space-y-2">
              <h3 className="font-semibold text-sm">End-to-End Tracking</h3>
              <p className="text-xs text-muted-foreground">
                Follow a road project from its budget allocation, through the
                bidding process, contract signing, to physical completion —
                all on one chain.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border space-y-2">
              <h3 className="font-semibold text-sm">Cost Verification</h3>
              <p className="text-xs text-muted-foreground">
                Compare contract values from OCDS procurement data with
                actual spending tracked in the infrastructure module to
                identify cost overruns.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border space-y-2">
              <h3 className="font-semibold text-sm">Multi-Contract Projects</h3>
              <p className="text-xs text-muted-foreground">
                Large projects often involve multiple procurement processes.
                OC4IDS links them all under one project, giving a unified
                view of the entire investment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Query Endpoints
          </CardTitle>
          <CardDescription>
            Public REST API endpoints for querying infrastructure project data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                method: "GET",
                path: "/govchain/infrastructure/v1/project",
                description: "List all infrastructure projects",
              },
              {
                method: "GET",
                path: "/govchain/infrastructure/v1/project/{project_id}",
                description:
                  "Get a specific infrastructure project by ID",
              },
              {
                method: "GET",
                path: "/govchain/infrastructure/v1/projects_by_sector/{sector}",
                description:
                  "Query projects by sector (e.g., transport, health, education)",
              },
              {
                method: "GET",
                path: "/govchain/infrastructure/v1/projects_by_region/{region}",
                description:
                  "Query projects by geographic region",
              },
              {
                method: "GET",
                path: "/govchain/infrastructure/v1/projects_by_status/{status}",
                description:
                  "Query projects by their current status",
              },
            ].map((endpoint) => (
              <div
                key={endpoint.path}
                className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg"
              >
                <Badge
                  variant="secondary"
                  className="flex-shrink-0 font-mono text-xs mt-0.5"
                >
                  {endpoint.method}
                </Badge>
                <div>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                  <p className="text-xs text-muted-foreground mt-1">
                    {endpoint.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Blocks className="h-6 w-6 text-primary" />
            Blockchain Transactions
          </CardTitle>
          <CardDescription>
            On-chain message types for the infrastructure module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                tx: "CreateProject",
                description:
                  "Register a new infrastructure project with title, sector, locations, budget, parties, and public authority information.",
              },
              {
                tx: "UpdateProject",
                description:
                  "Update project details including status, budget, timeline, locations, and completion data as the project progresses.",
              },
              {
                tx: "LinkContractingProcess",
                description:
                  "Link an OCDS contracting process to this infrastructure project, connecting procurement to physical outcomes.",
              },
              {
                tx: "AttachDocument",
                description:
                  "Attach project documents (designs, permits, assessments) with IPFS storage and on-chain content hash verification.",
              },
              {
                tx: "UpdateProgress",
                description:
                  "Record measurable progress observations with metrics, KPIs, and quantifiable data points for monitoring.",
              },
            ].map((item) => (
              <div key={item.tx} className="p-4 border rounded-lg space-y-2">
                <Badge className="font-mono text-xs">Msg/{item.tx}</Badge>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Real-World Use Cases</CardTitle>
          <CardDescription>
            How OC4IDS on blockchain can transform infrastructure transparency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Public Roads &amp; Bridges
              </h3>
              <p className="text-sm text-muted-foreground">
                Track road construction from budget approval through
                procurement, construction progress, and final delivery.
                Citizens can verify if the road was completed on time and
                within budget, with photos and progress reports permanently
                on-chain.
              </p>
            </div>
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <HardHat className="h-5 w-5 text-primary" />
                School &amp; Hospital Construction
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitor social infrastructure projects with location data,
                budget tracking, and contractor performance metrics.
                Communities can see exactly what&apos;s being built in their
                area and who is building it.
              </p>
            </div>
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Disaster Recovery Projects
              </h3>
              <p className="text-sm text-muted-foreground">
                Track emergency infrastructure rehabilitation with full
                accountability for rapid procurement and reconstruction
                efforts, ensuring donor funds are used effectively.
              </p>
            </div>
            <div className="space-y-3 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Anti-Corruption Monitoring
              </h3>
              <p className="text-sm text-muted-foreground">
                Compare budgeted vs. actual costs, detect unusual patterns in
                contractor selection, and identify projects with unexplained
                delays — all with immutable data that cannot be tampered
                with.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            References &amp; Standard Sources
          </CardTitle>
          <CardDescription>
            Official documentation and resources for the Open Contracting for Infrastructure Data Standard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                title: "OC4IDS Schema Reference",
                url: "https://standard.open-contracting.org/infrastructure/latest/en/reference/",
                description: "Complete schema reference for the infrastructure data standard, including all object definitions and field descriptions.",
              },
              {
                title: "OC4IDS Project Schema",
                url: "https://standard.open-contracting.org/infrastructure/latest/en/reference/#project-schema",
                description: "The project schema — the primary data structure describing an infrastructure project from identification to completion.",
              },
              {
                title: "OC4IDS Codelists",
                url: "https://standard.open-contracting.org/infrastructure/latest/en/reference/codelists/",
                description: "Standardized code values for project status, sector classifications, project types, and geometry types.",
              },
              {
                title: "CoST Infrastructure Data Standard",
                url: "https://standard.open-contracting.org/infrastructure/latest/en/cost/",
                description: "How OC4IDS maps to the CoST IDS (Infrastructure Data Standard) for proactive and reactive disclosure.",
              },
              {
                title: "OC4IDS Getting Started",
                url: "https://standard.open-contracting.org/infrastructure/latest/en/guidance/",
                description: "Implementation guidance for publishers, including how to identify and structure infrastructure project data.",
              },
              {
                title: "OCDS for Infrastructure",
                url: "https://standard.open-contracting.org/infrastructure/latest/en/projects/",
                description: "How OC4IDS connects project-level data with OCDS contracting processes for end-to-end transparency.",
              },
              {
                title: "CoST Initiative",
                url: "https://infrastructuretransparency.org/",
                description: "The Infrastructure Transparency Initiative (CoST) — the global program promoting infrastructure transparency.",
              },
              {
                title: "Open Contracting Partnership",
                url: "https://www.open-contracting.org/",
                description: "The global organization that stewards both OCDS and OC4IDS and supports open contracting reforms worldwide.",
              },
            ].map((ref) => (
              <a
                key={ref.url}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {ref.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ref.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link href="/procurement">
          <Button size="lg" className="gap-2">
            Explore OCDS Module
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <a
          href="https://github.com/bettergovph/govchain"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" variant="outline">
            Contribute on GitHub
          </Button>
        </a>
      </div>
    </div>
  );
}
