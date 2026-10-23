"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  THEME_META,
  THEME_STORAGE_KEY,
  isTheme,
  type Theme,
} from "@/lib/theme";

interface ThemeContextValue {
  /** Active theme. */
  theme: Theme;
  /** `true` when the light glassmorphism theme is active. */
  isLight: boolean;
  /** Apply a specific theme. */
  setTheme: (theme: Theme) => void;
  /** Flip between dark and light. */
  toggleTheme: () => void;
  /** Display metadata of the active theme. */
  meta: (typeof THEME_META)[Theme];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = THEME_META[theme].mode;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f6f3ff" : "#081116");
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Theme resolved on the server from the cookie. */
  initialTheme?: Theme;
}

/**
 * Theme provider for the two NgeTag themes.
 *
 * The server reads the `ngetag-theme` cookie so the first paint already uses
 * the right palette; this provider mirrors changes to the cookie and
 * localStorage so the preference survives reloads and new tabs.
 */
export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // Keep other tabs in sync. The server cookie remains the source of truth for
  // the first paint, so no state is written during the initial effect.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = event.newValue;
      if (!isTheme(next)) return;
      setThemeState(next);
      applyTheme(next);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Cookies/localStorage can be blocked in private modes — ignore.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isLight: theme === "light",
      setTheme,
      toggleTheme,
      meta: THEME_META[theme],
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Access the active theme and the setters.
 * Throws when used outside `<ThemeProvider>` to catch wiring mistakes early.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
