import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Braces, KeyRound, Radio, Sparkles } from "lucide-react";
import { SwaggerUi } from "@/features/docs/components/SwaggerUi";
import { apiOperations } from "@/server/openapi/registry";
import { getOpenApiStats } from "@/server/openapi/document";

export const metadata: Metadata = {
  title: "API Docs",
  description:
    "Dokumentasi OpenAPI + Swagger untuk seluruh endpoint NgeTag Customer Web App: auth JWT/OAuth, telemetri asinkron, dan rekomendasi pgvector.",
};

const HIGHLIGHTS = [
  {
    icon: KeyRound,
    title: "Auth & JWT claims",
    description:
      "Email/password + OAuth Google & GitHub. Access token 15 menit, refresh token rotasi 30 hari, klaim role/tier/points/interests.",
    href: "#swagger",
  },
  {
    icon: Radio,
    title: "Telemetri asinkron",
    description:
      "Ingest 202 Accepted, ditulis setelah response lewat after(). Taste vector 384 dimensi disimpan di pgvector.",
    href: "#swagger",
  },
  {
    icon: Sparkles,
    title: "Recommendation engine",
    description:
      "Cosine similarity atas content_embeddings + filter radius PostGIS, fallback cold start dari klaim JWT.",
    href: "#swagger",
  },
];

/** `/api-docs` — self-hosted Swagger UI for the whole customer API. */
export default function ApiDocsPage() {
  const stats = getOpenApiStats();
  const tagCounts = apiOperations.reduce<Record<string, number>>((acc, operation) => {
    acc[operation.tag] = (acc[operation.tag] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="aurora mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 space-y-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-primary)]" />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold md:text-3xl">API Docs</h1>
          <span className="accent-pill rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            OpenAPI 3.1
          </span>
        </div>
        <p className="max-w-2xl text-sm text-[var(--color-muted-foreground)]">
          Semua endpoint yang dipakai NgeTag Customer Web App — termasuk
          autentikasi, telemetri aktivitas, dan rekomendasi berbasis vektor.
          Spesifikasi mentah tersedia di{" "}
          <Link className="text-[var(--color-primary)] underline" href="/api/openapi">
            /api/openapi
          </Link>
          .
        </p>
        <dl className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold">
          {[
            { label: "Path", value: stats.paths },
            { label: "Operasi", value: stats.methods },
            { label: "Grup", value: stats.tags },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-subtle rounded-xl border border-[var(--glass-border)] px-3 py-1.5"
            >
              <dt className="inline text-[var(--color-muted-foreground)]">
                {item.label}{" "}
              </dt>
              <dd className="inline text-[var(--color-foreground)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mb-8 grid gap-3 md:grid-cols-3">
        {HIGHLIGHTS.map((highlight) => (
          <a
            key={highlight.title}
            href={highlight.href}
            className="glass group rounded-2xl border border-[var(--glass-border)] p-4 transition hover:border-[var(--color-primary)]/50"
          >
            <div className="flex items-center justify-between">
              <highlight.icon className="size-5 text-[var(--color-primary)]" />
              <ArrowUpRight className="size-4 text-[var(--color-muted-foreground)] transition group-hover:text-[var(--color-primary)]" />
            </div>
            <h2 className="mt-3 text-sm font-semibold">{highlight.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
              {highlight.description}
            </p>
          </a>
        ))}
      </section>

      <section className="mb-6 flex flex-wrap gap-2">
        {Object.entries(tagCounts).map(([tag, count]) => (
          <span
            key={tag}
            className="glass-subtle rounded-full border border-[var(--glass-border)] px-3 py-1 text-[11px] font-semibold text-[var(--color-muted-foreground)]"
          >
            {tag}
            <span className="ml-1.5 text-[var(--color-primary)]">{count}</span>
          </span>
        ))}
      </section>

      <section id="swagger" className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
          <Braces className="size-4" />
          <span>
            Swagger UI dimuat dari bundel lokal (<code>swagger-ui-dist</code>),
            jadi tetap jalan tanpa CDN.
          </span>
        </div>
        <SwaggerUi specUrl="/api/openapi" />
      </section>
    </div>
  );
}
