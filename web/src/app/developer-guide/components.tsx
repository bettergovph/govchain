"use client";

import { useState } from "react";
import { Copy, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border bg-muted/30">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50">
        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Step({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
        {n}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

const GUIDE_PAGES = [
  { href: "/developer-guide/chain-config", label: "Chain Configuration" },
  { href: "/developer-guide/authentication", label: "Authentication & Keys" },
  { href: "/developer-guide/transactions", label: "Transaction Lifecycle" },
  { href: "/developer-guide/procurement", label: "Procurement (OCDS)" },
  { href: "/developer-guide/infrastructure", label: "Infrastructure (OC4IDS)" },
  { href: "/developer-guide/pagination", label: "Pagination" },
  { href: "/developer-guide/events", label: "Events & WebSocket" },
  { href: "/developer-guide/errors", label: "Error Handling" },
];

export function PageNavigation({ currentPath }: { currentPath: string }) {
  const currentIndex = GUIDE_PAGES.findIndex((p) => p.href === currentPath);
  const prev = currentIndex > 0 ? GUIDE_PAGES[currentIndex - 1] : null;
  const next =
    currentIndex < GUIDE_PAGES.length - 1
      ? GUIDE_PAGES[currentIndex + 1]
      : null;

  return (
    <div className="flex items-center justify-between pt-6 border-t mt-8">
      {prev ? (
        <Link href={prev.href}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {prev.label}
          </Button>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={next.href}>
          <Button variant="outline" size="sm" className="gap-2">
            {next.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
