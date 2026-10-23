"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import { buildAttendanceId, type EventAttendance } from "@/types/attendance";
import { trackEvent } from "@/lib/telemetry/client";

interface AttendanceState {
  items: Record<string, EventAttendance>;
  isAttending: (eventId: string) => boolean;
  toggle: (eventId: string, userId: string) => boolean;
  remove: (eventId: string) => void;
  list: () => EventAttendance[];
  clear: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      items: {},
      isAttending: (eventId) => Boolean(get().items[eventId]),
      toggle: (eventId, userId) => {
        const existing = get().items[eventId];
        if (typeof window !== "undefined") {
          void fetch("/api/engagements/attendances", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, eventId }),
          }).catch(() => null);
        }
        trackEvent(existing ? "attendance_remove" : "attendance_add", {
          targetType: "event",
          targetId: eventId,
        });

        if (existing) {
          const rest = { ...get().items };
          delete rest[eventId];
          set({ items: rest });
          return false;
        }

        const attendance: EventAttendance = {
          id: buildAttendanceId(userId, eventId),
          eventId,
          userId,
          createdAt: new Date().toISOString(),
        };

        set({ items: { ...get().items, [eventId]: attendance } });
        return true;
      },
      remove: (eventId) => {
        const rest = { ...get().items };
        delete rest[eventId];
        set({ items: rest });
      },
      list: () =>
        Object.values(get().items).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      clear: () => set({ items: {} }),
    }),
    {
      name: STORAGE_KEYS.attendance,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
