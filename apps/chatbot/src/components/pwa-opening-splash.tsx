"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function PwaOpeningSplash() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!isStandalone || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    try {
      if (window.sessionStorage.getItem("seed-pwa-opening-shown")) return;
      window.sessionStorage.setItem("seed-pwa-opening-shown", "true");
    } catch (error) {
      console.error("Could not check whether the PWA opening animation was shown", error);
    }

    setMounted(true);
    setVisible(true);
    const closeTimer = window.setTimeout(() => setVisible(false), 3800);
    const unmountTimer = window.setTimeout(() => setMounted(false), 4200);
    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`pwa-splash${visible ? "" : " closing"}`} aria-hidden="true">
      <Image src="/opening.gif" alt="" width={602} height={606} unoptimized priority />
    </div>
  );
}
