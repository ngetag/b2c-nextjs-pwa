import Link from "next/link";
import { routes } from "@/config/routes";
import type { Interest } from "@/types/interest";

interface InterestChipProps {
  interest: Interest;
  asLink?: boolean;
}

export function InterestChip({ interest, asLink = false }: InterestChipProps) {
  const className =
    "inline-flex rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/15";

  return asLink ? (
    <Link href={routes.search({ q: interest.label })} className={className}>
      {interest.label}
    </Link>
  ) : (
    <span className={className}>{interest.label}</span>
  );
}
