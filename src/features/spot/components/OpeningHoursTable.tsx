import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { DAY_LABELS, DAY_ORDER, sortHours } from "@/lib/openingHours";
import type { OpeningHour } from "@/types/spot";

interface OpeningHoursTableProps {
  hours: OpeningHour[];
}

export function OpeningHoursTable({ hours }: OpeningHoursTableProps) {
  const sorted = sortHours(hours);
  const todayKey = DAY_ORDER[(new Date().getDay() + 6) % 7]; // Mon=0..Sun=6 → align with our DAY_ORDER

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Jam Buka</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-[var(--color-border)]">
          {sorted.map((h) => {
            const isToday = h.day === todayKey;
            return (
              <li
                key={h.day}
                className={cn(
                  "flex items-center justify-between py-2 text-sm",
                  isToday && "font-medium text-[var(--color-foreground)]",
                )}
              >
                <span
                  className={
                    isToday
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-muted-foreground)]"
                  }
                >
                  {DAY_LABELS[h.day]}
                  {isToday ? <span className="ml-1.5 text-xs">· hari ini</span> : null}
                </span>
                <span
                  className={
                    h.closed
                      ? "text-[var(--color-destructive)]"
                      : "text-[var(--color-foreground)]"
                  }
                >
                  {h.closed ? "Tutup" : `${h.open} – ${h.close}`}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
