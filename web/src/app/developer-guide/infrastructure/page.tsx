"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { CodeBlock, Step, PageNavigation } from "../components";

export default function InfrastructurePage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Infrastructure Module (OC4IDS)</h1>

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

      <PageNavigation currentPath="/developer-guide/infrastructure" />
    </>
  );
}
