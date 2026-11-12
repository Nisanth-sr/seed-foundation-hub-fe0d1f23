import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PwaOpeningSplash } from "@/components/pwa-opening-splash";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SEED Chat",
  description: "A private AI assistant for SEED Foundation",
  applicationName: "SEED Chat",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SEED Chat",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#8ddd30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ServiceWorkerRegistration />
        <PwaOpeningSplash />
        {children}
      </body>
    </html>
  );
}
