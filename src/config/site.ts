import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const siteConfig = {
  name: APP_NAME,
  tagline: APP_TAGLINE,
  description: APP_DESCRIPTION,
  url: "https://ngetag.id",
  ogImage: "/og.png",
} as const;

export const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/hype", label: "Hype" },
  { href: "/explore", label: "Eksplore" },
  { href: "/promo", label: "Promo" },
  { href: "/blog", label: "Blog" },
  { href: "/profile", label: "Profil" },
] as const;

