"use client";

import { CalendarDays, Compass, Flame, Home, QrCode, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  match: string[];
}

const items: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home, match: ["/"] },
  { href: "/hype", label: "Hype", icon: Flame, match: ["/hype"] },
  { href: "/scan", label: "Scan", icon: QrCode, match: ["/scan"] },
  { href: "/search", label: "Jelajah", icon: Search, match: ["/search", "/explore", "/spots", "/events", "/tags"] },
  { href: "/profile", label: "Profil", icon: User, match: ["/profile", "/reviews"] },
];


function isActive(pathname: string, match: string[]): boolean {
  return match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-[420px] -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/60 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl md:hidden"
    >
      <ul className="flex items-center justify-between px-2">
        {items.map((item) => {
          const active = isActive(pathname, item.match);
          const Icon = item.icon;
          const isCenter = item.label === "Scan";

          if (isCenter) {
            return (
              <li key={item.href} className="relative flex items-center justify-center">
                <Link
                  href={item.href}
                  className="flex h-12 w-12 -translate-y-4 items-center justify-center rounded-full bg-gradient-to-tr from-[#7B61FF] to-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label="Scan QR Code"
                >
                  <Icon className="h-6 w-6 text-slate-950" strokeWidth={3} />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-all duration-200",
                  active
                    ? "text-[#00F5FF]"
                    : "text-gray-400 hover:text-white"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className="scale-90">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
