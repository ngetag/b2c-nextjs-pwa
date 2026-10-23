import { cn } from "@/lib/cn";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Horizontal scrolling container with hidden scrollbar and edge padding.
 */
export function HorizontalScroll({
  children,
  className,
}: HorizontalScrollProps) {
  return (
    <div
      className={cn(
        "scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 pt-2 md:mx-0 md:px-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
