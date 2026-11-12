"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((cause: unknown) => {
      console.error("Could not register the SEED Chat service worker", cause);
    });
  }, []);

  return null;
}
