"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Review } from "@/types/review";

interface ReviewState {
  /** User-created reviews (in addition to fixture reviews). */
  items: Review[];
  add: (review: Review) => void;
  update: (id: string, patch: Partial<Review>) => void;
  remove: (id: string) => void;
  listBySpot: (spotId: string) => Review[];
  listByAuthor: (authorId: string) => Review[];
  clear: () => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (review) => set({ items: [review, ...get().items] }),
      update: (id, patch) =>
        set({
          items: get().items.map((r) =>
            r.id === id
              ? { ...r, ...patch, updatedAt: new Date().toISOString() }
              : r,
          ),
        }),
      remove: (id) => set({ items: get().items.filter((r) => r.id !== id) }),
      listBySpot: (spotId) =>
        get()
          .items.filter((r) => r.spotId === spotId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
      listByAuthor: (authorId) =>
        get()
          .items.filter((r) => r.authorId === authorId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
      clear: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEYS.review,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
