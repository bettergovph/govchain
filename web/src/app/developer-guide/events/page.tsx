"use client";

import { CodeBlock, PageNavigation } from "../components";

export default function EventsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Events &amp; WebSocket Subscriptions</h1>

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

      <PageNavigation currentPath="/developer-guide/events" />
    </>
  );
}
