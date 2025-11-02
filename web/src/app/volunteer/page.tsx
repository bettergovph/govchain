import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  HardDrive,
  Database,
  CheckCircle2,
  AlertCircle,
  Award,
  Users,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function VolunteerPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Volunteer Node Operator Guide
        </h1>
        <p className="text-xl text-muted-foreground">
          Help support government data transparency by running an OpenGovChain node
        </p>
        <p className="text-muted-foreground">
          OpenGovChain is a <strong>tokenless, public good blockchain</strong> for government data transparency and accountability.
          The network is operated by volunteers like you, with no economic barriers to participation.
        </p>
      </div>

      {/* Why Run a Node */}
      <Card>
        <CardHeader>
          <CardTitle>Why Run a Node?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Support Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  Help preserve government datasets
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Ensure Availability</h3>
                <p className="text-sm text-muted-foreground">
                  Provide redundant storage and access
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Build Reputation</h3>
                <p className="text-sm text-muted-foreground">
                  Earn on-chain recognition for contributions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Join the Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with transparency advocates worldwide
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Types */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Ways to Help</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Server className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Basic Node</CardTitle>
              <CardDescription>
                Sync and relay transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Requirements</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 2 CPU cores</li>
                  <li>• 4 GB RAM</li>
                  <li>• 50 GB storage</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Cost</div>
                <p className="text-sm text-muted-foreground">
                  $5-10/month (VPS)
                </p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Commitment</div>
                <Badge variant="secondary">
                  Low (can run part-time)
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <HardDrive className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Data Pinner</CardTitle>
              <CardDescription>Help preserve government datasets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Requirements</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1 CPU core</li>
                  <li>• 2 GB RAM</li>
                  <li>• 100+ GB storage</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Cost</div>
                <p className="text-sm text-muted-foreground">$3-8/month</p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Commitment</div>
                <Badge>Very Low (hobby-friendly)</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Archive Node</CardTitle>
              <CardDescription>Store complete blockchain history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Requirements</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 2 CPU cores</li>
                  <li>• 8 GB RAM</li>
                  <li>• 200 GB storage</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Cost</div>
                <p className="text-sm text-muted-foreground">$10-20/month</p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Commitment</div>
                <Badge variant="secondary">Moderate availability</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>System Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Most modern computers can run a basic node! Even a Raspberry Pi 4 works for simple setups.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Basic Setup</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Any modern OS (Linux/macOS/Windows)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    2 GB RAM
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    20 GB free space
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Basic internet (5+ Mbps)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Better Performance</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Ubuntu/Debian (easier setup)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    4 GB RAM
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    100 GB SSD
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Stable internet connection
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>
            Get started with Docker (recommended) or build from source. 
            Full documentation: <a href="https://github.com/bettergovph/govchaind" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Repository</a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 - Docker Method (Recommended) */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Option A: Using Docker (Recommended)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The easiest and most maintainable method. Choose your setup:
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-sm mb-1">For VPS or Public IP:</div>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <div className="text-muted-foreground"># See Standalone Node Guide</div>
                      <div>docker-compose up -d</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">For Home Network (behind NAT):</div>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <div className="text-muted-foreground"># See Tailscale Guide for secure connectivity</div>
                      <div>docker-compose -f docker-compose.tailscale.yml up -d</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 1B - From Source */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                1B
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Option B: Build from Source (Advanced)</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground"># Verify environment</div>
                  <div>./scripts/check-build-env.sh</div>
                  <div className="mt-2 text-muted-foreground">
                    # Prerequisites: Go 1.18+ and Ignite CLI
                  </div>
                  <div>
                    curl https://get.ignite.com/cli | bash
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Clone and Build</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">
                    # Clone repository
                  </div>
                  <div>
                    git clone https://github.com/bettergovph/govchaind.git
                  </div>
                  <div>cd govchaind</div>
                  <div className="mt-2 text-muted-foreground">
                    # Setup environment
                  </div>
                  <div>./scripts/setup-env.sh</div>
                  <div className="mt-2 text-muted-foreground">
                    # Build binary
                  </div>
                  <div>ignite chain build</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Join as Volunteer</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">
                    # Use the join script (auto-detects public IP on VPS)
                  </div>
                  <div>./scripts/join-as-volunteer.sh &lt;your-node-name&gt; &lt;genesis-url&gt;</div>
                  <div className="mt-2 text-muted-foreground">
                    # Or for local development:
                  </div>
                  <div>ignite chain serve</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Verify Node is Running</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground"># Check Docker status</div>
                  <div>docker-compose ps</div>
                  <div className="mt-2 text-muted-foreground">
                    # Or check node sync status
                  </div>
                  <div>govchaind status | jq .SyncInfo</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-primary" />
            <CardTitle>Security Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Use a firewall:</span>
                <span className="text-muted-foreground">
                  {" "}
                  Allow only necessary ports (SSH, P2P)
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">
                  Disable RPC on public interface:
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  Keep RPC on localhost only
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">
                  Use SSH keys, not passwords:
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  Disable password authentication
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">
                  Keep validator keys offline:
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  Use a signer service for production
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Regular security updates:</span>
                <span className="text-muted-foreground">
                  {" "}
                  Keep your system up to date
                </span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Full Documentation</CardTitle>
          <CardDescription>
            Comprehensive guides for different setup scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="text-sm">
              • <a href="https://github.com/bettergovph/govchaind" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Getting Started Guide</a> - Complete setup instructions
            </li>
            <li className="text-sm">
              • <a href="https://github.com/bettergovph/govchaind" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Standalone Node Guide</a> - For VPS or local development
            </li>
            <li className="text-sm">
              • <a href="https://github.com/bettergovph/govchaind" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Tailscale Guide</a> - Join securely from behind NAT
            </li>
            <li className="text-sm">
              • <a href="https://github.com/bettergovph/govchaind" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Docker Guide</a> - Running with Docker
            </li>
            <li className="text-sm">
              • <a href="https://github.com/bettergovph/govchaind" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Network Configuration</a> - Peers, ports, and settings
            </li>
            <li className="text-sm">
              • <a href="https://github.com/bettergovph/govchaind" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Technical Implementation</a> - Architecture deep dive
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Support & Community */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Support & Community</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <ul className="space-y-2">
              <li className="text-sm">
                • <a href="https://discord.gg/bettergovph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Discord Community</a>
              </li>
              <li className="text-sm">
                • <a href="https://github.com/bettergovph/govchaind/issues" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Issues</a>
              </li>
              <li className="text-sm">
                • Email: <a href="mailto:volunteers@bettergov.ph" className="text-primary hover:underline">volunteers@bettergov.ph</a>
              </li>
              <li className="text-sm">
                • License: <a href="https://github.com/bettergovph/govchaind/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MIT License</a> (Open Source)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>🌟 Why OpenGovChain is Different</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Tokenless Architecture:</span>
                <span className="text-sm text-muted-foreground">
                  {" "}No economic barriers to participation. The network is a public good operated by volunteers.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Immutable Government Data:</span>
                <span className="text-sm text-muted-foreground">
                  {" "}Datasets are stored permanently on the blockchain with IPFS integration.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Rich Metadata & Queries:</span>
                <span className="text-sm text-muted-foreground">
                  {" "}Search by agency, category, and file type with comprehensive metadata.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Decentralized & Secure:</span>
                <span className="text-sm text-muted-foreground">
                  {" "}Built on Cosmos SDK with Tendermint BFT consensus, secured by volunteer validators.
                </span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Choose your setup method (Docker recommended)
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Read the appropriate guide for your environment
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Set up your node
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <a href="https://discord.gg/bettergovph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Join Discord community</a>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Introduce yourself in #introductions
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Help onboard other volunteers
            </li>
          </ol>
        </CardContent>
      </Card>

    </div>
  );
}
