import Link from "next/link";
import { ArrowRight, Building2, FileText, Search } from "lucide-react";

import type { SearchResult } from "@/lib/apex";

type SearchResultCardProps = {
  result: SearchResult;
};

function getHref(result: SearchResult) {
  if (result.type === "goal") {
    return `/goals/${result.id}`;
  }

  if (result.agency_id) {
    return `/agencies/${result.agency_id}`;
  }

  return "/explore";
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  return (
    <article className="card-surface flex h-full flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow">{result.type}</span>
        <Search className="h-4 w-4 text-[var(--ink-muted)]" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[var(--ink-strong)]">
          {result.title || result.name || "Untitled result"}
        </h3>
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          {result.description ??
            result.parent_goal ??
            "This result has limited description text in the current corpus."}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 text-xs font-medium text-[var(--ink-soft)]">
        {result.agency_name ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--mist)] px-3 py-2">
            <Building2 className="h-3.5 w-3.5" />
            {result.agency_name}
          </span>
        ) : null}
        {result.document_title ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--paper)] px-3 py-2">
            <FileText className="h-3.5 w-3.5" />
            {result.document_title}
          </span>
        ) : null}
      </div>

      <Link
        href={getHref(result)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition hover:gap-3"
      >
        Open record
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
