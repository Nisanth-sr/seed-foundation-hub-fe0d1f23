import Link from "next/link";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { getProgram, getStory, PROGRAMS, STORIES } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  return createMetadata({
    title: program.title,
    description: program.summary,
    path: `/our-work/${slug}`,
  });
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const relatedStory = program.storySlug ? getStory(program.storySlug) : undefined;
  const related = STORIES.filter((s) => s.focusArea === program.focusArea && s.slug !== program.storySlug).slice(0, 2);

  return (
    <>
      <Hero title={program.title} subtitle={program.summary} height="medium" align="left" />
      <Section>
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {program.focusLabel}
          </span>
          <span className="border border-foreground px-3 py-1 text-xs font-semibold uppercase">
            {program.status}
          </span>
        </div>
        <p className="max-w-3xl text-lg leading-relaxed">{program.description}</p>
        {relatedStory && (
          <div className="mt-10 border border-foreground p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Related story</p>
            <h3 className="mt-2 text-2xl font-semibold">{relatedStory.title}</h3>
            <p className="mt-3 text-base leading-relaxed">{relatedStory.excerpt}</p>
            <Button asChild variant="link" className="mt-4">
              <Link href={`/stories/${relatedStory.slug}`}>Read the story →</Link>
            </Button>
          </div>
        )}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-semibold">More in {program.focusLabel}</h3>
            <ul className="space-y-4">
              {related.map((s) => (
                <li key={s.slug}>
                  <Link href={`/stories/${s.slug}`} className="font-semibold text-primary hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-12">
          <Button asChild variant="secondary">
            <Link href="/our-work">← All programs</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
