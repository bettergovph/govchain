# GovChain Developer Guide

A practical guide for integrating with the GovChain blockchain's **Procurement (OCDS)** and **Infrastructure (OC4IDS)** modules. Covers authentication, querying data via REST, submitting transactions via CLI, REST broadcast, and CosmJS.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Chain Configuration](#chain-configuration)
3. [Authentication & Key Management](#authentication--key-management)
4. [Transaction Lifecycle](#transaction-lifecycle)
5. [Procurement Module (OCDS)](#procurement-module-ocds)
   - [Register an Entity](#1-register-an-entity)
   - [Create a Contracting Process](#2-create-a-contracting-process)
   - [Publish a Tender](#3-publish-a-tender)
   - [Submit an Award](#4-submit-an-award)
   - [Sign a Contract](#5-sign-a-contract)
   - [Update Implementation](#6-update-implementation)
   - [Submit a Full Release](#submit-a-full-release)
   - [Query Procurement Data](#query-procurement-data)
6. [Infrastructure Module (OC4IDS)](#infrastructure-module-oc4ids)
   - [Create a Project](#1-create-a-project)
   - [Update a Project](#2-update-a-project)
   - [Update Progress (Metrics)](#3-update-progress-metrics)
   - [Attach a Document](#4-attach-a-document)
   - [Link a Contracting Process](#5-link-a-contracting-process)
   - [Query Infrastructure Data](#query-infrastructure-data)
7. [REST API Pagination](#rest-api-pagination)
8. [Events & WebSocket Subscriptions](#events--websocket-subscriptions)
9. [Error Handling](#error-handling)

---

## Prerequisites

- A running `govchaind` node (local or remote)
- For CLI usage: the `govchaind` binary built and available in your PATH
- For programmatic access: Node.js 18+ with `@cosmjs/stargate` and `@cosmjs/proto-signing`

```bash
# Build the binary
cd govchaind
make install

# Or with Ignite CLI
ignite chain build
```

---

## Chain Configuration

| Setting | Value |
|---|---|
| **Chain ID** | `govchain` |
| **Address Prefix** | `cosmos` (bech32) |
| **RPC Endpoint** | `http://localhost:26657` |
| **REST (LCD) Endpoint** | `http://localhost:1317` |
| **gRPC Endpoint** | `localhost:9090` |
| **Default Denom** | `stake` |
| **Gas Price** | `0.025stake` |

All REST examples below assume `API=http://localhost:1317`. Adjust as needed for your environment.

---

## Authentication & Key Management

GovChain uses **Cosmos SDK standard authentication**. Every state-changing transaction must be signed by a private key. There are no API keys or bearer tokens -- identity is a cryptographic keypair.

### Create a Key (CLI)

```bash
# Create a new key (stores in local keyring)
govchaind keys add alice --keyring-backend test

# Output includes:
#   address:  cosmos1abc...
#   mnemonic: word1 word2 word3 ... word24

# List keys
govchaind keys list --keyring-backend test

# Show a specific key's address
govchaind keys show alice -a --keyring-backend test
```

### Create a Key (CosmJS / TypeScript)

```typescript
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

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
);
```

### Fund an Account

On a test network, transfer tokens from a funded genesis account:

```bash
govchaind tx bank send \
  validator alice 1000000stake \
  --chain-id govchain \
  --keyring-backend test \
  --gas auto --gas-adjustment 1.5 \
  --yes
```

### Check Balance

```bash
# CLI
govchaind query bank balances $(govchaind keys show alice -a --keyring-backend test)

# REST
curl "$API/cosmos/bank/v1beta1/balances/cosmos1abc..."
```

---

## Transaction Lifecycle

Every write operation follows this flow:

```
1. Construct message  -->  2. Sign transaction  -->  3. Broadcast  -->  4. Wait for inclusion
```

### Method A: CLI (simplest)

The CLI handles message construction, signing, and broadcast in one command:

```bash
govchaind tx <module> <command> [args...] \
  --from <key-name> \
  --chain-id govchain \
  --keyring-backend test \
  --gas auto --gas-adjustment 1.5 \
  --yes
```

### Method B: REST Broadcast

Use this when your application cannot connect to the RPC port (26657) directly but can reach the REST API (1317), or when you want full control over the signing step.

#### Step 1: Create the signed transaction

**Option 1 -- CLI `--generate-only` + sign offline:**

```bash
# 1a. Generate the unsigned transaction JSON
govchaind tx procurement create-process \
  --ocid ocds-abc123-ph-dpwh-2024-0001 \
  --from alice \
  --chain-id govchain \
  --keyring-backend test \
  --gas 200000 \
  --fees 500stake \
  --generate-only > unsigned_tx.json

# 1b. Sign the transaction (produces signed JSON)
govchaind tx sign unsigned_tx.json \
  --from alice \
  --chain-id govchain \
  --keyring-backend test > signed_tx.json

# 1c. Encode to base64 for the REST broadcast endpoint
govchaind tx encode signed_tx.json > tx_bytes_b64.txt

# 1d. Broadcast
curl -X POST "$API/cosmos/tx/v1beta1/txs" \
  -H "Content-Type: application/json" \
  -d "{
    \"tx_bytes\": \"$(cat tx_bytes_b64.txt)\",
    \"mode\": \"BROADCAST_MODE_SYNC\"
  }"
```

**Option 2 -- CosmJS sign offline, broadcast via REST:**

```typescript
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

// 1. Create wallet from mnemonic (offline -- no network needed)
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
  prefix: "cosmos",
});
const [account] = await wallet.getAccounts();

// 2. Connect a signing client (needs RPC only for account sequence lookup)
const client = await SigningStargateClient.connectWithSigner(
  "http://localhost:26657",
  wallet,
  { gasPrice: GasPrice.fromString("0.025stake") }
);

// 3. Sign the transaction (does NOT broadcast yet)
const msg = {
  typeUrl: "/govchain.procurement.v1.MsgCreateProcess",
  value: {
    creator: account.address,
    ocid: "ocds-abc123-ph-dpwh-2024-0001",
    // ... other fields
  },
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
  throw new Error(`Tx failed: ${result.tx_response.raw_log}`);
}
console.log("Tx Hash:", result.tx_response.txhash);
```

> **Tip:** If you cannot reach the RPC port at all, you can skip `SigningStargateClient` and fetch the account number and sequence from the REST API at `/cosmos/auth/v1beta1/accounts/{address}` instead. Then use `wallet.signDirect()` with a manually constructed `SignDoc`. See the CosmJS docs for `makeSignDoc`.

#### Step 2: Broadcast

POST the base64 bytes to the REST endpoint:

```bash
curl -X POST "$API/cosmos/tx/v1beta1/txs" \
  -H "Content-Type: application/json" \
  -d '{
    "tx_bytes": "<base64-encoded-signed-tx>",
    "mode": "BROADCAST_MODE_SYNC"
  }'
```

Broadcast modes:
- `BROADCAST_MODE_SYNC` -- waits for CheckTx (validates format and signature), returns immediately
- `BROADCAST_MODE_ASYNC` -- returns immediately without any check
- `BROADCAST_MODE_BLOCK` -- waits for the tx to be included in a block (slowest but confirms success)

### Method C: CosmJS SignAndBroadcast

```typescript
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
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
console.log("Height:", result.height);
```

---

## Procurement Module (OCDS)

The procurement module implements the **Open Contracting Data Standard (OCDS)** lifecycle:

```
Register Entity --> Create Process (planning) --> Publish Tender --> Submit Award --> Sign Contract --> Update Implementation
```

Each step creates an immutable **Release** on-chain, tagged with the lifecycle stage. Releases for the same OCID are aggregated into a **Contracting Process** (compiled view).

### Authorization Model

- **Process Owner**: The `creator` of a `CreateProcess` transaction becomes the process owner
- **Authorized Publishers**: Only the owner or addresses in `authorized_publishers` can publish subsequent releases (tender, award, contract, implementation)
- **Entity Registrar**: Only the original registrar of an entity can update it

---

### 1. Register an Entity

Organizations must be registered before participating in procurement.

#### CLI

```bash
# Currently via raw JSON transaction (no dedicated CLI subcommand yet)
govchaind tx procurement register-entity \
  --from alice \
  --chain-id govchain \
  --keyring-backend test \
  --gas auto --gas-adjustment 1.5 \
  --yes
```

#### REST (Broadcast signed tx)

**Message type**: `/govchain.procurement.v1.Msg/RegisterEntity`

```json
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
      "postal_code": "2110",
      "country_name": "Philippines"
    },
    "contact_point": {
      "name": "BAC Secretariat",
      "email": "bac-r3@dpwh.gov.ph",
      "telephone": "+63-47-123-4567"
    },
    "roles": ["procuringEntity", "buyer"]
  }
}
```

#### CosmJS

```typescript
const msg = {
  typeUrl: "/govchain.procurement.v1.MsgRegisterEntity",
  value: {
    creator: account.address,
    organization: {
      id: "PH-SEC-CS200901234",
      name: "DPWH Region III",
      identifier: {
        scheme: "PH-SEC",
        id: "CS200901234",
        legalName: "Department of Public Works and Highways - Region III",
      },
      address: {
        streetAddress: "DPWH Building, Dinalupihan",
        locality: "Bataan",
        region: "Central Luzon",
        postalCode: "2110",
        countryName: "Philippines",
      },
      contactPoint: {
        name: "BAC Secretariat",
        email: "bac-r3@dpwh.gov.ph",
        telephone: "+63-47-123-4567",
      },
      roles: ["procuringEntity", "buyer"],
    },
  },
};

const result = await client.signAndBroadcast(account.address, [msg], "auto");
// result.transactionHash => tx hash
```

#### Response

```json
{
  "entity_id": "PH-SEC-CS200901234"
}
```

---

### 2. Create a Contracting Process

Initiates a new contracting process at the **planning** stage.

#### REST Message

```json
{
  "@type": "/govchain.procurement.v1.MsgCreateProcess",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "buyer": {
    "id": "PH-SEC-CS200901234",
    "name": "DPWH Region III"
  },
  "planning": {
    "rationale": "Rehabilitation of national road segments in Bataan province",
    "budget": {
      "description": "2024 GAA Infrastructure Fund",
      "amount": {
        "amount": "50000000",
        "currency": "PHP"
      }
    }
  },
  "parties": [
    {
      "id": "PH-SEC-CS200901234",
      "name": "DPWH Region III",
      "roles": ["buyer", "procuringEntity"]
    }
  ]
}
```

#### CosmJS

```typescript
const msg = {
  typeUrl: "/govchain.procurement.v1.MsgCreateProcess",
  value: {
    creator: account.address,
    ocid: "ocds-abc123-ph-dpwh-2024-0001",
    buyer: {
      id: "PH-SEC-CS200901234",
      name: "DPWH Region III",
    },
    planning: {
      rationale: "Rehabilitation of national road segments in Bataan province",
      budget: {
        description: "2024 GAA Infrastructure Fund",
        amount: { amount: "50000000", currency: "PHP" },
      },
    },
    parties: [
      {
        id: "PH-SEC-CS200901234",
        name: "DPWH Region III",
        roles: ["buyer", "procuringEntity"],
      },
    ],
  },
};

const result = await client.signAndBroadcast(account.address, [msg], "auto");
```

#### Response

```json
{
  "ocid": "ocds-abc123-ph-dpwh-2024-0001"
}
```

---

### 3. Publish a Tender

Transitions the process to the **tender** stage.

#### REST Message

```json
{
  "@type": "/govchain.procurement.v1.MsgPublishTender",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "tender": {
    "id": "tender-001",
    "title": "Road Rehabilitation - Bataan Provincial Road",
    "description": "Rehabilitation of 12.5km road segment...",
    "status": "active",
    "procurement_method": "open",
    "main_procurement_category": "works",
    "value": {
      "amount": "50000000",
      "currency": "PHP"
    },
    "min_value": {
      "amount": "40000000",
      "currency": "PHP"
    },
    "procuring_entity": {
      "id": "PH-SEC-CS200901234",
      "name": "DPWH Region III"
    },
    "tender_period": {
      "start_date": "2024-03-01T00:00:00Z",
      "end_date": "2024-04-01T00:00:00Z"
    },
    "award_criteria": "priceOnly",
    "submission_method": ["electronicSubmission"],
    "items": [
      {
        "id": "item-001",
        "description": "Road rehabilitation works",
        "classification": {
          "scheme": "CPV",
          "id": "45233141",
          "description": "Road maintenance works"
        },
        "quantity": "12500",
        "unit": {
          "name": "meter",
          "scheme": "UNCEFACT",
          "id": "MTR"
        }
      }
    ],
    "documents": [
      {
        "id": "doc-bid-001",
        "document_type": "biddingDocuments",
        "title": "Bidding Documents",
        "url": "https://philgeps.gov.ph/docs/bid-001.pdf",
        "format": "application/pdf",
        "language": "en"
      }
    ]
  },
  "additional_parties": [
    {
      "id": "PH-DTI-CONTRACTOR-001",
      "name": "ABC Construction Corp",
      "roles": ["tenderer"]
    }
  ]
}
```

#### CosmJS

```typescript
const msg = {
  typeUrl: "/govchain.procurement.v1.MsgPublishTender",
  value: {
    creator: account.address,
    ocid: "ocds-abc123-ph-dpwh-2024-0001",
    tender: {
      id: "tender-001",
      title: "Road Rehabilitation - Bataan Provincial Road",
      status: "active",
      procurementMethod: "open",
      mainProcurementCategory: "works",
      value: { amount: "50000000", currency: "PHP" },
      procuringEntity: { id: "PH-SEC-CS200901234", name: "DPWH Region III" },
      tenderPeriod: {
        startDate: "2024-03-01T00:00:00Z",
        endDate: "2024-04-01T00:00:00Z",
      },
      items: [
        {
          id: "item-001",
          description: "Road rehabilitation works",
          classification: {
            scheme: "CPV",
            id: "45233141",
            description: "Road maintenance works",
          },
          quantity: "12500",
          unit: { name: "meter", scheme: "UNCEFACT", id: "MTR" },
        },
      ],
    },
  },
};

const result = await client.signAndBroadcast(account.address, [msg], "auto");
```

---

### 4. Submit an Award

Records the award decision.

#### REST Message

```json
{
  "@type": "/govchain.procurement.v1.MsgSubmitAward",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "award": {
    "id": "award-001",
    "title": "Award to ABC Construction Corp",
    "status": "active",
    "date": "2024-04-15T00:00:00Z",
    "value": {
      "amount": "47500000",
      "currency": "PHP"
    },
    "suppliers": [
      {
        "id": "PH-DTI-CONTRACTOR-001",
        "name": "ABC Construction Corp"
      }
    ],
    "items": [
      {
        "id": "item-001",
        "description": "Road rehabilitation works",
        "quantity": "12500",
        "unit": {
          "name": "meter",
          "scheme": "UNCEFACT",
          "id": "MTR",
          "value": { "amount": "3800", "currency": "PHP" }
        }
      }
    ]
  },
  "additional_parties": [
    {
      "id": "PH-DTI-CONTRACTOR-001",
      "name": "ABC Construction Corp",
      "roles": ["supplier"]
    }
  ]
}
```

---

### 5. Sign a Contract

Records the contract signing.

#### REST Message

```json
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
    "value": {
      "amount": "47500000",
      "currency": "PHP"
    },
    "items": [
      {
        "id": "item-001",
        "description": "Road rehabilitation works",
        "quantity": "12500"
      }
    ],
    "documents": [
      {
        "id": "doc-contract-001",
        "document_type": "contractSigned",
        "title": "Signed Contract",
        "url": "https://dpwh.gov.ph/contracts/2024-0001.pdf"
      }
    ]
  }
}
```

---

### 6. Update Implementation

Records implementation progress -- transactions, milestones, and documents.

#### REST Message

```json
{
  "@type": "/govchain.procurement.v1.MsgUpdateImplementation",
  "creator": "cosmos1abc...",
  "ocid": "ocds-abc123-ph-dpwh-2024-0001",
  "contract_id": "contract-001",
  "implementation": {
    "transactions": [
      {
        "id": "tx-disbursement-001",
        "source": "https://dbm.gov.ph/saro/2024-001",
        "date": "2024-06-01T00:00:00Z",
        "value": {
          "amount": "10000000",
          "currency": "PHP"
        },
        "payer": {
          "id": "PH-SEC-CS200901234",
          "name": "DPWH Region III"
        },
        "payee": {
          "id": "PH-DTI-CONTRACTOR-001",
          "name": "ABC Construction Corp"
        }
      }
    ],
    "milestones": [
      {
        "id": "milestone-001",
        "title": "Site Preparation Complete",
        "type": "delivery",
        "status": "met",
        "date_met": "2024-06-15T00:00:00Z"
      }
    ],
    "documents": [
      {
        "id": "doc-progress-001",
        "document_type": "physicalProgressReport",
        "title": "Monthly Progress Report - June 2024",
        "url": "https://dpwh.gov.ph/reports/prog-june-2024.pdf"
      }
    ]
  }
}
```

---

### Submit a Full Release

For advanced use, submit a complete OCDS release directly (bypasses the step-by-step helpers):

#### REST Message

```json
{
  "@type": "/govchain.procurement.v1.MsgSubmitRelease",
  "creator": "cosmos1abc...",
  "release": {
    "ocid": "ocds-abc123-ph-dpwh-2024-0002",
    "id": "release-001",
    "tag": ["planning"],
    "initiation_type": "tender",
    "language": "en",
    "parties": [],
    "buyer": { "id": "PH-SEC-CS200901234", "name": "DPWH" },
    "planning": {
      "rationale": "Bridge construction project",
      "budget": {
        "amount": { "amount": "200000000", "currency": "PHP" }
      }
    }
  }
}
```

The chain automatically:
- Sets `publisher_address`, `block_height`, `tx_hash`, and `chain_timestamp`
- Creates or updates the corresponding `ContractingProcess`
- Derives the lifecycle stage from the `tag` field

---

### Query Procurement Data

All queries are read-only GET requests -- **no authentication required**.

#### List All Contracting Processes

```bash
curl "$API/govchain/procurement/v1/process?pagination.limit=10"
```

```json
{
  "process": [
    {
      "ocid": "ocds-abc123-ph-dpwh-2024-0001",
      "compiled_release": { ... },
      "release_ids": ["...-planning-001", "...-tender-tender-001"],
      "current_stage": "tender",
      "owner": "cosmos1abc..."
    }
  ],
  "pagination": {
    "next_key": "...",
    "total": "42"
  }
}
```

#### Get a Single Process

```bash
curl "$API/govchain/procurement/v1/process/ocds-abc123-ph-dpwh-2024-0001"
```

#### List Releases for an OCID

```bash
curl "$API/govchain/procurement/v1/releases/ocds-abc123-ph-dpwh-2024-0001"
```

#### Get a Specific Release

```bash
curl "$API/govchain/procurement/v1/release/ocds-abc123-ph-dpwh-2024-0001/release-001"
```

#### Search Active Tenders

```bash
curl "$API/govchain/procurement/v1/tenders?pagination.limit=20"
```

#### Get Entity Details

```bash
curl "$API/govchain/procurement/v1/entity/PH-SEC-CS200901234"
```

#### List All Entities

```bash
curl "$API/govchain/procurement/v1/entity?pagination.limit=50"
```

#### Get OCDS Release Package

Returns data in the standard **OCDS Release Package** format:

```bash
curl "$API/govchain/procurement/v1/ocds/releases/ocds-abc123-ph-dpwh-2024-0001"
```

#### Get OCDS Record Package

Returns the **OCDS Record Package** (compiled view with linked releases):

```bash
curl "$API/govchain/procurement/v1/ocds/records/ocds-abc123-ph-dpwh-2024-0001"
```

#### Module Parameters

```bash
curl "$API/govchain/procurement/v1/params"
```

```json
{
  "params": {
    "allowed_ocid_prefixes": ["ocds-abc123"],
    "max_release_size": "1048576",
    "require_entity_verification": false,
    "default_currency": "PHP",
    "min_tenderers_open": 3,
    "alternative_method_threshold": "1000000",
    "public_bidding_threshold": "5000000"
  }
}
```

---

## Infrastructure Module (OC4IDS)

The infrastructure module implements the **Open Contracting for Infrastructure Data Standard (OC4IDS)**:

```
Create Project --> Update Project --> Update Progress (metrics) --> Attach Documents --> Link Contracting Process
```

### Authorization Model

- **Project Owner**: The `creator` of `CreateProject` becomes the project owner
- **Authorized Publishers**: Only the owner or addresses in `authorized_publishers` can update the project, attach documents, record progress, or link contracting processes

---

### 1. Create a Project

#### REST Message

```json
{
  "@type": "/govchain.infrastructure.v1.MsgCreateProject",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "title": "Bataan Provincial Road Rehabilitation",
  "description": "Complete rehabilitation of 12.5km provincial road connecting Dinalupihan to Hermosa",
  "status": "preparation",
  "project_type": "rehabilitation",
  "sector": ["transport", "transport.road"],
  "purpose": "Improve connectivity and reduce travel time in Bataan province",
  "budget": {
    "amount": {
      "amount": "50000000",
      "currency": "PHP"
    },
    "budget_breakdown": []
  },
  "period": {
    "start_date": "2024-05-01T00:00:00Z",
    "end_date": "2025-05-01T00:00:00Z"
  },
  "locations": [
    {
      "description": "Dinalupihan-Hermosa Road, Bataan",
      "geometry": {
        "type": "Point",
        "coordinates": ["120.4632", "14.8645"]
      },
      "gazetteer": {
        "scheme": "PSGC",
        "identifiers": ["030800000"]
      }
    }
  ],
  "parties": [
    {
      "id": "PH-SEC-CS200901234",
      "name": "DPWH Region III",
      "roles": ["publicAuthority", "procuringEntity"]
    }
  ],
  "public_authority": {
    "id": "PH-SEC-CS200901234",
    "name": "DPWH Region III"
  },
  "additional_classifications": [
    {
      "scheme": "PSIC",
      "id": "42101",
      "description": "Construction of highways, roads, and streets"
    }
  ]
}
```

#### CosmJS

```typescript
const msg = {
  typeUrl: "/govchain.infrastructure.v1.MsgCreateProject",
  value: {
    creator: account.address,
    projectId: "oc4ids-ph-dpwh-2024-infra-0001",
    title: "Bataan Provincial Road Rehabilitation",
    description: "Complete rehabilitation of 12.5km provincial road...",
    status: "preparation",
    projectType: "rehabilitation",
    sector: ["transport", "transport.road"],
    purpose: "Improve connectivity and reduce travel time in Bataan",
    budget: {
      amount: { amount: "50000000", currency: "PHP" },
    },
    period: {
      startDate: "2024-05-01T00:00:00Z",
      endDate: "2025-05-01T00:00:00Z",
    },
    locations: [
      {
        description: "Dinalupihan-Hermosa Road, Bataan",
        geometry: {
          type: "Point",
          coordinates: ["120.4632", "14.8645"],
        },
      },
    ],
    parties: [
      {
        id: "PH-SEC-CS200901234",
        name: "DPWH Region III",
        roles: ["publicAuthority", "procuringEntity"],
      },
    ],
    publicAuthority: {
      id: "PH-SEC-CS200901234",
      name: "DPWH Region III",
    },
  },
};

const result = await client.signAndBroadcast(account.address, [msg], "auto");
```

#### Response

```json
{
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001"
}
```

---

### 2. Update a Project

Only non-empty fields are updated (partial update).

#### REST Message

```json
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
}
```

> Only fields with values are changed. Empty strings and empty arrays are skipped.

---

### 3. Update Progress (Metrics)

Record quantitative progress observations. New metrics are appended; existing metrics (matching `id`) have their observations merged.

#### REST Message

```json
{
  "@type": "/govchain.infrastructure.v1.MsgUpdateProgress",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "metrics": [
    {
      "id": "physical-progress",
      "title": "Physical Progress",
      "observations": [
        {
          "id": "obs-2024-06",
          "measure": "35",
          "unit": {
            "name": "percent",
            "scheme": "UNCEFACT",
            "id": "P1"
          },
          "period": {
            "start_date": "2024-06-01T00:00:00Z",
            "end_date": "2024-06-30T00:00:00Z"
          },
          "note": "Subgrade and drainage works completed for first 4km"
        }
      ]
    },
    {
      "id": "financial-progress",
      "title": "Financial Disbursement",
      "observations": [
        {
          "id": "obs-fin-2024-06",
          "measure": "10000000",
          "unit": {
            "name": "Philippine Peso",
            "scheme": "UNCEFACT",
            "id": "PHP"
          },
          "note": "First disbursement for mobilization and earthworks"
        }
      ]
    }
  ]
}
```

#### CosmJS

```typescript
const msg = {
  typeUrl: "/govchain.infrastructure.v1.MsgUpdateProgress",
  value: {
    creator: account.address,
    projectId: "oc4ids-ph-dpwh-2024-infra-0001",
    metrics: [
      {
        id: "physical-progress",
        title: "Physical Progress",
        observations: [
          {
            id: "obs-2024-06",
            measure: "35",
            unit: { name: "percent", scheme: "UNCEFACT", id: "P1" },
            period: {
              startDate: "2024-06-01T00:00:00Z",
              endDate: "2024-06-30T00:00:00Z",
            },
            note: "Subgrade and drainage works completed for first 4km",
          },
        ],
      },
    ],
  },
};

const result = await client.signAndBroadcast(account.address, [msg], "auto");
```

---

### 4. Attach a Document

#### REST Message

```json
{
  "@type": "/govchain.infrastructure.v1.MsgAttachDocument",
  "creator": "cosmos1abc...",
  "project_id": "oc4ids-ph-dpwh-2024-infra-0001",
  "document": {
    "id": "doc-eia-001",
    "document_type": "environmentalImpact",
    "title": "Environmental Impact Assessment",
    "description": "EIA report for the road rehabilitation project",
    "url": "https://dpwh.gov.ph/eia/2024-0001.pdf",
    "format": "application/pdf",
    "language": "en",
    "ipfs_cid": "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy"
  }
}
```

---

### 5. Link a Contracting Process

Link an OCDS procurement process to the infrastructure project.

#### REST Message

```json
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
        "value": {
          "amount": "47500000",
          "currency": "PHP"
        }
      }
    }
  }
}
```

---

### Query Infrastructure Data

#### List All Projects

```bash
curl "$API/govchain/infrastructure/v1/project?pagination.limit=10"
```

#### Get a Single Project

```bash
curl "$API/govchain/infrastructure/v1/project/oc4ids-ph-dpwh-2024-infra-0001"
```

```json
{
  "project": {
    "id": "oc4ids-ph-dpwh-2024-infra-0001",
    "title": "Bataan Provincial Road Rehabilitation",
    "status": "implementation",
    "type": "rehabilitation",
    "sector": ["transport", "transport.road"],
    "budget": { "amount": { "amount": "50000000", "currency": "PHP" } },
    "locations": [...],
    "parties": [...],
    "metrics": [...],
    "documents": [...],
    "contracting_processes": [...],
    "publisher_address": "cosmos1abc...",
    "block_height": "1234",
    "tx_hash": "ABCDEF..."
  }
}
```

#### Filter by Sector

```bash
curl "$API/govchain/infrastructure/v1/projects_by_sector/transport"
```

#### Filter by Status

```bash
curl "$API/govchain/infrastructure/v1/projects_by_status/implementation"
```

Valid statuses: `identification`, `preparation`, `implementation`, `completion`, `cancelled`

#### Filter by Region

```bash
curl "$API/govchain/infrastructure/v1/projects_by_region/Central%20Luzon"
```

#### Module Parameters

```bash
curl "$API/govchain/infrastructure/v1/params"
```

```json
{
  "params": {
    "default_currency": "PHP",
    "require_project_verification": false,
    "max_project_size": "2097152",
    "allowed_project_prefixes": ["oc4ids-ph"]
  }
}
```

---

## REST API Pagination

All list endpoints support Cosmos SDK pagination:

```bash
# First page
curl "$API/govchain/procurement/v1/process?pagination.limit=10"

# Next page (use next_key from previous response)
curl "$API/govchain/procurement/v1/process?pagination.limit=10&pagination.key=<next_key>"

# Reverse order (newest first)
curl "$API/govchain/procurement/v1/process?pagination.limit=10&pagination.reverse=true"

# Count total (slower)
curl "$API/govchain/procurement/v1/process?pagination.count_total=true"

# Offset-based (alternative to key-based)
curl "$API/govchain/procurement/v1/process?pagination.offset=20&pagination.limit=10"
```

**Response pagination block:**

```json
{
  "pagination": {
    "next_key": "base64-encoded-key-or-null",
    "total": "0"
  }
}
```

> `total` is only populated when `count_total=true` (adds query overhead).

---

## Events & WebSocket Subscriptions

The chain emits typed events for every state change. Subscribe via CometBFT WebSocket:

### Connect

```bash
wscat -c ws://localhost:26657/websocket
```

### Subscribe to Procurement Events

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "id": "1",
  "params": {
    "query": "release_submitted.ocid EXISTS"
  }
}
```

### Subscribe to Infrastructure Events

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "id": "2",
  "params": {
    "query": "project_created.project_id EXISTS"
  }
}
```

### Event Types

**Procurement events:**

| Event | Attributes |
|---|---|
| `release_submitted` | `ocid`, `release_id`, `publisher` |
| `process_created` | `ocid`, `publisher`, `stage` |
| `tender_published` | `ocid`, `tender_id`, `publisher` |
| `award_made` | `ocid`, `award_id`, `publisher` |
| `contract_signed` | `ocid`, `contract_id`, `publisher` |
| `implementation_updated` | `ocid`, `contract_id`, `publisher` |
| `entity_registered` | `entity_id`, `name`, `registrar` |

**Infrastructure events:**

| Event | Attributes |
|---|---|
| `project_created` | `project_id`, `title`, `status`, `publisher` |
| `project_updated` | `project_id`, `status`, `publisher` |
| `progress_updated` | `project_id`, `metric_id`, `measure`, `publisher` |
| `document_attached` | `project_id`, `document_id`, `document_type`, `publisher` |

### Filter by Specific OCID

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "id": "3",
  "params": {
    "query": "release_submitted.ocid='ocds-abc123-ph-dpwh-2024-0001'"
  }
}
```

---

## Error Handling

### Common Error Codes

| Code | Name | Meaning |
|---|---|---|
| 4 | `ErrUnauthorized` | Signer is not the owner or authorized publisher |
| 5 | `ErrInvalidAddress` | Malformed bech32 address |
| 18 | `ErrInvalidRequest` | Missing required field or invalid data |
| 11 | `ErrOutOfGas` | Transaction ran out of gas |
| 19 | `ErrTxInMempoolCache` | Duplicate transaction |
| 32 | `ErrWrongSequence` | Account sequence mismatch (retry with correct sequence) |

### Module-Specific Errors

**Procurement:**
- `ErrInvalidOCID` -- OCID is empty or malformed
- `ErrProcessAlreadyExists` -- Process with this OCID already exists
- `ErrProcessNotFound` -- No process found for the given OCID
- `ErrUnauthorizedPublisher` -- Signer not in authorized publishers list
- `ErrEntityAlreadyExists` -- Entity with this ID already registered
- `ErrEntityNotFound` -- Entity not found

**Infrastructure:**
- `ErrInvalidProjectID` -- Project ID is empty
- `ErrProjectAlreadyExists` -- Project with this ID already exists
- `ErrProjectNotFound` -- No project found for the given ID
- `ErrUnauthorizedPublisher` -- Signer not in authorized publishers list

### Error Response Format

REST API errors follow the Google RPC status format:

```json
{
  "code": 3,
  "message": "invalid OCID: OCID cannot be empty",
  "details": []
}
```

Transaction broadcast errors:

```json
{
  "tx_response": {
    "code": 18,
    "raw_log": "invalid request: release cannot be nil",
    "txhash": "ABC123...",
    "height": "0"
  }
}
```

> A `code` of `0` means success. Any non-zero code indicates failure.

### Handling Sequence Errors

If you get `ErrWrongSequence`, re-fetch the account sequence and retry:

```bash
# Get current account info
curl "$API/cosmos/auth/v1beta1/accounts/cosmos1abc..."
```

```typescript
// CosmJS handles this automatically when using signAndBroadcast with "auto" gas
// For manual signing, fetch the latest sequence:
const account = await client.getAccount(address);
// account.sequence contains the next expected sequence number
```
