"use client";

import { SITE } from "@/lib/content";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const url = encodeURIComponent(`${SITE.url}${path}`);
  const text = encodeURIComponent(title);

  const links = [
    { label: "Twitter", href: `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: "Email", href: `mailto:?subject=${text}&body=${url}` },
  ];

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
