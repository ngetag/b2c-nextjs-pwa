"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import { buildSpotVisitId, type SpotVisit } from "@/types/visit";
import { trackEvent } from "@/lib/telemetry/client";

interface MarkSpotVisitInput {
  userId: string;
  spotId: string;
  tagIds: string[];
  reviewed?: boolean;
}

interface VisitState {
  items: Record<string, SpotVisit>;
  markSpotVisit: (input: MarkSpotVisitInput) => void;
  listByUser: (userId: string) => SpotVisit[];
  clear: () => void;
}

export const useVisitStore = create<VisitState>()(
  persist(
    (set, get) => ({
      items: {},
      markSpotVisit: ({ userId, spotId, tagIds, reviewed = false }) => {
        const id = buildSpotVisitId(userId, spotId);
        const now = new Date().toISOString();
        const current = get().items[id];

        trackEvent("qr_scan", {
          targetType: "spot",
          targetId: spotId,
          tagIds,
        });

        if (typeof window !== "undefined") {
          void fetch("/api/engagements/visits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, spotId, tagIds, reviewed }),
          }).catch(() => null);
        }

        set({
          items: {
            ...get().items,
            [id]: current
              ? {
                  ...current,
                  tagIds: Array.from(new Set([...current.tagIds, ...tagIds])),
                  visitCount: current.visitCount + 1,
                  reviewCount: current.reviewCount + (reviewed ? 1 : 0),
                  lastVisitedAt: now,
                }
              : {
                  id,
                  userId,
                  spotId,
                  tagIds,
                  visitCount: 1,
                  reviewCount: reviewed ? 1 : 0,
                  firstVisitedAt: now,
                  lastVisitedAt: now,
                },
          },
        });
      },
      listByUser: (userId) =>
        Object.values(get().items)
          .filter((visit) => visit.userId === userId)
          .sort(
            (a, b) =>
              new Date(b.lastVisitedAt).getTime() -
              new Date(a.lastVisitedAt).getTime(),
          ),
      clear: () => set({ items: {} }),
    }),
    {
      name: STORAGE_KEYS.visit,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
