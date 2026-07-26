import Link from "next/link";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { ArticleCard } from "@/components/site/ArticleCard";
import { Button } from "@/components/ui/button";
import { getStory, STORIES } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
import { ShareButtons } from "@/components/site/ShareButtons";

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return createMetadata({
    title: story.title,
    description: story.excerpt,
    path: `/stories/${slug}`,
  });
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const related = STORIES.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <Hero title={story.title} height="medium" align="left" />
      <Section spacing="md">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {story.category}
          </span>
          <ShareButtons title={story.title} path={`/stories/${slug}`} />
        </div>
        <article className="prose-seed max-w-3xl">
          <p className="text-lg leading-relaxed md:text-xl">{story.body}</p>
        </article>
        <div className="mt-12">
          <Button asChild variant="secondary">
            <Link href="/stories">← All stories</Link>
          </Button>
        </div>
      </Section>
      <Section title="Related stories" spacing="md">
        <div className="grid gap-8 md:grid-cols-3">
          {related.map((s) => (
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
