import type { MetadataRoute } from "next";
import { PROGRAMS, SITE } from "@/lib/content";
import { getPublishedReports } from "@/lib/project-reports";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticRoutes = ["", "/about", "/our-stories", "/get-involved", "/feedback"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));

  const programs = PROGRAMS.map((p) => ({
    url: `${base}/our-stories/${p.slug}`,
    lastModified: new Date(),
  }));

  const reports = await getPublishedReports();
  const stories = reports.map((s) => ({
    url: `${base}/our-stories/${s.slug}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
  }));

  return [...staticRoutes, ...programs, ...stories];
}
