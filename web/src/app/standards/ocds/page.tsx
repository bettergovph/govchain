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
  Building2,
  Globe,
  Shield,
  ArrowRight,
  Blocks,
  Database,
  Landmark,
  Users,
  Gavel,
  FileSignature,
  ClipboardList,
  Search,
  ArrowLeft,
  Workflow,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "OCDS - Open Contracting Data Standard on Blockchain - OpenGovChain",
  description:
    "Blockchain-backed implementation of the Open Contracting Data Standard (OCDS) for transparent, immutable, and verifiable public procurement data.",
};

export default function OCDSPage() {
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
            OCDS 1.1
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Blocks className="h-3 w-3" />
            Procurement Module
          </Badge>
        </div>

        <h1 className="text-4xl font-bold text-foreground leading-tight">
          Open Contracting Data Standard (OCDS) on Blockchain
        </h1>

        <p className="text-xl text-muted-foreground max-w-3xl">
          OpenGovChain&apos;s procurement module implements the{" "}
          <a href="https://standard.open-contracting.org/latest/en/" target="_blank" rel="noopener noreferrer" className="underline decoration-primary/40 hover:decoration-primary underline-offset-2"><strong>Open Contracting Data Standard</strong></a> — the global
          benchmark for publishing structured, comparable procurement data —
          directly on an immutable blockchain ledger.
        </p>

        <p className="text-muted-foreground max-w-3xl">
          Every stage of the contracting process, from planning through
          implementation, is captured as on-chain transactions that anyone can
          query and verify. No data can be retroactively altered, ensuring the
          highest level of accountability for public spending.
        </p>
      </div>

      {/* What is OCDS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">What is OCDS?</CardTitle>
          <CardDescription>
            The international standard for open contracting data, maintained by
            the Open Contracting Partnership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The{" "}
            <a href="https://standard.open-contracting.org/latest/en/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2"><strong>Open Contracting Data Standard (OCDS)</strong></a>{" "}
            provides a{" "}
            <a href="https://standard.open-contracting.org/latest/en/schema/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">structured schema</a>{" "}
            for publishing data about every stage of the
            public contracting process. Developed by the{" "}
            <a href="https://www.open-contracting.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2"><strong>Open Contracting Partnership</strong></a>, it is used by
            governments and organizations in over 30 countries to make
            procurement data accessible, comparable, and actionable.
          </p>
          <p className="text-muted-foreground">
            OCDS defines a{" "}
            <a href="https://standard.open-contracting.org/latest/en/schema/codelists/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">common vocabulary</a>{" "}
            for procurement data — including{" "}
            <a href="https://standard.open-contracting.org/latest/en/getting_started/contracting_process/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">planning, tender, award, contract, and implementation stages</a>{" "}
            — enabling cross-border analysis, anti-corruption monitoring, and
            better value for money in public spending.
          </p>
          <div className="flex gap-2 flex-wrap">
            <a
              href="https://standard.open-contracting.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                OCDS Official Documentation
              </Button>
            </a>
            <a
              href="https://www.open-contracting.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                Open Contracting Partnership
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Contracting Lifecycle */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          The Full Contracting Lifecycle On-Chain
        </h2>
        <p className="text-muted-foreground">
          Each stage of the{" "}
          <a href="https://standard.open-contracting.org/latest/en/getting_started/contracting_process/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">contracting process</a>{" "}
          is captured as a blockchain
          transaction, creating an immutable record from start to finish.
        </p>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            {
              stage: "Planning",
              icon: ClipboardList,
              description:
                "Budget allocation, rationale, and procurement planning documents are published on-chain.",
              txName: "CreateProcess",
            },
            {
              stage: "Tender",
              icon: FileText,
              description:
                "Tender details including items, submission deadlines, and eligibility criteria are recorded.",
              txName: "PublishTender",
            },
            {
              stage: "Award",
              icon: Gavel,
              description:
                "Award decisions with supplier details, evaluation results, and contract values.",
              txName: "SubmitAward",
            },
            {
              stage: "Contract",
              icon: FileSignature,
              description:
                "Signed contract details, terms, milestones, and delivery schedules committed to the chain.",
              txName: "SignContract",
            },
            {
              stage: "Implementation",
              icon: Workflow,
              description:
                "Milestones, transactions, and delivery updates tracked through to completion.",
              txName: "UpdateImplementation",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={item.stage} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-base">{item.stage}</CardTitle>
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
            Key data structures stored on the OpenGovChain blockchain for
            procurement transparency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Contracting Process
              </h3>
              <p className="text-sm text-muted-foreground">
                The core unit of OCDS data. Each process is identified by a
                unique{" "}
                <a href="https://standard.open-contracting.org/latest/en/schema/identifiers/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2"><strong>OCID</strong> (Open Contracting Identifier)</a>{" "}
                and contains the{" "}
                <a href="https://standard.open-contracting.org/latest/en/schema/record_package/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">compiled release</a>{" "}
                that aggregates all stages.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">ocid:</span> string
                </div>
                <div>
                  <span className="text-muted-foreground">owner:</span> address
                </div>
                <div>
                  <span className="text-muted-foreground">current_stage:</span>{" "}
                  planning | tender | award | contract | implementation
                </div>
                <div>
                  <span className="text-muted-foreground">
                    compiled_release:
                  </span>{" "}
                  Release
                </div>
                <div>
                  <span className="text-muted-foreground">release_ids:</span>{" "}
                  string[]
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Release
              </h3>
              <p className="text-sm text-muted-foreground">
                An individual update to a contracting process. Each{" "}
                <a href="https://standard.open-contracting.org/latest/en/schema/release/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">release</a>{" "}
                captures one or more changes (planning, tender, award,
                contract, implementation) and is{" "}
                <a href="https://standard.open-contracting.org/latest/en/schema/codelists/#release-tag" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">tagged</a>{" "}
                accordingly.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">ocid:</span> string
                </div>
                <div>
                  <span className="text-muted-foreground">id:</span>{" "}
                  release_id
                </div>
                <div>
                  <span className="text-muted-foreground">tag:</span> string[]
                </div>
                <div>
                  <span className="text-muted-foreground">
                    planning / tender / awards / contracts:
                  </span>{" "}
                  structured data
                </div>
                <div>
                  <span className="text-muted-foreground">parties:</span>{" "}
                  Organization[]
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Entity Registry
              </h3>
              <p className="text-sm text-muted-foreground">
                <a href="https://standard.open-contracting.org/latest/en/schema/reference/#organization" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">Organizations</a>{" "}
                participating in procurement can be registered
                on-chain with verified{" "}
                <a href="https://org-id.guide/" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">identifiers</a>.
                This creates a reusable
                registry of procuring entities and suppliers.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">entity_id:</span>{" "}
                  string
                </div>
                <div>
                  <span className="text-muted-foreground">organization:</span>{" "}
                  name, identifier, address, roles
                </div>
                <div>
                  <span className="text-muted-foreground">registrar:</span>{" "}
                  address
                </div>
                <div>
                  <span className="text-muted-foreground">active:</span> boolean
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Document Verification
              </h3>
              <p className="text-sm text-muted-foreground">
                Procurement{" "}
                <a href="https://standard.open-contracting.org/latest/en/schema/reference/#document" target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/40 hover:decoration-primary underline-offset-2">documents</a>{" "}
                (bid notices, evaluation reports,
                contracts) are stored on IPFS with content hashes recorded
                on-chain for tamper-proof verification.
              </p>
              <div className="bg-accent/50 rounded-lg p-3 space-y-1 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">ipfs_cid:</span>{" "}
                  content identifier
                </div>
                <div>
                  <span className="text-muted-foreground">content_hash:</span>{" "}
                  SHA-256
                </div>
                <div>
                  <span className="text-muted-foreground">document_type:</span>{" "}
                  string
                </div>
                <div>
                  <span className="text-muted-foreground">
                    date_published:
                  </span>{" "}
                  timestamp
                </div>
              </div>
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
            Public REST API endpoints for querying procurement data on-chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                method: "GET",
                path: "/govchain/procurement/v1/process",
                description: "List all contracting processes",
              },
              {
                method: "GET",
                path: "/govchain/procurement/v1/process/{ocid}",
                description:
                  "Get a specific contracting process by its OCID",
              },
              {
                method: "GET",
                path: "/govchain/procurement/v1/releases/{ocid}",
                description: "Get all releases for a contracting process",
              },
              {
                method: "GET",
                path: "/govchain/procurement/v1/ocds/records/{ocid}",
                description:
                  "Get OCDS-compliant record package for a process",
              },
              {
                method: "GET",
                path: "/govchain/procurement/v1/ocds/releases/{ocid}",
                description:
                  "Get OCDS-compliant release package for a process",
              },
              {
                method: "GET",
                path: "/govchain/procurement/v1/tenders",
                description: "List all published tenders",
              },
              {
                method: "GET",
                path: "/govchain/procurement/v1/entity",
                description: "List all registered entities",
              },
              {
                method: "GET",
                path: "/govchain/procurement/v1/entity/{entity_id}",
                description: "Get a specific registered entity",
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
            On-chain message types for the procurement module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                tx: "CreateProcess",
                description:
                  "Initiate a new contracting process with planning data, buyer information, and a unique OCID.",
              },
              {
                tx: "PublishTender",
                description:
                  "Publish tender details including items, submission method, value, and procurement method.",
              },
              {
                tx: "SubmitAward",
                description:
                  "Record an award decision with selected suppliers, evaluation details, and award value.",
              },
              {
                tx: "SignContract",
                description:
                  "Commit a signed contract with terms, milestones, value, and delivery schedule.",
              },
              {
                tx: "UpdateImplementation",
                description:
                  "Update contract implementation with milestones, transactions, and delivery documents.",
              },
              {
                tx: "SubmitRelease",
                description:
                  "Submit a full OCDS release for any stage, enabling maximum flexibility.",
              },
              {
                tx: "RegisterEntity",
                description:
                  "Register a new organization (buyer, supplier, etc.) on the on-chain entity registry.",
              },
              {
                tx: "UpdateEntity",
                description:
                  "Update an existing registered entity's organization details.",
              },
            ].map((item) => (
              <div key={item.tx} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="font-mono text-xs">
                    Msg/{item.tx}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Governance Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Module Parameters</CardTitle>
          <CardDescription>
            Configurable governance parameters for the procurement module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                param: "allowed_ocid_prefixes",
                description:
                  "Approved OCID prefixes (e.g., ocds-abc123) that can be used for contracting processes. See OCDS identifier guidance.",
                href: "https://standard.open-contracting.org/latest/en/schema/identifiers/",
              },
              {
                param: "default_currency",
                description:
                  "Default currency code (e.g., PHP) used for monetary values when not specified.",
              },
              {
                param: "public_bidding_threshold",
                description:
                  "Minimum value requiring public competitive bidding procedures.",
              },
              {
                param: "alternative_method_threshold",
                description:
                  "Maximum value allowed for alternative procurement methods.",
              },
              {
                param: "min_tenderers_open",
                description:
                  "Minimum number of tenderers required for open procurement methods.",
              },
              {
                param: "require_entity_verification",
                description:
                  "Whether entities must be verified before they can participate in processes.",
              },
            ].map((item) => (
              <div key={item.param} className="p-3 bg-accent/30 rounded-lg space-y-1">
                <code className="text-sm font-mono font-semibold">
                  {item.param}
                </code>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
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
            Official documentation and resources for the Open Contracting Data Standard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                title: "OCDS Schema Reference",
                url: "https://standard.open-contracting.org/latest/en/schema/",
                description: "Complete schema documentation including release, record, and all component schemas.",
              },
              {
                title: "OCDS Release Schema",
                url: "https://standard.open-contracting.org/latest/en/schema/release/",
                description: "The release schema — the primary unit of OCDS data describing one update to a contracting process.",
              },
              {
                title: "OCDS Codelists",
                url: "https://standard.open-contracting.org/latest/en/schema/codelists/",
                description: "Standardized code values for procurement methods, tender statuses, award criteria, and more.",
              },
              {
                title: "OCDS Identifiers",
                url: "https://standard.open-contracting.org/latest/en/schema/identifiers/",
                description: "Guidance on OCIDs (Open Contracting Identifiers) and organization identifier schemes.",
              },
              {
                title: "Contracting Process Overview",
                url: "https://standard.open-contracting.org/latest/en/getting_started/contracting_process/",
                description: "How OCDS maps to the five stages of the contracting process: planning through implementation.",
              },
              {
                title: "OCDS Guidance & Best Practices",
                url: "https://standard.open-contracting.org/latest/en/guidance/",
                description: "Implementation guidance, mapping templates, and best practices for publishers.",
              },
              {
                title: "Open Contracting Partnership",
                url: "https://www.open-contracting.org/",
                description: "The global organization that stewards OCDS and supports open contracting reforms worldwide.",
              },
              {
                title: "Organization Identifier Guide",
                url: "https://org-id.guide/",
                description: "The reference list of organization identifier schemes used in OCDS for buyer and supplier IDs.",
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
        <Link href="/standards/oc4ids">
          <Button size="lg" className="gap-2">
            Explore OC4IDS Module
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
