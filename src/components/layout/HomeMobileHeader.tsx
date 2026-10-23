"use client";

import Image from "next/image";
import {
  Bell,
  ChevronDown,
  Filter,
  CalendarDays,
  Coffee,
  Grid2x2,
  MapPin,
  Search,
  Pizza,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatHomeLocation } from "@/lib/location";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import { useUnreadNotificationCount } from "@/stores/notification.store";
import { useIsMounted } from "@/hooks/useIsMounted";

export function HomeMobileHeader() {
  const { location, status } = useCurrentLocationStore();
  const { user } = useCurrentUserStore();
  const unreadCount = useUnreadNotificationCount();
  const mounted = useIsMounted();

  const locationLabel =
    status === "detecting" ? "Mendeteksi..." : formatHomeLocation(location);
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <section className="-mx-4 -mt-5 relative w-[calc(100%+2rem)] min-h-[390px] overflow-hidden bg-[var(--color-background)] px-4 pb-5 pt-6 md:hidden">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/bg-header.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(13_14_21_/_0.16),rgb(13_14_21_/_0.58))]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/70 via-[var(--color-background)]/35 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[390px] flex-col justify-between">
        {/* ── Top bar: location + bell ── */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/location"
            className="inline-flex items-center gap-1 text-[var(--color-foreground)] transition-colors duration-200 ease-out hover:text-[var(--color-secondary)]"
            aria-label="Ubah lokasi aktif"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-secondary)]" aria-hidden />
            <span className="max-w-36 truncate text-sm font-medium">{locationLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/50" aria-hidden />
          </Link>

          <Link
            href="/notifications"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/8 text-[var(--color-foreground)] transition-colors duration-200 ease-out hover:text-[var(--color-secondary)]"
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" aria-hidden />
            {mounted && unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent-coffee" aria-label="Ada notifikasi baru" />
            )}
          </Link>
        </div>

        {/* ── Greeting + headline ── */}
        <div className="flex-1 my-auto flex flex-col justify-center items-start space-y-2 text-left">
          <p className="text-[15px] font-medium leading-none text-white">
            Hi, <span className="font-semibold text-[#C7D2FE]">{firstName}</span> 👋
          </p>
          <h1 className="max-w-[12ch] text-[36px] font-bold leading-snug tracking-normal text-white sm:text-[38px]">
            <span className="inline-block">Mau</span>{" "}
            <span className="bg-gradient-to-r from-[#5B9BFF] via-[#9B73FF] to-[#CF8FFF] bg-clip-text text-transparent">
              ngapain
            </span>
            <br />
            hari ini?
          </h1>
        </div>

        <div className="mt-auto pt-4">
          <Link
            href="/search"
            className="relative flex h-12 w-full flex-1 items-center gap-3 rounded-full border border-white/25 bg-gradient-to-b from-white/20 via-white/8 to-white/5 px-4 text-sm text-white/80 shadow-[inset_0_1.5px_1px_0_rgba(255,255,255,0.45),inset_0_-1px_1px_0_rgba(0,0,0,0.3),0_12px_36px_rgba(0,0,0,0.4)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:border-white/35 hover:from-white/25 hover:to-white/10 active:scale-[0.99]"
            aria-label="Buka pencarian"
          >
            <Search className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Cari spot, event, komunitas, tag...</span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white/60 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.14)]">
              <Filter className="h-3 w-3" aria-hidden />
            </span>
          </Link>
        </div>

        <div className="mt-4 flex gap-0 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { label: "Kafe", href: "/search?q=kafe", bg: "bg-[#C67C2E]", icon: Coffee },
            { label: "Makan", href: "/search?q=makan", bg: "bg-[#D4973A]", icon: Pizza },
            { label: "Event", href: "/search?q=event", bg: "bg-[#C2185B]", icon: CalendarDays },
            { label: "Komunitas", href: "/communities", bg: "bg-[#1A7A8A]", icon: Users },
            { label: "Semua", href: "/search", bg: "bg-white/12", icon: Grid2x2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex min-w-[76px] flex-col items-center gap-1 transition-all duration-150 ease-out active:scale-95"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${item.bg} shadow-[0_4px_14px_rgb(0_0_0_/_0.35)]`}
                >
                  <Icon className="h-6 w-6 text-white" aria-hidden />
                </span>
                <span className="text-[12px] font-medium text-white/80">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
