export const FOCUS_AREAS = ["health", "education", "environment", "disaster-relief"] as const;
export type FocusArea = (typeof FOCUS_AREAS)[number];

export const FOCUS_AREA_LABELS: Record<FocusArea, string> = {
  health: "Health",
  education: "Education",
  environment: "Environment",
  "disaster-relief": "Disaster Relief",
};

export type ReportStatus = "draft" | "published";
export type MediaKind = "image" | "video" | "video_embed";

export type ReportMedia = {
  id: string;
  kind: MediaKind;
  storagePath: string | null;
  embedUrl: string | null;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  url: string | null;
};

export type ProjectReport = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  focusArea: FocusArea;
  category: string;
  eventDate: string | null;
  venue: string | null;
  coverImagePath: string | null;
  coverImageUrl: string | null;
  status: ReportStatus;
  featuredOnHomepage: boolean;
  publishedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  media: ReportMedia[];
};

export type ReportListRow = {
  id: string;
  slug: string;
  title: string;
  focusArea: FocusArea;
  category: string;
  eventDate: string | null;
  status: ReportStatus;
  featuredOnHomepage: boolean;
  coverImageUrl: string | null;
  updatedAt: string;
};

export type ReportPatch = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  focusArea: FocusArea;
  eventDate: string | null;
  venue: string | null;
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
