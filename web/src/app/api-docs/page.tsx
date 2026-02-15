"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  Globe,
  ChevronDown,
  ChevronRight,
  Code,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Database,
  Send,
  BookOpen,
  Layers,
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Method = "get" | "post" | "put" | "delete" | "patch";

type Parameter = {
  name: string;
  in: "path" | "query" | "body";
  required: boolean;
  description?: string;
  type?: string;
  format?: string;
  schema?: any;
};

type Response = {
  description: string;
  schema?: any;
};

type Operation = {
  summary: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: any;
  responses?: Record<string, Response>;
};

type PathItem = {
  [method in Method]?: Operation;
};

type OpenAPISpec = {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, PathItem>;
  definitions?: Record<string, any>;
};

type Section = "overview" | "schemas" | "queries" | "transactions";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const methodColors: Record<string, string> = {
  get: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  post: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  put: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  delete: "bg-red-500/10 text-red-400 border-red-500/30",
  patch: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

const MODULE_INFO: Record<
  string,
  {
    name: string;
    icon: string;
    standard: string;
    standardUrl: string;
    description: string;
    concepts: { term: string; definition: string }[];
    queryPrefix: string;
    msgPrefix: string;
    definitionPrefix: string;
    coreSchemas: string[];
    supportingSchemas: string[];
  }
> = {
  "govchain.procurement.v1": {
    name: "Procurement",
    icon: "📋",
    standard: "Open Contracting Data Standard (OCDS)",
    standardUrl: "https://standard.open-contracting.org/latest/en/",
    description:
      "Implements the Open Contracting Data Standard (OCDS) on-chain, providing a transparent and immutable record of the full public procurement lifecycle. Covers planning, tender, award, contract, and implementation stages. Aligned with Republic Act 9184 (Philippine Government Procurement Reform Act).",
    concepts: [
      {
        term: "OCID",
        definition:
          "Open Contracting ID — a globally unique identifier for each contracting process (prefix + local id).",
      },
      {
        term: "Release",
        definition:
          "An immutable snapshot of a contracting process at a specific point in time, tagged with a lifecycle stage.",
      },
      {
        term: "Contracting Process",
        definition:
          "The compiled view aggregating all releases for a single OCID into a current-state record.",
      },
      {
        term: "Entity Registry",
        definition:
          "On-chain registration of organizations that participate in procurement.",
      },
      {
        term: "Release Package",
        definition:
          "An envelope containing one or more releases with publisher metadata, conforming to the OCDS packaging spec.",
      },
    ],
    queryPrefix: "/govchain/procurement/",
    msgPrefix: "/govchain.procurement.v1.Msg/",
    definitionPrefix: "govchain.procurement.v1.",
    coreSchemas: [
      "govchain.procurement.v1.Release",
      "govchain.procurement.v1.Planning",
      "govchain.procurement.v1.Tender",
      "govchain.procurement.v1.Award",
      "govchain.procurement.v1.Contract",
      "govchain.procurement.v1.Implementation",
      "govchain.procurement.v1.ContractingProcess",
      "govchain.procurement.v1.EntityRegistry",
      "govchain.procurement.v1.ReleasePackage",
      "govchain.procurement.v1.Record",
    ],
    supportingSchemas: [
      "govchain.procurement.v1.Organization",
      "govchain.procurement.v1.OrganizationReference",
      "govchain.procurement.v1.Value",
      "govchain.procurement.v1.Period",
      "govchain.procurement.v1.Identifier",
      "govchain.procurement.v1.Address",
      "govchain.procurement.v1.ContactPoint",
      "govchain.procurement.v1.Classification",
      "govchain.procurement.v1.Item",
      "govchain.procurement.v1.Unit",
      "govchain.procurement.v1.Document",
      "govchain.procurement.v1.Milestone",
      "govchain.procurement.v1.Amendment",
      "govchain.procurement.v1.RelatedProcess",
      "govchain.procurement.v1.Budget",
      "govchain.procurement.v1.Transaction",
      "govchain.procurement.v1.Publisher",
      "govchain.procurement.v1.LinkedRelease",
      "govchain.procurement.v1.Params",
    ],
  },
  "govchain.infrastructure.v1": {
    name: "Infrastructure",
    icon: "🏗️",
    standard: "Open Contracting for Infrastructure Data Standard (OC4IDS)",
    standardUrl: "https://standard.open-contracting.org/infrastructure/latest/en/",
    description:
      "Implements the Open Contracting for Infrastructure Data Standard (OC4IDS) on-chain, enabling transparent tracking of infrastructure projects from identification through completion. Links infrastructure project data with OCDS procurement processes for end-to-end transparency.",
    concepts: [
      {
        term: "InfraProject",
        definition:
          "The core data structure representing an infrastructure project with its full lifecycle data.",
      },
      {
        term: "Contracting Process Link",
        definition:
          "A connection between an infrastructure project and one or more OCDS procurement processes, with tender and contract summaries.",
      },
      {
        term: "Metrics & Observations",
        definition:
          "Quantitative measures tracking project progress, cost, and performance with timestamped observations.",
      },
      {
        term: "Location & Geometry",
        definition:
          "Geographic data using GeoJSON geometry objects (Point, LineString, Polygon) and gazetteer references.",
      },
    ],
    queryPrefix: "/govchain/infrastructure/",
    msgPrefix: "/govchain.infrastructure.v1.Msg/",
    definitionPrefix: "govchain.infrastructure.v1.",
    coreSchemas: [
      "govchain.infrastructure.v1.InfraProject",
      "govchain.infrastructure.v1.ContractingProcessSummary",
      "govchain.infrastructure.v1.TenderSummary",
      "govchain.infrastructure.v1.ContractSummary",
      "govchain.infrastructure.v1.Completion",
      "govchain.infrastructure.v1.Metric",
      "govchain.infrastructure.v1.Observation",
    ],
    supportingSchemas: [
      "govchain.infrastructure.v1.Organization",
      "govchain.infrastructure.v1.OrganizationReference",
      "govchain.infrastructure.v1.Value",
      "govchain.infrastructure.v1.Period",
      "govchain.infrastructure.v1.Identifier",
      "govchain.infrastructure.v1.Address",
      "govchain.infrastructure.v1.ContactPoint",
      "govchain.infrastructure.v1.Classification",
      "govchain.infrastructure.v1.Location",
      "govchain.infrastructure.v1.Geometry",
      "govchain.infrastructure.v1.Gazetteer",
      "govchain.infrastructure.v1.Document",
      "govchain.infrastructure.v1.Budget",
      "govchain.infrastructure.v1.RelatedProject",
      "govchain.infrastructure.v1.Unit",
      "govchain.infrastructure.v1.Params",
    ],
  },
  "govchain.datasets.v1": {
    name: "Datasets",
    icon: "📊",
    standard: "Open Government Data",
    standardUrl: "",
    description:
      "Provides an on-chain registry for government datasets, enabling transparent cataloging and distribution of open government data. Integrates with IPFS for decentralized file storage and uses SHA-256 checksums for data integrity verification.",
    concepts: [
      {
        term: "Entry",
        definition:
          "A dataset record containing metadata, file references, and an IPFS content identifier (CID) for decentralized access.",
      },
      {
        term: "IPFS CID",
        definition:
          "Content Identifier used by the InterPlanetary File System to address and retrieve dataset files.",
      },
      {
        term: "Pin Count",
        definition:
          "The number of IPFS nodes pinning this dataset, indicating its availability and redundancy.",
      },
    ],
    queryPrefix: "/govchain/datasets/",
    msgPrefix: "/govchain.datasets.v1.Msg/",
    definitionPrefix: "govchain.datasets.v1.",
    coreSchemas: ["govchain.datasets.v1.Entry"],
    supportingSchemas: ["govchain.datasets.v1.Params"],
  },
};

const MODULES = [
  { id: "govchain.procurement.v1", label: "Procurement (OCDS)" },
  { id: "govchain.infrastructure.v1", label: "Infrastructure (OC4IDS)" },
  { id: "govchain.datasets.v1", label: "Datasets" },
];

const SECTIONS: { id: Section; label: string; icon: typeof BookOpen }[] = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "schemas", label: "Data Schemas", icon: Database },
  { id: "queries", label: "Query Endpoints", icon: Globe },
  { id: "transactions", label: "Transactions", icon: Send },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortName(fullName: string): string {
  const parts = fullName.split(".");
  return parts[parts.length - 1];
}

