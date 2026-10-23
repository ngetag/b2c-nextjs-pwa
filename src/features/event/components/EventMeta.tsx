import { Calendar, Clock, MapPin, Ticket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatPriceRange, formatTime } from "@/lib/format";
import type { NgetagEvent } from "@/types/event";

interface EventMetaProps {
  event: NgetagEvent;
}

export function EventMeta({ event }: EventMetaProps) {
  const sameDay =
    new Date(event.startAt).toDateString() ===
    new Date(event.endAt).toDateString();

  return (
    <Card>
      <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
        <MetaRow
          icon={Calendar}
          label="Tanggal"
          value={
            sameDay
              ? formatDate(event.startAt)
              : `${formatDate(event.startAt)} – ${formatDate(event.endAt)}`
          }
        />
        <MetaRow
          icon={Clock}
          label="Waktu"
          value={`${formatTime(event.startAt)} – ${formatTime(event.endAt)} WIB`}
        />
        <MetaRow
          icon={MapPin}
          label="Lokasi"
          value={`${event.venueName}, ${event.location.district ?? event.location.city}`}
        />
        <MetaRow
          icon={Ticket}
          label="Harga"
          value={formatPriceRange(event.price)}
          highlight
        />
        {event.capacity ? (
          <MetaRow
            icon={Users}
            label="Kapasitas"
            value={`${event.capacity.toLocaleString("id-ID")} orang`}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

interface MetaRowProps {
  icon: typeof Calendar;
  label: string;
  value: string;
  highlight?: boolean;
}

function MetaRow({ icon: Icon, label, value, highlight }: MetaRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-[var(--color-muted-foreground)]">
          {label}
        </p>
        <p
          className={
            highlight
              ? "font-display text-base font-semibold text-[var(--color-primary)]"
              : "text-sm font-medium text-[var(--color-foreground)]"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}
