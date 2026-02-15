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
          href="/standards"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Standards
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
          <strong>
            Open Contracting for Infrastructure Data Standard (OC4IDS)
          </strong>{" "}
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
            <strong>
              Open Contracting for Infrastructure Data Standard (OC4IDS)
            </strong>{" "}
            builds on OCDS to provide a framework for disclosing data about
            infrastructure projects. Developed in partnership with the{" "}
            <strong>CoST – Infrastructure Transparency Initiative</strong>, it
            enables governments to publish structured data about projects,
            their associated procurement processes, and physical progress.
          </p>
          <p className="text-muted-foreground">
            OC4IDS bridges the gap between procurement data and project
            outcomes, making it possible to track whether infrastructure
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
          Every phase of an infrastructure project is recorded as immutable
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
                The core data structure. Each project captures everything from
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
                Rich geospatial data for each project, supporting addresses,
                gazetteer identifiers, and geometry coordinates for precise
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
                Measurable indicators that track physical and financial progress
                over time with structured observation data.
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
                Summarized procurement data linked from the OCDS procurement
                module, connecting contracts to the infrastructure project
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

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link href="/standards/ocds">
          <Button size="lg" className="gap-2">
            Explore OCDS Module
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/standards">
          <Button size="lg" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Standards Overview
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
