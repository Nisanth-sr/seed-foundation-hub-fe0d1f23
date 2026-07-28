import type { MetadataRoute } from "next";
import { PROGRAMS, SITE, STORIES } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticRoutes = ["", "/about", "/our-stories", "/get-involved"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));

  const programs = PROGRAMS.map((p) => ({
    url: `${base}/our-stories/${p.slug}`,
    lastModified: new Date(),
  }));

  const stories = STORIES.map((s) => ({
    url: `${base}/our-stories/${s.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...programs, ...stories];
}
