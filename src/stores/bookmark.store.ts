"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import { demoUser } from "@/data/fixtures/users";
import {
  type Bookmark,
  type BookmarkTargetType,
  buildBookmarkId,
  buildBookmarkKey,
} from "@/types/bookmark";

interface BookmarkState {
  /** Keyed by `${type}:${id}` for O(1) lookup. */
  items: Record<string, Bookmark>;
  isBookmarked: (type: BookmarkTargetType, id: string) => boolean;
  toggle: (
    type: BookmarkTargetType,
    targetId: string,
    userId: string,
  ) => boolean;
  remove: (type: BookmarkTargetType, targetId: string) => void;
  listByType: (type: BookmarkTargetType) => Bookmark[];
  clear: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      // Seed two wishlist events so the frontend prototype has an initial state.
      items: Object.fromEntries(
        ["e12", "e5"].map((targetId) => {
          const bookmark: Bookmark = {
            id: buildBookmarkId(demoUser.id, "event", targetId),
            userId: demoUser.id,
            targetType: "event",
            targetId,
            createdAt: "2026-08-28T10:00:00.000Z",
          };
          return [buildBookmarkKey("event", targetId), bookmark];
        }),
      ),
      isBookmarked: (type, id) => Boolean(get().items[buildBookmarkKey(type, id)]),
      toggle: (type, targetId, userId) => {
        const key = buildBookmarkKey(type, targetId);
        const existing = get().items[key];
        if (existing) {
          const { [key]: _removed, ...rest } = get().items;
          set({ items: rest });
          return false;
        }
        const bookmark: Bookmark = {
          id: buildBookmarkId(userId, type, targetId),
          userId,
          targetType: type,
          targetId,
          createdAt: new Date().toISOString(),
        };
        set({ items: { ...get().items, [key]: bookmark } });
        return true;
      },
      remove: (type, targetId) => {
        const key = buildBookmarkKey(type, targetId);
        const { [key]: _removed, ...rest } = get().items;
        set({ items: rest });
      },
      listByType: (type) =>
        Object.values(get().items)
          .filter((b) => b.targetType === type)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
      clear: () => set({ items: {} }),
    }),
    {
      name: STORAGE_KEYS.bookmark,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
