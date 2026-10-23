"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Client-side landing after an OAuth redirect. The auth cookies are already set
 * by the callback route; this component hydrates the session and forwards the
 * visitor to their original destination.
 */
export function OAuthCallback({ next }: { next: string }) {
  const router = useRouter();
  const { reload } = useAuth();
  const [message, setMessage] = useState("Menyelesaikan proses masuk…");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function finish() {
      try {
        await reload();
        if (!cancelled) router.replace(next);
      } catch {
        if (!cancelled) setMessage("Gagal menyelesaikan sesi. Coba masuk lagi.");
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [next, reload, router]);

  return (
    <div className="glass-accent flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
      </span>
      <div>
        <h1 className="font-display text-lg font-bold">Menyambungkan akun</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      </div>
    </div>
  );
}
