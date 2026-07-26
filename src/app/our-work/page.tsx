import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { PROGRAMS, WORK_AREAS, type FocusArea } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
import { WorkFilters } from "@/components/site/WorkFilters";

export const metadata = createMetadata({
  title: "Our Work",
  description:
    "SEED Foundation programs spanning health awareness, education, environment, and disaster relief across Tamil Nadu.",
  path: "/our-work",
});

export default async function OurWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const params = await searchParams;
  const area = (params.area as FocusArea | undefined) || "all";
  const filtered =
    area === "all" ? PROGRAMS : PROGRAMS.filter((p) => p.focusArea === area);

  return (
    <>
      <Hero
        title="Our Work"
        subtitle="Creating impact through community action across four interconnected areas."
        height="medium"
        align="left"
      />

      <Section spacing="md">
        <div className="mb-12 grid gap-8 md:grid-cols-2">
          {WORK_AREAS.map((w) => (
            <div key={w.id} className="border border-foreground p-6">
              <h3 className="text-xl font-semibold">{w.title}</h3>
              <p className="mt-3 text-base leading-relaxed">{w.description}</p>
            </div>
          ))}
        </div>

        <WorkFilters active={area} />

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/our-work/${p.slug}`}
              className="flex flex-col border border-foreground transition-transform hover:scale-[1.01]"
            >
              <div className="flex aspect-[16/9] items-center justify-center bg-foreground">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {p.focusLabel}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {p.focusLabel}
                  </span>
                  <span className="border border-foreground px-3 py-1 text-xs font-semibold uppercase">
                    {p.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed">{p.summary}</p>
                <span className="mt-4 text-sm font-semibold text-primary">View details →</span>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-8 text-lg">No programs in this focus area yet.</p>
        )}
      </Section>
    </>
  );
}
