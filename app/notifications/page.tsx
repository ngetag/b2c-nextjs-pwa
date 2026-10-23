"use client";

import Link from "next/link";
import { Bell, CalendarDays, ChevronRight, Ticket } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import { useIsMounted } from "@/hooks/useIsMounted";

export default function NotificationsPage() {
  const mounted = useIsMounted();
  const { items: notifications, markAsRead } = useNotificationStore();

  if (!mounted) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
      <header className="space-y-2 pb-6">
        <div className="h-1 w-10 rounded-full bg-accent-coffee" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Notifikasi</h1>
            <p className="mt-2 text-sm text-muted-foreground">Update event dan tiket yang kamu nantikan.</p>
          </div>
          <div className="rounded-2xl border border-accent-coffee/25 bg-accent-coffee/10 p-3 text-accent-coffee"><Bell className="h-5 w-5" /></div>
        </div>
      </header>

      <section className="space-y-3" aria-label="Daftar notifikasi">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const read = !notification.unread;
            const Icon = notification.type === "ticket" ? Ticket : CalendarDays;
            return (
              <Link
                key={notification.id}
                href={notification.href}
                onClick={() => markAsRead(notification.id)}
                className={`group flex items-start gap-3 rounded-3xl border p-4 transition-colors hover:border-primary md:p-5 ${read ? "border-border bg-surface/70" : "border-accent-coffee/35 bg-accent-coffee/5"}`}
              >
                <div className={`mt-0.5 rounded-xl p-2.5 ${read ? "bg-surface-elevated text-muted-foreground" : "bg-accent-coffee/15 text-accent-coffee"}`}><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-foreground">{notification.title}</h2>{!read ? <span className="h-2 w-2 rounded-full bg-accent-coffee" /> : null}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{notification.detail}</p>
                </div>
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Belum ada notifikasi saat ini.
          </p>
        )}
      </section>

      <p className="mt-5 text-center text-xs text-muted-foreground">Klik notifikasi untuk melihat event terkait di kalender.</p>
    </div>
  );
}
