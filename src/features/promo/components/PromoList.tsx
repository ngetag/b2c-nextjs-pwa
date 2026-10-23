import { Tag as TagIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Promo } from "@/types/promo";

interface PromoListProps {
  promos: Promo[];
}

export function PromoList({ promos }: PromoListProps) {
  if (promos.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="font-display text-base font-semibold text-[var(--color-foreground)]">
        Promo yang lagi jalan
      </h2>
      <ul className="space-y-2">
        {promos.map((promo) => (
          <li
            key={promo.id}
            className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
              <TagIcon className="h-4 w-4" aria-hidden />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  {promo.title}
                </h3>
                {promo.discountPercent ? (
                  <span className="shrink-0 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent-foreground)]">
                    Hemat {promo.discountPercent}%
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {promo.description}
              </p>
              <div className="flex items-center gap-3 pt-0.5 text-[10px] font-semibold text-[var(--color-muted-foreground)]">
                <span>s/d {formatDate(promo.validUntil)}</span>
                {promo.code ? (
                  <span className="rounded bg-[var(--color-surface-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-foreground)]">
                    {promo.code}
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
