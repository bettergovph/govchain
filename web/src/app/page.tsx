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
  Eye,
  Scale,
  ArrowRight,
  Blocks,
  Database,
  Network,
  TrendingUp,
  Landmark,
  HardHat,
  Banknote,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "OpenGovChain - Open Standards on Blockchain for Government Transparency",
  description:
    "Blockchain-backed Open Contracting Data Standard (OCDS), Open Contracting for Infrastructure (OC4IDS), and National Budget tracking for transparent, verifiable, and permanent government fiscal data.",
};

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            Open Standards
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Blocks className="h-3 w-3" />
            Blockchain-Backed
          </Badge>
        </div>

        <h1 className="text-4xl font-bold text-foreground leading-tight">
          Open Contracting (OCDS) & Infrastructure (OC4IDS) Data Standards &amp; Budget Monitoring on Blockchain
        </h1>

        <p className="text-xl text-muted-foreground max-w-5xl">
          OpenGovChain is an open-source platform that implements internationally recognized open data standards
          on an immutable blockchain — making government procurement,
          infrastructure spending, and the national budget transparent,
          verifiable, and permanently accessible to every citizen.
        </p>

        <Link href="/whitepaper">
          <Button size="lg" className="gap-2">
            <BookOpen className="h-5 w-5" />
            Read the Whitepaper
          </Button>
        </Link>
      </div>

      {/* Why Open Standards Matter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Why Open Standards on Blockchain?</CardTitle>
          <CardDescription>
            Combining the power of globally adopted data standards with
            blockchain immutability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">Transparency</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Every procurement process and infrastructure project is
                published using structured, machine-readable formats that
                anyone can audit. Blockchain ensures the data cannot be
                altered or deleted after publication.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">Accountability</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Immutable on-chain records create an unbreakable audit trail
                from planning to implementation. Government officials,
                oversight bodies, and citizens can verify every step of the
                contracting process.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">Better Outcomes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Open contracting data enables analysis that drives better
                value for money, reduces corruption, and improves the quality
                of public services and infrastructure delivered to
                communities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Three Modules */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Our Modules</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* OCDS Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Landmark className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">OCDS</CardTitle>
                  <CardDescription>
                    Open Contracting Data Standard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground">
                The global standard for publishing structured, comparable data
                on public procurement. Our blockchain module captures the
                full contracting process — from planning and tendering
                through award, contract signing, and implementation.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">On-Chain Capabilities:</h4>
                <ul className="space-y-1">
                  {[
                    "Create and manage contracting processes with unique OCIDs",
                    "Publish tenders, awards, and signed contracts",
                    "Track implementation with milestones and transactions",
                    "Register and verify procuring entities on-chain",
                    "Generate OCDS-compliant release and record packages",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/procurement">
                <Button className="w-full gap-2 mt-2">
                  Explore Procurement Module
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* OC4IDS Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <HardHat className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">OC4IDS</CardTitle>
                  <CardDescription>
                    Open Contracting for Infrastructure Data Standard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground">
                An extension of open contracting principles to infrastructure
                projects. Our blockchain module tracks every infrastructure
                project from identification through completion — linking
                procurement data with project-level monitoring.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">On-Chain Capabilities:</h4>
                <ul className="space-y-1">
                  {[
                    "Register infrastructure projects with location and sector data",
                    "Track budgets, timelines, and completion metrics",
                    "Link procurement processes to their parent infrastructure projects",
                    "Attach and verify project documents with IPFS storage",
                    "Monitor progress with measurable observations and KPIs",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/standards/oc4ids">
                <Button className="w-full gap-2 mt-2">
                  Explore Infrastructure Module
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Budget Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Banknote className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">National Budget</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    NEP &rarr; GAA &rarr; SARO &rarr; Disbursement
                    <Badge variant="secondary" className="text-[10px] ml-1">
                      Proposed
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground">
                A proposed module to track the full lifecycle of public funds
                — from the National Expenditure Program (NEP) through
                legislative enactment (GAA), allotment releases (SARO), cash
                allocations (NCA), obligations, and disbursements, aligned
                with the Unified Account Code Structure (UACS).
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Planned Capabilities:</h4>
                <ul className="space-y-1">
                  {[
                    "Track budget lines from NEP proposal through GAA enactment",
                    "Record allotment releases (SARO) and cash allocations (NCA)",
                    "Link obligations to OCDS procurement processes via UACS codes",
                    "Anchor COA audit findings to specific budget items",
                    "End-to-end traceability from appropriation to physical delivery",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/whitepaper#budget">
                <Button variant="outline" className="w-full gap-2 mt-2">
                  Read the Whitepaper
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How Blockchain Adds Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            What Blockchain Adds to Open Contracting
          </CardTitle>
          <CardDescription>
            Traditional open contracting portals publish data — OpenGovChain
            makes it permanent and trustworthy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Immutability &amp; Tamper-Proof Records
              </h3>
              <p className="text-sm text-muted-foreground">
                Once a procurement release or infrastructure project update is
                published on-chain, it cannot be altered or deleted. Every
                change creates a new, timestamped record — providing a
                complete and verifiable history.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Decentralized Verification
              </h3>
              <p className="text-sm text-muted-foreground">
                No single entity controls the data. A network of validators
                independently verifies every transaction, eliminating single
                points of failure and making censorship practically
                impossible.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Content-Addressed Document Storage
              </h3>
              <p className="text-sm text-muted-foreground">
                Supporting documents are stored on IPFS with their content
                hashes recorded on-chain. Anyone can verify that a document
                has not been modified since publication by checking its hash.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Interoperability &amp; Open APIs
              </h3>
              <p className="text-sm text-muted-foreground">
                Data stored on-chain follows international standards (OCDS,
                OC4IDS, UACS), making it interoperable with existing open
                contracting tools, analytics platforms, and civil society
                monitoring applications worldwide.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Statistics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">The Global Impact of Open Contracting</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-4xl font-bold text-primary">30+</div>
              <p className="text-sm text-muted-foreground">
                Countries using OCDS for procurement transparency
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-4xl font-bold text-primary">$2T+</div>
              <p className="text-sm text-muted-foreground">
                In public spending covered by open contracting globally
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-4xl font-bold text-primary">5–20%</div>
              <p className="text-sm text-muted-foreground">
                Potential savings on public procurement through transparency
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-4xl font-bold text-primary">100%</div>
              <p className="text-sm text-muted-foreground">
                Of data on OpenGovChain is permanently verifiable on-chain
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Who Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Who Benefits?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Government Agencies
              </h3>
              <p className="text-sm text-muted-foreground">
                Streamline reporting, demonstrate accountability, and build
                public trust. Meet international open data commitments with
                blockchain-grade assurance.
              </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Civil Society &amp; Media
              </h3>
              <p className="text-sm text-muted-foreground">
                Access tamper-proof contracting data for monitoring,
                investigative reporting, and advocacy. Track public spending
                from budget to delivery.
              </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Private Sector
              </h3>
              <p className="text-sm text-muted-foreground">
                Discover procurement opportunities through transparent tender
                data. Fair competition creates a level playing field for
                businesses of all sizes.
              </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Development Partners
              </h3>
              <p className="text-sm text-muted-foreground">
                Track aid-funded projects and procurement with verifiable
                on-chain records. Improve coordination and reduce duplication
                across programs.
              </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Oversight Bodies
              </h3>
              <p className="text-sm text-muted-foreground">
                Audit procurement processes with immutable records and
                complete transaction histories. Detect anomalies and
                irregularities with confidence in data integrity.
              </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Citizens
              </h3>
              <p className="text-sm text-muted-foreground">
                Verify how public funds are spent on procurement and
                infrastructure. Hold government accountable with
                permanently accessible, trustworthy data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">
              Join the Movement for Transparent Public Spending
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              OpenGovChain is open source and free for any government agency or
              organization. Help us build a future where every public peso
              — from appropriation to procurement to physical delivery —
              is transparent, verifiable, and accountable.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/whitepaper">
                <Button size="lg" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  Read the Whitepaper
                </Button>
              </Link>
              <Link href="/procurement">
                <Button size="lg" variant="outline" className="gap-2">
                  <Landmark className="h-5 w-5" />
                  Explore OCDS Module
                </Button>
              </Link>
              <Link href="/standards/oc4ids">
                <Button size="lg" variant="outline" className="gap-2">
                  <HardHat className="h-5 w-5" />
                  Explore OC4IDS Module
                </Button>
              </Link>
              <a
                href="https://github.com/bettergovph/govchain"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="gap-2">
                  Contribute on GitHub
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
