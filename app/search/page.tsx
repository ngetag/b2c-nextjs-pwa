import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultGridSkeleton } from "@/features/search/components/ResultGrid";
import { SearchView } from "@/features/search/components/SearchView";
import { listTags } from "@/data/repositories/tag.repo";

export const metadata: Metadata = {
  title: "Cari hangout & event",
  description: "Cari dan jelajahi spot serta event berdasarkan lokasi, tag, dan minat.",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await searchParams; // Read for dynamic rendering opt-in
  const tags = await listTags();

  return (
    <Suspense fallback={<ResultGridSkeleton />}>
      <SearchView tags={tags} />
    </Suspense>
  );
}
