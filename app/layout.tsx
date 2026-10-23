import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { FloatingScanButton } from "@/components/layout/FloatingScanButton";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/providers/AppProviders";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { siteConfig } from "@/config/site";
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  THEME_STORAGE_KEY,
  isTheme,
} from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "hangout",
    "event",
    "Jakarta",
    "kafe",
    "rooftop",
    "promo",
    "tag",
    "discovery",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#081116" },
  ],
};

/**
 * Runs before paint and aligns the `data-theme` attribute with the stored
 * preference. The server already renders the theme from the cookie, so this
 * only covers the case where the cookie is blocked but localStorage is not.
 */
const themeBootstrapScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);var t=m?decodeURIComponent(m[1]):null;if(!t){t=window.localStorage.getItem("${THEME_STORAGE_KEY}");}if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t==="light"?"light":"dark";var c=t==="light"?"#f6f3ff":"#081116";var meta=document.querySelector('meta[name="theme-color"]');if(meta){meta.setAttribute("content",c);}}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <html
      lang="id"
      data-theme={theme}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--color-background)]">
        <ThemeProvider initialTheme={theme}>
          <AppProviders>
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <FloatingScanButton />
            <BottomNav />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
