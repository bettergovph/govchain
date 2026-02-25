"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { CodeBlock, Step, PageNavigation } from "../components";

export default function ProcurementPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Procurement Module (OCDS)</h1>

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

      <PageNavigation currentPath="/developer-guide/procurement" />
    </>
  );
}
