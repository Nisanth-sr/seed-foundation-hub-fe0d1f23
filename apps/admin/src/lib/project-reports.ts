import "server-only";
import { supabaseAdmin } from "./supabase/admin";
import { toVideoEmbedSrc } from "./video-embed";
import {
  FOCUS_AREA_LABELS,
  FOCUS_AREAS,
  slugify,
  type FocusArea,
  type MediaKind,
  type ProjectReport,
  type ReportListRow,
  type ReportMedia,
  type ReportPatch,
  type ReportStatus,
} from "./project-report-shared";
import { createEmptyReport, serializeReportBody } from "./parse-report-body";

export {
  FOCUS_AREAS,
  FOCUS_AREA_LABELS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  slugify,
  type FocusArea,
  type MediaKind,
  type ProjectReport,
  type ReportListRow,
  type ReportMedia,
  type ReportPatch,
  type ReportStatus,
} from "./project-report-shared";

const BUCKET = "project-reports";
const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function supabasePublicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!base) return path;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}

function publicSiteOrigin() {
  return (process.env.PUBLIC_SITE_URL || "https://seedfound.org").replace(/\/$/, "");
}

export function resolveAdminMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${publicSiteOrigin()}${path}`;
  return supabasePublicUrl(path);
}

function isFocusArea(value: string): value is FocusArea {
  return (FOCUS_AREAS as readonly string[]).includes(value);
}

function mapMedia(row: {
  id: string;
  kind: string;
  storage_path: string | null;
  embed_url: string | null;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
}): ReportMedia {
  const kind = row.kind as MediaKind;
  const url =
    kind === "video_embed"
      ? row.embed_url
      : resolveAdminMediaUrl(row.storage_path);

  return {
    id: row.id,
    kind,
    storagePath: row.storage_path,
    embedUrl: row.embed_url,
    altText: row.alt_text,
    caption: row.caption,
    sortOrder: row.sort_order,
    url,
  };
}

export async function listReports(): Promise<ReportListRow[]> {
  const selectWithFeatured =
    "id, slug, title, focus_area, category, event_date, status, featured_on_homepage, cover_image_path, updated_at";
  const selectLegacy =
    "id, slug, title, focus_area, category, event_date, status, cover_image_path, updated_at";

  const primary = await supabaseAdmin
    .from("project_reports")
    .select(selectWithFeatured)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  const result =
    primary.error && /featured_on_homepage/i.test(primary.error.message)
      ? await supabaseAdmin
          .from("project_reports")
          .select(selectLegacy)
          .order("event_date", { ascending: false, nullsFirst: false })
          .order("updated_at", { ascending: false })
      : primary;

  if (result.error) throw new Error(result.error.message);

  return (result.data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    focusArea: isFocusArea(row.focus_area) ? row.focus_area : "health",
    category: row.category,
    eventDate: row.event_date,
    status: row.status === "published" ? "published" : "draft",
    featuredOnHomepage: Boolean((row as { featured_on_homepage?: boolean }).featured_on_homepage),
    coverImageUrl: resolveAdminMediaUrl(row.cover_image_path),
    updatedAt: row.updated_at,
  }));
}

export async function getReport(id: string): Promise<ProjectReport | null> {
  const { data, error } = await supabaseAdmin.from("project_reports").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: media, error: mediaError } = await supabaseAdmin
    .from("project_report_media")
    .select("*")
    .eq("report_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (mediaError) throw new Error(mediaError.message);

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    focusArea: isFocusArea(data.focus_area) ? data.focus_area : "health",
    category: data.category,
    eventDate: data.event_date,
    venue: data.venue,
    coverImagePath: data.cover_image_path,
    coverImageUrl: resolveAdminMediaUrl(data.cover_image_path),
    status: data.status === "published" ? "published" : "draft",
    featuredOnHomepage: !!data.featured_on_homepage,
    publishedAt: data.published_at,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    media: (media ?? []).map(mapMedia),
  };
}

export async function createDraftReport(createdBy: string): Promise<string> {
  const slug = `draft-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("project_reports")
    .insert({
      title: "Untitled report",
      slug,
      excerpt: "",
      body: serializeReportBody(createEmptyReport()),
      focus_area: "health",
      category: FOCUS_AREA_LABELS.health,
      status: "draft",
      created_by: createdBy,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateReport(id: string, patch: ReportPatch) {
  const slug = slugify(patch.slug || patch.title);
  if (!slug) throw new Error("Slug is required");
  if (!patch.title.trim()) throw new Error("Title is required");
  if (!FOCUS_AREAS.includes(patch.focusArea)) throw new Error("Invalid focus area");

  const { error } = await supabaseAdmin
    .from("project_reports")
    .update({
      title: patch.title.trim(),
      slug,
      excerpt: patch.excerpt.trim(),
      body: patch.body,
      focus_area: patch.focusArea,
      category: FOCUS_AREA_LABELS[patch.focusArea],
      event_date: patch.eventDate || null,
      venue: patch.venue?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") throw new Error("That slug is already used by another report");
    throw new Error(error.message);
  }
}

export async function setReportStatus(id: string, status: ReportStatus) {
  const { data: current, error: readError } = await supabaseAdmin
    .from("project_reports")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!current) throw new Error("Report not found");

  const { error } = await supabaseAdmin
    .from("project_reports")
    .update({
      status,
      published_at:
        status === "published" ? (current.published_at ?? new Date().toISOString()) : current.published_at,
      ...(status === "draft" ? { featured_on_homepage: false } : {}),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function setReportFeatured(id: string, featured: boolean) {
  const { data: current, error: readError } = await supabaseAdmin
    .from("project_reports")
    .select("status, published_at")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!current) throw new Error("Report not found");

  const { error } = await supabaseAdmin
    .from("project_reports")
    .update({
      featured_on_homepage: featured,
      ...(featured
        ? {
            status: "published" as const,
            published_at: current.published_at ?? new Date().toISOString(),
          }
        : {}),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteReport(id: string) {
  const { data: media } = await supabaseAdmin
    .from("project_report_media")
    .select("storage_path")
    .eq("report_id", id);

  const { data: report } = await supabaseAdmin
    .from("project_reports")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();

  const paths = [
    ...(media ?? []).map((m) => m.storage_path).filter((p): p is string => !!p && !p.startsWith("/")),
    ...(report?.cover_image_path && !report.cover_image_path.startsWith("/") ? [report.cover_image_path] : []),
  ];

  if (paths.length > 0) {
    await supabaseAdmin.storage.from(BUCKET).remove(paths);
  }

  const { error } = await supabaseAdmin.from("project_reports").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createSignedUpload(reportId: string, fileName: string, mimeType: string) {
  const { data: report, error: reportError } = await supabaseAdmin
    .from("project_reports")
    .select("id")
    .eq("id", reportId)
    .maybeSingle();
  if (reportError) throw new Error(reportError.message);
  if (!report) throw new Error("Report not found");

  let kind: "image" | "video";
  if (IMAGE_MIME.has(mimeType)) kind = "image";
  else if (VIDEO_MIME.has(mimeType)) kind = "video";
  else throw new Error("Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, or WebM.");

  const ext = (fileName.split(".").pop() || (kind === "image" ? "jpg" : "mp4"))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${reportId}/${crypto.randomUUID()}.${ext || "bin"}`;

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw new Error(error.message);

  return { path, token: data.token, signedUrl: data.signedUrl, kind };
}

export async function addUploadedMedia(
  reportId: string,
  path: string,
  kind: "image" | "video",
  caption?: string,
) {
  if (!path.startsWith(`${reportId}/`)) throw new Error("Invalid upload path");

  const { data: existing } = await supabaseAdmin
    .from("project_report_media")
    .select("sort_order")
    .eq("report_id", reportId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabaseAdmin.from("project_report_media").insert({
    report_id: reportId,
    kind,
    storage_path: path,
    caption: caption?.trim() || null,
    alt_text: caption?.trim() || null,
    sort_order: sortOrder,
  });
  if (error) throw new Error(error.message);
}

export async function setCoverImage(reportId: string, path: string | null) {
  const { data: current, error: readError } = await supabaseAdmin
    .from("project_reports")
    .select("cover_image_path")
    .eq("id", reportId)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const previous = current?.cover_image_path;
  if (previous && !previous.startsWith("/") && previous !== path) {
    await supabaseAdmin.storage.from(BUCKET).remove([previous]);
  }

  const { error } = await supabaseAdmin
    .from("project_reports")
    .update({ cover_image_path: path })
    .eq("id", reportId);
  if (error) throw new Error(error.message);
}

export async function addVideoEmbed(reportId: string, url: string, caption?: string) {
  const embed = toVideoEmbedSrc(url);
  if (!embed) throw new Error("Use a YouTube or Vimeo URL");

  const { data: existing } = await supabaseAdmin
    .from("project_report_media")
    .select("sort_order")
    .eq("report_id", reportId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabaseAdmin.from("project_report_media").insert({
    report_id: reportId,
    kind: "video_embed",
    embed_url: url.trim(),
    caption: caption?.trim() || null,
    sort_order: sortOrder,
  });
  if (error) throw new Error(error.message);
}

export async function updateMediaCaption(mediaId: string, caption: string) {
  const { error } = await supabaseAdmin
    .from("project_report_media")
    .update({ caption: caption.trim() || null, alt_text: caption.trim() || null })
    .eq("id", mediaId);
  if (error) throw new Error(error.message);
}

export async function deleteMedia(mediaId: string) {
  const { data, error: readError } = await supabaseAdmin
    .from("project_report_media")
    .select("storage_path")
    .eq("id", mediaId)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  if (data?.storage_path && !data.storage_path.startsWith("/")) {
    await supabaseAdmin.storage.from(BUCKET).remove([data.storage_path]);
  }

  const { error } = await supabaseAdmin.from("project_report_media").delete().eq("id", mediaId);
  if (error) throw new Error(error.message);
}

export async function moveMedia(reportId: string, mediaId: string, direction: "up" | "down") {
  const { data, error } = await supabaseAdmin
    .from("project_report_media")
    .select("id, sort_order")
    .eq("report_id", reportId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const items = data ?? [];
  const index = items.findIndex((item) => item.id === mediaId);
  if (index < 0) throw new Error("Media not found");
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= items.length) return;

  const a = items[index];
  const b = items[swapWith];
  const { error: e1 } = await supabaseAdmin
    .from("project_report_media")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id);
  const { error: e2 } = await supabaseAdmin
    .from("project_report_media")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
}
