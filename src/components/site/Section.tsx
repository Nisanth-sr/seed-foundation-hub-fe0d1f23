import { cn } from "@/lib/utils";

type SectionProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  bg?: "white" | "black" | "green";
  spacing?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
};

const spacingClass = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-20",
  lg: "py-20 md:py-[100px]",
};

const bgClass = {
  white: "bg-background text-foreground",
  black: "bg-foreground text-background",
  green: "bg-primary text-primary-foreground",
};

export function Section({
  title,
  subtitle,
  children,
  bg = "white",
  spacing = "lg",
  className,
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn(bgClass[bg], spacingClass[spacing], className)}>
      <div className="container-x">
        {(title || subtitle) && (
          <div className="mb-12 max-w-3xl">
            {title && (
              <h2 className="text-3xl font-bold leading-[1.25] md:text-4xl lg:text-5xl">{title}</h2>
            )}
            {subtitle && <p className="mt-4 text-lg leading-relaxed md:text-xl">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
