import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-admin-sans",
});

export const metadata: Metadata = {
  title: "SEED Admin Console",
  description: "Career assessment administration for SEED Foundation",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={dmSans.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
