"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { routes } from "@/config/routes";
import { formatDateShort, formatTime } from "@/lib/format";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useBookmarkStore } from "@/stores/bookmark.store";
import type { NgetagEvent } from "@/types/event";

interface AttendanceCalendarViewProps {
  events: NgetagEvent[];
}

interface CalendarEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "wishlist" | "attending";
  event?: NgetagEvent;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getUpcomingAttendingEvents(events: NgetagEvent[], ids: Set<string>) {
  return events
    .filter((event) => ids.has(event.id))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function AttendanceCalendarView({ events }: AttendanceCalendarViewProps) {
  const mounted = useIsMounted();
  const attendanceItems = useAttendanceStore((state) => state.items);
  const bookmarkedItems = useBookmarkStore((state) => state.items);
  const attendingIds = new Set(mounted ? Object.keys(attendanceItems) : []);
  const bookmarkedIds = new Set(
    (mounted ? Object.values(bookmarkedItems) : [])
      .filter((bookmark) => bookmark.targetType === "event")
      .map((bookmark) => bookmark.targetId),
  );
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const YEAR = currentDate.getFullYear();
  const MONTH = currentDate.getMonth();
  const MONTH_LABEL = `${MONTH_NAMES[MONTH]} ${YEAR}`;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(YEAR, MONTH - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(YEAR, MONTH + 1, 1));
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const wishlistedEvents = events.filter(
    (event) => bookmarkedIds.has(event.id),
  );
  const attendingEvents = getUpcomingAttendingEvents(events, attendingIds);
  const entries: CalendarEntry[] = [
    ...wishlistedEvents.map((event) => ({
      id: `wishlist-${event.id}`,
      title: event.title,
      date: event.startAt.slice(0, 10),
      time: formatTime(event.startAt),
      type: "wishlist" as const,
      event,
    })),
    ...attendingEvents
      .filter((event) => !wishlistedEvents.some((wishlisted) => wishlisted.id === event.id))
      .map((event) => ({
        id: `attending-${event.id}`,
        title: event.title,
        date: event.startAt.slice(0, 10),
        time: formatTime(event.startAt),
        type: "attending" as const,
        event,
      })),
  ];

  const firstDay = new Date(YEAR, MONTH, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
  const calendarCells = Array.from({ length: offset + daysInMonth }, (_, index) =>
    index < offset ? null : index - offset + 1,
  );
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
        <section className="glass rounded-3xl border p-4 md:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Agenda kamu</p>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground">{MONTH_LABEL}</h2>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} aria-label="Bulan sebelumnya"><ChevronLeft /></Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} aria-label="Bulan berikutnya"><ChevronRight /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground">
            {WEEKDAYS.map((day) => <span key={day} className="py-2">{day}</span>)}
            {calendarCells.map((day, index) => {
              const key = day ? dateKey(YEAR, MONTH, day) : `empty-${index}`;
              const dayEntries = day ? entries.filter((entry) => entry.date === key) : [];
              return day ? (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-16 rounded-xl border p-1.5 text-left transition-colors md:min-h-20 ${selectedDate === key ? "border-primary bg-primary/10" : "border-border/70 bg-surface-soft/60 hover:border-primary/50"}`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${selectedDate === key ? "bg-primary font-bold text-primary-foreground" : "text-foreground"}`}>{day}</span>
                  <div className="mt-1 space-y-1">
                    {dayEntries.slice(0, 2).map((entry) => <span key={entry.id} className={`block truncate rounded px-1 py-0.5 text-[9px] font-semibold ${entry.type === "wishlist" ? "bg-accent-music/15 text-accent-music" : "bg-primary/15 text-primary"}`}>{entry.title}</span>)}
                  </div>
                </button>
              ) : <span key={key} className="min-h-16 md:min-h-20" />;
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-border/70 pt-4 text-[11px] text-muted-foreground">
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-accent-music" />Wishlist tiket</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />Ikut event</span>
          </div>
        </section>

        <section className="glass rounded-3xl border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-music">
                {selectedDate.slice(-2)} {MONTH_NAMES[parseInt(selectedDate.slice(5, 7), 10) - 1]}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-foreground">Agenda hari ini</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {selectedEntries.length > 0 ? selectedEntries.map((entry) => (
              <div key={entry.id} className="flex gap-3 rounded-2xl border border-border bg-surface-soft/70 p-3">
                <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary"><Ticket className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{entry.title}</p><p className="mt-1 text-xs text-muted-foreground">{entry.time}{entry.event ? ` · ${entry.event.venueName}` : ""}</p></div>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">Belum ada event wishlist atau event yang kamu ikuti di tanggal ini.</p>}
          </div>
        </section>
      </div>

      <div>
        <section className="space-y-3">
          <SectionHeader title="Wishlist tiket" subtitle="Event yang kamu nantikan otomatis muncul di kalender." />
          {wishlistedEvents.length > 0 ? wishlistedEvents.map((event) => (
            <Link key={event.id} href={routes.event(event.id)} className="flex items-center gap-3 rounded-2xl border border-border bg-surface/80 p-3 transition-colors hover:border-accent-music/70">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-music/10 text-accent-music"><CalendarDays className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{event.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateShort(event.startAt)} · {formatTime(event.startAt)} WIB · {event.organizer.name}</p></div>
              <span className="hidden rounded-full bg-accent-music/10 px-2 py-1 text-[10px] font-semibold text-accent-music sm:inline">Wishlist</span>
            </Link>
          )) : <EmptyState title="Belum ada wishlist" description="Simpan event yang kamu incar agar masuk ke kalender." />}
        </section>

      </div>
    </div>
  );
}

interface ProfileUpcomingEventsProps { events: NgetagEvent[]; }

export function ProfileUpcomingEvents({ events }: ProfileUpcomingEventsProps) {
  const attendanceItems = useAttendanceStore((state) => state.items);
  const upcomingEvents = getUpcomingAttendingEvents(events, new Set(Object.keys(attendanceItems))).slice(0, 3);
  return <section className="space-y-3"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-foreground">Event Mendatang</h3><Link href={routes.calendar()} className="text-xs font-medium text-primary">Lihat kalender</Link></div>{upcomingEvents.length > 0 ? <div className="space-y-2">{upcomingEvents.map((event) => <Link key={event.id} href={routes.event(event.id)} className="block rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary"><p className="line-clamp-1 text-sm font-medium text-foreground">{event.title}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateShort(event.startAt)} · {formatTime(event.startAt)} WIB</p></Link>)}</div> : <p className="text-xs text-muted-foreground">Belum ada event yang kamu tandai.</p>}</section>;
}
