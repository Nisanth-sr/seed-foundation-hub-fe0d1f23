import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ArticleCardProps = {
  title: string;
  excerpt: string;
  category: string;
  href: string;
  image?: string;
};

export function ArticleCard({ title, excerpt, category, href, image }: ArticleCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col border border-foreground bg-background transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-foreground">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {category}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-3 inline-block w-fit bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {category}
        </span>
        <h3 className="text-xl font-semibold leading-snug group-hover:text-primary">{title}</h3>
        <p className="mt-3 flex-1 text-base leading-relaxed">{excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Read more <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
