import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HERO } from "@/lib/content";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-foreground">
      <div className="container-x relative z-10 py-12 md:py-16 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] md:text-sm">
          Our efforts strive toward one goal
        </p>

        <h1 className="mt-6 max-w-6xl text-[clamp(2.75rem,6.4vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.05em]">
          {HERO.headline}
        </h1>

        {/* Image composition: offset slab + irregular clip + open gate accents */}
        <div className="relative mt-12 md:mt-16">
          {/* Offset black plane behind the image */}
          <div
            aria-hidden
            className="absolute -bottom-5 left-6 right-0 top-8 bg-foreground md:left-10 md:top-10"
            style={{ clipPath: "polygon(6% 0, 100% 4%, 94% 100%, 0 96%)" }}
          />

          {/* Soft white wash plane for depth */}
          <div
            aria-hidden
            className="absolute -left-3 -top-3 h-[55%] w-[38%] bg-background/35 md:-left-5 md:-top-5"
            style={{ clipPath: "polygon(0 12%, 100% 0, 88% 100%, 0 100%)" }}
          />

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-cover.png"
              alt="A human hand and a robotic hand reach toward a globe and a sapling growing from an open book"
              className="relative z-10 aspect-[2/1] w-full object-cover"
              style={{
                clipPath: "polygon(0 10%, 100% 0, 100% 90%, 0 100%)",
              }}
            />

            {/* Open “gate” accents — incomplete corners, never a closed box */}
            <span
              aria-hidden
              className="absolute -left-1 top-[8%] z-20 h-16 w-16 border-l-[6px] border-t-[6px] border-foreground md:h-24 md:w-24 md:border-l-8 md:border-t-8"
            />
            <span
              aria-hidden
              className="absolute -right-1 bottom-[8%] z-20 h-16 w-16 border-b-[6px] border-r-[6px] border-foreground md:h-24 md:w-24 md:border-b-8 md:border-r-8"
            />

            {/* Diagonal slash accent */}
            <span
              aria-hidden
              className="absolute right-[12%] top-0 z-20 h-full w-[3px] origin-top rotate-[8deg] bg-foreground"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-1">
            <span aria-hidden className="block h-1 w-12 bg-foreground md:w-full" />
          </div>
          <p className="text-lg leading-relaxed md:col-span-7 md:text-xl">
            {HERO.subheading}
          </p>
          <div className="md:col-span-4 md:justify-self-end">
            <Link
              href={HERO.cta.href}
              className="group inline-flex min-h-12 items-center gap-3 bg-foreground px-8 text-sm font-bold uppercase tracking-wide text-primary transition-transform hover:scale-[1.02]"
            >
              {HERO.cta.label}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
