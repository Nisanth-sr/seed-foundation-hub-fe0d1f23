import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEED Chat",
  description: "A private AI assistant for SEED Foundation",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
