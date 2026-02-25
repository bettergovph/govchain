import {
  BookOpen,
  ArrowRight,
  Globe,
  Key,
  Send,
  Database,
  Layers,
  Search,
  Radio,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Developer Guide - OpenGovChain",
  description:
    "A practical guide for integrating with the GovChain blockchain's Procurement (OCDS) and Infrastructure (OC4IDS) modules.",
};

const sections = [
  {
    href: "/developer-guide/chain-config",
    title: "Chain Configuration",
    description:
      "Network endpoints, chain ID, gas settings, and default denominations.",
    icon: Globe,
  },
  {
    href: "/developer-guide/authentication",
    title: "Authentication & Keys",
    description:
      "Create keys via CLI or CosmJS, fund accounts, and manage wallets.",
    icon: Key,
  },
  {
    href: "/developer-guide/transactions",
    title: "Transaction Lifecycle",
    description:
      "Three methods for submitting transactions: CLI, REST broadcast, and CosmJS.",
    icon: Send,
  },
  {
    href: "/developer-guide/procurement",
    title: "Procurement Module (OCDS)",
    description:
      "Full OCDS lifecycle with examples: entities, processes, tenders, awards, contracts, and implementation.",
    icon: Database,
  },
  {
    href: "/developer-guide/infrastructure",
    title: "Infrastructure Module (OC4IDS)",
    description:
      "OC4IDS project lifecycle: create projects, track progress, attach documents, and link procurement.",
    icon: Layers,
  },
  {
    href: "/developer-guide/pagination",
    title: "REST API Pagination",
    description:
      "Cursor-based and offset-based pagination for all list endpoints.",
    icon: Search,
  },
  {
    href: "/developer-guide/events",
    title: "Events & WebSocket",
    description:
      "Subscribe to real-time blockchain events via CometBFT WebSocket.",
    icon: Radio,
  },
  {
    href: "/developer-guide/errors",
    title: "Error Handling",
    description:
      "Common error codes, module-specific errors, and sequence handling.",
    icon: AlertTriangle,
  },
];

export default function DeveloperGuidePage() {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Developer Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A practical guide for integrating with the GovChain
          blockchain&apos;s{" "}
          <strong>Procurement (OCDS)</strong> and{" "}
          <strong>Infrastructure (OC4IDS)</strong> modules. Covers
          authentication, querying via REST, submitting transactions via CLI
          and CosmJS, WebSocket events, and error handling.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {section.title}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
