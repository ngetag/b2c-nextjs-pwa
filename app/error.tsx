"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // In production this would log to Sentry / equivalent.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center md:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]">
        <TriangleAlert className="h-8 w-8" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-xl font-bold text-[var(--color-foreground)]">
          Terjadi kesalahan
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Ada yang nyangkut saat memuat halaman ini. Coba ulang sebentar lagi.
        </p>
        {error.digest ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Kode: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </div>
      <Button onClick={reset}>Coba lagi</Button>
    </div>
  );
}
