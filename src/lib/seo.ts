import type { Metadata } from "next";
import { SITE } from "./content";

const defaultOg = "/images/seed-logo.png";

export function createMetadata({
  title,
  description,
  path = "/",
  image = defaultOg,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${SITE.url}${path}`;
  const fullTitle = title === SITE.name ? title : `${title} | ${SITE.name}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE.url),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      images: [{ url: image }],
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "No. 36, R.C. Street, Elankadai, Kottar Post",
      addressLocality: "Nagercoil",
      addressRegion: "Tamil Nadu",
      postalCode: "629002",
      addressCountry: "IN",
    },
    identifier: [
      { "@type": "PropertyValue", name: "Trust Registration", value: SITE.compliance.trustReg },
      { "@type": "PropertyValue", name: "PAN", value: SITE.compliance.pan },
      { "@type": "PropertyValue", name: "DARPAN", value: SITE.compliance.darpan },
    ],
  };
}
