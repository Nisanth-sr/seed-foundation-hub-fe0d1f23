"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/career")) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/20 bg-background/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="SEED Foundation home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/seed-logo.png" alt="SEED Foundation" className="h-10 w-auto object-contain mix-blend-multiply" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === l.href ? "text-primary" : "text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/career" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm">
              Career Assessment
            </Button>
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded border border-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-foreground bg-background lg:hidden">
          <nav className="container-x flex flex-col gap-1 py-3" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-3 text-sm font-medium hover:bg-primary"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/career" onClick={() => setOpen(false)} className="rounded px-2 py-3 text-sm font-medium">
              Career Assessment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
