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
  Target,
  Blocks,
  Database,
  Network,
  Shield,
  Clock,
  Users,
  Globe,
  Code,
  Heart,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-4xl font-bold text-foreground">
            GovChain is an open source blockchain.
          </h1>
          <Badge variant="outline" className="gap-1">
            <Code className="h-3 w-3" />
            Open Source
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Heart className="h-3 w-3" />
            Free to Use
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground">
          A tokenless, public good blockchain for government data transparency
          and accountability.
        </p>

        <p>
            GovChain is a decentralized blockchain network designed to store and
            manage government datasets with complete transparency. Our mission
            is to create an open, accessible platform where government data can
            be stored immutably and accessed by all citizens.          
        </p>

        <h2 className="text-xl font-bold">
          100% Open Source & Free for All Agencies
        </h2>

        <p className="text-muted-foreground">
          GovChain is completely <strong>free and open source</strong>. Any
          government agency, organization, or individual can use, modify, and
          deploy this platform without restrictions or licensing fees.
        </p>
      </div>

      {/* Project Status Notice */}
      <Card className="border-orange-500/50 bg-orange-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <CardTitle>Project in Active Development</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            GovChain is currently under active development. Technical
            specifications, features, and implementation details may change as
            we refine the platform based on community feedback and real-world
            testing.
          </p>
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              We Need Your Help!
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              We're looking for volunteers to help build, test, and improve
              GovChain. Whether you're a developer, designer, government
              official, or transparency advocate, your contribution can make a
              difference.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://discord.gg/bettergovph"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline">
                  Join Discord
                </Button>
              </a>
              <a
                href="https://github.com/bettergovph/govchain/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline">
                  Report Issues
                </Button>
              </a>
              <Link href="/volunteer">
                <Button size="sm" variant="outline">
                  Run a Node
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Network className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Tokenless Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  No Economic Barriers - Anyone can participate without
                  purchasing tokens
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Volunteer-Operated - Community-driven validator network
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Public Good Focus - Designed for transparency, not profit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Immutable Records - Government datasets stored permanently
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  IPFS Integration - Efficient file storage with content
                  addressing
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Rich Metadata - Comprehensive dataset information
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Blocks className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Decentralized Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Cosmos SDK - Built on proven blockchain technology
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Validator Network - Volunteer nodes secure the network
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Open Source - Fully transparent and auditable code
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture</CardTitle>
          <CardDescription>
            GovChain combines three powerful technologies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Cosmos Blockchain</h3>
              <p className="text-sm text-muted-foreground">
                Immutable registry of dataset metadata and provenance
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">IPFS</h3>
              <p className="text-sm text-muted-foreground">
                Distributed file storage with content addressing
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">ChromaDB Vector DB</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered semantic search
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Components */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Components</CardTitle>
          <CardDescription>
            Core components of the GovChain blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Datasets Module
              </h3>
              <p className="text-sm text-muted-foreground">
                Custom Cosmos SDK module for data management
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Entry Storage
              </h3>
              <p className="text-sm text-muted-foreground">
                Structured metadata for government files
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Query Engine
              </h3>
              <p className="text-sm text-muted-foreground">
                Efficient data retrieval and filtering
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Validator Network
              </h3>
              <p className="text-sm text-muted-foreground">
                Decentralized consensus mechanism
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Data Flow</CardTitle>
          <CardDescription>
            How data moves through the GovChain network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Government agencies upload datasets to IPFS
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Metadata</h3>
                <p className="text-sm text-muted-foreground">
                  Blockchain stores immutable metadata and references
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Network validates data integrity and authenticity
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold">Access</h3>
                <p className="text-sm text-muted-foreground">
                  Public can query and download datasets freely
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Consensus</div>
                <div className="font-semibold">Tendermint BFT</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Block Time</div>
                <div className="font-semibold">~5 seconds</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Validators</div>
                <div className="font-semibold">Community</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Storage</div>
                <div className="font-semibold">IPFS + Chain</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why GovChain */}
      <Card>
        <CardHeader>
          <CardTitle>Why GovChain?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-destructive">
                Traditional Government Data Portals
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive">❌</span>
                  Can be censored or taken offline
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive">❌</span>
                  Can be tampered with
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive">❌</span>
                  Have single points of failure
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive">❌</span>
                  Require trust in centralized operators
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600">GovChain</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Cannot be censored (distributed worldwide)
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Cannot be tampered with (cryptographic verification)
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Cannot go offline (redundant copies)
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Requires no trust (open-source, verifiable)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Blockchain:</span>
                <span className="text-muted-foreground">
                  {" "}
                  Tendermint BFT consensus, 2/3+ validator agreement
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Data Integrity:</span>
                <span className="text-muted-foreground">
                  {" "}
                  SHA-256 checksums, content-addressed storage
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Access:</span>
                <span className="text-muted-foreground">
                  {" "}
                  Public read access, verified agency uploads
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold">Privacy:</span>
                <span className="text-muted-foreground">
                  {" "}
                  No personal data on-chain
                </span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
