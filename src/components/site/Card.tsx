import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type CardProps = {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function Card({ title, description, href, cta = "Learn more", icon, className }: CardProps) {
  const inner = (
    <>
      {icon && <div className="mb-6 text-primary">{icon}</div>}
      <h3 className="text-xl font-semibold leading-snug md:text-2xl">{title}</h3>
      <p className="mt-3 text-base leading-relaxed">{description}</p>
      {href && (
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {cta} <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </>
  );

  const classes = cn(
    "block border border-foreground bg-background p-6 transition-transform duration-300 hover:scale-[1.02] md:p-8",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
