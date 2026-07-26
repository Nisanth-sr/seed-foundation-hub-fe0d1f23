import type { MetadataRoute } from "next";
import { PROGRAMS, SITE, STORIES } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticRoutes = ["", "/about", "/our-work", "/stories", "/get-involved", "/contact"].map(
    (path) => ({
      url: `${base}${path || "/"}`,
      lastModified: new Date(),
    }),
  );

  const programs = PROGRAMS.map((p) => ({
    url: `${base}/our-work/${p.slug}`,
    lastModified: new Date(),
  }));

  const stories = STORIES.map((s) => ({
    url: `${base}/stories/${s.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...programs, ...stories];
}
