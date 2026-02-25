"use client";

import { CodeBlock, PageNavigation } from "../components";

export default function PaginationPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">REST API Pagination</h1>

      <p className="text-sm text-muted-foreground">
        All list endpoints support standard cursor-based pagination.
      </p>
      <CodeBlock
        language="bash"
        code={`# First page
curl "$API/govchain/procurement/v1/process?pagination.limit=10"

# Next page (use next_key from previous response)
curl "$API/govchain/procurement/v1/process?pagination.limit=10&pagination.key=<next_key>"

# Reverse order (newest first)
curl "$API/govchain/procurement/v1/process?pagination.limit=10&pagination.reverse=true"

# Count total (slower -- adds query overhead)
curl "$API/govchain/procurement/v1/process?pagination.count_total=true"

# Offset-based alternative
curl "$API/govchain/procurement/v1/process?pagination.offset=20&pagination.limit=10"`}
      />
      <p className="text-sm text-muted-foreground">
        Response pagination block:
      </p>
      <CodeBlock
        language="json"
        code={`{
  "pagination": {
    "next_key": "base64-encoded-key-or-null",
    "total": "0"
  }
}`}
      />
      <p className="text-xs text-muted-foreground">
        <code>total</code> is only populated when{" "}
        <code>count_total=true</code>.
      </p>

      <PageNavigation currentPath="/developer-guide/pagination" />
    </>
  );
}
