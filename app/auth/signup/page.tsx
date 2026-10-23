import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Buat akun NgeTag gratis untuk menyimpan spot, mengikuti komunitas, dan mendapatkan rekomendasi berbasis minat.",
};

interface SignupPageProps {
  searchParams: Promise<{ next?: string }>;
}

/** `/auth/signup` — registration + interest onboarding. */
export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account";

  return <SignupForm next={next} />;
}
