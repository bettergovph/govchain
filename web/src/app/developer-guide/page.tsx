"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Terminal,
  Globe,
  Key,
  Send,
  Search,
  Database,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  Menu,
  X,
  Layers,
  Radio,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadSection from "@/components/UploadSection";
import DatasetList from "@/components/DatasetList";

// ---------------------------------------------------------------------------
// Code Block with copy
// ---------------------------------------------------------------------------

function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border bg-muted/30">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50">
        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------

function Section({
  id,
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  icon: typeof Terminal;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="border rounded-lg overflow-hidden scroll-mt-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
        <h2 className="text-lg font-bold">{title}</h2>
      </button>
      {isOpen && <div className="px-5 pb-6 space-y-5 border-t pt-5">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function Step({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
        {n}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table of Contents
// ---------------------------------------------------------------------------

const TOC = [
  { id: "chain-config", label: "Chain Configuration" },
  { id: "auth", label: "Authentication & Keys" },
  { id: "tx-lifecycle", label: "Transaction Lifecycle" },
  { id: "procurement", label: "Procurement (OCDS)" },
  { id: "infrastructure", label: "Infrastructure (OC4IDS)" },
  { id: "pagination", label: "Pagination" },
  { id: "events", label: "Events & WebSocket" },
  { id: "errors", label: "Error Handling" },
  { id: "dataset-portal", label: "Dataset Portal" },
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DeveloperGuidePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-14"
        } border-r bg-background transition-all duration-200 flex-shrink-0 flex flex-col`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">Dev Guide</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 mx-auto"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
        {sidebarOpen && (
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                Sections
              </div>
              <div className="space-y-0.5">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                Resources
              </div>
              <div className="space-y-0.5">
                <Link
                  href="/api-docs"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  API Reference
                </Link>
                <Link
                  href="/explorer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Block Explorer
                </Link>
                <Link
                  href="/volunteer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Run a Validator
                </Link>
              </div>
            </div>
          </nav>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">Developer Guide</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              A practical guide for integrating with the GovChain blockchain&apos;s{" "}
              <strong>Procurement (OCDS)</strong> and{" "}
              <strong>Infrastructure (OC4IDS)</strong> modules. Covers
              authentication, querying via REST, submitting transactions via CLI
              and CosmJS, WebSocket events, and error handling.
            </p>
          </div>

          {/* ============================================================= */}
          {/* Chain Configuration */}
          {/* ============================================================= */}
          <Section
            id="chain-config"
            title="Chain Configuration"
            icon={Globe}
            defaultOpen={true}
          >
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                      Setting
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Chain ID", "govchain"],
                    ["Address Prefix", "cosmos (bech32)"],
                    ["RPC Endpoint", "http://localhost:26657"],
                    ["REST (LCD) Endpoint", "http://localhost:1317"],
                    ["gRPC Endpoint", "localhost:9090"],
                    ["Default Denom", "stake"],
                    ["Gas Price", "0.025stake"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b last:border-b-0">
                      <td className="px-4 py-2 font-medium">{k}</td>
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              All REST examples use{" "}
              <code className="px-1 bg-muted rounded">
                API=http://localhost:1317
              </code>
              . Adjust for your environment.
            </p>
          </Section>

          {/* ============================================================= */}
          {/* Authentication */}
          {/* ============================================================= */}
          <Section id="auth" title="Authentication & Key Management" icon={Key}>
            <p className="text-sm text-muted-foreground">
              GovChain uses <strong>Cosmos SDK standard authentication</strong>.
              Every state-changing transaction must be signed by a private key.
              There are no API keys or bearer tokens -- identity is a
              cryptographic keypair.
            </p>

            <h3 className="text-base font-semibold">Create a Key (CLI)</h3>
            <CodeBlock
              language="bash"
              code={`# Create a new key (stores in local keyring)
govchaind keys add alice --keyring-backend test

# List keys
govchaind keys list --keyring-backend test

# Show a specific key's address
govchaind keys show alice -a --keyring-backend test`}
            />

            <h3 className="text-base font-semibold">
              Create a Key (CosmJS / TypeScript)
            </h3>
            <CodeBlock
              language="typescript"
              code={`import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

// From a new random mnemonic
const wallet = await DirectSecp256k1HdWallet.generate(24, {
  prefix: "cosmos",
});
const [account] = await wallet.getAccounts();
console.log("Address:", account.address);

// From an existing mnemonic
const wallet2 = await DirectSecp256k1HdWallet.fromMnemonic(
  "your twenty four word mnemonic phrase here ...",
  { prefix: "cosmos" }
);`}
            />

            <h3 className="text-base font-semibold">Fund an Account</h3>
            <CodeBlock
              language="bash"
              code={`govchaind tx bank send \\
  validator alice 1000000stake \\
  --chain-id govchain \\
  --keyring-backend test \\
  --gas auto --gas-adjustment 1.5 --yes`}
            />

            <h3 className="text-base font-semibold">Check Balance</h3>
            <CodeBlock
              language="bash"
              code={`# CLI
govchaind query bank balances $(govchaind keys show alice -a --keyring-backend test)

# REST
curl "$API/cosmos/bank/v1beta1/balances/cosmos1abc..."`}
            />
          </Section>

          {/* ============================================================= */}
          {/* Transaction Lifecycle */}
          {/* ============================================================= */}
          <Section
            id="tx-lifecycle"
            title="Transaction Lifecycle"
            icon={Send}
          >
            <div className="flex items-center gap-2 flex-wrap text-sm font-mono">
              <Badge variant="outline">1. Construct Msg</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">2. Sign Tx</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">3. Broadcast</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">4. Block Inclusion</Badge>
            </div>

            <h3 className="text-base font-semibold">Method A: CLI</h3>
            <p className="text-sm text-muted-foreground">
              The CLI handles message construction, signing, and broadcast in one
              command:
            </p>
            <CodeBlock
              language="bash"
              code={`govchaind tx <module> <command> [args...] \\
  --from <key-name> \\
  --chain-id govchain \\
  --keyring-backend test \\
  --gas auto --gas-adjustment 1.5 --yes`}
            />

            <h3 className="text-base font-semibold">Method B: REST Broadcast</h3>
            <p className="text-sm text-muted-foreground">
              Use this when your app cannot reach the RPC port (26657) directly
              but can reach the REST API (1317), or when you want full control
              over the signing step.
            </p>

            <h4 className="text-sm font-semibold text-muted-foreground">
              Step 1: Create the signed transaction
            </h4>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Option A &mdash; CLI generate-only + sign offline
            </p>
            <CodeBlock
              language="bash"
              code={`# 1a. Generate the unsigned transaction JSON
govchaind tx procurement create-process \\
  --ocid ocds-abc123-ph-dpwh-2024-0001 \\
  --from alice \\
  --chain-id govchain --keyring-backend test \\
  --gas 200000 --fees 500stake \\
  --generate-only > unsigned_tx.json

# 1b. Sign the transaction (produces signed JSON)
govchaind tx sign unsigned_tx.json \\
  --from alice \\
  --chain-id govchain --keyring-backend test > signed_tx.json

# 1c. Encode to base64 for the REST broadcast endpoint
govchaind tx encode signed_tx.json > tx_bytes_b64.txt

# 1d. Broadcast
curl -X POST "$API/cosmos/tx/v1beta1/txs" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"tx_bytes\\": \\"$(cat tx_bytes_b64.txt)\\",
    \\"mode\\": \\"BROADCAST_MODE_SYNC\\"
  }"`}
            />

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Option B &mdash; CosmJS sign offline, broadcast via REST
            </p>
            <CodeBlock
              language="typescript"
              code={`import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

// 1. Create wallet from mnemonic (offline -- no network needed)
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
  prefix: "cosmos",
});
const [account] = await wallet.getAccounts();

// 2. Connect signing client (needs RPC only for account sequence)
const client = await SigningStargateClient.connectWithSigner(
  "http://localhost:26657",
  wallet,
  { gasPrice: GasPrice.fromString("0.025stake") }
);

// 3. Sign the transaction (does NOT broadcast yet)
const msg = {
  typeUrl: "/govchain.procurement.v1.MsgCreateProcess",
  value: { creator: account.address, ocid: "ocds-abc123-ph-dpwh-2024-0001" },
};
const fee = { amount: [{ denom: "stake", amount: "500" }], gas: "200000" };
const signedTx = await client.sign(account.address, [msg], fee, "");

// 4. Encode to bytes, then base64
const txBytes = TxRaw.encode(signedTx).finish();
const txBytesB64 = Buffer.from(txBytes).toString("base64");

// 5. Broadcast via REST (no RPC connection needed for this step)
const res = await fetch("http://localhost:1317/cosmos/tx/v1beta1/txs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tx_bytes: txBytesB64,
    mode: "BROADCAST_MODE_SYNC",
  }),
});
const result = await res.json();

if (result.tx_response.code !== 0) {
  throw new Error(\`Tx failed: \${result.tx_response.raw_log}\`);
}
console.log("Tx Hash:", result.tx_response.txhash);`}
            />
            <p className="text-xs text-muted-foreground italic">
              Tip: If you cannot reach RPC at all, fetch the account number and
              sequence from{" "}
              <code>/cosmos/auth/v1beta1/accounts/&#123;address&#125;</code>{" "}
              via REST, then use <code>wallet.signDirect()</code> with a manually
              constructed <code>SignDoc</code>.
            </p>

            <h4 className="text-sm font-semibold text-muted-foreground">
              Step 2: Broadcast
            </h4>
            <CodeBlock
              language="bash"
              code={`curl -X POST "$API/cosmos/tx/v1beta1/txs" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tx_bytes": "<base64-encoded-signed-tx>",
    "mode": "BROADCAST_MODE_SYNC"
  }'`}
            />
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                      Mode
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                      Behavior
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-3 py-2 font-mono text-xs">BROADCAST_MODE_SYNC</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      Waits for CheckTx validation, returns immediately
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-3 py-2 font-mono text-xs">BROADCAST_MODE_ASYNC</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      Returns immediately without any check
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-mono text-xs">BROADCAST_MODE_BLOCK</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      Waits for block inclusion (confirms success)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-semibold">
              Method C: CosmJS signAndBroadcast
            </h3>
            <CodeBlock
              language="typescript"
              code={`import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
  prefix: "cosmos",
});
const [account] = await wallet.getAccounts();

const client = await SigningStargateClient.connectWithSigner(
  "http://localhost:26657",
  wallet,
  { gasPrice: GasPrice.fromString("0.025stake") }
);

const result = await client.signAndBroadcast(
  account.address,
  [msg],   // array of messages
  "auto",  // auto gas estimation
  "memo"   // optional memo
);

console.log("Tx Hash:", result.transactionHash);
console.log("Height:", result.height);`}
            />
          </Section>

          {/* ============================================================= */}
          {/* Procurement Module */}
          {/* ============================================================= */}
          <Section
            id="procurement"
            title="Procurement Module (OCDS)"
            icon={Database}
          >
            <p className="text-sm text-muted-foreground">
              Implements the{" "}
              <strong>Open Contracting Data Standard (OCDS)</strong> lifecycle on-chain.
              Each step creates an immutable Release tagged with the stage.
            </p>

            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <Badge variant="outline">Register Entity</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Create Process</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Publish Tender</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Submit Award</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Sign Contract</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Update Implementation</Badge>
            </div>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="text-sm font-semibold mb-1">Authorization</div>
                <p className="text-xs text-muted-foreground">
                  The <code>creator</code> of <code>CreateProcess</code> becomes the process <strong>owner</strong>. Only the owner or addresses in <code>authorized_publishers</code> can publish subsequent releases. Entity updates are restricted to the original registrar.
                </p>
              </CardContent>
            </Card>

            {/* Step 1: Register Entity */}
            <Step n={1} title="Register an Entity" />
            <p className="text-sm text-muted-foreground">
              Organizations must be registered before participating in procurement.
            </p>
            <CodeBlock
              language="json"
              code={`// POST /govchain.procurement.v1.Msg/RegisterEntity
{
  "@type": "/govchain.procurement.v1.MsgRegisterEntity",
  "creator": "cosmos1abc...",
  "organization": {
    "id": "PH-SEC-CS200901234",
    "name": "DPWH Region III",
    "identifier": {
      "scheme": "PH-SEC",
      "id": "CS200901234",
      "legal_name": "Department of Public Works and Highways - Region III"
    },
    "address": {
      "street_address": "DPWH Building, Dinalupihan",
      "locality": "Bataan",
      "region": "Central Luzon",
      "country_name": "Philippines"
    },
    "roles": ["procuringEntity", "buyer"]
  }
}`}
            />
            <CodeBlock
              language="typescript"
              code={`const msg = {
  typeUrl: "/govchain.procurement.v1.MsgRegisterEntity",
  value: {
    creator: account.address,
    organization: {
      id: "PH-SEC-CS200901234",
      name: "DPWH Region III",
      identifier: { scheme: "PH-SEC", id: "CS200901234",
        legalName: "Department of Public Works and Highways - Region III" },
      address: { streetAddress: "DPWH Building", locality: "Bataan",
        region: "Central Luzon", countryName: "Philippines" },
      roles: ["procuringEntity", "buyer"],
    },
  },
};
const result = await client.signAndBroadcast(account.address, [msg], "auto");`}
            />

            {/* Step 2: Create Process */}
            <Step n={2} title="Create a Contracting Process (Planning)" />
            <CodeBlock
              language="json"
              code={`// POST /govchain.procurement.v1.Msg/CreateProcess
{
  "@type": "/govchain.procurement.v1.MsgCreateProcess",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "buyer": {
    "id": "PH-SEC-CS200901234",
    "name": "DPWH Region III"
  },
  "planning": {
    "rationale": "Rehabilitation of national road segments in Bataan",
    "budget": {
      "description": "2024 GAA Infrastructure Fund",
      "amount": { "amount": "50000000", "currency": "PHP" }
    }
  },
  "parties": [
    { "id": "PH-SEC-CS200901234", "name": "DPWH Region III",
      "roles": ["buyer", "procuringEntity"] }
  ]
}`}
            />

            {/* Step 3: Publish Tender */}
            <Step n={3} title="Publish a Tender" />
            <CodeBlock
              language="json"
              code={`// POST /govchain.procurement.v1.Msg/PublishTender
{
  "@type": "/govchain.procurement.v1.MsgPublishTender",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "tender": {
    "id": "tender-001",
    "title": "Road Rehabilitation - Bataan Provincial Road",
    "status": "active",
    "procurement_method": "open",
    "main_procurement_category": "works",
    "value": { "amount": "50000000", "currency": "PHP" },
    "procuring_entity": { "id": "PH-SEC-CS200901234", "name": "DPWH Region III" },
    "tender_period": {
      "start_date": "2024-03-01T00:00:00Z",
      "end_date": "2024-04-01T00:00:00Z"
    },
    "items": [{
      "id": "item-001",
      "description": "Road rehabilitation works",
      "classification": { "scheme": "CPV", "id": "45233141" },
      "quantity": "12500",
      "unit": { "name": "meter", "scheme": "UNCEFACT", "id": "MTR" }
    }]
  }
}`}
            />

            {/* Step 4: Submit Award */}
            <Step n={4} title="Submit an Award" />
            <CodeBlock
              language="json"
              code={`// POST /govchain.procurement.v1.Msg/SubmitAward
{
  "@type": "/govchain.procurement.v1.MsgSubmitAward",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "award": {
    "id": "award-001",
    "title": "Award to ABC Construction Corp",
    "status": "active",
    "date": "2024-04-15T00:00:00Z",
    "value": { "amount": "47500000", "currency": "PHP" },
    "suppliers": [
      { "id": "PH-DTI-CONTRACTOR-001", "name": "ABC Construction Corp" }
    ]
  },
  "additional_parties": [
    { "id": "PH-DTI-CONTRACTOR-001", "name": "ABC Construction Corp",
      "roles": ["supplier"] }
  ]
}`}
            />

            {/* Step 5: Sign Contract */}
            <Step n={5} title="Sign a Contract" />
            <CodeBlock
              language="json"
              code={`// POST /govchain.procurement.v1.Msg/SignContract
{
  "@type": "/govchain.procurement.v1.MsgSignContract",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "contract": {
    "id": "contract-001",
    "award_id": "award-001",
    "title": "Contract for Road Rehabilitation - Bataan",
    "status": "active",
    "period": {
      "start_date": "2024-05-01T00:00:00Z",
      "end_date": "2024-12-31T00:00:00Z"
    },
    "value": { "amount": "47500000", "currency": "PHP" }
  }
}`}
            />

            {/* Step 6: Update Implementation */}
            <Step n={6} title="Update Implementation" />
            <CodeBlock
              language="json"
              code={`// POST /govchain.procurement.v1.Msg/UpdateImplementation
{
  "@type": "/govchain.procurement.v1.MsgUpdateImplementation",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "contract_id": "contract-001",
  "implementation": {
    "transactions": [{
      "id": "tx-disbursement-001",
      "date": "2024-06-01T00:00:00Z",
      "value": { "amount": "10000000", "currency": "PHP" },
      "payer": { "id": "PH-SEC-CS200901234", "name": "DPWH Region III" },
      "payee": { "id": "PH-DTI-CONTRACTOR-001", "name": "ABC Construction Corp" }
    }],
    "milestones": [{
      "id": "milestone-001",
      "title": "Site Preparation Complete",
      "type": "delivery",
      "status": "met",
      "date_met": "2024-06-15T00:00:00Z"
    }]
  }
}`}
            />

            {/* Queries */}
            <h3 className="text-lg font-semibold pt-4 border-t">
              Query Procurement Data
            </h3>
            <p className="text-sm text-muted-foreground">
              All queries are read-only GET requests -- <strong>no authentication required</strong>.
            </p>
            <CodeBlock
              language="bash"
              code={`# List all contracting processes
curl "$API/govchain/procurement/v1/process?pagination.limit=10"

# Get a single process by OCID
curl "$API/govchain/procurement/v1/process/ocds-abc123-ph-dpwh-2024-0001"

# List releases for an OCID
curl "$API/govchain/procurement/v1/releases/ocds-abc123-ph-dpwh-2024-0001"

# Get a specific release
curl "$API/govchain/procurement/v1/release/ocds-abc123-ph-dpwh-2024-0001/release-001"

# Search active tenders
curl "$API/govchain/procurement/v1/tenders?pagination.limit=20"

# Get entity details
curl "$API/govchain/procurement/v1/entity/PH-SEC-CS200901234"

# List all registered entities
curl "$API/govchain/procurement/v1/entity?pagination.limit=50"

# OCDS Release Package (standard format)
curl "$API/govchain/procurement/v1/ocds/releases/ocds-abc123-ph-dpwh-2024-0001"

# OCDS Record Package (compiled view)
curl "$API/govchain/procurement/v1/ocds/records/ocds-abc123-ph-dpwh-2024-0001"

# Module parameters
curl "$API/govchain/procurement/v1/params"`}
            />
          </Section>

          {/* ============================================================= */}
          {/* Infrastructure Module */}
          {/* ============================================================= */}
          <Section
            id="infrastructure"
            title="Infrastructure Module (OC4IDS)"
            icon={Layers}
          >
            <p className="text-sm text-muted-foreground">
              Implements the{" "}
              <strong>
                Open Contracting for Infrastructure Data Standard (OC4IDS)
              </strong>{" "}
              on-chain.
            </p>

            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <Badge variant="outline">Create Project</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Update Project</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Update Progress</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Attach Docs</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="outline">Link Procurement</Badge>
            </div>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="text-sm font-semibold mb-1">Authorization</div>
                <p className="text-xs text-muted-foreground">
                  The <code>creator</code> of <code>CreateProject</code> becomes the project <strong>owner</strong>. Only the owner or addresses in <code>authorized_publishers</code> can update the project, attach documents, record progress, or link contracting processes.
                </p>
              </CardContent>
            </Card>

            {/* Create Project */}
            <Step n={1} title="Create a Project" />
            <CodeBlock
              language="json"
              code={`// POST /govchain.infrastructure.v1.Msg/CreateProject
{
  "@type": "/govchain.infrastructure.v1.MsgCreateProject",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "title": "Bataan Provincial Road Rehabilitation",
  "description": "Complete rehabilitation of 12.5km provincial road",
  "status": "preparation",
  "project_type": "rehabilitation",
  "sector": ["transport", "transport.road"],
  "purpose": "Improve connectivity in Bataan province",
  "budget": {
    "amount": { "amount": "50000000", "currency": "PHP" }
  },
  "period": {
    "start_date": "2024-05-01T00:00:00Z",
    "end_date": "2025-05-01T00:00:00Z"
  },
  "locations": [{
    "description": "Dinalupihan-Hermosa Road, Bataan",
    "geometry": { "type": "Point", "coordinates": ["120.4632", "14.8645"] },
    "gazetteer": { "scheme": "PSGC", "identifiers": ["030800000"] }
  }],
  "parties": [
    { "id": "PH-SEC-CS200901234", "name": "DPWH Region III",
      "roles": ["publicAuthority", "procuringEntity"] }
  ],
  "public_authority": { "id": "PH-SEC-CS200901234", "name": "DPWH Region III" }
}`}
            />
            <CodeBlock
              language="typescript"
              code={`const msg = {
  typeUrl: "/govchain.infrastructure.v1.MsgCreateProject",
  value: {
    creator: account.address,
    projectId: "oc4ids-ph-dpwh-2024-infra-0001",
    title: "Bataan Provincial Road Rehabilitation",
    description: "Complete rehabilitation of 12.5km provincial road",
    status: "preparation",
    projectType: "rehabilitation",
    sector: ["transport", "transport.road"],
    purpose: "Improve connectivity in Bataan province",
    budget: { amount: { amount: "50000000", currency: "PHP" } },
    period: { startDate: "2024-05-01T00:00:00Z", endDate: "2025-05-01T00:00:00Z" },
    locations: [{
      description: "Dinalupihan-Hermosa Road, Bataan",
      geometry: { type: "Point", coordinates: ["120.4632", "14.8645"] },
    }],
    parties: [{ id: "PH-SEC-CS200901234", name: "DPWH Region III",
      roles: ["publicAuthority", "procuringEntity"] }],
    publicAuthority: { id: "PH-SEC-CS200901234", name: "DPWH Region III" },
  },
};
const result = await client.signAndBroadcast(account.address, [msg], "auto");`}
            />

            {/* Update Project */}
            <Step n={2} title="Update a Project" />
            <p className="text-sm text-muted-foreground">
              Only non-empty fields are updated (partial update). Empty strings
              and empty arrays are skipped.
            </p>
            <CodeBlock
              language="json"
              code={`// POST /govchain.infrastructure.v1.Msg/UpdateProject
{
  "@type": "/govchain.infrastructure.v1.MsgUpdateProject",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "status": "implementation",
  "title": "",
  "description": "",
  "project_type": "",
  "sector": [],
  "purpose": ""
}`}
            />

            {/* Update Progress */}
            <Step n={3} title="Update Progress (Metrics)" />
            <p className="text-sm text-muted-foreground">
              New metrics are appended; existing metrics (matching <code>id</code>) have their observations merged.
            </p>
            <CodeBlock
              language="json"
              code={`// POST /govchain.infrastructure.v1.Msg/UpdateProgress
{
  "@type": "/govchain.infrastructure.v1.MsgUpdateProgress",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "metrics": [
    {
      "id": "physical-progress",
      "title": "Physical Progress",
      "observations": [{
        "id": "obs-2024-06",
        "measure": "35",
        "unit": { "name": "percent", "scheme": "UNCEFACT", "id": "P1" },
        "period": {
          "start_date": "2024-06-01T00:00:00Z",
          "end_date": "2024-06-30T00:00:00Z"
        },
        "note": "Subgrade and drainage works completed for first 4km"
      }]
    },
    {
      "id": "financial-progress",
      "title": "Financial Disbursement",
      "observations": [{
        "id": "obs-fin-2024-06",
        "measure": "10000000",
        "unit": { "name": "Philippine Peso", "scheme": "UNCEFACT", "id": "PHP" },
        "note": "First disbursement for mobilization and earthworks"
      }]
    }
  ]
}`}
            />

            {/* Attach Document */}
            <Step n={4} title="Attach a Document" />
            <CodeBlock
              language="json"
              code={`// POST /govchain.infrastructure.v1.Msg/AttachDocument
{
  "@type": "/govchain.infrastructure.v1.MsgAttachDocument",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "document": {
    "id": "doc-eia-001",
    "document_type": "environmentalImpact",
    "title": "Environmental Impact Assessment",
    "url": "https://dpwh.gov.ph/eia/2024-0001.pdf",
    "format": "application/pdf",
    "language": "en",
    "ipfs_cid": "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy"
  }
}`}
            />

            {/* Link Contracting Process */}
            <Step n={5} title="Link a Contracting Process" />
            <p className="text-sm text-muted-foreground">
              Link an OCDS procurement process to the infrastructure project, creating the OC4IDS-to-OCDS bridge.
            </p>
            <CodeBlock
              language="json"
              code={`// POST /govchain.infrastructure.v1.Msg/LinkContractingProcess
{
  "@type": "/govchain.infrastructure.v1.MsgLinkContractingProcess",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "contracting_process": {
    "ocid": "ocds-abc123-ph-dpwh-2024-0001",
    "summary": {
      "tender": {
        "procurement_method": "open",
        "procurement_method_details": "Public Bidding per RA 9184",
        "status": "complete"
      },
      "contract": {
        "status": "active",
        "value": { "amount": "47500000", "currency": "PHP" }
      }
    }
  }
}`}
            />

            {/* Queries */}
            <h3 className="text-lg font-semibold pt-4 border-t">
              Query Infrastructure Data
            </h3>
            <CodeBlock
              language="bash"
              code={`# List all projects
curl "$API/govchain/infrastructure/v1/project?pagination.limit=10"

# Get a single project
curl "$API/govchain/infrastructure/v1/project/oc4ids-ph-dpwh-2024-infra-0001"

# Filter by sector
curl "$API/govchain/infrastructure/v1/projects_by_sector/transport"

# Filter by status (identification|preparation|implementation|completion|cancelled)
curl "$API/govchain/infrastructure/v1/projects_by_status/implementation"

# Filter by region
curl "$API/govchain/infrastructure/v1/projects_by_region/Central%20Luzon"

# Module parameters
curl "$API/govchain/infrastructure/v1/params"`}
            />
          </Section>

          {/* ============================================================= */}
          {/* Pagination */}
          {/* ============================================================= */}
          <Section id="pagination" title="REST API Pagination" icon={Search}>
            <p className="text-sm text-muted-foreground">
              All list endpoints support standard Cosmos SDK pagination.
            </p>
            <CodeBlock
              language="bash"
              code={`# First page
curl "$API/govchain/procurement/v1/process?pagination.limit=10"

# Next page (use next_key from previous response)
curl "$API/govchain/procurement/v1/process?pagination.limit=10&pagination.key=<next_key>"

# Reverse order (newest first)
curl "$API/govchain/procurement/v1/process?pagination.limit=10&pagination.reverse=true"

# Count total (slower -- adds query overhead)
curl "$API/govchain/procurement/v1/process?pagination.count_total=true"

# Offset-based alternative
curl "$API/govchain/procurement/v1/process?pagination.offset=20&pagination.limit=10"`}
            />
            <p className="text-sm text-muted-foreground">
              Response pagination block:
            </p>
            <CodeBlock
              language="json"
              code={`{
  "pagination": {
    "next_key": "base64-encoded-key-or-null",
    "total": "0"
  }
}`}
            />
            <p className="text-xs text-muted-foreground">
              <code>total</code> is only populated when{" "}
              <code>count_total=true</code>.
            </p>
          </Section>

          {/* ============================================================= */}
          {/* Events */}
          {/* ============================================================= */}
          <Section
            id="events"
            title="Events & WebSocket Subscriptions"
            icon={Radio}
          >
            <p className="text-sm text-muted-foreground">
              Subscribe to real-time events via CometBFT WebSocket at{" "}
              <code>ws://localhost:26657/websocket</code>.
            </p>
            <CodeBlock
              language="bash"
              code={`# Connect with wscat
wscat -c ws://localhost:26657/websocket`}
            />
            <h3 className="text-base font-semibold">Subscribe to Events</h3>
            <CodeBlock
              language="json"
              code={`// All procurement releases
{ "jsonrpc": "2.0", "method": "subscribe", "id": "1",
  "params": { "query": "release_submitted.ocid EXISTS" } }

// All infrastructure project creations
{ "jsonrpc": "2.0", "method": "subscribe", "id": "2",
  "params": { "query": "project_created.project_id EXISTS" } }

// Specific OCID only
{ "jsonrpc": "2.0", "method": "subscribe", "id": "3",
  "params": { "query": "release_submitted.ocid='ocds-abc123-ph-dpwh-2024-0001'" } }`}
            />

            <h3 className="text-base font-semibold">Event Reference</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Procurement
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      {[
                        ["release_submitted", "ocid, release_id, publisher"],
                        ["process_created", "ocid, publisher, stage"],
                        ["tender_published", "ocid, tender_id, publisher"],
                        ["award_made", "ocid, award_id, publisher"],
                        ["contract_signed", "ocid, contract_id, publisher"],
                        ["implementation_updated", "ocid, contract_id, publisher"],
                        ["entity_registered", "entity_id, name, registrar"],
                      ].map(([event, attrs]) => (
                        <tr key={event} className="border-b last:border-b-0">
                          <td className="px-2 py-1.5 font-mono font-medium">
                            {event}
                          </td>
                          <td className="px-2 py-1.5 text-muted-foreground">
                            {attrs}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Infrastructure
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      {[
                        ["project_created", "project_id, title, status, publisher"],
                        ["project_updated", "project_id, status, publisher"],
                        ["progress_updated", "project_id, metric_id, measure, publisher"],
                        ["document_attached", "project_id, document_id, document_type, publisher"],
                      ].map(([event, attrs]) => (
                        <tr key={event} className="border-b last:border-b-0">
                          <td className="px-2 py-1.5 font-mono font-medium">
                            {event}
                          </td>
                          <td className="px-2 py-1.5 text-muted-foreground">
                            {attrs}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          {/* ============================================================= */}
          {/* Error Handling */}
          {/* ============================================================= */}
          <Section
            id="errors"
            title="Error Handling"
            icon={AlertTriangle}
          >
            <h3 className="text-base font-semibold">Common Error Codes</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground w-16">
                      Code
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                      Meaning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["4", "ErrUnauthorized", "Signer is not the owner or authorized publisher"],
                    ["5", "ErrInvalidAddress", "Malformed bech32 address"],
                    ["18", "ErrInvalidRequest", "Missing required field or invalid data"],
                    ["11", "ErrOutOfGas", "Transaction ran out of gas"],
                    ["32", "ErrWrongSequence", "Account sequence mismatch (retry with correct sequence)"],
                  ].map(([code, name, desc]) => (
                    <tr key={code} className="border-b last:border-b-0">
                      <td className="px-3 py-2 font-mono">{code}</td>
                      <td className="px-3 py-2 font-mono text-xs">{name}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-semibold">Module-Specific Errors</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-sm font-semibold mb-2">Procurement</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li><code>ErrInvalidOCID</code> -- OCID is empty or malformed</li>
                    <li><code>ErrProcessAlreadyExists</code> -- Duplicate OCID</li>
                    <li><code>ErrProcessNotFound</code> -- OCID not found</li>
                    <li><code>ErrUnauthorizedPublisher</code> -- Not in authorized list</li>
                    <li><code>ErrEntityAlreadyExists</code> -- Duplicate entity ID</li>
                    <li><code>ErrEntityNotFound</code> -- Entity not found</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="text-sm font-semibold mb-2">Infrastructure</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li><code>ErrInvalidProjectID</code> -- Project ID is empty</li>
                    <li><code>ErrProjectAlreadyExists</code> -- Duplicate project ID</li>
                    <li><code>ErrProjectNotFound</code> -- Project not found</li>
                    <li><code>ErrUnauthorizedPublisher</code> -- Not in authorized list</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-base font-semibold">Response Format</h3>
            <p className="text-sm text-muted-foreground">
              A transaction <code>code</code> of <code>0</code> means success.
              Any non-zero code indicates failure.
            </p>
            <CodeBlock
              language="json"
              code={`// REST query error (Google RPC status)
{ "code": 3, "message": "invalid OCID: OCID cannot be empty", "details": [] }

// Transaction broadcast error
{ "tx_response": {
    "code": 18,
    "raw_log": "invalid request: release cannot be nil",
    "txhash": "ABC123...",
    "height": "0"
}}`}
            />

            <h3 className="text-base font-semibold">
              Handling Sequence Errors
            </h3>
            <p className="text-sm text-muted-foreground">
              If you get <code>ErrWrongSequence</code>, re-fetch the account
              sequence and retry:
            </p>
            <CodeBlock
              language="bash"
              code={`curl "$API/cosmos/auth/v1beta1/accounts/cosmos1abc..."`}
            />
            <CodeBlock
              language="typescript"
              code={`// CosmJS handles this automatically with "auto" gas.
// For manual signing, fetch the latest sequence:
const account = await client.getAccount(address);
// account.sequence => next expected sequence number`}
            />
          </Section>

          {/* ============================================================= */}
          {/* Dataset Portal */}
          {/* ============================================================= */}
          <Section
            id="dataset-portal"
            title="Dataset Portal"
            icon={Database}
          >
            <p className="text-sm text-muted-foreground">
              Upload, discover, and access government datasets stored on the
              blockchain. Use the tabs below to browse existing datasets or
              upload new ones.
            </p>

            <Tabs defaultValue="datasets" className="w-full">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="datasets">Browse Datasets</TabsTrigger>
                <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <UploadSection />
              </TabsContent>

              <TabsContent value="datasets" className="mt-6">
                <DatasetList />
              </TabsContent>
            </Tabs>
          </Section>
        </div>
      </main>
    </div>
  );
}
