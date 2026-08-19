import { toVideoEmbedSrc } from "@/lib/video-embed";

type ReportMedia = {
  id: string;
  kind: "image" | "video" | "video_embed";
  url: string | null;
  embedSrc: string | null;
  caption: string | null;
  altText: string | null;
};

export function ReportMediaGallery({ media }: { media: ReportMedia[] }) {
  if (media.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-bold">Photos and videos</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {media.map((item) => (
          <figure key={item.id} className="border border-foreground bg-background">
            {item.kind === "image" && item.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.altText || item.caption || ""} className="aspect-[4/3] w-full object-cover" />
            )}
            {item.kind === "video" && item.url && (
              <video src={item.url} className="aspect-video w-full bg-foreground object-cover" controls playsInline />
            )}
            {item.kind === "video_embed" && (item.embedSrc || (item.url && toVideoEmbedSrc(item.url))) && (
              <div className="relative aspect-video w-full">
                <iframe
                  src={item.embedSrc || toVideoEmbedSrc(item.url!)!}
                  title={item.caption || "Report video"}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
            {item.caption && (
              <figcaption className="border-t border-foreground px-4 py-3 text-sm leading-relaxed">{item.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
