import * as React from "react";
import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[linear-gradient(90deg,var(--color-muted),var(--color-border),var(--color-muted))]",
        className,
      )}
      {...props}
    />
  );
}
