"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FocusArea } from "@/lib/content";

const FILTERS: { id: "all" | FocusArea; label: string }[] = [
  { id: "all", label: "All" },
  { id: "health", label: "Health" },
  { id: "education", label: "Education" },
  { id: "environment", label: "Environment" },
  { id: "disaster-relief", label: "Disaster Relief" },
];

export function WorkFilters({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by focus area">
      {FILTERS.map((f) => (
        <Link
          key={f.id}
          href={f.id === "all" ? "/our-work" : `/our-work?area=${f.id}`}
          role="tab"
          aria-selected={active === f.id}
          className={cn(
            "min-h-11 px-4 py-2 text-sm font-semibold transition-colors",
            active === f.id
              ? "bg-primary text-primary-foreground"
              : "border border-foreground hover:bg-foreground hover:text-background",
          )}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
