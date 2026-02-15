"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { CodeBlock, PageNavigation } from "../components";

export default function TransactionsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Transaction Lifecycle</h1>

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

      <PageNavigation currentPath="/developer-guide/transactions" />
    </>
  );
}
