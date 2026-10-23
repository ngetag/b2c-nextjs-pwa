import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

interface ResultGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ResultGrid({ children, className }: ResultGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 pt-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ResultGridSkeletonProps {
  count?: number;
}

export function ResultGridSkeleton({ count = 8 }: ResultGridSkeletonProps) {
  return (
    <ResultGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </ResultGrid>
  );
}
