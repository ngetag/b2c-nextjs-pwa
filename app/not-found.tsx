import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center md:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <Compass className="h-8 w-8" aria-hidden />
      </div>
      <div className="space-y-2">
        <p className="font-display text-5xl font-bold text-[var(--color-foreground)]">
          404
        </p>
        <h1 className="font-display text-xl font-bold text-[var(--color-foreground)]">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Halaman yang kamu cari belum ada atau sudah pindah tempat.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button asChild>
          <Link href={routes.home()}>Ke beranda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.explore()}>Eksplore</Link>
        </Button>
      </div>
    </div>
  );
}
