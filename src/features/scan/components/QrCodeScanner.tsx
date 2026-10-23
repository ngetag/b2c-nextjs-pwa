"use client";

import {
  Camera,
  CheckCircle2,
  Loader2,
  ScanLine,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { QR_REVIEW_ACCESS_KEY } from "@/lib/constants";

type Html5QrcodeInstance = import("html5-qrcode").Html5Qrcode;
type ScannerStatus =
  | "idle"
  | "starting"
  | "scanning"
  | "redirecting"
  | "success"
  | "error";

type QrDestination =
  | { kind: "internal"; href: string; reviewSpotId?: string }
  | { kind: "external"; href: string }
  | { kind: "invalid"; message: string };

const INTERNAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "ngetag.id",
  "www.ngetag.id",
  "ngetag-web.vercel.app",
]);

const INTERNAL_ROUTES = [
  /^\/$/,
  /^\/bookmarks\/?$/,
  /^\/calendar\/?$/,
  /^\/communities(?:\/[^/]+)?\/?$/,
  /^\/events\/[^/]+\/?$/,
  /^\/explore\/?$/,
  /^\/location\/?$/,
  /^\/profile(?:\/reviews)?\/?$/,
  /^\/promo\/?$/,
  /^\/reviews\/new\/?$/,
  /^\/scan\/?$/,
  /^\/search\/?$/,
  /^\/spots\/[^/]+\/?$/,
  /^\/tags\/[^/]+\/?$/,
];

function normalizeScannerError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (/notallowed|permission|denied/i.test(message)) {
    return "Akses kamera ditolak. Izinkan kamera di browser untuk mulai scan QR Code.";
  }

  if (/notfound|devicesnotfound|no camera|notreadable|trackstart/i.test(message)) {
    return "Kamera tidak tersedia atau sedang dipakai aplikasi lain.";
  }

  if (/overconstrained|constraint/i.test(message)) {
    return "Kamera belakang tidak tersedia. Coba gunakan kamera lain.";
  }

  return "Scanner gagal dibuka. Pastikan browser mendukung kamera dan halaman dibuka dari HTTPS atau localhost.";
}

function isKnownInternalRoute(pathname: string): boolean {
  return INTERNAL_ROUTES.some((routePattern) => routePattern.test(pathname));
}

function resolveQrDestination(rawValue: string): QrDestination {
  const value = rawValue.trim();
  if (!value) {
    return {
      kind: "invalid",
      message: "QR Code kosong atau tidak bisa dibaca.",
    };
  }

  const isAbsoluteHttpUrl = /^https?:\/\//i.test(value);
  const isInternalPath = value.startsWith("/");
  if (!isAbsoluteHttpUrl && !isInternalPath) {
    return {
      kind: "invalid",
      message: "QR Code tidak berisi URL yang valid.",
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value, window.location.origin);
  } catch {
    return {
      kind: "invalid",
      message: "QR Code tidak berisi URL yang valid.",
    };
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      kind: "invalid",
      message: "QR Code harus berisi URL http atau https.",
    };
  }

  const currentHost = window.location.hostname.toLowerCase();
  const targetHost = parsedUrl.hostname.toLowerCase();
  const isInternalHost =
    targetHost === currentHost || INTERNAL_HOSTS.has(targetHost);

  if (!isInternalHost) {
    return { kind: "external", href: parsedUrl.href };
  }

  if (!isKnownInternalRoute(parsedUrl.pathname)) {
    return {
      kind: "invalid",
      message: "URL QR Code valid, tapi route NgeTag tidak dikenali.",
    };
  }

  let reviewSpotId: string | undefined;
  if (parsedUrl.pathname.replace(/\/$/, "") === "/reviews/new") {
    reviewSpotId = parsedUrl.searchParams.get("spotId") ?? undefined;
    if (!reviewSpotId) {
      return {
        kind: "invalid",
        message: "URL review dari QR Code tidak memiliki spotId.",
      };
    }

    parsedUrl.searchParams.set("source", "qr");
  }

  return {
    kind: "internal",
    href: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
    reviewSpotId,
  };
}

