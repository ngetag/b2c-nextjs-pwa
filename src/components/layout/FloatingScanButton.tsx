import { QrCode } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";

/**
 * Desktop-only shortcut for the scanner. Mobile exposes this in BottomNav.
 */
export function FloatingScanButton() {
  return (
    <Link
      href={routes.scan()}
      className="fixed bottom-8 right-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#7B61FF] to-[#00F5FF] text-slate-950 shadow-[0_0_25px_rgba(0,245,255,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_35px_rgba(0,245,255,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5FF] md:inline-flex xl:bottom-10 xl:right-10"
      aria-label="Scan QR Code"
      title="Scan QR Code"
    >
      <QrCode className="h-6 w-6 text-slate-950" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}

