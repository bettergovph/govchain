"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Menu,
  X,
  Globe,
  Key,
  Send,
  Database,
  Layers,
  Search,
  Radio,
  AlertTriangle,
  Terminal,
  ExternalLink,
} from "lucide-react";

const GUIDE_SECTIONS = [
  { href: "/developer-guide", label: "Overview", icon: BookOpen, exact: true },
  { href: "/developer-guide/chain-config", label: "Chain Configuration", icon: Globe },
  { href: "/developer-guide/authentication", label: "Authentication & Keys", icon: Key },
  { href: "/developer-guide/transactions", label: "Transaction Lifecycle", icon: Send },
  { href: "/developer-guide/procurement", label: "Procurement (OCDS)", icon: Database },
  { href: "/developer-guide/infrastructure", label: "Infrastructure (OC4IDS)", icon: Layers },
  { href: "/developer-guide/pagination", label: "Pagination", icon: Search },
  { href: "/developer-guide/events", label: "Events & WebSocket", icon: Radio },
  { href: "/developer-guide/errors", label: "Error Handling", icon: AlertTriangle },
];

const RESOURCES = [
  { href: "/api-docs", label: "API Reference", icon: Terminal },
  { href: "/explorer", label: "Block Explorer", icon: ExternalLink },
  { href: "/volunteer", label: "Run a Validator", icon: ExternalLink },
  { href: "/datasets", label: "Dataset Portal", icon: Database },
];

export default function DeveloperGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-14"
        } border-r bg-background transition-all duration-200 flex-shrink-0 flex flex-col`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">Dev Guide</span>
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
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                Sections
              </div>
              <div className="space-y-0.5">
                {GUIDE_SECTIONS.map((item) => {
                  const Icon = item.icon;
                  const isActive = 'exact' in item
                    ? pathname === item.href
                    : pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                Resources
              </div>
              <div className="space-y-0.5">
                {RESOURCES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
