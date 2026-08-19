import "server-only";

/** Tell the public website to drop its project-reports cache. */
export async function revalidatePublicSite() {
  const origin = process.env.PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!origin || !secret) return;

  try {
    await fetch(`${origin.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag: "project-reports" }),
    });
  } catch {
    // Public site may not be running locally; admin writes still succeed.
  }
}
