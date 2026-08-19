"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  FOCUS_AREAS,
  FOCUS_AREA_LABELS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  slugify,
  type FocusArea,
  type ProjectReport,
} from "@/lib/project-report-shared";
import { toVideoEmbedSrc } from "@/lib/video-embed";
import {
  actionAddVideoEmbed,
  actionAttachMedia,
  actionClearCover,
  actionCreateMediaUpload,
  actionDeleteMedia,
  actionDeleteReport,
  actionMoveMedia,
  actionSaveReport,
  actionSetReportFeatured,
  actionSetReportStatus,
  actionUpdateMediaCaption,
} from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const selectClassName =
  "flex h-10 w-full rounded border border-foreground bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ReportEditor({ report }: { report: ProjectReport }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(report.title);
  const [slug, setSlug] = useState(report.slug);
  const [slugTouched, setSlugTouched] = useState(!report.slug.startsWith("draft-"));
  const [excerpt, setExcerpt] = useState(report.excerpt);
  const [body, setBody] = useState(report.body);
  const [focusArea, setFocusArea] = useState<FocusArea>(report.focusArea);
  const [eventDate, setEventDate] = useState(report.eventDate ?? "");
  const [venue, setVenue] = useState(report.venue ?? "");
  const [status, setStatus] = useState(report.status);
  const [featured, setFeatured] = useState(report.featuredOnHomepage);
  const [coverUrl, setCoverUrl] = useState(report.coverImageUrl);
  const [media, setMedia] = useState(report.media);
  const [embedUrl, setEmbedUrl] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStatus(report.status);
    setFeatured(report.featuredOnHomepage);
    setCoverUrl(report.coverImageUrl);
    setMedia(report.media);
  }, [report]);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value) || slug);
  }

  function save() {
    startTransition(async () => {
      const result = await actionSaveReport(report.id, {
        title,
        slug,
        excerpt,
        body,
        focusArea,
        eventDate: eventDate || null,
        venue,
      });
      if (!result.ok) toast.error(result.error);
      else {
        toast.success("Saved");
        router.refresh();
      }
    });
  }

  function setVisible(next: "draft" | "published") {
    startTransition(async () => {
      const saved = await actionSaveReport(report.id, {
        title,
        slug,
        excerpt,
        body,
        focusArea,
        eventDate: eventDate || null,
        venue,
      });
      if (!saved.ok) {
        toast.error(saved.error);
        return;
      }
      const result = await actionSetReportStatus(report.id, next);
      if (!result.ok) toast.error(result.error);
      else {
        setStatus(next);
        if (next === "draft") setFeatured(false);
        toast.success(next === "published" ? "Visible on Our Stories" : "Hidden from website");
        router.refresh();
      }
    });
  }

  function setHomepage(next: boolean) {
    startTransition(async () => {
      const saved = await actionSaveReport(report.id, {
        title,
        slug,
        excerpt,
        body,
        focusArea,
        eventDate: eventDate || null,
        venue,
      });
      if (!saved.ok) {
        toast.error(saved.error);
        return;
      }
      const result = await actionSetReportFeatured(report.id, next);
      if (!result.ok) toast.error(result.error);
      else {
        setFeatured(next);
        if (next) setStatus("published");
        toast.success(next ? "Promoted to homepage" : "Removed from homepage");
        router.refresh();
      }
    });
  }

  async function uploadFile(file: File, asCover: boolean) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (asCover && !isImage) {
      toast.error("Cover must be an image");
      return;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      toast.error("Images must be 10 MB or smaller");
      return;
    }
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      toast.error("Videos must be 50 MB or smaller");
      return;
    }

    setUploading(asCover ? "cover" : "gallery");
    try {
      const signed = await actionCreateMediaUpload(report.id, file.name, file.type);
      if (!signed.ok) {
        toast.error(signed.error);
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from("project-reports")
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (error) {
        toast.error(error.message);
        return;
      }
      const attached = await actionAttachMedia(report.id, signed.path, signed.kind, asCover);
      if (!attached.ok) {
        toast.error(attached.error);
        return;
      }
      toast.success(asCover ? "Cover image updated" : "Media added");
      router.refresh();
    } finally {
      setUploading(null);
    }
  }

  function addEmbed() {
    const src = toVideoEmbedSrc(embedUrl);
    if (!src) {
      toast.error("Use a YouTube or Vimeo URL");
      return;
    }
    startTransition(async () => {
      const result = await actionAddVideoEmbed(report.id, embedUrl);
      if (!result.ok) toast.error(result.error);
      else {
        setEmbedUrl("");
        toast.success("Video added");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{title || "Untitled report"}</h1>
          <p className="text-sm text-muted-foreground">/our-stories/{slug || "…"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status === "published" ? <Badge variant="success">Visible on Our Stories</Badge> : <Badge variant="muted">Hidden</Badge>}
          {featured && status === "published" ? <Badge variant="success">Homepage</Badge> : null}
          <Button type="button" variant="outline" disabled={pending} onClick={save}>
            Save
          </Button>
          <Button
            type="button"
            variant={status === "published" ? "outline" : "primary"}
            disabled={pending}
            onClick={() => setVisible(status === "published" ? "draft" : "published")}
          >
            {status === "published" ? "Hide from website" : "Show on website"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setHomepage(!featured)}
          >
            {featured ? "Remove from homepage" : "Promote to homepage"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="focus">Focus area</Label>
            <select
              id="focus"
              className={selectClassName}
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value as FocusArea)}
            >
              {FOCUS_AREAS.map((area) => (
                <option key={area} value={area}>
                  {FOCUS_AREA_LABELS[area]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eventDate">Event date</Label>
            <Input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="excerpt">Short summary (shown on cards)</Label>
            <Textarea id="excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="body">Report body</Label>
            <Textarea id="body" className="min-h-[320px] font-mono text-xs leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cover image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="max-h-56 w-full max-w-md object-cover" />
          ) : (
            <p className="text-sm text-muted-foreground">No cover image yet</p>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              ref={coverInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void uploadFile(file, true);
              }}
            />
            <Button type="button" variant="outline" disabled={!!uploading} onClick={() => coverInput.current?.click()}>
              {uploading === "cover" ? "Uploading…" : "Upload cover"}
            </Button>
            {coverUrl && (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await actionClearCover(report.id);
                    if (!result.ok) toast.error(result.error);
                    else setCoverUrl(null);
                  });
                }}
              >
                Remove cover
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images and videos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              ref={galleryInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void uploadFile(file, false);
              }}
            />
            <Button type="button" variant="outline" disabled={!!uploading} onClick={() => galleryInput.current?.click()}>
              {uploading === "gallery" ? "Uploading…" : "Upload image or video"}
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[240px] flex-1 space-y-1.5">
              <Label htmlFor="embed">YouTube or Vimeo URL</Label>
              <Input
                id="embed"
                placeholder="https://www.youtube.com/watch?v=…"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" disabled={pending || !embedUrl.trim()} onClick={addEmbed}>
              Add video
            </Button>
          </div>

          <ul className="space-y-4">
            {media.map((item, index) => (
              <li key={item.id} className="grid gap-3 border border-foreground/20 p-3 md:grid-cols-[180px_1fr]">
                <MediaPreview item={item} />
                <div className="space-y-2">
                  <Input
                    defaultValue={item.caption ?? ""}
                    placeholder="Caption"
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === (item.caption ?? "")) return;
                      startTransition(async () => {
                        const result = await actionUpdateMediaCaption(report.id, item.id, value);
                        if (!result.ok) toast.error(result.error);
                        else setMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, caption: value } : m)));
                      });
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || index === 0}
                      onClick={() => {
                        startTransition(async () => {
                          const result = await actionMoveMedia(report.id, item.id, "up");
                          if (!result.ok) toast.error(result.error);
                        });
                      }}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || index === media.length - 1}
                      onClick={() => {
                        startTransition(async () => {
                          const result = await actionMoveMedia(report.id, item.id, "down");
                          if (!result.ok) toast.error(result.error);
                        });
                      }}
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          const result = await actionDeleteMedia(report.id, item.id);
                          if (!result.ok) toast.error(result.error);
                          else setMedia((prev) => prev.filter((m) => m.id !== item.id));
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
            {media.length === 0 && <li className="text-sm text-muted-foreground">No gallery items yet</li>}
          </ul>
        </CardContent>
      </Card>

      <form
        action={actionDeleteReport.bind(null, report.id)}
        onSubmit={(e) => {
          if (!window.confirm("Delete this report? This cannot be undone.")) e.preventDefault();
        }}
      >
        <Button type="submit" variant="destructive">
          Delete report
        </Button>
      </form>
    </div>
  );
}

function MediaPreview({ item }: { item: ProjectReport["media"][number] }) {
  if (item.kind === "image" && item.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.url} alt={item.altText ?? ""} className="h-32 w-full object-cover" />
    );
  }
  if (item.kind === "video" && item.url) {
    return <video src={item.url} className="h-32 w-full bg-foreground object-cover" controls />;
  }
  const embed = item.embedUrl ? toVideoEmbedSrc(item.embedUrl) : null;
  if (embed) {
    return (
      <iframe
        src={embed}
        title={item.caption || "Video"}
        className="h-32 w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return <div className="flex h-32 items-center justify-center bg-muted text-xs">Media</div>;
}
