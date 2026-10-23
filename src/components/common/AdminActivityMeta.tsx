import { Clock } from "lucide-react";
import { formatLastActive } from "@/lib/format";

interface AdminActivityMetaProps {
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}

export function AdminActivityMeta({
  lastUpdatedAt,
  lastUpdatedBy,
}: AdminActivityMetaProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 text-sm text-[var(--color-muted-foreground)]">
      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
      <div>
        <p className="font-medium text-[var(--color-foreground)]">
          {formatLastActive(lastUpdatedAt)}
        </p>
        {lastUpdatedBy ? (
          <p className="mt-0.5 text-xs">Update dari {lastUpdatedBy}</p>
        ) : null}
      </div>
    </div>
  );
}
