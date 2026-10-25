"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TelemetryConsent, tracker } from "@/lib/tracker";

export function ConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [allowLocation, setAllowLocation] = useState(false);
  const [allowIp, setAllowIp] = useState(true);

  useEffect(() => {
    // Check if consent has already been saved
    const stored = localStorage.getItem("ngetag_user_consent");
    if (!stored) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSavePreferences = async (acceptCustom: boolean, allowAll = false) => {
    const updatedConsent: TelemetryConsent = {
      telemetry: true,
      ipConsent: allowAll ? true : acceptCustom ? allowIp : false,
      geoConsent: allowAll ? true : acceptCustom ? allowLocation : false,
    };

    tracker.setConsent(updatedConsent);

    if (updatedConsent.geoConsent) {
      await tracker.refreshGeolocation();
    }

    // Fire consent event
    tracker.track({
      eventType: "consent_updated",
      metadata: { ...updatedConsent },
      immediate: true,
    });

    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Pengaturan Privasi & Cookie"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-4 shadow-2xl backdrop-blur-md md:bottom-6 md:right-6 md:left-auto"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-sm font-semibold text-[var(--color-foreground)]">
            Personalisasi & Pengalaman Jelajah
          </h3>
          <p className="text-xs leading-relaxed text-[var(--color-muted-foreground)]">
            Ngetag menggunakan data aktivitas untuk menyarankan spot dan event yang relevan.
            Kami memerlukan izinmu sebelum mencatat perkiraan lokasi dan jaringan.
          </p>
        </div>
      </div>

      <div className="my-3 space-y-2 rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-surface-soft)] p-3 text-xs">
        <label className="flex cursor-pointer select-none items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[var(--color-primary)]" />
            <div>
              <span className="font-medium text-[var(--color-foreground)]">
                Analisis Jaringan (IP)
              </span>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                Membantu mendeteksi kota dan performa rute
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={allowIp}
            onChange={(e) => setAllowIp(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)] cursor-pointer"
          />
        </label>

        <label className="flex cursor-pointer select-none items-center justify-between gap-3 border-t border-[var(--color-border)]/40 pt-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--accent-coffee)]" />
            <div>
              <span className="font-medium text-[var(--color-foreground)]">
                Akurasi Lokasi Sekitar (GPS)
              </span>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                Mencari spot dan promo terdekat secara presisi
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={allowLocation}
            onChange={(e) => setAllowLocation(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)] cursor-pointer"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleSavePreferences(false, false)}
          className="rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)] transition-colors"
        >
          Tolak Semua Opsional
        </button>
        <Button
          type="button"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => handleSavePreferences(true, false)}
        >
          Simpan Pilihan
        </Button>
        <Button
          type="button"
          className="h-8 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] text-xs font-semibold"
          onClick={() => handleSavePreferences(true, true)}
        >
          Izinkan Semua
        </Button>
      </div>
    </div>
  );
}