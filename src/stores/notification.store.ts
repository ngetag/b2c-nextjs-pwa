import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NgetagNotification {
  id: string;
  title: string;
  description: string;
  detail: string;
  href: string;
  type: "ticket" | "calendar" | "system";
  unread: boolean;
  createdAt: string;
}

interface NotificationState {
  items: NgetagNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (
    notification: Omit<NgetagNotification, "id" | "unread" | "createdAt">,
  ) => void;
}

const initialNotifications: NgetagNotification[] = [
  {
    id: "ticket-available",
    title: "Tiket sudah tersedia",
    description: "Indonesia Coffee Festival sudah mulai menjual tiketnya.",
    detail: "5 September 2026 · Wishlist kamu",
    href: "/calendar?event=e12",
    type: "ticket",
    unread: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "event-calendar",
    title: "Event masuk ke kalender",
    description: "Indie Clash Vol. 5 tersimpan dari wishlist kamu.",
    detail: "19 September 2026 · M Bloc Space",
    href: "/calendar?event=e5",
    type: "calendar",
    unread: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "promoter-update",
    title: "Ada update dari promotor",
    description:
      "Java Festival Production mengumumkan detail terbaru event.",
    detail: "Kemarin · Java Festival Production",
    href: "/calendar?event=e1",
    type: "ticket",
    unread: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      items: initialNotifications,
      markAsRead: (id) => {
        if (typeof window !== "undefined") {
          void fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          }).catch(() => null);
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, unread: false } : item,
          ),
        }));
      },
      markAllAsRead: () => {
        if (typeof window !== "undefined") {
          void fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAllAsRead: true }),
          }).catch(() => null);
        }
        set((state) => ({
          items: state.items.map((item) => ({ ...item, unread: false })),
        }));
      },
      addNotification: (notification) => {
        if (typeof window !== "undefined") {
          void fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notification),
          }).catch(() => null);
        }
        set((state) => ({
          items: [
            {
              ...notification,
              id: Math.random().toString(36).slice(2, 9),
              unread: true,
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ],
        }));
      },
    }),
    {
      name: "ngetag-notifications",
    },
  ),
);

export const useUnreadNotificationCount = () => {
  return useNotificationStore(
    (state) => state.items.filter((item) => item.unread).length,
  );
};
