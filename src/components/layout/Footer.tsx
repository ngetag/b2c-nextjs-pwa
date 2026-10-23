import Link from "next/link";
import { NgetagLogo } from "@/components/brand/NgetagLogo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

/**
 * Site-wide footer. Hidden on mobile to leave room for BottomNav.
 */
export function Footer() {
  return (
    <footer className="glass-subtle hidden border-t border-[var(--glass-border)] md:block">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex"
              aria-label="NgeTag beranda"
            >
              <NgetagLogo variant="auto" />
            </Link>
            <p className="max-w-sm text-sm text-[var(--color-muted-foreground)]">
              {APP_TAGLINE}
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-[var(--color-foreground)]">
                Jelajah
              </h3>
              <ul className="space-y-1.5 text-[var(--color-muted-foreground)]">
                <li>
                  <Link href="/explore" className="hover:text-[var(--color-foreground)]">
                    Jelajah
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-[var(--color-foreground)]">
                    Pencarian
                  </Link>
                </li>
                <li>
                  <Link href="/promo" className="hover:text-[var(--color-foreground)]">
                    Promo
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-[var(--color-foreground)]">
                Akun
              </h3>
              <ul className="space-y-1.5 text-[var(--color-muted-foreground)]">
                <li>
                  <Link href="/account" className="hover:text-[var(--color-foreground)]">
                    Akun & sesi
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-[var(--color-foreground)]">
                    Profil
                  </Link>
                </li>
                <li>
                  <Link href="/bookmarks" className="hover:text-[var(--color-foreground)]">
                    Bookmark
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-[var(--color-foreground)]">
                Tentang
              </h3>
              <ul className="space-y-1.5 text-[var(--color-muted-foreground)]">
                <li>
                  <Link href="/api-docs" className="hover:text-[var(--color-foreground)]">
                    API Docs (Swagger)
                  </Link>
                </li>
                <li>
                  <Link href="/theme" className="hover:text-[var(--color-foreground)]">
                    Galeri tema
                  </Link>
                </li>
                <li>
                  <span>Data demo</span>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted-foreground)]">
          © {new Date().getFullYear()} {APP_NAME}. Semua data dalam preview ini bersifat dummy.
        </div>
      </div>
    </footer>
  );
}
