/** No-op analytics until GA4 is configured */
export function track(event: string, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event, payload ?? {});
  }
}
