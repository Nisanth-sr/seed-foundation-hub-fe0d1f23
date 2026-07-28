import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { GET_INVOLVED, SITE } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
import { InvolveForms } from "@/components/site/InvolveForms";
import { ContactForm } from "@/components/site/ContactForm";

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
        <div className="mb-16 grid gap-8 md:grid-cols-2">
          {GET_INVOLVED.paths.map((p) => (
            <div key={p.id} id={p.id} className="border border-foreground p-6 md:p-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold">{p.title}</h2>
              <p className="mt-4 text-base leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
        <InvolveForms />
      </Section>

      <Section
        id="contact"
        title="Contact"
        subtitle="We’d love to hear from you."
        bg="white"
        className="scroll-mt-24"
      >
        <div className="grid gap-12 lg:grid-cols-2">
          <ContactForm />
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold">Visit us</h3>
              <ul className="mt-6 space-y-2 text-base">
                <li>
                  <span className="font-semibold">Email:</span>{" "}
                  <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <span className="font-semibold">Phone:</span> {SITE.phone}
                </li>
                <li>
                  <span className="font-semibold">Hours:</span> {SITE.hours}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
