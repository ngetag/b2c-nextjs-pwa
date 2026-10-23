/**
 * Locale-aware formatters for Indonesian UI.
 */

const LOCALE = "id-ID";

/**
 * Format number as Indonesian Rupiah (IDR).
 * @example formatIDR(25000) → "Rp25.000"
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price range. Free returns "Gratis".
 */
export function formatPriceRange(opts: {
  min: number;
  max?: number;
  isFree: boolean;
}): string {
  if (opts.isFree) return "Gratis";
  if (opts.max && opts.max > opts.min) {
    return `${formatIDR(opts.min)} – ${formatIDR(opts.max)}`;
  }
  return formatIDR(opts.min);
}

/**
 * Format ISO date as "12 Mei 2026".
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Format ISO date as short "12 Mei".
 */
export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

/**
 * Format ISO time as "19:30".
 */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/**
 * Relative time: "2 jam lalu", "3 hari lalu", "baru saja".
 */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "waktu tidak tersedia";
  const diff = now.getTime() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "kemarin";
  if (day < 7) return `${day} hari lalu`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk} minggu lalu`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} bulan lalu`;
  const yr = Math.floor(day / 365);
  return `${yr} tahun lalu`;
}

export function formatLastActive(iso?: string, now: Date = new Date()): string {
  if (!iso) return "Terakhir aktif belum tersedia";
  return `Terakhir aktif ${formatRelative(iso, now)}`;
}

/**
 * Price level "$" .. "$$$$".
 */
export function formatPriceLevel(level: 1 | 2 | 3 | 4): string {
  return "$".repeat(level);
}

/**
 * Pluralize count: 1 review, 25 review.
 * (Bahasa Indonesia tidak punya plural form, gunakan kata kunci.)
 */
export function formatCount(count: number, label: string): string {
  return `${count.toLocaleString(LOCALE)} ${label}`;
}
