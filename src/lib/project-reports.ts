import "server-only";
import { unstable_cache } from "next/cache";
import { STORIES, type FocusArea } from "@/lib/content";
import { createPublicSupabase } from "@/lib/supabase/public";
import { toVideoEmbedSrc } from "@/lib/video-embed";

const BUCKET = "project-reports";

export type ReportMedia = {
  id: string;
  kind: "image" | "video" | "video_embed";
  url: string | null;
  embedSrc: string | null;
  caption: string | null;
  altText: string | null;
};

export type PublicReport = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  focusArea: FocusArea;
  category: string;
  eventDate: string | null;
  venue: string | null;
  coverImageUrl?: string;
  publishedAt: string | null;
  updatedAt: string;
  media: ReportMedia[];
};

function supabasePublicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!base) return path;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}

export function resolvePublicMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path;
  return supabasePublicUrl(path);
}

function isFocusArea(value: string): value is FocusArea {
  return value === "health" || value === "education" || value === "environment" || value === "disaster-relief";
}

function isMissingRelation(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  return /could not find the table|does not exist|schema cache/i.test(error.message ?? "");
}

function fromLegacyStories(): PublicReport[] {
  return STORIES.map((story) => ({
    id: `legacy-${story.slug}`,
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    body: story.body,
    focusArea: story.focusArea,
    category: story.category,
    eventDate: null,
    venue: null,
    coverImageUrl: story.image,
    publishedAt: null,
    updatedAt: "",
    media: [],
  }));
}

type ReportRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  focus_area: string;
  category: string;
  event_date: string | null;
  venue: string | null;
  cover_image_path: string | null;
  published_at: string | null;
  updated_at: string;
  project_report_media?: {
    id: string;
    kind: string;
    storage_path: string | null;
    embed_url: string | null;
    alt_text: string | null;
    caption: string | null;
    sort_order: number;
  }[];
};

function mapReport(row: ReportRow): PublicReport {
  const media = [...(row.project_report_media ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => {
      const kind = item.kind as ReportMedia["kind"];
      return {
        id: item.id,
        kind,
        url: kind === "video_embed" ? item.embed_url : resolvePublicMediaUrl(item.storage_path) ?? null,
        embedSrc: item.embed_url ? toVideoEmbedSrc(item.embed_url) : null,
        caption: item.caption,
        altText: item.alt_text,
      };
    });

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    focusArea: isFocusArea(row.focus_area) ? row.focus_area : "health",
    category: row.category,
    eventDate: row.event_date,
    venue: row.venue,
    coverImageUrl: resolvePublicMediaUrl(row.cover_image_path),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    media,
  };
}

const SELECT =
  "id, slug, title, excerpt, body, focus_area, category, event_date, venue, cover_image_path, published_at, updated_at, project_report_media (id, kind, storage_path, embed_url, alt_text, caption, sort_order)";

async function fetchPublishedReports(): Promise<PublicReport[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("project_reports")
      .select(SELECT)
      .eq("status", "published")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false });

    if (error) {
      if (isMissingRelation(error)) return fromLegacyStories();
      console.error("[project-reports]", error.message);
      return fromLegacyStories();
    }

    return (data ?? []).map((row) => mapReport(row as ReportRow));
  } catch (err) {
    console.error("[project-reports]", err);
    return fromLegacyStories();
  }
}

async function fetchPublishedReportBySlug(slug: string): Promise<PublicReport | null> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("project_reports")
      .select(SELECT)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      if (isMissingRelation(error)) {
        return fromLegacyStories().find((story) => story.slug === slug) ?? null;
      }
      console.error("[project-reports]", error.message);
      return fromLegacyStories().find((story) => story.slug === slug) ?? null;
    }

    return data ? mapReport(data as ReportRow) : null;
  } catch (err) {
    console.error("[project-reports]", err);
    return fromLegacyStories().find((story) => story.slug === slug) ?? null;
  }
}

export const getPublishedReports = unstable_cache(fetchPublishedReports, ["project-reports-list"], {
  tags: ["project-reports"],
  revalidate: 60,
});

export const getPublishedReportBySlug = unstable_cache(
  fetchPublishedReportBySlug,
  ["project-reports-by-slug"],
  { tags: ["project-reports"], revalidate: 60 },
);