function resolveRef(ref: string): string {
  return ref.replace("#/definitions/", "");
}

function getFieldType(
  prop: any
): { display: string; refName?: string; isArray: boolean } {
  if (prop.$ref) {
    const name = resolveRef(prop.$ref);
    return { display: shortName(name), refName: name, isArray: false };
  }
  if (prop.type === "array" && prop.items) {
    if (prop.items.$ref) {
      const name = resolveRef(prop.items.$ref);
      return { display: shortName(name) + "[]", refName: name, isArray: true };
    }
    return {
      display: (prop.items.type || "any") + "[]",
      refName: undefined,
      isArray: true,
    };
  }
  let t = prop.type || "object";
  if (prop.format) t += ` (${prop.format})`;
  return { display: t, refName: undefined, isArray: false };
}

function getFieldDescription(prop: any): string {
  return prop.description || prop.title || "";
}

// ---------------------------------------------------------------------------
// Schema Field Table
// ---------------------------------------------------------------------------

function SchemaFieldTable({
  definition,
  definitions,
  expandedRefs,
  onToggleRef,
}: {
  definition: any;
  definitions: Record<string, any>;
  expandedRefs: Set<string>;
  onToggleRef: (name: string) => void;
}) {
  const properties = definition?.properties;
  if (!properties || Object.keys(properties).length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No fields defined.
      </p>
    );
  }
  const required = new Set(definition.required || []);

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[200px]">
              Field
            </th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[160px]">
              Type
            </th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(properties).map(([key, prop]: [string, any]) => {
            const ft = getFieldType(prop);
            const desc = getFieldDescription(prop);
            const isRequired = required.has(key);
            const isExpanded = ft.refName ? expandedRefs.has(ft.refName) : false;
            const nestedDef = ft.refName ? definitions[ft.refName] : undefined;
            const hasNestedProps =
              nestedDef?.properties &&
              Object.keys(nestedDef.properties).length > 0;

            return (
              <tr key={key} className="border-b last:border-b-0 group">
                <td className="px-3 py-2 align-top">
                  <code className="text-xs font-mono text-foreground">
                    {key}
                  </code>
                  {isRequired && (
                    <span className="text-red-400 ml-1 text-xs">*</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {hasNestedProps ? (
                    <button
                      onClick={() => onToggleRef(ft.refName!)}
                      className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {ft.display}
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground">
                      {ft.display}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-xs text-muted-foreground">
                  {desc}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schema Card (used in the "Data Schemas" section)
// ---------------------------------------------------------------------------

function SchemaCard({
  name,
  definition,
  definitions,
}: {
  name: string;
  definition: any;
  definitions: Record<string, any>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());

  const toggleRef = useCallback((refName: string) => {
    setExpandedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(refName)) next.delete(refName);
      else next.add(refName);
      return next;
    });
  }, []);

  const sName = shortName(name);
  const title = definition?.title || "";
  // Extract description part after " - " in titles like "Value - Financial values..."
  const titleDesc = title.includes(" - ")
    ? title.split(" - ").slice(1).join(" - ")
    : title !== sName
      ? title
      : "";

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <code className="text-sm font-semibold font-mono">{sName}</code>
        {titleDesc && (
          <span className="text-xs text-muted-foreground truncate">
            {titleDesc}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {titleDesc && (
            <p className="text-sm text-muted-foreground">{titleDesc}</p>
          )}
          <SchemaFieldTable
            definition={definition}
            definitions={definitions}
            expandedRefs={expandedRefs}
            onToggleRef={toggleRef}
          />
          {/* Render expanded nested schemas inline */}
          {Array.from(expandedRefs).map((refName) => {
            const refDef = definitions[refName];
            if (!refDef?.properties) return null;
            return (
              <div key={refName} className="ml-4 mt-2">
                <div className="text-xs font-mono text-primary mb-2 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {shortName(refName)}
                </div>
                <SchemaFieldTable
                  definition={refDef}
                  definitions={definitions}
                  expandedRefs={new Set()}
                  onToggleRef={() => {}}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Endpoint Card
// ---------------------------------------------------------------------------

function EndpointCard({
  path,
  method,
  operation,
  definitions,
}: {
  path: string;
  method: string;
  operation: Operation;
  definitions: Record<string, any>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const m = method.toLowerCase();
  const colorClass = methodColors[m] || methodColors.get;

  const toggleRef = useCallback((refName: string) => {
    setExpandedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(refName)) next.delete(refName);
      else next.add(refName);
      return next;
    });
  }, []);

  // Parse body parameter for Swagger 2.0 style
  const bodyParam = operation.parameters?.find((p) => p.in === "body");
  const bodySchemaRef = bodyParam?.schema?.$ref
    ? resolveRef(bodyParam.schema.$ref)
    : null;
  const bodySchema = bodySchemaRef ? definitions[bodySchemaRef] : null;

  const pathParams = operation.parameters?.filter((p) => p.in === "path") || [];
  const queryParams =
    operation.parameters?.filter((p) => p.in === "query") || [];

  const successResp = operation.responses?.["200"];
  const successSchemaRef = successResp?.schema?.$ref
    ? resolveRef(successResp.schema.$ref)
    : null;
  const successSchema = successSchemaRef
    ? definitions[successSchemaRef]
    : successResp?.schema;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        <Badge
          className={`${colorClass} border font-mono text-[11px] px-2 py-0.5 flex-shrink-0`}
        >
          {method.toUpperCase()}
        </Badge>
        <div className="flex-1 min-w-0">
          <code className="text-xs text-muted-foreground break-all">
            {path}
          </code>
          {operation.summary && (
            <div className="text-sm font-medium mt-0.5 truncate">
              {operation.summary}
            </div>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t">
          {operation.description && (
            <p className="text-sm text-muted-foreground pt-3 whitespace-pre-line">
              {operation.description}
            </p>
          )}

          {/* Path Parameters */}
          {pathParams.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Path Parameters
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground text-xs">
                        Name
                      </th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground text-xs">
                        Type
                      </th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground text-xs">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pathParams.map((p) => (
                      <tr key={p.name} className="border-b last:border-b-0">
                        <td className="px-3 py-1.5">
                          <code className="text-xs font-mono">{p.name}</code>
                          <span className="text-red-400 ml-1 text-xs">*</span>
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground font-mono">
                          {p.type || "string"}
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground">
                          {p.description || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Query Parameters */}
          {queryParams.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Query Parameters
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground text-xs">
                        Name
                      </th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground text-xs">
                        Type
                      </th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground text-xs">
                        Required
                      </th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground text-xs">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {queryParams.map((p) => (
                      <tr key={p.name} className="border-b last:border-b-0">
                        <td className="px-3 py-1.5">
                          <code className="text-xs font-mono">{p.name}</code>
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground font-mono">
                          {p.type || "string"}
                        </td>
                        <td className="px-3 py-1.5 text-xs">
                          {p.required ? (
                            <span className="text-red-400">yes</span>
                          ) : (
                            <span className="text-muted-foreground">no</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-xs text-muted-foreground">
                          {p.description || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body */}
          {bodySchema && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Code className="h-3.5 w-3.5" />
                Request Body
                {bodySchemaRef && (
                  <span className="font-mono font-normal text-primary">
                    {shortName(bodySchemaRef)}
                  </span>
                )}
              </h4>
              <SchemaFieldTable
                definition={bodySchema}
                definitions={definitions}
                expandedRefs={expandedRefs}
                onToggleRef={toggleRef}
              />
              {Array.from(expandedRefs)
                .filter((r) => definitions[r]?.properties)
                .map((refName) => (
                  <div key={refName} className="ml-4 mt-2">
                    <div className="text-xs font-mono text-primary mb-2 flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {shortName(refName)}
                    </div>
                    <SchemaFieldTable
                      definition={definitions[refName]}
                      definitions={definitions}
                      expandedRefs={new Set()}
                      onToggleRef={() => {}}
                    />
                  </div>
                ))}
            </div>
          )}

          {/* Success Response */}
          {successSchema && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Response 200
                {successSchemaRef && (
                  <span className="font-mono font-normal text-primary">
                    {shortName(successSchemaRef)}
                  </span>
                )}
              </h4>
              <SchemaFieldTable
                definition={successSchema}
                definitions={definitions}
                expandedRefs={expandedRefs}
                onToggleRef={toggleRef}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Overview
// ---------------------------------------------------------------------------

function OverviewSection({ moduleId }: { moduleId: string }) {
  const info = MODULE_INFO[moduleId];
  if (!info) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <span className="text-2xl">{info.icon}</span>
          {info.name} Module
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {info.description}
        </p>
      </div>

      {info.standardUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Standard</div>
                <a
                  href={info.standardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {info.standard}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Key Concepts</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {info.concepts.map((c) => (
            <Card key={c.term}>
              <CardContent className="pt-4 pb-4">
                <div className="font-semibold text-sm mb-1">{c.term}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {c.definition}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Schemas
// ---------------------------------------------------------------------------

function SchemasSection({
  moduleId,
  definitions,
}: {
  moduleId: string;
  definitions: Record<string, any>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const info = MODULE_INFO[moduleId];
  if (!info) return null;

  const allModuleDefNames = Object.keys(definitions).filter(
    (k) =>
      k.startsWith(info.definitionPrefix) &&
      !k.includes("Query") &&
      !k.includes("Msg")
  );

  const coreSchemas = info.coreSchemas.filter(
    (s) => definitions[s]?.properties
  );
  const supportingSchemas = info.supportingSchemas.filter(
    (s) => definitions[s]?.properties
  );
  // Any remaining schemas not in core or supporting
  const listed = new Set([...info.coreSchemas, ...info.supportingSchemas]);
  const otherSchemas = allModuleDefNames.filter(
    (s) => !listed.has(s) && definitions[s]?.properties
  );

  const filter = (names: string[]) =>
    searchTerm
      ? names.filter((n) =>
          shortName(n).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : names;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Database className="h-6 w-6" />
          Data Schemas
        </h2>
        <p className="text-muted-foreground text-sm">
          Data types defined by the {info.name} module. Expand each schema to
          see its fields. Click nested type names to inspect their structure.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter schemas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {filter(coreSchemas).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Core Data Types
          </h3>
          <div className="space-y-2">
            {filter(coreSchemas).map((name) => (
              <SchemaCard
                key={name}
                name={name}
                definition={definitions[name]}
                definitions={definitions}
              />
            ))}
          </div>
        </div>
      )}

      {filter(supportingSchemas).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Supporting Types
          </h3>
          <div className="space-y-2">
            {filter(supportingSchemas).map((name) => (
              <SchemaCard
                key={name}
                name={name}
                definition={definitions[name]}
                definitions={definitions}
              />
            ))}
          </div>
        </div>
      )}

      {filter(otherSchemas).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Other Types
          </h3>
          <div className="space-y-2">
            {filter(otherSchemas).map((name) => (
              <SchemaCard
                key={name}
                name={name}
                definition={definitions[name]}
                definitions={definitions}
              />
            ))}
          </div>
        </div>
      )}

      {filter(coreSchemas).length === 0 &&
        filter(supportingSchemas).length === 0 &&
        filter(otherSchemas).length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No schemas match &ldquo;{searchTerm}&rdquo;
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Query Endpoints
// ---------------------------------------------------------------------------

function QueriesSection({
  moduleId,
  paths,
  definitions,
}: {
  moduleId: string;
  paths: Record<string, PathItem>;
  definitions: Record<string, any>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const info = MODULE_INFO[moduleId];
  if (!info) return null;

  const queryPaths = useMemo(() => {
    return Object.entries(paths)
      .filter(([p]) => p.startsWith(info.queryPrefix))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [paths, info.queryPrefix]);

  const filtered = searchTerm
    ? queryPaths.filter(
        ([path, item]) =>
          path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          Object.values(item).some(
            (op: any) =>
              op?.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              op?.operationId?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    : queryPaths;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Globe className="h-6 w-6" />
          Query Endpoints
        </h2>
        <p className="text-muted-foreground text-sm">
          Read-only HTTP endpoints for querying {info.name.toLowerCase()} data
          from the chain. All queries use the GET method.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter endpoints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No endpoints found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(([path, pathItem]) =>
            Object.entries(pathItem).map(([method, operation]) =>
              operation ? (
                <EndpointCard
                  key={`${method}:${path}`}
                  path={path}
                  method={method}
                  operation={operation}
                  definitions={definitions}
                />
              ) : null
            )
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {queryPaths.length} query endpoint
        {queryPaths.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Transactions
// ---------------------------------------------------------------------------

function TransactionsSection({
  moduleId,
  paths,
  definitions,
}: {
  moduleId: string;
  paths: Record<string, PathItem>;
  definitions: Record<string, any>;
}) {
  const info = MODULE_INFO[moduleId];
  if (!info) return null;

  const txPaths = useMemo(() => {
    return Object.entries(paths)
      .filter(
        ([p]) =>
          p.startsWith(info.msgPrefix) && !p.endsWith("/UpdateParams")
      )
      .sort(([a], [b]) => a.localeCompare(b));
  }, [paths, info.msgPrefix]);

  const updateParamsPath = Object.entries(paths).find(
    ([p]) => p === `${info.msgPrefix}UpdateParams`
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Send className="h-6 w-6" />
          Transactions
        </h2>
        <p className="text-muted-foreground text-sm">
          State-changing messages submitted as blockchain transactions. Each
          transaction is signed by the sender and recorded immutably on-chain.
        </p>
      </div>

      {txPaths.length === 0 && !updateParamsPath ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No transactions defined for this module.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {txPaths.map(([path, pathItem]) =>
            Object.entries(pathItem).map(([method, operation]) =>
              operation ? (
                <EndpointCard
                  key={`${method}:${path}`}
                  path={path}
                  method={method}
                  operation={operation}
                  definitions={definitions}
                />
              ) : null
            )
          )}
        </div>
      )}

      {updateParamsPath && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Governance
          </h3>
          <p className="text-xs text-muted-foreground">
            Parameter updates require a governance proposal passed through
            the x/gov module.
          </p>
          {Object.entries(updateParamsPath[1]).map(([method, operation]) =>
            operation ? (
              <EndpointCard
                key={`gov:${method}`}
                path={updateParamsPath[0]}
                method={method}
                operation={operation}
                definitions={definitions}
              />
            ) : null
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {txPaths.length + (updateParamsPath ? 1 : 0)} transaction type
        {txPaths.length + (updateParamsPath ? 1 : 0) !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function APIDocsPage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>(
    "govchain.procurement.v1"
  );
  const [selectedSection, setSelectedSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch("/openapi.json")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error("Failed to load OpenAPI spec:", err));
  }, []);

  const definitions = spec?.definitions || {};
  const paths = spec?.paths || {};

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Terminal className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading API specification...</p>
        </div>
      </div>
    );
  }

  const moduleInfo = MODULE_INFO[selectedModule];

  return (
    <div className="flex min-h-screen">
      {/* ---- Sidebar ---- */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-14"
        } border-r bg-background transition-all duration-200 flex-shrink-0 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">GovChain API</span>
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
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Module Selection */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                Modules
              </div>
              <div className="space-y-1">
                {MODULES.map((mod) => {
                  const mInfo = MODULE_INFO[mod.id];
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setSelectedModule(mod.id);
                        setSelectedSection("overview");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm ${
                        selectedModule === mod.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span>{mInfo?.icon}</span>
                      <span className="font-medium">{mod.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Navigation */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                Sections
              </div>
              <div className="space-y-0.5">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSection(sec.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm ${
                        selectedSection === sec.id
                          ? "bg-muted font-semibold"
                          : "hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ---- Main Content ---- */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Globe className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">
                {moduleInfo?.name || ""} API Documentation
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Interactive reference for the GovChain on-chain{" "}
              {moduleInfo?.name.toLowerCase() || ""} module.{" "}
              {moduleInfo?.standard
                ? `Implements the ${moduleInfo.standard}.`
                : ""}
            </p>
          </div>

          {/* Active Section */}
          {selectedSection === "overview" && (
            <OverviewSection moduleId={selectedModule} />
          )}

          {selectedSection === "schemas" && (
            <SchemasSection
              moduleId={selectedModule}
              definitions={definitions}
            />
          )}

          {selectedSection === "queries" && (
            <QueriesSection
              moduleId={selectedModule}
              paths={paths}
              definitions={definitions}
            />
          )}

          {selectedSection === "transactions" && (
            <TransactionsSection
              moduleId={selectedModule}
              paths={paths}
              definitions={definitions}
            />
          )}
        </div>
      </main>
    </div>
  );
}
