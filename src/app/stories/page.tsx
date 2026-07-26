import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { ArticleCard } from "@/components/site/ArticleCard";
import { STORIES } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Stories of Impact",
  description:
    "Stories from SEED Foundation programs — health awareness, education, environment, and humanitarian relief.",
  path: "/stories",
});

export default function StoriesPage() {
  return (
    <>
      <Hero
        title="Stories of Impact"
        subtitle="Community action, told through the people and places we serve."
        height="medium"
        align="left"
      />
      <Section>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((s) => (
            <ArticleCard
              key={s.slug}
              title={s.title}
              excerpt={s.excerpt}
              category={s.category}
              href={`/stories/${s.slug}`}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
