import Link from "next/link";
import { notFound } from "next/navigation";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { ArticleCard } from "@/components/site/ArticleCard";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/site/ShareButtons";
import { ReportMediaGallery } from "@/components/site/ReportMediaGallery";
import { getProgram, PROGRAMS } from "@/lib/content";
import { getPublishedReportBySlug, getPublishedReports } from "@/lib/project-reports";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const reports = await getPublishedReports();
  const programSlugs = PROGRAMS.map((p) => ({ slug: p.slug }));
  const reportSlugs = reports.map((r) => ({ slug: r.slug }));
  return [...programSlugs, ...reportSlugs];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  if (report) {
    return createMetadata({
      title: report.title,
      description: report.excerpt,
      path: `/our-stories/${slug}`,
      image: report.coverImageUrl,
    });
  }
  const program = getProgram(slug);
  if (program) {
    return createMetadata({
      title: program.title,
      description: program.summary,
      path: `/our-stories/${slug}`,
    });
  }
  return {};
}

export default async function OurStoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await getPublishedReportBySlug(slug);
  const program = getProgram(slug);

  if (report) {
    const all = await getPublishedReports();
    const related = all.filter((s) => s.slug !== slug).slice(0, 3);

    return (
      <>
        <Hero title={report.title} height="medium" align="left" backgroundImage={report.coverImageUrl} />
        <Section spacing="md">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {report.category}
            </span>
            {report.eventDate && (
              <span className="text-sm text-muted-foreground">
                {new Date(`${report.eventDate}T00:00:00`).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {report.venue && <span className="text-sm text-muted-foreground">{report.venue}</span>}
            <ShareButtons title={report.title} path={`/our-stories/${slug}`} />
          </div>
          <article className="prose-seed max-w-3xl">
            <p className="whitespace-pre-line text-lg leading-relaxed md:text-xl">{report.body}</p>
          </article>
          <ReportMediaGallery media={report.media} />
          <div className="mt-12">
            <Button asChild variant="secondary">
              <Link href="/our-stories">← All stories</Link>
            </Button>
          </div>
        </Section>
        {related.length > 0 && (
          <Section title="Related stories" spacing="md">
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((s) => (
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
          </Section>
        )}
      </>
    );
  }

  if (!program) notFound();

  const all = await getPublishedReports();
  const relatedStory = program.storySlug ? all.find((s) => s.slug === program.storySlug) : undefined;
  const related = all
    .filter((s) => s.focusArea === program.focusArea && s.slug !== program.storySlug)
    .slice(0, 2);

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
              <Link href={`/our-stories/${relatedStory.slug}`}>Read the story →</Link>
            </Button>
          </div>
        )}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-semibold">More in {program.focusLabel}</h3>
            <ul className="space-y-4">
              {related.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/our-stories/${s.slug}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-12">
          <Button asChild variant="secondary">
            <Link href="/our-stories">← All stories</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
