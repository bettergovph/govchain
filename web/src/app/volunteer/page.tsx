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
          Help support government data transparency by running a OpenGovChain node
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
        <h2 className="text-2xl font-bold">Node Types</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Server className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Validator Node</CardTitle>
              <CardDescription>
                Validate transactions and produce blocks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Requirements</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 4-8 CPU cores</li>
                  <li>• 16-32 GB RAM</li>
                  <li>• 200 GB SSD</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Cost</div>
                <p className="text-sm text-muted-foreground">
                  $20-40/month (VPS)
                </p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Commitment</div>
                <Badge variant="destructive">
                  High uptime required (&gt;99%)
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <HardDrive className="h-8 w-8 text-primary mb-2" />
              <CardTitle>IPFS Pinner Node</CardTitle>
              <CardDescription>Store and serve dataset files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Requirements</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 2+ CPU cores</li>
                  <li>• 8 GB RAM</li>
                  <li>• 1-10 TB HDD</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Cost</div>
                <p className="text-sm text-muted-foreground">$5-20/month</p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Commitment</div>
                <Badge>Moderate (can go offline temporarily)</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Archive Node</CardTitle>
              <CardDescription>Provide full blockchain history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-1">Requirements</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 4 CPU cores</li>
                  <li>• 16 GB RAM</li>
                  <li>• 500 GB SSD</li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Cost</div>
                <p className="text-sm text-muted-foreground">$30-50/month</p>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Commitment</div>
                <Badge variant="secondary">High availability recommended</Badge>
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
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-3">Minimum</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Ubuntu 20.04+ / Debian 11+ / macOS
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  4 GB RAM
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  100 GB free disk space
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  10 Mbps internet connection
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Recommended</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Ubuntu 22.04 LTS
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  8 GB RAM
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  500 GB SSD
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  100 Mbps internet connection
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>Get started in 6 steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Install Dependencies</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground"># Update system</div>
                  <div>sudo apt update && sudo apt upgrade -y</div>
                  <div className="mt-2 text-muted-foreground">
                    # Install basic tools
                  </div>
                  <div>
                    sudo apt install -y curl wget git build-essential jq
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    # Install Go 1.21
                  </div>
                  <div>wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz</div>
                  <div>
                    sudo tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz
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
                <h3 className="font-semibold mb-2">Build Blockchain Binary</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">
                    # Clone repository
                  </div>
                  <div>
                    git clone https://github.com/bettergov/govchaind.git
                  </div>
                  <div>cd govchaind</div>
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
                <h3 className="font-semibold mb-2">Initialize Node</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">
                    # Initialize node (replace 'my-node' with your moniker)
                  </div>
                  <div>govchaind init my-node --chain-id govchain-1</div>
                  <div className="mt-2 text-muted-foreground">
                    # Download genesis file
                  </div>
                  <div>
                    wget
                    https://govchain.bettergov.ph/genesis.json
                    \
                  </div>
                  <div> -O ~/.govchain/config/genesis.json</div>
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
                <h3 className="font-semibold mb-2">Configure Node</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">
                    # Edit config.toml
                  </div>
                  <div>nano ~/.govchain/config/config.toml</div>
                  <div className="mt-2 text-muted-foreground">
                    # Key settings:
                  </div>
                  <div>
                    persistent_peers = "node1@ip1:26656,node2@ip2:26656"
                  </div>
                  <div>external_address = "tcp://YOUR_PUBLIC_IP:26656"</div>
                  <div>prometheus = true</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Create Systemd Service</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div>sudo systemctl daemon-reload</div>
                  <div>sudo systemctl enable govchaind</div>
                  <div>sudo systemctl start govchaind</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                6
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Verify Node is Running</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground"># Check status</div>
                  <div>sudo systemctl status govchaind</div>
                  <div className="mt-2 text-muted-foreground">
                    # Check sync status
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
            <ul className="space-y-1">
              <li className="text-sm text-muted-foreground">
                • Discord: https://discord.gg/bettergovph
              </li>
              <li className="text-sm text-muted-foreground">
                • GitHub Issues: https://github.com/bettergovph/govchain/issues
              </li>
              <li className="text-sm text-muted-foreground">
                • Email: volunteers@bettergov.ph
              </li>
            </ul>
          </div>
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
              Set up your node
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Join Discord community
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Introduce yourself in #introductions
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Start pinning datasets
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Participate in governance
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
