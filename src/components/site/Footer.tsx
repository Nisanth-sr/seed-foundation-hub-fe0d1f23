"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE, NAV_LINKS } from "@/lib/content";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/career") || pathname.startsWith("/internal") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <footer className="bg-foreground text-background">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/seed-logo.png"
            alt="SEED Foundation"
            className="mb-4 h-12 w-auto bg-background object-contain p-1.5"
          />
          <p className="text-sm leading-relaxed">
            Helping communities gain knowledge, strengthen resilience, and improve wellbeing through
            participation and collaboration.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/contact" className="hover:text-primary">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                Terms
              </Link>
            </li>
            <li>
              <span>Compliance Statement</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Connect</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-primary">
                {SITE.email}
              </a>
            </li>
            <li className="leading-relaxed">{SITE.address}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a href="#" className="hover:text-primary" aria-label="Twitter">
              Twitter
            </a>
            <a href="#" className="hover:text-primary" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a href="#" className="hover:text-primary" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" className="hover:text-primary" aria-label="Facebook">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-background/30">
        <div className="container-x flex flex-col gap-2 py-6 text-xs sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} SEED Foundation. All rights reserved.</p>
          <p>
            Trust Reg: {SITE.compliance.trustReg} | PAN: {SITE.compliance.pan} | DARPAN:{" "}
            {SITE.compliance.darpan}
          </p>
        </div>
      </div>
    </footer>
  );
}
