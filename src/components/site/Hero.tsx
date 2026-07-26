import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type HeroProps = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  cta?: { text: string; href: string };
  height?: "full" | "tall" | "medium";
  align?: "center" | "left";
};

const heightClass = {
  full: "min-h-[60vh] md:min-h-[90vh]",
  tall: "min-h-[50vh] md:min-h-[70vh]",
  medium: "min-h-[40vh] md:min-h-[50vh]",
};

export function Hero({
  title,
  subtitle,
  backgroundImage = "/images/hero-cover.png",
  cta,
  height = "full",
  align = "center",
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative isolate flex items-center overflow-hidden",
        heightClass[height],
      )}
    >
      <div
        className="absolute inset-0 -z-10 bg-foreground bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${backgroundImage})`,
        }}
      />
      <div
        className={cn(
          "container-x relative z-10 py-20",
          align === "center" ? "text-center" : "text-left max-w-3xl",
        )}
      >
        <h1 className="text-4xl font-bold leading-[1.2] tracking-[-0.5px] text-background md:text-5xl lg:text-[56px]">
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-6 text-lg leading-relaxed text-background/90 md:text-[28px] md:leading-snug",
              align === "center" && "mx-auto max-w-3xl",
            )}
          >
            {subtitle}
          </p>
        )}
        {cta && (
          <div className={cn("mt-10", align === "center" && "flex justify-center")}>
            <Button asChild variant="primary" size="lg">
              <Link href={cta.href}>{cta.text}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
