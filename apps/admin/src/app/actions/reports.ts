"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  addUploadedMedia,
  addVideoEmbed,
  createDraftReport,
  createSignedUpload,
  deleteMedia,
  deleteReport,
  moveMedia,
  setCoverImage,
  setReportStatus,
  updateMediaCaption,
  updateReport,
  type ReportPatch,
  type ReportStatus,
} from "@/lib/project-reports";
import { revalidatePublicSite } from "@/lib/revalidate-public";

async function refresh(reportId?: string) {
  revalidatePath("/reports");
  if (reportId) revalidatePath(`/reports/${reportId}`);
  await revalidatePublicSite();
}

export async function actionCreateReport() {
  const { user } = await requireAdmin();
  const id = await createDraftReport(user.id);
  redirect(`/reports/${id}`);
}

export async function actionSaveReport(reportId: string, patch: ReportPatch) {
  try {
    await requireAdmin();
    await updateReport(reportId, patch);
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Save failed" };
  }
}

export async function actionSetReportStatus(reportId: string, status: ReportStatus) {
  try {
    await requireAdmin();
    await setReportStatus(reportId, status);
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function actionDeleteReport(reportId: string) {
  await requireAdmin();
  await deleteReport(reportId);
  await refresh();
  redirect("/reports");
}

export async function actionCreateMediaUpload(reportId: string, fileName: string, mimeType: string) {
  try {
    await requireAdmin();
    const upload = await createSignedUpload(reportId, fileName, mimeType);
    return { ok: true as const, ...upload };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Upload failed" };
  }
}

export async function actionAttachMedia(
  reportId: string,
  path: string,
  kind: "image" | "video",
  asCover: boolean,
  caption?: string,
) {
  try {
    await requireAdmin();
    if (asCover && kind === "image") {
      await setCoverImage(reportId, path);
    } else {
      await addUploadedMedia(reportId, path, kind, caption);
    }
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Attach failed" };
  }
}

export async function actionAddVideoEmbed(reportId: string, url: string, caption?: string) {
  try {
    await requireAdmin();
    await addVideoEmbed(reportId, url, caption);
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Embed failed" };
  }
}

export async function actionUpdateMediaCaption(reportId: string, mediaId: string, caption: string) {
  try {
    await requireAdmin();
    await updateMediaCaption(mediaId, caption);
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function actionDeleteMedia(reportId: string, mediaId: string) {
  try {
    await requireAdmin();
    await deleteMedia(mediaId);
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

export async function actionMoveMedia(reportId: string, mediaId: string, direction: "up" | "down") {
  try {
    await requireAdmin();
    await moveMedia(reportId, mediaId, direction);
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Reorder failed" };
  }
}

export async function actionClearCover(reportId: string) {
  try {
    await requireAdmin();
    await setCoverImage(reportId, null);
    await refresh(reportId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Update failed" };
  }
}
