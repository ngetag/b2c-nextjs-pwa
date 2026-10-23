import type { Metadata } from "next";
import { searchEvents } from "@/data/repositories/event.repo";
import { AttendanceCalendarView } from "@/features/calendar/components/AttendanceCalendarView";

export const metadata: Metadata = {
  title: "Kalender",
  description: "Event yang akan kamu datangi di NgeTag.",
};

export default async function CalendarPage() {
  const eventsResult = await searchEvents({ pageSize: 100 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--accent-music)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          Kalender
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Event incaranmu, rapi di satu tempat.
        </p>
      </header>

      <AttendanceCalendarView events={eventsResult.items} />
    </div>
  );
}
