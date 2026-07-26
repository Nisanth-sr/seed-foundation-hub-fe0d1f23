import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HERO } from "@/lib/content";

export function HomeHero() {
  return (
    <section className="bg-primary text-foreground">
      <div className="container-x py-12 md:py-16 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] md:text-sm">
          Our efforts strive toward one goal
        </p>

        <h1 className="mt-6 max-w-6xl text-[clamp(2.75rem,6.4vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.05em]">
          {HERO.headline}
        </h1>

        <div className="mt-10 overflow-hidden border-2 border-foreground md:mt-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-cover.png"
            alt="A human hand and a robotic hand reach toward a globe and a sapling growing from an open book"
            className="aspect-[2/1] w-full object-cover"
          />
        </div>

        <div className="mt-10 grid gap-8 border-t-2 border-foreground pt-8 md:grid-cols-12 md:items-center">
          <p className="text-lg leading-relaxed md:col-span-8 md:text-xl">
            {HERO.subheading}
          </p>
          <div className="md:col-span-4 md:justify-self-end">
            <Link
              href={HERO.cta.href}
              className="inline-flex min-h-12 items-center gap-3 bg-foreground px-8 text-sm font-bold uppercase tracking-wide text-primary transition-transform hover:scale-[1.02]"
            >
              {HERO.cta.label}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
