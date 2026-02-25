"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock, PageNavigation } from "../components";

export default function ErrorsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Error Handling</h1>

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

      <PageNavigation currentPath="/developer-guide/errors" />
    </>
  );
}
