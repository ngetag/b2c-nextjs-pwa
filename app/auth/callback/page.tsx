import type { Metadata } from "next";
import { OAuthCallback } from "@/features/auth/components/OAuthCallback";

export const metadata: Metadata = {
  title: "Menyelesaikan masuk",
  robots: { index: false, follow: false },
};

interface CallbackPageProps {
  searchParams: Promise<{ next?: string }>;
}

/** `/auth/callback` — client-side completion screen for the OAuth redirect. */
export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account";

  return <OAuthCallback next={next} />;
}
