import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { ArticleCard } from "@/components/site/ArticleCard";
import { WorkFilters } from "@/components/site/WorkFilters";
import { PROGRAMS, STORIES, WORK_AREAS, type FocusArea } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Our Stories",
  description:
    "SEED Foundation programs and stories spanning health awareness, education, environment, and disaster relief across Tamil Nadu.",
  path: "/our-stories",
});

export default async function OurStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const params = await searchParams;
  const area = (params.area as FocusArea | undefined) || "all";
  const filteredPrograms =
    area === "all" ? PROGRAMS : PROGRAMS.filter((p) => p.focusArea === area);
  const filteredStories =
    area === "all" ? STORIES : STORIES.filter((s) => s.focusArea === area);

  return (
    <>
      <Hero
        title="Our Stories"
        subtitle="Programs and community stories across four interconnected areas of action."
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

        <h2 className="mt-12 text-2xl font-semibold md:text-3xl">Programs</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {filteredPrograms.map((p) => (
            <Link
              key={p.slug}
              href={`/our-stories/${p.slug}`}
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
        {filteredPrograms.length === 0 && (
          <p className="mt-8 text-lg">No programs in this focus area yet.</p>
        )}
      </Section>

      <Section
        title="Stories of Impact"
        subtitle="Community action, told through the people and places we serve."
        bg="white"
      >
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((s) => (
            <ArticleCard
              key={s.slug}
              title={s.title}
              excerpt={s.excerpt}
              category={s.category}
              href={`/our-stories/${s.slug}`}
              image={s.image}
            />
          ))}
        </div>
        {filteredStories.length === 0 && (
          <p className="mt-8 text-lg">No stories in this focus area yet.</p>
        )}
      </Section>
    </>
  );
}
