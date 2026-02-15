"use client";

import { CodeBlock, PageNavigation } from "../components";

export default function ChainConfigPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Chain Configuration</h1>

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

      <PageNavigation currentPath="/developer-guide/chain-config" />
    </>
  );
}
