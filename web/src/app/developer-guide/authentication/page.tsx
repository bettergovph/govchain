"use client";

import { CodeBlock, PageNavigation } from "../components";

export default function AuthenticationPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Authentication &amp; Key Management</h1>

      <p className="text-sm text-muted-foreground">
        GovChain uses <strong>cryptographic key-based authentication</strong>.
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

      <PageNavigation currentPath="/developer-guide/authentication" />
    </>
  );
}
