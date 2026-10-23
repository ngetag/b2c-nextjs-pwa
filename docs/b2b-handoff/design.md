# NgeTag B2B Design Handoff

Dokumen ini bisa dicopy ke project B2B Owner Dashboard agar tema visual konsisten dengan B2C NgeTag. Fokus B2B adalah dashboard operasional, jadi gunakan desain yang lebih padat, tenang, dan mudah discan, tetapi tetap memakai token brand B2C.

## Stack UI

- Framework: Next.js App Router.
- Styling: Tailwind CSS v4.
- Icon: `lucide-react`.
- Font: `Inter` untuk body, `Plus Jakarta Sans` untuk heading/display.
- Helper class merge: `clsx` + `tailwind-merge`.
- Component variant helper: `class-variance-authority`.

Install package yang relevan di B2B:

```bash
npm install lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot
```

## Design Tokens

Paste token ini ke global CSS B2B. Jika B2B juga memakai Tailwind v4, gunakan struktur ini.

```css
@import "tailwindcss";

:root {
  --color-primary: #00FFFF;
  --color-primary-hover: #67fbff;
  --color-primary-foreground: #021014;

  --color-secondary: #ffb84d;
  --color-secondary-foreground: #edf7ff;

  --color-accent: #ffb84d;
  --color-accent-foreground: #1c1002;

  --color-background: #0D0E15;
  --color-surface: #101b24;
  --color-surface-elevated: #15232e;
  --color-surface-soft: #0d171f;

  --color-foreground: #f4fbff;
  --color-muted: #263746;
  --color-muted-foreground: #9fb0bd;
  --color-border: #243645;
  --color-input: #2a4050;
  --color-ring: #00f5ff;

  --color-destructive: #ff4f64;
  --color-destructive-foreground: #fff7f8;
  --color-success: #42e889;
  --color-warning: #ffbd4a;

  --accent-coffee: #ff9f1c;
  --accent-gaming: #a855f7;
  --accent-music: #ff4fd8;
  --accent-sport: #42e889;
  --accent-tech: #00f5ff;
  --accent-photo: #ffd84d;
  --accent-pop: #ff4f64;
  --accent-community: #4da3ff;

  --radius-sm: 0.375rem;
  --radius: 0.5rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  --shadow-soft: 0 18px 55px rgb(0 0 0 / 0.28);
  --shadow-card: 0 14px 34px rgb(0 0 0 / 0.22);
}

@theme inline {
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-surface: var(--color-surface);
  --color-surface-elevated: var(--color-surface-elevated);
  --color-surface-soft: var(--color-surface-soft);

  --color-primary: var(--color-primary);
  --color-primary-hover: var(--color-primary-hover);
  --color-primary-foreground: var(--color-primary-foreground);

  --color-secondary: var(--color-secondary);
  --color-secondary-foreground: var(--color-secondary-foreground);

  --color-accent: var(--color-accent);
  --color-accent-foreground: var(--color-accent-foreground);

  --color-muted: var(--color-muted);
  --color-muted-foreground: var(--color-muted-foreground);
  --color-border: var(--color-border);
  --color-input: var(--color-input);
  --color-ring: var(--color-ring);

  --color-destructive: var(--color-destructive);
  --color-destructive-foreground: var(--color-destructive-foreground);
  --color-success: var(--color-success);
  --color-warning: var(--color-warning);

  --font-sans: var(--font-inter);
  --font-display: var(--font-jakarta);

  --radius-sm: var(--radius-sm);
  --radius: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  html {
    color-scheme: dark;
  }

  body {
    background:
      linear-gradient(180deg, rgb(8 17 22 / 0.98), rgb(8 17 22)),
      linear-gradient(135deg, rgb(0 245 255 / 0.08), transparent 38%),
      linear-gradient(315deg, rgb(255 79 216 / 0.08), transparent 42%);
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans), Arial, Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-display), var(--font-sans), sans-serif;
    letter-spacing: 0;
  }

  ::selection {
    background: rgb(0 245 255 / 0.28);
    color: var(--color-foreground);
  }
}

@utility scrollbar-hide {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

## Font Setup

Di Next.js, pakai:

```tsx
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        {children}
      </body>
    </html>
  );
}
```

## Visual Direction B2B

B2B adalah owner dashboard, jadi jangan dibuat seperti landing page.

Gunakan:
- Sidebar kiri untuk navigasi utama.
- Header/top bar untuk search, switcher owner/business, dan profile.
- Table untuk data besar seperti spot, event, promo, review, komunitas.
- Form dua kolom di desktop untuk create/edit entity.
- Cards hanya untuk metric, summary, repeated item, modal, atau framed tool.
- Density lebih rapat daripada B2C, tetapi tetap beri spacing cukup.

Hindari:
- Hero besar.
- Decorative blobs/orbs.
- Gradient dominan yang terlalu marketing.
- Card di dalam card.
- Warna ungu/biru gelap yang mendominasi seluruh halaman tanpa aksen cyan/amber.

## Layout Pattern

Shell dashboard:

```tsx
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:block" />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6" />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

