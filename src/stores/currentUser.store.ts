"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { demoUser } from "@/data/fixtures/users";
import { STORAGE_KEYS } from "@/lib/constants";
import type { User } from "@/types/user";

interface CurrentUserState {
  user: User;
  setUser: (user: User) => void;
  resetUser: () => void;
}

/**
 * Single mock user store. Seeded with demoUser on first mount.
 * No login/logout — every visitor "is" the demo user.
 */
export const useCurrentUserStore = create<CurrentUserState>()(
  persist(
    (set) => ({
      user: demoUser,
      setUser: (user) => set({ user }),
      resetUser: () => set({ user: demoUser }),
    }),
    {
      name: STORAGE_KEYS.user,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CurrentUserState>;
        return {
          ...state,
          user: {
            ...demoUser,
            ...state.user,
            interestIds: state.user?.interestIds ?? demoUser.interestIds,
            badges: state.user?.badges ?? demoUser.badges,
            preferences: {
              ...demoUser.preferences,
              ...state.user?.preferences,
            },
          },
        };
      },
    },
  ),
);
