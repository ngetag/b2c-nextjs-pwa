"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  buildCommunityMembershipId,
  type CommunityMembership,
} from "@/types/community";

interface CommunityState {
  items: Record<string, CommunityMembership>;
  isJoined: (communityId: string) => boolean;
  toggle: (communityId: string, userId: string) => boolean;
  remove: (communityId: string) => void;
  list: () => CommunityMembership[];
  clear: () => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      items: {},
      isJoined: (communityId) => Boolean(get().items[communityId]),
      toggle: (communityId, userId) => {
        const existing = get().items[communityId];
        if (typeof window !== "undefined") {
          void fetch("/api/engagements/memberships", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, communityId }),
          }).catch(() => null);
        }
        if (existing) {
          const rest = { ...get().items };
          delete rest[communityId];
          set({ items: rest });
          return false;
        }

        const membership: CommunityMembership = {
          id: buildCommunityMembershipId(userId, communityId),
          communityId,
          userId,
          joinedAt: new Date().toISOString(),
        };

        set({ items: { ...get().items, [communityId]: membership } });
        return true;
      },
      remove: (communityId) => {
        const rest = { ...get().items };
        delete rest[communityId];
        set({ items: rest });
      },
      list: () =>
        Object.values(get().items).sort(
          (a, b) =>
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
        ),
      clear: () => set({ items: {} }),
    }),
    {
      name: STORAGE_KEYS.community,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
