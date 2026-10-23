"use client";

import { useEffect, useRef, useState } from "react";

interface SwaggerUiProps {
  /** URL of the OpenAPI document the UI should render. */
  specUrl: string;
}

interface SwaggerGlobals {
  SwaggerUIBundle?: ((config: Record<string, unknown>) => unknown) & {
    presets?: Record<string, unknown>;
  };
  SwaggerUIStandalonePreset?: unknown;
}

declare global {
  interface Window extends SwaggerGlobals {
    ui?: unknown;
  }
}

/** Load a script once and resolve when it is ready. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-swagger-asset="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`Gagal memuat ${src}`)),
          { once: true },
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.swaggerAsset = src;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Gagal memuat ${src}`)),
      { once: true },
    );
    document.body.appendChild(script);
  });
}

/** Add the Swagger UI stylesheet once. */
function loadStylesheet(href: string) {
  if (document.querySelector(`link[data-swagger-asset="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.swaggerAsset = href;
  document.head.appendChild(link);
}

/**
 * Client-side Swagger UI renderer.
 *
 * The bundle is served from our own `/api-docs/assets/*` route (no CDN), which
 * keeps the docs usable in offline/preview environments. While it loads we show
 * a skeleton; if loading fails we surface the raw spec link instead of a blank
 * screen.
 */
export function SwaggerUi({ specUrl }: SwaggerUiProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        loadStylesheet("/api-docs/assets/swagger-ui.css");
        await loadScript("/api-docs/assets/swagger-ui-bundle.js");
        await loadScript("/api-docs/assets/swagger-ui-standalone-preset.js");

        if (cancelled || !containerRef.current) return;

        const bundle = window.SwaggerUIBundle;
        if (!bundle) throw new Error("Swagger UI bundle tidak tersedia");

        window.ui = bundle({
          url: specUrl,
          domNode: containerRef.current,
          deepLinking: true,
          docExpansion: "none",
          defaultModelsExpandDepth: 1,
          displayRequestDuration: true,
          filter: true,
          persistAuthorization: true,
          tryItOutEnabled: true,
          presets: [
            bundle.presets?.apis,
            window.SwaggerUIStandalonePreset,
          ].filter(Boolean),
        });

        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [specUrl]);

  return (
    <div className="glass overflow-hidden rounded-3xl border border-[var(--glass-border)]">
      {status === "loading" ? (
        <div className="space-y-3 p-6" aria-busy="true">
          <div className="h-6 w-48 animate-pulse rounded-full bg-[var(--color-muted)]/40" />
          <div className="h-24 animate-pulse rounded-2xl bg-[var(--color-muted)]/25" />
          <div className="h-24 animate-pulse rounded-2xl bg-[var(--color-muted)]/20" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="space-y-2 p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Swagger UI gagal dimuat.</p>
          <p>
            Spesifikasi tetap bisa diakses langsung di{" "}
            <a className="text-primary underline" href={specUrl}>
              {specUrl}
            </a>
            .
          </p>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="swagger-shell min-h-[60vh] bg-transparent px-2 pb-6"
      />
    </div>
  );
}
