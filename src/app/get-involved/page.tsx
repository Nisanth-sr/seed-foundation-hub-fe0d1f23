import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { GET_INVOLVED } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
import { InvolveForms } from "@/components/site/InvolveForms";

export const metadata = createMetadata({
  title: "Get Involved",
  description: GET_INVOLVED.intro,
  path: "/get-involved",
});

export default function GetInvolvedPage() {
  return (
    <>
      <Hero
        title="Get Involved"
        subtitle={GET_INVOLVED.intro}
        height="medium"
        align="left"
      />
      <Section>
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          {GET_INVOLVED.paths.map((p) => (
            <div key={p.id} id={p.id} className="border border-foreground p-6 md:p-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold">{p.title}</h2>
              <p className="mt-4 text-base leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
        <InvolveForms />
      </Section>
    </>
  );
}
