import type { NextConfig } from "next";

/**
 * Map existing Vercel VITE_* / server keys onto NEXT_PUBLIC_* so the
 * preview/production deploy works without renaming every env var yet.
 */
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      "",
    NEXT_PUBLIC_ADMIN_CONSOLE_PATH:
      process.env.NEXT_PUBLIC_ADMIN_CONSOLE_PATH ||
      process.env.VITE_ADMIN_CONSOLE_PATH ||
      process.env.ADMIN_CONSOLE_PATH ||
      "",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://seedfound.org"),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/our-work", destination: "/our-stories", permanent: true },
      { source: "/our-work/:slug", destination: "/our-stories/:slug", permanent: true },
      { source: "/stories", destination: "/our-stories", permanent: true },
      { source: "/stories/:slug", destination: "/our-stories/:slug", permanent: true },
      { source: "/contact", destination: "/get-involved", permanent: true },
    ];
  },
};

export default nextConfig;