Page header:

```tsx
<header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <div>
    <div className="mb-2 h-1 w-10 rounded-full bg-[var(--color-primary)]" />
    <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)]">
      Spots
    </h1>
    <p className="text-sm text-[var(--color-muted-foreground)]">
      Kelola tempat yang tampil di NgeTag B2C.
    </p>
  </div>
</header>
```

## Component Baseline

### `cn`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### Button

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[0_0_0_1px_rgb(0_245_255_/_0.14),0_14px_30px_rgb(0_245_255_/_0.16)] hover:bg-[var(--color-primary-hover)] hover:shadow-[0_0_0_1px_rgb(0_245_255_/_0.22),0_18px_36px_rgb(0_245_255_/_0.22)]",
        secondary:
          "border border-[var(--color-border)] bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]",
        ghost:
          "text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-primary)]",
        destructive:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90",
        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
```

### Card

```tsx
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}
```

### Input

```tsx
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-[var(--color-input)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] transition-colors focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
}
```

### Badge / Status Chip

```tsx
export function StatusBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
}) {
  const toneClass = {
    default: "border-[var(--color-primary)]/35 bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    success: "border-[var(--color-success)]/35 bg-[var(--color-success)]/10 text-[var(--color-success)]",
    warning: "border-[var(--color-warning)]/35 bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    danger: "border-[var(--color-destructive)]/35 bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]",
    muted: "border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-muted-foreground)]",
  }[tone];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", toneClass)}>
      {children}
    </span>
  );
}
```

## B2B Entity UI Mapping

- Spot: table + create/edit form + gallery manager + opening hours editor + QR review action.
- Event: table + schedule fields + ticket/price fields + organizer block.
- Promo: table + status badge + validity date + relation selector spot/event.
- Community: table + update composer + agenda editor + category selector.
- Review Tags: chips editor per spot.
- Reviews: read-only table/list with sentiment/tag filters.
- Analytics: metric cards + compact charts + table drilldown.

## Table Style

```tsx
<div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
  <table className="w-full text-sm">
    <thead className="bg-[var(--color-surface-soft)] text-xs uppercase text-[var(--color-muted-foreground)]">
      <tr className="border-b border-[var(--color-border)]">
        <th className="px-4 py-3 text-left font-semibold">Name</th>
        <th className="px-4 py-3 text-left font-semibold">Status</th>
        <th className="px-4 py-3 text-right font-semibold">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[var(--color-border)]">
      <tr className="hover:bg-[var(--color-surface-elevated)]">
        <td className="px-4 py-3 text-[var(--color-foreground)]">Kopi Tuku Cipete</td>
        <td className="px-4 py-3">Published</td>
        <td className="px-4 py-3 text-right">Edit</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Form Style

```tsx
<form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
  <section className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--color-foreground)]">Nama spot</label>
      <Input placeholder="Kopi Tuku Cipete" />
      <p className="text-xs text-[var(--color-muted-foreground)]">Nama publik yang tampil di B2C.</p>
    </div>
  </section>

  <aside className="space-y-4">
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
      <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Publish</h2>
    </section>
  </aside>
</form>
```

## Status Colors

- Published/Active: `--color-success`
- Draft: `--color-warning`
- Archived/Expired: `--color-muted-foreground`
- Error/Rejected: `--color-destructive`
- Featured/Primary action: `--color-primary`

## Responsive Rules

- Mobile: single column, top bar compact, action buttons full width when needed.
- Tablet: two-column content allowed for metric cards.
- Desktop: sidebar + main content, max width `max-w-7xl`.
- Tables on mobile should become horizontal scroll or card list.
- Forms on desktop can use `lg:grid-cols-[minmax(0,1fr)_320px]`.

## Copy Checklist

Copy these from B2C if B2B repo does not have them yet:

```txt
docs/b2b-handoff/design.md
src/shared/contracts/
src/shared/mocks/
```

Optional but useful to copy/adapt:

```txt
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/input.tsx
src/components/ui/textarea.tsx
src/components/ui/badge.tsx
src/lib/cn.ts
```

Do not copy B2C feature components directly. B2B should build dashboard-specific screens using the same tokens and contracts.