export function QrCodeScanner() {
  const router = useRouter();
  const reactId = useId();
  const readerId = `qr-reader-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const stopPromiseRef = useRef<Promise<void> | null>(null);
  const scanLockedRef = useRef(false);
  const redirectLockedRef = useRef(false);
  const mountedRef = useRef(false);
  const statusRef = useRef<ScannerStatus>("idle");

  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const setScannerStatus = useCallback((nextStatus: ScannerStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    if (stopPromiseRef.current) {
      await stopPromiseRef.current;
      return;
    }

    stopPromiseRef.current = (async () => {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch {
        // Stop can reject if the camera is already stopped during route changes.
      } finally {
        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }
        stopPromiseRef.current = null;
      }
    })();

    await stopPromiseRef.current;
  }, []);

  const handleDecodedQrCode = useCallback(
    async (decodedText: string) => {
      if (redirectLockedRef.current) return;
      redirectLockedRef.current = true;

      const scannedValue = decodedText.trim();
      setResult(scannedValue);
      setError("");
      setScannerStatus("redirecting");

      await stopScanner();

      if (!mountedRef.current) return;

      const destination = resolveQrDestination(scannedValue);
      if (destination.kind === "invalid") {
        redirectLockedRef.current = false;
        scanLockedRef.current = false;
        setError(destination.message);
        setScannerStatus("error");
        toast.error(destination.message);
        return;
      }

      toast.success("QR Code terbaca. Mengalihkan...");

      window.setTimeout(() => {
        if (destination.kind === "internal") {
          if (destination.reviewSpotId) {
            window.sessionStorage.setItem(
              QR_REVIEW_ACCESS_KEY,
              JSON.stringify({
                spotId: destination.reviewSpotId,
                createdAt: Date.now(),
              }),
            );
          }

          router.push(destination.href);
          return;
        }

        window.location.assign(destination.href);
      }, 180);
    },
    [router, setScannerStatus, stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (
      scannerRef.current?.isScanning ||
      statusRef.current === "starting" ||
      statusRef.current === "redirecting"
    ) {
      return;
    }

    scanLockedRef.current = false;
    redirectLockedRef.current = false;
    setResult("");
    setError("");
    setScannerStatus("starting");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser ini tidak mendukung akses kamera.");
      setScannerStatus("error");
      return;
    }

    if (!window.isSecureContext) {
      setError("Kamera hanya bisa dibuka dari HTTPS atau localhost.");
      setScannerStatus("error");
      return;
    }

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      const scanner =
        scannerRef.current ??
        new Html5Qrcode(readerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.62);
            return { width: size, height: size };
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText) => {
          if (scanLockedRef.current) return;
          scanLockedRef.current = true;
          void handleDecodedQrCode(decodedText);
        },
        () => {
          // Realtime scan misses are expected; keep UI quiet until a QR is found.
        },
      );

      if (mountedRef.current && !scanLockedRef.current) {
        setScannerStatus("scanning");
      }
    } catch (startError) {
      await stopScanner();

      if (!mountedRef.current) return;

      setError(normalizeScannerError(startError));
      setScannerStatus("error");
    }
  }, [handleDecodedQrCode, readerId, setScannerStatus, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;
    const startTimer = window.setTimeout(() => {
      void startScanner();
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      mountedRef.current = false;
      void stopScanner();
    };
  }, [startScanner, stopScanner]);

  const isBusy = status === "starting";
  const isScanning = status === "scanning";
  const isRedirecting = status === "redirecting";
  const canStart = status === "idle" || status === "success" || status === "error";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] md:p-4">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-cyan-300/30 bg-[var(--color-background)]">
          <div
            id={readerId}
            className={cn(
              "h-full min-h-[min(82vw,22rem)] w-full overflow-hidden rounded-lg md:min-h-[25rem]",
              "[&_video]:h-full [&_video]:min-h-[min(82vw,22rem)] [&_video]:w-full [&_video]:object-cover md:[&_video]:min-h-[25rem]",
            )}
          />

          {(status === "idle" || isBusy || isRedirecting) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-background)]/88 p-6 text-center backdrop-blur-sm">
              {isBusy || isRedirecting ? (
                <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" aria-hidden />
              ) : (
                <Camera className="h-10 w-10 text-[var(--color-primary)]" aria-hidden />
              )}
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                {isRedirecting
                  ? "Mengalihkan..."
                  : isBusy
                    ? "Membuka kamera..."
                    : "Scanner siap"}
              </p>
            </div>
          )}

          {isScanning && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-[18%] bg-[var(--color-background)]/62 backdrop-blur-[2px]" />
              <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[var(--color-background)]/62 backdrop-blur-[2px]" />
              <div className="absolute bottom-[18%] left-0 top-[18%] w-[18%] bg-[var(--color-background)]/62 backdrop-blur-[2px]" />
              <div className="absolute bottom-[18%] right-0 top-[18%] w-[18%] bg-[var(--color-background)]/62 backdrop-blur-[2px]" />
              <div className="absolute left-[18%] top-[18%] aspect-square w-[64%] rounded-lg border-2 border-cyan-300/75 shadow-[0_0_0_1px_rgb(0_245_255_/_0.12),0_0_36px_rgb(0_245_255_/_0.16)]" />
              <div className="qr-scan-line absolute left-[22%] top-[22%] h-0.5 w-[56%] rounded-full bg-[var(--color-primary)] shadow-[0_0_22px_rgb(0_245_255_/_0.9)]" />
            </div>
          )}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={startScanner}
        disabled={!canStart}
      >
        {isBusy || isRedirecting ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <ScanLine aria-hidden />
        )}
        {isRedirecting
          ? "Redirecting..."
          : isBusy
            ? "Opening Camera"
            : isScanning
              ? "Scanning..."
              : "Scan Code"}
      </Button>

      {isRedirecting ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              QR Code terbaca. Kamera ditutup, sedang mengalihkan...
            </div>
            <div className="break-all rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-sm text-[var(--color-foreground)]">
              {result}
            </div>
          </div>
        </div>
      ) : status === "success" ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-success)]">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              QR Code berhasil discan
            </div>
            <div className="break-all rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-sm text-[var(--color-foreground)]">
              {result}
            </div>
          </div>
        </div>
      ) : status === "error" ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
          <div className="flex items-start gap-2 text-sm font-semibold text-[var(--color-destructive)]">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            {isScanning ? (
              <ScanLine className="h-5 w-5 text-[var(--color-primary)]" aria-hidden />
            ) : (
              <Camera className="h-5 w-5 text-[var(--color-primary)]" aria-hidden />
            )}
            <span>
              {isScanning
                ? "Scanner aktif. Kamera berhenti otomatis setelah QR terbaca."
                : "Tekan Scan Code untuk membuka kamera."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
