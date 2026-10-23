"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useTagSelection(paramName = "tags") {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedTagSlugs = useMemo(
    () =>
      searchParams
        .getAll(paramName)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    [paramName, searchParams],
  );

  const setSelectedTagSlugs = useCallback(
    (next: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramName);
      for (const slug of next) params.append(paramName, slug);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [paramName, pathname, router, searchParams],
  );

  const toggleTag = useCallback(
    (slug: string) => {
      const next = selectedTagSlugs.includes(slug)
        ? selectedTagSlugs.filter((item) => item !== slug)
        : [...selectedTagSlugs, slug];
      setSelectedTagSlugs(next);
    },
    [selectedTagSlugs, setSelectedTagSlugs],
  );

  const clearTags = useCallback(
    () => setSelectedTagSlugs([]),
    [setSelectedTagSlugs],
  );

  return { selectedTagSlugs, toggleTag, clearTags, setSelectedTagSlugs };
}
