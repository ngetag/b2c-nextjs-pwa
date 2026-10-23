"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { buildSearchParams, readArrayParam, readNumberParam, readStringParam } from "@/lib/url";
import type { SearchQuery } from "@/types/index";

type SearchType = "spot" | "event" | "all";
type SearchSort = "relevance" | "newest" | "distance";

/**
 * Parse + update URL search params for the /search page.
 * URL is the source of truth — shareable, deep-linkable.
 */
export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo<SearchQuery>(() => {
    return {
      q: readStringParam(searchParams.get("q") ?? undefined),
      type: (readStringParam(searchParams.get("type") ?? undefined) as SearchType) ?? "all",
      tagSlugs: readArrayParam(searchParams.getAll("tags")),
      sort: (readStringParam(searchParams.get("sort") ?? undefined) as SearchSort) ?? "relevance",
      page: readNumberParam(searchParams.get("page") ?? undefined, 1),
    };
  }, [searchParams]);

  const updateQuery = useCallback(
    (patch: Partial<SearchQuery>) => {
      const next = { ...query, ...patch };
      const params: Record<string, string | string[] | undefined> = {
        q: next.q || undefined,
        type: next.type && next.type !== "all" ? next.type : undefined,
        tags: next.tagSlugs && next.tagSlugs.length > 0 ? next.tagSlugs : undefined,
        sort: next.sort && next.sort !== "relevance" ? next.sort : undefined,
      };
      const qs = buildSearchParams(params);
      router.replace(`/search${qs}`, { scroll: false });
    },
    [query, router],
  );

  const toggleTag = useCallback(
    (slug: string) => {
      const current = query.tagSlugs ?? [];
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      updateQuery({ tagSlugs: next });
    },
    [query.tagSlugs, updateQuery],
  );

  const setQ = useCallback((q: string) => updateQuery({ q }), [updateQuery]);
  const setType = useCallback(
    (type: SearchType) => updateQuery({ type, tagSlugs: query.tagSlugs }),
    [query.tagSlugs, updateQuery],
  );
  const setSort = useCallback((sort: SearchSort) => updateQuery({ sort }), [updateQuery]);
  const reset = useCallback(() => router.replace("/search"), [router]);

  return { query, updateQuery, toggleTag, setQ, setType, setSort, reset };
}
