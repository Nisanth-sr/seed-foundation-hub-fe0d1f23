import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: "default" | "outline" | "success" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "outline" && "border border-foreground",
        variant === "success" && "bg-primary/30 text-foreground",
        variant === "muted" && "bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
