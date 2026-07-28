import Link from "next/link";
import {
  HeartPulse,
  GraduationCap,
  Leaf,
  HandHeart,
  ArrowRight,
} from "lucide-react";
import { HomeHero } from "@/components/site/HomeHero";
import { Section } from "@/components/site/Section";
import { Card } from "@/components/site/Card";
import { ArticleCard } from "@/components/site/ArticleCard";
import { Newsletter } from "@/components/site/Newsletter";
import { CtaStrip } from "@/components/site/CtaStrip";
import { Button } from "@/components/ui/button";
import {
  HERO,
  BELIEF,
  PILLARS,
  STORIES,
  APPROACH_STEPS,
  IMPACT,
} from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "SEED Foundation",
  description: HERO.subheading.slice(0, 155),
  path: "/",
});

const pillarIcons = {
  health: HeartPulse,
  education: GraduationCap,
  environment: Leaf,
  "disaster-relief": HandHeart,
};

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <Section id="home-mission" spacing="lg">
        <div className="mx-auto max-w-[600px] text-center">
          <p className="text-3xl font-bold leading-[1.25] md:text-4xl lg:text-5xl">
            We believe lasting change begins with{" "}
            <span className="text-primary">informed communities</span>.
          </p>
          <p className="mt-8 text-lg leading-relaxed">{BELIEF.body}</p>
          <Link
            href={BELIEF.cta.href}
            className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
          >
            {BELIEF.cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Section title="What We Work On" subtitle="Four interconnected areas of community action." bg="white">
        <div className="grid gap-[60px] md:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = pillarIcons[p.id];
            return (
              <Card
                key={p.id}
                title={p.title}
                description={p.description}
                href={p.href}
                icon={<Icon className="h-8 w-8" aria-hidden />}
              />
            );
          })}
        </div>
      </Section>

      <Section title="Stories of Impact" subtitle="Community action, told through the people and places we serve.">
        <div className="grid gap-8 md:grid-cols-3">
          {STORIES.slice(0, 3).map((s) => (
            <ArticleCard
              key={s.slug}
              title={s.title}
              excerpt={s.excerpt}
              category={s.category}
              href={`/stories/${s.slug}`}
              image={s.image}
            />
          ))}
        </div>
        <div className="mt-10">
          <Button asChild variant="primary">
            <Link href="/stories">Read all stories</Link>
          </Button>
        </div>
      </Section>

      <Section title="Impact" subtitle="Across documented initiatives, SEED FOUNDATION has worked with:" bg="black">
        <ul className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT.audiences.map((a) => (
            <li key={a} className="border border-background/40 px-4 py-3 text-sm md:text-base">
              {a}
            </li>
          ))}
        </ul>
        <h3 className="mb-6 text-2xl font-semibold text-primary">Reported outcomes</h3>
        <ul className="space-y-3">
          {IMPACT.outcomes.map((o) => (
            <li key={o} className="flex gap-3 text-base leading-relaxed">
              <span className="mt-2 h-2 w-2 shrink-0 bg-primary" aria-hidden />
              {o}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="How We Work"
        subtitle="Community change happens through collaboration. Every initiative follows a consistent approach."
      >
        <ol className="grid gap-8 md:grid-cols-5">
          {APPROACH_STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="text-sm font-semibold text-primary">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <Newsletter />
      </Section>

      <CtaStrip />
    </>
  );
}
