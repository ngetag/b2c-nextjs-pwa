import type { Metadata } from "next";
import { QrCodeScanner } from "@/features/scan/components/QrCodeScanner";

export const metadata: Metadata = {
  title: "Scan QR Code",
  description: "Scan QR Code untuk membuka detail tag, event, atau promo di NgeTag.",
};

export default function ScanPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col px-4 py-5 md:px-6 md:py-10">
      <section className="mx-auto flex w-full max-w-[28rem] flex-1 flex-col justify-center gap-5 md:max-w-[30rem]">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
            QR Code
          </h1>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
            Arahkan kamera ke QR Code NgeTag.
          </p>
        </div>
        <QrCodeScanner />
      </section>
    </div>
  );
}
