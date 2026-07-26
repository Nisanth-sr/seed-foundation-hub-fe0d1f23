import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalAdminConsole } from "./InternalAdminConsole";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ user?: string }>;
};

export default async function InternalPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const expected = process.env.NEXT_PUBLIC_ADMIN_CONSOLE_PATH;

  if (!expected || slug !== expected) {
    notFound();
  }

  const { user: userId } = await searchParams;

  return <InternalAdminConsole userId={userId} slug={slug} />;
}
