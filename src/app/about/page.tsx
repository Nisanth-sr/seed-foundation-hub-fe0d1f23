import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { CtaStrip } from "@/components/site/CtaStrip";
import { Button } from "@/components/ui/button";
import { ABOUT, APPROACH_STEPS } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description:
    "SEED FOUNDATION is a community-focused nonprofit delivering awareness programs, educational initiatives, environmental campaigns, and humanitarian relief across Tamil Nadu.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Hero title="About SEED Foundation" subtitle="Who we are and how we work." height="medium" align="left" />

      <Section title="Who We Are">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6 text-lg leading-relaxed">
            {ABOUT.whoWeAre.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <div className="flex min-h-[280px] items-center justify-center border border-foreground bg-foreground text-background">
            <p className="px-8 text-center text-sm uppercase tracking-wide text-primary">
              Image coming soon
            </p>
          </div>
        </div>
      </Section>

      <Section title="Our Approach" subtitle={ABOUT.approachIntro} bg="black">
        <h3 className="mb-6 text-xl font-semibold text-primary">Each program emphasizes</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT.principles.map((p) => (
            <li key={p} className="border border-background px-5 py-4 text-base">
              {p}
            </li>
          ))}
        </ul>
        <ol className="mt-16 grid gap-8 md:grid-cols-5">
          {APPROACH_STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="text-sm font-semibold text-primary">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Trustees & Leadership" subtitle="Leadership profiles will be published here.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-foreground p-6">
              <div className="mb-4 aspect-square bg-foreground" />
              <h3 className="text-lg font-semibold">Trustee name</h3>
              <p className="text-sm text-primary">Role — coming soon</p>
              <p className="mt-3 text-sm leading-relaxed">
                Biography and photo will be added when provided.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Button asChild variant="primary" size="lg">
            <Link href="/our-stories">Explore our stories</Link>
          </Button>
        </div>
      </Section>

      <CtaStrip />
    </>
  );
}
