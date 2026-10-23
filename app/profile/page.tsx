import type { Metadata } from "next";
import { ProfileView } from "@/features/profile/components/ProfileView";

export const metadata: Metadata = {
  title: "Profil",
  description: "Profil dan aktivitas kamu di NgeTag.",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-8">
      <header className="space-y-2 pb-4 md:pb-6">
        <div className="h-1 w-10 rounded-full bg-[var(--accent-community)]" />
        <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
          Profil
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Minat, komunitas, dan aktivitasmu di NgeTag.
        </p>
      </header>

      <ProfileView />
    </div>
  );
}
