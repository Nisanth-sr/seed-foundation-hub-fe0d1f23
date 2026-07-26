import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { HERO } from "@/lib/content";

export function HomeHero() {
  return (
    <section className="bg-primary text-foreground">
      <div className="container-x">
        <div className="grid min-h-[calc(100svh-4rem)] grid-rows-[auto_1fr_auto] py-8 md:py-12">
          <div className="flex items-center justify-between border-b border-foreground pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] md:text-sm">
              Our efforts strive toward one goal
            </p>
            <a
              href="#home-mission"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground transition-colors hover:bg-foreground hover:text-primary"
              aria-label="Scroll to our mission"
            >
              <ArrowDown className="h-5 w-5" />
            </a>
          </div>

          <div className="grid items-end gap-8 py-10 lg:grid-cols-12 lg:py-14">
            <h1 className="max-w-5xl text-[clamp(3.25rem,7.2vw,7.25rem)] font-bold leading-[0.92] tracking-[-0.055em] lg:col-span-10">
              {HERO.headline}
            </h1>
          </div>

          <div className="grid items-end gap-0 lg:grid-cols-12">
            <div className="relative min-h-[280px] overflow-hidden border-[12px] border-foreground sm:min-h-[360px] md:border-[18px] lg:col-span-8 lg:min-h-[410px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-cover.png"
                alt="Students and community members learning together"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute bottom-0 right-0 h-20 w-20 border-l-[12px] border-t-[12px] border-foreground bg-primary md:h-28 md:w-28 md:border-l-[18px] md:border-t-[18px]"
                aria-hidden
              />
            </div>

            <div className="bg-background p-6 text-foreground sm:p-8 lg:col-span-4 lg:min-h-[410px] lg:p-10">
              <p className="text-base leading-relaxed md:text-lg">{HERO.subheading}</p>
              <Link
                href={HERO.cta.href}
                className="mt-8 inline-flex min-h-11 items-center gap-3 border-b-2 border-foreground pb-2 text-sm font-bold uppercase tracking-wide transition-colors hover:border-primary hover:text-primary"
              >
                {HERO.cta.label}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
