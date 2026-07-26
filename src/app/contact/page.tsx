import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { SITE } from "@/lib/content";
import { createMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata = createMetadata({
  title: "Contact",
  description: `Contact SEED Foundation at ${SITE.address}`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Hero title="Contact" subtitle="We’d love to hear from you." height="medium" align="left" />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <ContactForm />
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Visit us</h2>
              <p className="mt-4 text-base leading-relaxed">{SITE.address}</p>
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
            <div className="aspect-[4/3] w-full border border-foreground">
              <iframe
                title="SEED Foundation location map"
                src={SITE.mapEmbed}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
