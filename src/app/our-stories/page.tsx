import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { ArticleCard } from "@/components/site/ArticleCard";
import { WorkFilters } from "@/components/site/WorkFilters";
import { WORK_AREAS, type FocusArea } from "@/lib/content";
import { getPublishedReports } from "@/lib/project-reports";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Our Stories",
  description:
    "SEED Foundation stories spanning health awareness, education, environment, and disaster relief across Tamil Nadu.",
  path: "/our-stories",
});

export const revalidate = 60;

export default async function OurStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const params = await searchParams;
  const area = (params.area as FocusArea | undefined) || "all";
  const reports = await getPublishedReports();
  const filteredStories = area === "all" ? reports : reports.filter((s) => s.focusArea === area);

  return (
    <>
      <Hero title="Our Stories" subtitle="Community stories across four interconnected areas of action." height="medium" align="left" />

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
              image={s.coverImageUrl}
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
