"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Globe,
  Shield,
  Eye,
  Scale,
  Blocks,
  Database,
  FileText,
  HardHat,
  Landmark,
  Users,
  CheckCircle2,
  ChevronsDown
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SectionHeading({
  n,
  children,
  id,
}: {
  n: number;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold mt-16 mb-4 scroll-mt-24 flex items-baseline gap-3"
    >
      <span className="text-primary font-mono text-lg">{n}.</span>
      {children}
    </h2>
  );
}

function Sub({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3
      id={id}
      className="text-lg font-semibold mt-8 mb-3 scroll-mt-24"
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
  );
}

function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap my-4 text-xs font-mono">
      {steps.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          <Badge variant="outline" className="whitespace-nowrap">
            {s}
          </Badge>
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table of Contents
// ---------------------------------------------------------------------------

const TOC = [
  { id: "abstract", label: "Executive Summary" },
  { id: "problem", label: "The Transparency Gap" },
  { id: "vision", label: "Vision" },
  { id: "principles", label: "Design Principles" },
  { id: "architecture", label: "Architecture" },
  { id: "procurement", label: "Module I: Procurement" },
  { id: "infrastructure", label: "Module II: Infrastructure" },
  { id: "budget", label: "Module III: National Budget" },
  { id: "traceability", label: "End-to-End Traceability" },
  { id: "governance", label: "Governance" },
  { id: "roadmap", label: "Roadmap" },
  { id: "participate", label: "Get Involved" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WhitepaperPage() {
  return (
    <article className="max-w-3xl mx-auto py-8 space-y-0">
      {/* ---------------------------------------------------------------- */}
      {/* Title Block */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Blocks className="h-3 w-3" />
            Whitepaper
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            Open Standards
          </Badge>
        </div>
        <h1 className="text-4xl font-bold leading-tight">
          OpenGovChain: An Open National Blockchain for Fiscal Transparency
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          A tokenless, open-source blockchain infrastructure for tracking public
          money from appropriation to disbursement &mdash; built on OCDS, OC4IDS,
          and a proposed National Budget Module for the Philippine budget cycle.
        </p>
        <p className="text-xs text-muted-foreground">
          DRAFT &mdash; Version 0.1 &middot; Last updated 2026-02-15 &middot; BetterGov.PH
        </p>

        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-300/50 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/30">
          <Shield className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Draft Document
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5">
              This whitepaper is a living document in draft state. Objectives,
              module designs, and technical details are subject to change as the
              project evolves. Feedback and contributions are welcome.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Table of Contents */}
      {/* ---------------------------------------------------------------- */}
      <Card className="mb-12">
        <CardContent className="pt-6 pb-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Contents
          </div>
          <nav className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
            {TOC.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-mono text-xs text-primary w-5">
                  {i + 1}.
                </span>
                {item.label}
              </a>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* 1. EXECUTIVE SUMMARY */}
      {/* ================================================================ */}
      <SectionHeading n={1} id="abstract">
        Executive Summary
      </SectionHeading>

      <P>
        OpenGovChain is a free, open-source, tokenless blockchain designed to
        make government fiscal data a permanent public good. Built on the Cosmos
        SDK with CometBFT consensus, the network is operated by volunteer
        validators and requires no tokens to participate.
      </P>
      <P>
        The platform implements three complementary modules that, together,
        provide end-to-end traceability of public money:
      </P>

      <div className="grid sm:grid-cols-3 gap-3 my-6">
        {[
          {
            icon: FileText,
            title: "Procurement",
            standard: "OCDS",
            desc: "Full procurement lifecycle from planning to implementation, on-chain.",
          },
          {
            icon: HardHat,
            title: "Infrastructure",
            standard: "OC4IDS",
            desc: "Infrastructure project tracking with progress metrics and geo-location.",
          },
          {
            icon: Landmark,
            title: "National Budget",
            standard: "Proposed",
            desc: "Track the peso from NEP to GAA to SARO to disbursement.",
          },
        ].map((m) => (
          <Card key={m.title}>
            <CardContent className="pt-5 pb-4">
              <m.icon className="h-5 w-5 text-primary mb-2" />
              <div className="font-semibold text-sm">
                {m.title}{" "}
                <Badge variant="secondary" className="text-[10px] ml-1">
                  {m.standard}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {m.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <P>
        By anchoring fiscal data to an immutable, decentralized ledger, OpenGovChain
        eliminates the possibility of retroactive alteration, provides cryptographic
        proof of publication, and makes government spending verifiable by any
        citizen with an internet connection.
      </P>

      {/* ================================================================ */}
      {/* 2. THE PROBLEM */}
      {/* ================================================================ */}
      <SectionHeading n={2} id="problem">
        The Transparency Gap
      </SectionHeading>

      <P>
        The Philippines ranks 15th globally and 1st in Asia on the Open Budget
        Index (OBI score: 75/100, 2023). The foundations for transparency
        exist &mdash; the Transparency Seal, PhilGEPS, Open Data Philippines, and
        the Unified Account Code Structure (UACS) are all operational. Yet
        significant gaps remain:
      </P>

      <ul className="list-disc list-outside pl-5 text-muted-foreground space-y-2 mb-4 text-sm">
        <li>
          <strong>Fragmented systems.</strong> Budget preparation (eBudget),
          treasury operations (eMDS), accounting (eNGAS), and procurement
          (PhilGEPS) run as isolated silos. Tracing a single peso from
          appropriation through procurement to physical delivery requires
          manually cross-referencing multiple databases.
        </li>
        <li>
          <strong>Mutable records.</strong> Government portals are controlled by
          the agencies they report on. Data can be updated, unpublished, or
          quietly corrected without a public audit trail.
        </li>
        <li>
          <strong>Delayed accountability.</strong> COA Annual Audit Reports are
          typically published 12&ndash;18 months after the fiscal year closes,
          limiting the ability of citizens and oversight bodies to intervene in
          real time.
        </li>
        <li>
          <strong>No machine-readable lifecycle.</strong> While individual budget
          documents (NEP, GAA) are published as PDFs and spreadsheets, there is
          no structured, machine-readable data format that tracks a budget line
          from proposal through legislation, allotment, obligation, and
          disbursement.
        </li>
        <li>
          <strong>Opacity in the bicameral process.</strong> The Bicameral
          Conference Committee stage of budget legislation &mdash; where the House and
          Senate versions of the General Appropriations Bill are reconciled &mdash; has
          historically operated with limited public visibility.
        </li>
      </ul>

      <P>
        OpenGovChain addresses these gaps not by replacing existing government
        systems, but by providing an independent, immutable layer that anchors
        their outputs. Agencies continue to use their existing tools; the
        blockchain serves as a permanent public record of what was published,
        when, and by whom.
      </P>

      {/* ================================================================ */}
      {/* 3. VISION */}
      {/* ================================================================ */}
      <SectionHeading n={3} id="vision">
        Vision: A True National Blockchain Infrastructure
      </SectionHeading>

      <P>
        OpenGovChain is not a portal, a dashboard, or a reporting tool. It is
        infrastructure &mdash; a shared, neutral, append-only ledger that any
        government agency, civil society organization, media outlet, or citizen
        can read from and, with proper authorization, write to.
      </P>

      <P>
        The end-state is a system where:
      </P>

      <div className="space-y-3 my-6">
        {[
          {
            icon: Eye,
            title: "Every peso is traceable",
            desc: "From the moment an agency proposes a budget line in the NEP, through legislative deliberation in the GAA, allotment via SARO, cash release via NCA, procurement under OCDS, and physical delivery of an infrastructure project under OC4IDS — every transition is recorded on-chain.",
          },
          {
            icon: Shield,
            title: "Every record is permanent",
            desc: "No single entity — not the publishing agency, not the platform operator, not the government — can alter or delete a record once published. The network's consensus mechanism (CometBFT with 2/3+ validator agreement) ensures finality.",
          },
          {
            icon: Scale,
            title: "Every citizen can verify",
            desc: "All on-chain data is publicly queryable via REST, RPC, and gRPC. No accounts, tokens, or permissions are required to read. Third-party tools, researchers, and media can independently verify any claim.",
          },
          {
            icon: Globe,
            title: "Every standard is open",
            desc: "The platform builds on internationally recognized standards (OCDS, OC4IDS, UACS, GIFT fiscal data principles) rather than inventing proprietary formats. Data published on OpenGovChain is interoperable with global open contracting tools.",
          },
        ].map((item) => (
          <div key={item.title} className="flex gap-3">
            <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">{item.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ================================================================ */}
      {/* 4. DESIGN PRINCIPLES */}
      {/* ================================================================ */}
      <SectionHeading n={4} id="principles">
        Design Principles
      </SectionHeading>

      <div className="border rounded-lg overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-2.5 font-semibold">Principle</th>
              <th className="text-left px-4 py-2.5 font-semibold">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Tokenless by default",
                "No economic barriers to participation. The network is a public good, not a financial instrument. Validators volunteer for the mission, not for token rewards. Tokenomics can be introduced later via governance if the community decides.",
              ],
              [
                "Standards-first",
                "Every module implements an existing international standard (OCDS, OC4IDS, UACS) rather than a proprietary schema. This ensures data is interoperable from day one.",
              ],
              [
                "Open source (MIT)",
                "Any agency, government, or organization can use, fork, and deploy the platform without restriction. Transparency of the platform itself is non-negotiable.",
              ],
              [
                "Append-only, not replace",
                "OpenGovChain does not replace eBudget, PhilGEPS, or eNGAS. It anchors their outputs. Agencies publish structured records to the chain; existing workflows remain intact.",
              ],
              [
                "Start simple, extend as needed",
                "The base platform supports datasets and structured records. Governance, custom tokens, smart contracts (CosmWasm), IBC cross-chain links, and agency-specific modules can be added incrementally.",
              ],
              [
                "Volunteer-operated",
                "Any individual or organization can run a validator node. The barrier to entry is a modest server (2 CPU, 4 GB RAM, ~$5-10/month). The network does not depend on any single operator.",
              ],
            ].map(([principle, rationale]) => (
              <tr key={principle} className="border-b last:border-b-0">
                <td className="px-4 py-2.5 font-medium align-top w-48">
                  {principle}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs leading-relaxed">
                  {rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================ */}
      {/* 5. ARCHITECTURE */}
      {/* ================================================================ */}
      <SectionHeading n={5} id="architecture">
        Architecture
      </SectionHeading>

      <P>
        OpenGovChain is built on the Cosmos SDK, an open-source framework for
        building application-specific blockchains. The key components are:
      </P>

      <div className="space-y-3 my-4">
        {[
          [
            "Consensus",
            "CometBFT (formerly Tendermint) Byzantine Fault Tolerant consensus. Blocks are finalized in ~5 seconds. The network tolerates up to 1/3 of validators acting maliciously.",
          ],
          [
            "Storage",
            "On-chain state for structured records (procurement releases, project data, budget documents). IPFS (InterPlanetary File System) for large files and documents, referenced by content-addressed CID on-chain.",
          ],
          [
            "API Surface",
            "REST (gRPC-gateway on port 1317), RPC (CometBFT on port 26657), and gRPC (port 9090). All read endpoints are unauthenticated. Write operations require a signed transaction.",
          ],
          [
            "Modules",
            "Each domain (procurement, infrastructure, budget, datasets) is a separate Cosmos SDK module with its own state store, message types, query handlers, and event system.",
          ],
          [
            "Indexing",
            "An optional indexer node polls the chain, generates vector embeddings, and stores them in ChromaDB for semantic search across all on-chain records.",
          ],
        ].map(([label, desc]) => (
          <div key={label} className="flex gap-3">
            <div className="font-semibold text-sm w-24 flex-shrink-0">{label}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* ================================================================ */}
      {/* 6. MODULE I: PROCUREMENT */}
      {/* ================================================================ */}
      <SectionHeading n={6} id="procurement">
        Module I: Public Procurement (OCDS)
      </SectionHeading>

      <div className="flex items-center gap-2 mb-4">
        <Badge>Implemented</Badge>
        <Badge variant="outline">
          <a
            href="https://standard.open-contracting.org/latest/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Open Contracting Data Standard
            <ExternalLink className="h-3 w-3" />
          </a>
        </Badge>
      </div>

      <P>
        The procurement module records the full public procurement lifecycle
        on-chain, following the OCDS schema. Every state transition is published
        as an immutable release, tagged with the lifecycle stage.
      </P>

      <FlowDiagram
        steps={[
          "Register Entity",
          "Create Process (Planning)",
          "Publish Tender",
          "Submit Award",
          "Sign Contract",
          "Update Implementation",
        ]}
      />

      <Sub>Key Data Structures</Sub>
      <ul className="list-disc list-outside pl-5 text-muted-foreground space-y-1 mb-4 text-sm">
        <li>
          <strong>Release</strong> &mdash; An immutable snapshot at a point in
          time, tagged with one or more lifecycle stages (planning, tender,
          award, contract, implementation).
        </li>
        <li>
          <strong>Contracting Process</strong> &mdash; The compiled view
          aggregating all releases for a single OCID. Updated automatically on
          each new release.
        </li>
        <li>
          <strong>Entity Registry</strong> &mdash; On-chain registration of
          organizations (buyers, procuring entities, suppliers) with
          org-id.guide identifiers.
        </li>
      </ul>

      <Sub>Authorization</Sub>
      <P>
        The creator of a contracting process becomes its owner. Only the owner
        or addresses explicitly added to the <code>authorized_publishers</code>{" "}
        list can publish subsequent releases. This ensures that only authorized
        agency personnel can update procurement records, while the public can
        freely read all data.
      </P>

      <Sub>OCDS Compliance</Sub>
      <P>
        The module produces standard OCDS Release Packages and Record Packages
        via dedicated REST endpoints, ensuring compatibility with the global
        ecosystem of OCDS tools, validators, and analytics platforms.
      </P>

      {/* ================================================================ */}
      {/* 7. MODULE II: INFRASTRUCTURE */}
      {/* ================================================================ */}
      <SectionHeading n={7} id="infrastructure">
        Module II: Infrastructure Projects (OC4IDS)
      </SectionHeading>

      <div className="flex items-center gap-2 mb-4">
        <Badge>Implemented</Badge>
        <Badge variant="outline">
          <a
            href="https://standard.open-contracting.org/infrastructure/latest/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            OC4IDS
            <ExternalLink className="h-3 w-3" />
          </a>
        </Badge>
      </div>

      <P>
        The infrastructure module tracks physical infrastructure projects from
        identification through completion, linking them to the procurement
        processes that fund them.
      </P>

      <FlowDiagram
        steps={[
          "Create Project",
          "Update Details",
          "Record Progress",
          "Attach Documents",
          "Link Procurement",
        ]}
      />

      <Sub>Key Capabilities</Sub>
      <ul className="list-disc list-outside pl-5 text-muted-foreground space-y-1 mb-4 text-sm">
        <li>
          <strong>Geographic location</strong> with GeoJSON geometry (Point,
          LineString, Polygon) and Philippine Standard Geographic Code (PSGC)
          gazetteer references.
        </li>
        <li>
          <strong>Quantitative metrics</strong> with timestamped observations
          for tracking physical and financial progress over time.
        </li>
        <li>
          <strong>Document attachments</strong> with optional IPFS storage for
          EIAs, progress reports, and completion certificates.
        </li>
        <li>
          <strong>Procurement linkage</strong> &mdash; each project can reference
          one or more OCDS contracting processes by OCID, with embedded tender
          and contract summaries.
        </li>
        <li>
          <strong>Filterable queries</strong> by sector, status, and region for
          public monitoring dashboards.
        </li>
      </ul>

      {/* ================================================================ */}
      {/* 8. MODULE III: NATIONAL BUDGET */}
      {/* ================================================================ */}
      <SectionHeading n={8} id="budget">
        Module III: National Budget (NEP &rarr; GAA)
      </SectionHeading>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary">Proposed</Badge>
        <Badge variant="outline">UACS + GIFT Fiscal Data Principles</Badge>
      </div>

      <P>
        The proposed National Budget Module closes the most critical gap in
        Philippine fiscal transparency: a structured, machine-readable,
        immutable record of how public money moves through the four phases of
        the budget cycle.
      </P>

      <Sub id="budget-cycle">The Philippine Budget Cycle</Sub>

      <P>
        The national budget follows four overlapping phases, each producing key
        documents that the module aims to anchor on-chain:
      </P>

      {/* Phase 1 */}
      <div className="border-l-2 border-primary/30 pl-4 mb-6">
        <div className="font-semibold text-sm flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px]">
            Phase 1
          </Badge>
          Budget Preparation (Executive)
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          Led by the Department of Budget and Management (DBM). The Development
          Budget Coordination Committee (DBCC) sets macroeconomic targets and
          expenditure ceilings. Agencies submit proposals through Technical
          Budget Hearings. DBM consolidates everything into the National
          Expenditure Program (NEP) and Budget of Expenditures and Sources of
          Financing (BESF), which the President transmits to Congress.
        </p>
        <div className="text-xs font-mono text-muted-foreground">
          Key documents: Budget Call, Agency Proposals (BEDs), <strong>NEP</strong>,{" "}
          <strong>BESF</strong>, Budget Message
        </div>
      </div>

      {/* Phase 2 */}
      <div className="border-l-2 border-primary/30 pl-4 mb-6">
        <div className="font-semibold text-sm flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px]">
            Phase 2
          </Badge>
          Budget Legislation (Congress)
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          The House Committee on Appropriations and the Senate Finance Committee
          conduct independent reviews. After both chambers pass their versions,
          the Bicameral Conference Committee reconciles differences. The
          President signs the unified bill into law (with line-item veto power),
          producing the General Appropriations Act.
        </p>
        <div className="text-xs font-mono text-muted-foreground">
          Key documents: House GAB, Senate GAB, Bicameral Report,{" "}
          <strong>General Appropriations Act (GAA)</strong>
        </div>
      </div>

      {/* Phase 3 */}
      <div className="border-l-2 border-primary/30 pl-4 mb-6">
        <div className="font-semibold text-sm flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px]">
            Phase 3
          </Badge>
          Budget Execution (Agencies)
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          DBM disaggregates the GAA into Agency Budget Matrices (ABMs) and
          issues allotment authorities. Agencies receive obligational authority
          via SAROs (Special Allotment Release Orders) and disbursement authority
          via NCAs (Notices of Cash Allocation). At the agency level, Obligation
          Requests (ObRs) commit funds and Disbursement Vouchers (DVs) process
          payments through the Treasury Single Account.
        </p>
        <div className="text-xs font-mono text-muted-foreground">
          Key documents: ABM, <strong>SARO</strong>, <strong>NCA</strong>, ObR,
          DV, SLCI
        </div>
      </div>

      {/* Phase 4 */}
      <div className="border-l-2 border-primary/30 pl-4 mb-6">
        <div className="font-semibold text-sm flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px]">
            Phase 4
          </Badge>
          Budget Accountability (COA)
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          Agencies submit quarterly and annual trial balances. The Commission on
          Audit (COA) &mdash; the constitutionally independent supreme audit
          institution &mdash; examines legality, propriety, and accuracy of all
          financial transactions. COA publishes Annual Audit Reports (AARs) per
          agency and consolidated Annual Financial Reports (AFRs).
        </p>
        <div className="text-xs font-mono text-muted-foreground">
          Key documents: Trial Balances, FARs, <strong>COA AARs</strong>,{" "}
          <strong>AFRs</strong>
        </div>
      </div>

      <Sub>UACS as the Classification Backbone</Sub>
      <P>
        The Unified Account Code Structure (UACS) is the Philippine
        government&apos;s harmonized classification system across budgeting,
        treasury, and accounting. Every financial transaction is encoded using
        five code segments:
      </P>

      <div className="border rounded-lg overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-3 py-2 font-medium">Segment</th>
              <th className="text-left px-3 py-2 font-medium">Description</th>
              <th className="text-left px-3 py-2 font-medium">Example</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Funding Source",
                "Origin and type of financial resources",
                "101 (General Fund, New General Appropriations)",
              ],
              [
                "Organization",
                "Department, bureau, and operating unit",
                "10 01 001 (DPWH Central Office)",
              ],
              [
                "Location",
                "Geographic code (PSGC)",
                "03 08 (Bataan)",
              ],
              [
                "PAP",
                "Program, Activity, or Project",
                "310203 (Road Construction)",
              ],
              [
                "Object",
                "Nature of expenditure (PS, MOOE, CO)",
                "5-02-13-050 (Road Networks)",
              ],
            ].map(([seg, desc, ex]) => (
              <tr key={seg} className="border-b last:border-b-0">
                <td className="px-3 py-2 font-medium text-xs">{seg}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {desc}
                </td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">
                  {ex}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <P>
        UACS codes are the natural bridge between the budget module and the
        procurement module. A UACS-coded budget line in the GAA can be traced to
        the SARO that releases it, the procurement process that spends it (via
        OCDS <code>planning.budget</code>), and the infrastructure project that
        delivers it (via OC4IDS).
      </P>

      <Sub>Proposed On-Chain Data Model</Sub>

      <P>
        The budget module would introduce the following on-chain record types,
        each published as immutable, timestamped entries:
      </P>

      <div className="space-y-3 my-4">
        {[
          {
            name: "BudgetLineItem",
            desc: "A single appropriation line from the NEP or GAA, classified by UACS codes. Tracks the proposed amount (NEP), enacted amount (GAA), and any vetoed or realigned amounts.",
          },
          {
            name: "AllotmentRelease",
            desc: "Records a SARO or GARO issuance — the authority for an agency to incur obligations against a specific budget line. References the parent BudgetLineItem by UACS code.",
          },
          {
            name: "CashAllocation",
            desc: "Records an NCA — the authority for an agency to withdraw funds from a government servicing bank. References the parent AllotmentRelease.",
          },
          {
            name: "ObligationRecord",
            desc: "Records an obligation incurred by an agency (e.g., a contract award). Links to the OCDS contracting process via OCID and to the parent AllotmentRelease.",
          },
          {
            name: "DisbursementRecord",
            desc: "Records actual payment — the final step in the spending chain. References the ObligationRecord and the OCDS implementation transaction.",
          },
          {
            name: "AuditFinding",
            desc: "Anchors COA audit observations and findings to specific budget lines, allotments, or disbursements. Provides the accountability closure for the cycle.",
          },
        ].map((r) => (
          <div key={r.name} className="flex gap-3">
            <code className="text-xs font-mono text-primary w-40 flex-shrink-0 pt-0.5">
              {r.name}
            </code>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      <Sub>The Data Flow On-Chain</Sub>

      <FlowDiagram
        steps={[
          "NEP Line Item",
          "GAA Enactment",
          "SARO Release",
          "NCA Allocation",
          "Obligation (→ OCDS)",
          "Disbursement",
          "COA Audit",
        ]}
      />

      <P>
        Each transition is a separate on-chain transaction, signed by the
        authorized publisher (DBM for allotments, the implementing agency for
        obligations, COA for audit findings). The chain records who published
        what, when, at which block height, and with which transaction hash.
      </P>

      {/* ================================================================ */}
      {/* 9. END-TO-END TRACEABILITY */}
      {/* ================================================================ */}
      <SectionHeading n={9} id="traceability">
        End-to-End Traceability
      </SectionHeading>

      <P>
        The three modules are designed to interconnect. A single infrastructure
        project can be traced across all three:
      </P>

      <Card className="my-6">
        <CardContent className="pt-5 pb-5">
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <Landmark className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Budget:</strong> GAA Line Item for &ldquo;Road
                Construction &mdash; Region III&rdquo; (UACS: 101-10-01-001-03-08-310203-5-02-13-050) appropriates PHP 50M. DBM releases SARO and NCA.
              </div>
            </div>
            <ChevronsDown className="h-4 w-4 text-muted-foreground mx-auto" />
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Procurement:</strong> DPWH Region III creates an OCDS
                contracting process (ocds-abc123-ph-dpwh-2024-0001) with{" "}
                <code>planning.budget</code> referencing the UACS-coded GAA
                line. The process moves through tender, award, and contract.
              </div>
            </div>
            <ChevronsDown className="h-4 w-4 text-muted-foreground mx-auto" />
            <div className="flex items-start gap-3">
              <HardHat className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong>Infrastructure:</strong> The OC4IDS project
                (oc4ids-ph-dpwh-2024-infra-0001) links to the OCDS process via{" "}
                <code>contracting_processes[].ocid</code>. Progress metrics
                record 35% physical completion. Documents include the EIA and
                monthly progress reports on IPFS.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <P>
        This end-to-end chain means that any citizen, journalist, or oversight
        body can start from a GAA line item and follow the money all the way to
        the physical road being built &mdash; or start from a construction site
        and trace backward to the legislative appropriation that funded it. Every
        link in the chain is on-chain, timestamped, and immutable.
      </P>

      {/* ================================================================ */}
      {/* 10. GOVERNANCE */}
      {/* ================================================================ */}
      <SectionHeading n={10} id="governance">
        Network Governance &amp; Participation
      </SectionHeading>

      <P>
        OpenGovChain is operated by a volunteer validator network with no
        economic prerequisites. Governance follows the Cosmos SDK{" "}
        <code>x/gov</code> module pattern:
      </P>

      <ul className="list-disc list-outside pl-5 text-muted-foreground space-y-2 mb-4 text-sm">
        <li>
          <strong>Parameter changes</strong> (e.g., adjusting OCID prefixes,
          maximum release sizes, or budget module thresholds) require a
          governance proposal approved by validators.
        </li>
        <li>
          <strong>Module upgrades</strong> follow the standard Cosmos SDK upgrade
          mechanism with coordinated halt-height across validators.
        </li>
        <li>
          <strong>Validator admission</strong> is open. Any individual or
          organization can join by running a node and creating a validator
          transaction. There are no minimum stake requirements on the tokenless
          network.
        </li>
        <li>
          <strong>Data publishing</strong> is permissioned by module. Each
          module defines who can write (e.g., registered entities for
          procurement, project owners for infrastructure, designated agencies for
          budget). Reading is always public and free.
        </li>
      </ul>

      <Sub>Tiered Participation</Sub>

      <div className="border rounded-lg overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-3 py-2 font-medium">Role</th>
              <th className="text-left px-3 py-2 font-medium">Requirements</th>
              <th className="text-left px-3 py-2 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Validator Node", "2 CPU, 4 GB RAM, 50 GB disk", "~$5-10/mo"],
              ["Data Pinner (IPFS)", "1 CPU, 2 GB RAM, 100+ GB disk", "~$3-8/mo"],
              ["Archive Node", "2 CPU, 8 GB RAM, 200 GB disk", "~$10-20/mo"],
              ["API Consumer", "Any device with internet", "Free"],
            ].map(([role, reqs, cost]) => (
              <tr key={role} className="border-b last:border-b-0">
                <td className="px-3 py-2 font-medium text-xs">{role}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {reqs}
                </td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">
                  {cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================================================================ */}
      {/* 11. ROADMAP */}
      {/* ================================================================ */}
      <SectionHeading n={11} id="roadmap">
        Roadmap
      </SectionHeading>

      <div className="space-y-4 my-4">
        {[
          {
            phase: "Phase 1: Foundation",
            status: "complete",
            items: [
              "Cosmos SDK blockchain with CometBFT consensus",
              "Datasets module with IPFS integration",
              "Procurement module (OCDS) — full lifecycle",
              "Infrastructure module (OC4IDS) — project tracking",
              "REST, RPC, and gRPC API surface",
              "Volunteer validator onboarding",
              "Web portal and block explorer",
            ],
          },
          {
            phase: "Phase 2: Budget & Governance",
            status: "in-progress",
            items: [
              "National Budget module (NEP → GAA → SARO → NCA → Disbursement)",
              "UACS code registry on-chain",
              "Cross-module traceability (Budget ↔ Procurement ↔ Infrastructure)",
              "On-chain governance for parameter changes",
              "Entity verification workflows",
              "Enhanced indexing and semantic search",
            ],
          },
          {
            phase: "Phase 3: Scale & Interoperability",
            status: "planned",
            items: [
              "IBC (Inter-Blockchain Communication) for cross-chain data sharing",
              "CosmWasm smart contracts for custom agency logic",
              "LGU (Local Government Unit) budget tracking",
              "Integration with PhilGEPS and DBM systems",
              "International deployment templates for other countries",
              "Advanced analytics and AI-powered anomaly detection",
            ],
          },
        ].map((p) => (
          <div key={p.phase} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="font-semibold text-sm">{p.phase}</div>
              <Badge
                variant={
                  p.status === "complete"
                    ? "default"
                    : p.status === "in-progress"
                      ? "secondary"
                      : "outline"
                }
                className="text-[10px]"
              >
                {p.status === "complete"
                  ? "Complete"
                  : p.status === "in-progress"
                    ? "In Progress"
                    : "Planned"}
              </Badge>
            </div>
            <ul className="space-y-1">
              {p.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${p.status === "complete"
                      ? "text-emerald-500"
                      : "text-muted-foreground/40"
                      }`}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ================================================================ */}
      {/* 12. GET INVOLVED */}
      {/* ================================================================ */}
      <SectionHeading n={12} id="participate">
        Get Involved
      </SectionHeading>

      <P>
        OpenGovChain is built by volunteers who believe government data should
        be a permanent, verifiable public good. There are several ways to
        contribute:
      </P>

      <div className="grid sm:grid-cols-2 gap-3 my-6">
        {[
          {
            icon: Database,
            title: "Run a Validator",
            desc: "Operate a node to help secure the network and validate transactions.",
            href: "/volunteer",
          },
          {
            icon: Globe,
            title: "Contribute Code",
            desc: "The entire platform is open source under the MIT license on GitHub.",
            href: "https://github.com/bettergovph/govchain",
          },
          {
            icon: FileText,
            title: "Publish Data",
            desc: "Government agencies can publish procurement, infrastructure, and budget data directly to the chain.",
            href: "/developer-guide",
          },
          {
            icon: Users,
            title: "Join the Community",
            desc: "Connect with other contributors, researchers, and transparency advocates on Discord.",
            href: "https://discord.gg/bettergovph",
          },
        ].map((c) => (
          <Card key={c.title} className="hover:bg-muted/30 transition-colors">
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <CardContent className="pt-5 pb-4">
                <c.icon className="h-5 w-5 text-primary mb-2" />
                <div className="font-semibold text-sm">{c.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {c.desc}
                </p>
              </CardContent>
            </a>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t pt-8 mt-16 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          OpenGovChain is a project of{" "}
          <a
            href="https://bettergov.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            BetterGov.PH
          </a>
          . Licensed under MIT.
        </p>
        <p className="text-xs text-muted-foreground">
          Questions or feedback? Reach us at{" "}
          <a
            href="mailto:volunteers@bettergov.ph"
            className="text-primary hover:underline"
          >
            volunteers@bettergov.ph
          </a>{" "}
          or on{" "}
          <a
            href="https://discord.gg/bettergovph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Discord
          </a>
          .
        </p>
      </div>
    </article>
  );
}
