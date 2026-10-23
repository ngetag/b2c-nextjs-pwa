import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke NgeTag dengan email, Google, atau GitHub untuk menyimpan spot favorit dan mendapatkan rekomendasi personal.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

/** `/auth/login` — email/password and OAuth sign-in. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account";

  return <LoginForm next={next} initialError={params.error ?? null} />;
}
