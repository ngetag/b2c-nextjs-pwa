import type { DayKey, OpeningHour } from "@/types/spot";

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Senin",
  tue: "Selasa",
  wed: "Rabu",
  thu: "Kamis",
  fri: "Jumat",
  sat: "Sabtu",
  sun: "Minggu",
};

export const DAY_ORDER: DayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

const JS_DAY_TO_KEY: Record<number, DayKey> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

/**
 * Sort opening hours in Senin → Minggu order.
 */
export function sortHours(hours: OpeningHour[]): OpeningHour[] {
  return [...hours].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
}

/**
 * Get today's opening hour entry.
 */
export function getTodayHours(
  hours: OpeningHour[],
  now: Date = new Date(),
): OpeningHour | null {
  const key = JS_DAY_TO_KEY[now.getDay()];
  return hours.find((h) => h.day === key) ?? null;
}
