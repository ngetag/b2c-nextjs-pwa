/**
 * Theme constants shared by the server (cookie read in the root layout) and
 * the client (`ThemeProvider`).
 *
 * Theme 1 — `dark`: "Midnight Neon" discovery theme (default, original design).
 * Theme 2 — `light`: "Lavender Glass" glassmorphism theme with a purple accent.
 */

export const THEMES = ["dark", "light"] as const;

/** Available NgeTag themes. */
export type Theme = (typeof THEMES)[number];

/** Theme used when no preference has been stored yet. */
export const DEFAULT_THEME: Theme = "dark";

/** Cookie used to render the correct theme during SSR (no flash). */
export const THEME_COOKIE = "ngetag-theme";

/** Cookie lifetime (1 year). */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** localStorage mirror used when cookies are unavailable. */
export const THEME_STORAGE_KEY = "ngetag:theme:v1";

/** Theme display metadata (used by the toggle and the `/theme` preview page). */
export const THEME_META: Record<
  Theme,
  { label: string; description: string; swatch: string[]; mode: "dark" | "light" }
> = {
  dark: {
    label: "Midnight Neon",
    description:
      "Tema gelap dengan aksen cyan neon untuk eksplorasi malam hari.",
    swatch: ["#0D0E15", "#00FFFF", "#A855F7"],
    mode: "dark",
  },
  light: {
    label: "Lavender Glass",
    description:
      "Tema terang dengan glassmorphism lembut dan aksen ungu khas NgeTag.",
    swatch: ["#F6F3FF", "#7C3AED", "#F0ABFC"],
    mode: "light",
  },
};

/** Type guard for persisted theme values. */
export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}
