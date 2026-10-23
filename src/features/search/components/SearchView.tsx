"use client";

import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Compass,
  Hash,
  Heart,
  MapPin,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { communities, interests } from "@/data/fixtures";
import { events } from "@/data/fixtures/events";
import { spots } from "@/data/fixtures/spots";
import { communityCategories } from "@/data/fixtures/interests";
import { CommunityCard } from "@/features/community/components/CommunityCard";
import { EventCard } from "@/features/event/components/EventCard";
import { FilterBar } from "@/features/search/components/FilterBar";
import {
  getInterestEventRecommendations,
  getInterestSpotRecommendations,
  getLocationEventRecommendations,
  getLocationSpotRecommendations,
} from "@/features/search/lib/recommendations";
import { useSearch } from "@/features/search/hooks/useSearch";
import { SpotCard } from "@/features/spot/components/SpotCard";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/cn";
import { SEARCH_DEBOUNCE_MS, STORAGE_KEYS } from "@/lib/constants";
import { formatCount } from "@/lib/format";
import { formatHomeLocation } from "@/lib/location";
import { getItem, setItem } from "@/lib/storage";
import { useCurrentLocationStore } from "@/stores/currentLocation.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import type { NgetagEvent } from "@/types/event";
import type { Community, CommunityCategory, Interest } from "@/types/interest";
import type { Spot } from "@/types/spot";
import type { Tag } from "@/types/tag";

interface SearchViewProps {
  tags: Tag[];
}

interface SearchResults {
  spots: Spot[];
  events: NgetagEvent[];
  communities: Community[];
  discovery: DiscoveryResult[];
}

interface SearchResultRowProps {
  children: React.ReactNode;
}

function SearchResultRow({ children }: SearchResultRowProps) {
  return (
    <div className="scrollbar-hide flex max-w-full snap-x gap-3 overflow-x-auto overscroll-x-contain pb-3 pt-2 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible xl:grid-cols-3">
      {children}
    </div>
  );
}

interface SearchCarouselProps {
  children: React.ReactNode;
}

function SearchCarousel({ children }: SearchCarouselProps) {
  return (
    <div className="scrollbar-hide flex max-w-full snap-x gap-3 overflow-x-auto overscroll-x-contain pb-3 pt-2">
      {children}
    </div>
  );
}

interface DiscoveryResultCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
}

type DiscoveryResult =
  | {
      kind: "tag";
      item: Tag;
    }
  | {
      kind: "category";
      item: CommunityCategory;
    }
  | {
      kind: "interest";
      item: Interest;
    };

function DiscoveryResultCard({
  href,
  icon,
  label,
  title,
  description,
}: DiscoveryResultCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-28 min-w-52 snap-start flex-col rounded-3xl glass p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] md:min-w-0"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted-foreground)]">
        {icon}
        <span>{label}</span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)]">
        {title}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
        {description}
      </p>
    </Link>
  );
}

interface QuickCategory {
  label: string;
  keyword?: string;
  type?: "all" | "spot" | "event";
  tagSlugs?: string[];
  sort?: "distance" | "relevance";
}

type SearchableKind =
  | "spot"
  | "event"
  | "community"
  | "tag"
  | "category"
  | "interest";

interface SearchableItem<T> {
  id: string;
  kind: SearchableKind;
  item: T;
  title: string;
  primary: string[];
  tags: string[];
  categories: string[];
  interests: string[];
  description: string[];
  boost?: number;
}

interface ScoredSearchableItem<T> extends SearchableItem<T> {
  score: number;
}

interface RankedSearchResults {
  spots: ScoredSearchableItem<unknown>[];
  events: ScoredSearchableItem<unknown>[];
  communities: ScoredSearchableItem<unknown>[];
  discovery: ScoredSearchableItem<unknown>[];
}

const MAX_SEARCH_HISTORY = 6;
const POPULAR_KEYWORDS = [
  "Cafe aesthetic",
  "Live music",
  "Rooftop",
  "Event weekend",
  "Workspace",
  "Promo",
];

const QUICK_CATEGORIES: QuickCategory[] = [
  { label: "Tongkrongan", keyword: "cozy", type: "spot", tagSlugs: ["cozy"] },
  { label: "Event", keyword: "event", type: "event" },
  { label: "Komunitas", keyword: "komunitas", type: "all" },
  { label: "Promo", keyword: "promo", type: "all" },
  { label: "Dekat Saya", type: "all", sort: "distance" },
];

const CONTENT_RESULT_LIMIT = 6;
const COMMUNITY_RESULT_LIMIT = 4;
const DISCOVERY_RESULT_LIMIT = 4;
const MIN_CLEAR_QUERY_LENGTH = 4;
const STRONG_CONTENT_SCORE = 28;
const MIN_CONTENT_SCORE = 8;
const MIN_DISCOVERY_SCORE = 14;

const TAG_CATEGORY_LABELS: Record<Tag["category"], string> = {
  activity: "Aktivitas",
  cuisine: "Kuliner",
  occasion: "Occasion",
  price: "Harga",
  vibe: "Vibe",
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSubsequence(needle: string, haystack: string): boolean {
  if (needle.length < 3) return false;
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

function scoreText(query: string, target: string, weight: number): number {
  const normalizedTarget = normalizeText(target);
  if (!query || !normalizedTarget) return 0;
  if (normalizedTarget === query) return weight * 5;
  if (normalizedTarget.startsWith(query)) return weight * 4;
  if (normalizedTarget.includes(query)) return weight * 3;

  const queryTokens = query.split(" ").filter(Boolean);
  const targetTokens = normalizedTarget.split(" ").filter(Boolean);
  let score = 0;

  for (const queryToken of queryTokens) {
    for (const targetToken of targetTokens) {
      if (targetToken === queryToken) score += weight * 1.4;
      else if (targetToken.startsWith(queryToken)) score += weight;
      else if (targetToken.includes(queryToken)) score += weight * 0.7;
      else if (isSubsequence(queryToken, targetToken)) score += weight * 0.35;
    }
  }

  return score;
}

function scoreSearchableItem<T>(
  item: SearchableItem<T>,
  query: string,
): ScoredSearchableItem<T> | null {
  const score =
    item.primary.reduce((sum, value) => sum + scoreText(query, value, 12), 0) +
    item.tags.reduce((sum, value) => sum + scoreText(query, value, 8), 0) +
    item.categories.reduce((sum, value) => sum + scoreText(query, value, 7), 0) +
    item.interests.reduce((sum, value) => sum + scoreText(query, value, 7), 0) +
    item.description.reduce((sum, value) => sum + scoreText(query, value, 4), 0) +
    (item.boost ?? 0);

  return score > 0 ? { ...item, score } : null;
}

function getTagNames(tagIds: string[], tagsById: Map<string, Tag>): string[] {
  return tagIds.flatMap((id) => {
    const tag = tagsById.get(id);
    return tag ? [tag.name, tag.slug, TAG_CATEGORY_LABELS[tag.category]] : [];
  });
}

function getSelectedTagMatchCount(
  item: SearchableItem<unknown>,
  selectedTagSet: Set<string>,
): number {
  if (selectedTagSet.size === 0) return 0;
  if (item.kind === "spot") {
    return (item.item as Spot).tagIds.filter((id) => selectedTagSet.has(id))
      .length;
  }
  if (item.kind === "event") {
    return (item.item as NgetagEvent).tagIds.filter((id) =>
      selectedTagSet.has(id),
    ).length;
  }
  return 0;
}

export function SearchView({ tags }: SearchViewProps) {
  const router = useRouter();
  const { query, setQ, updateQuery, toggleTag, setSort, reset } = useSearch();
  const [inputValue, setInputValue] = useState(query.q ?? "");
  const debouncedInput = useDebounce(inputValue, SEARCH_DEBOUNCE_MS);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const location = useCurrentLocationStore((s) => s.location);
  const userFavoriteTagIds = useCurrentUserStore(
    (s) => s.user.preferences?.favoriteTagIds,
  );
  const userInterestIds = useCurrentUserStore((s) => s.user.interestIds ?? []);
  const favoriteTagIds = useMemo(
    () => userFavoriteTagIds ?? [],
    [userFavoriteTagIds],
  );

  const activeType = query.type ?? "all";
  const selectedTagSlugs = useMemo(() => query.tagSlugs ?? [], [query.tagSlugs]);
  const debouncedQuery = normalizeText(query.q ?? "");
  const hasSearchIntent =
    Boolean((query.q ?? "").trim()) || selectedTagSlugs.length > 0;
  const tagsById = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);
  const tagsBySlug = useMemo(
    () => new Map(tags.map((tag) => [tag.slug, tag])),
    [tags],
  );
  const categoriesById = useMemo(
    () =>
      new Map(
        communityCategories.map((category) => [category.id, category]),
      ),
    [],
  );
  const interestsById = useMemo(
    () => new Map(interests.map((interest) => [interest.id, interest])),
    [],
  );
  const selectedTagIds = useMemo(
    () =>
      selectedTagSlugs.flatMap((slug) => {
        const tag = tagsBySlug.get(slug);
        return tag ? [tag.id] : [];
      }),
    [selectedTagSlugs, tagsBySlug],
  );

  const searchIndex = useMemo(() => {
    const spotItems: SearchableItem<unknown>[] = spots.map((spot) => ({
      id: spot.id,
      kind: "spot",
      item: spot,
      title: spot.name,
      primary: [spot.name, "spot", "tempat", "tongkrongan"],
      tags: getTagNames(spot.tagIds, tagsById),
      categories: getTagNames(spot.tagIds, tagsById),
      interests: [],
      description: [
        spot.description,
        spot.location.address,
        spot.location.village,
        spot.location.district,
        spot.location.city,
      ],
      boost: spot.featured ? 2 : 0,
    }));

    const eventItems: SearchableItem<unknown>[] = events.map((event) => ({
      id: event.id,
      kind: "event",
      item: event,
      title: event.title,
      primary: [event.title, event.venueName, event.organizer.name, "event"],
      tags: getTagNames(event.tagIds, tagsById),
      categories: getTagNames(event.tagIds, tagsById),
      interests: event.interestIds.flatMap((id) => {
        const interest = interestsById.get(id);
        return interest ? [interest.label, interest.slug] : [];
      }),
      description: [
        event.description,
        event.venueName,
        event.location.village,
        event.location.district,
        event.location.city,
      ],
      boost: event.featured ? 2 : 0,
    }));

    const communityItems: SearchableItem<unknown>[] = communities.map(
      (community) => {
        const category = categoriesById.get(community.categoryId);
        return {
          id: community.id,
          kind: "community",
          item: community,
          title: community.title,
          primary: [
            community.title,
            community.managementName ?? "",
            "komunitas",
            "community",
          ],
          tags: community.tags,
          categories: category
            ? [category.title, category.id]
            : [community.categoryId],
          interests: [],
          description: [
            community.description,
            community.communityType,
            ...community.updates.flatMap((update) => [update.title, update.body]),
            ...community.agendas.flatMap((agenda) => [
              agenda.title,
              agenda.description,
            ]),
          ],
          boost: community.isOfficial ? 2 : 0,
        };
      },
    );

    const tagItems: SearchableItem<unknown>[] = tags.map((tag) => ({
      id: tag.id,
      kind: "tag",
      item: tag,
      title: tag.name,
      primary: [tag.name, tag.slug, "tag"],
      tags: [tag.name, tag.slug],
      categories: [TAG_CATEGORY_LABELS[tag.category], tag.category],
      interests: [],
      description: [TAG_CATEGORY_LABELS[tag.category]],
      boost: (tag.trendingScore ?? 0) / 100,
    }));

    const categoryItems: SearchableItem<unknown>[] =
      communityCategories.map((category) => ({
        id: category.id,
        kind: "category",
        item: category,
        title: category.title,
        primary: [category.title, category.id, "kategori", "category"],
        tags: [],
        categories: [category.title, category.id],
        interests: [],
        description: [],
      }));

    const interestItems: SearchableItem<unknown>[] = interests.map(
      (interest) => ({
        id: interest.id,
        kind: "interest",
        item: interest,
        title: interest.label,
        primary: [interest.label, interest.slug, "minat", "interest"],
        tags: [],
        categories: [],
        interests: [interest.label, interest.slug],
        description: [],
      }),
    );

    return [
      ...spotItems,
      ...eventItems,
      ...communityItems,
      ...tagItems,
      ...categoryItems,
      ...interestItems,
    ];
  }, [categoriesById, interestsById, tags, tagsById]);

  const locationSpots = useMemo(
    () => getLocationSpotRecommendations(location, 6),
    [location],
  );
  const locationEvents = useMemo(
    () => getLocationEventRecommendations(location, 6),
    [location],
  );
  const interestSpots = useMemo(
    () => getInterestSpotRecommendations(favoriteTagIds, 6),
    [favoriteTagIds],
  );
  const interestEvents = useMemo(
    () => getInterestEventRecommendations(favoriteTagIds, userInterestIds, 6),
    [favoriteTagIds, userInterestIds],
  );

  useEffect(() => {
    const storedHistory =
      getItem<string[]>(STORAGE_KEYS.searchHistory)?.filter(Boolean) ?? [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchHistory(storedHistory.slice(0, MAX_SEARCH_HISTORY));
  }, []);

  useEffect(() => {
    if (debouncedInput !== (query.q ?? "")) {
      setQ(debouncedInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  const results = useMemo<SearchResults>(() => {
    if (!hasSearchIntent) {
      return {
        spots: [],
        events: [],
        communities: [],
        discovery: [],
      };
    }

    const selectedTagSet = new Set(selectedTagIds);
    const filtered = searchIndex
      .filter((item) => {
        if (activeType === "spot" && item.kind !== "spot") return false;
        if (activeType === "event" && item.kind !== "event") return false;
        if (selectedTagSet.size === 0) return true;
        return getSelectedTagMatchCount(item, selectedTagSet) > 0;
      });
    const scored = (debouncedQuery
      ? filtered
          .map((item) => scoreSearchableItem(item, debouncedQuery))
          .map((item) =>
            item
              ? {
                  ...item,
                  score:
                    item.score +
                    getSelectedTagMatchCount(item, selectedTagSet) * 12,
                }
              : null,
          )
          .filter((item): item is ScoredSearchableItem<unknown> =>
            Boolean(item),
          )
      : filtered
          .filter(
            (item) =>
              item.kind === "spot" ||
              item.kind === "event" ||
              item.kind === "community",
          )
          .map((item) => ({
            ...item,
            score:
              getSelectedTagMatchCount(item, selectedTagSet) * 12 +
              (item.kind === "spot" && (item.item as Spot).featured ? 2 : 0) +
              (item.kind === "event" && (item.item as NgetagEvent).featured
                ? 2
                : 0),
          })))
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(b.kind === "spot") -
            Number(a.kind === "spot") ||
          Number(b.kind === "event") -
            Number(a.kind === "event") ||
          Number(b.kind === "community") -
            Number(a.kind === "community") ||
          a.title.localeCompare(b.title),
      );
    const ranked: RankedSearchResults = {
      spots: scored.filter((item) => item.kind === "spot"),
      events: scored.filter((item) => item.kind === "event"),
      communities: scored.filter((item) => item.kind === "community"),
      discovery: scored.filter(
        (item) =>
          item.kind === "tag" ||
          item.kind === "category" ||
          item.kind === "interest",
      ),
    };
    const contentScores = [
      ...ranked.spots,
      ...ranked.events,
      ...ranked.communities,
    ].map((item) => item.score);
    const bestContentScore = Math.max(0, ...contentScores);
    const bestDiscoveryScore = ranked.discovery[0]?.score ?? 0;
    const contentCount = contentScores.filter(
      (score) => score >= MIN_CONTENT_SCORE,
    ).length;
    const isClearContentMatch =
      bestContentScore >= STRONG_CONTENT_SCORE && contentCount > 0;
    const shouldShowDiscovery =
      activeType === "all" &&
      ranked.discovery.length > 0 &&
      bestDiscoveryScore >= MIN_DISCOVERY_SCORE &&
      (!isClearContentMatch ||
        contentCount < 2 ||
        debouncedQuery.length < MIN_CLEAR_QUERY_LENGTH);

    return {
      spots: ranked.spots
        .filter((item) => item.score >= MIN_CONTENT_SCORE)
        .map((item) => item.item as Spot)
        .slice(0, CONTENT_RESULT_LIMIT),
      events: ranked.events
        .filter((item) => item.score >= MIN_CONTENT_SCORE)
        .map((item) => item.item as NgetagEvent)
        .slice(0, CONTENT_RESULT_LIMIT),
      communities: ranked.communities
        .filter((item) => item.score >= MIN_CONTENT_SCORE)
        .map((item) => item.item as Community)
        .slice(0, COMMUNITY_RESULT_LIMIT),
      discovery: shouldShowDiscovery
        ? ranked.discovery
        .map((item): DiscoveryResult => {
          if (item.kind === "tag") {
            return { kind: "tag", item: item.item as Tag };
          }
          if (item.kind === "category") {
            return {
              kind: "category",
              item: item.item as CommunityCategory,
            };
          }
          return { kind: "interest", item: item.item as Interest };
        })
        .slice(0, DISCOVERY_RESULT_LIMIT)
        : [],
    };
  }, [
    activeType,
    debouncedQuery,
    hasSearchIntent,
    searchIndex,
    selectedTagIds,
  ]);

  useEffect(() => {
    const trimmed = debouncedInput.trim();
    if (trimmed.length >= 2) saveSearchHistory(trimmed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  function saveSearchHistory(keyword: string) {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    const next = [
      trimmed,
      ...searchHistory.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, MAX_SEARCH_HISTORY);

    setSearchHistory(next);
    setItem(STORAGE_KEYS.searchHistory, next);
  }

  function runSearch(keyword: string) {
    const trimmed = keyword.trim();
    setInputValue(trimmed);
    saveSearchHistory(trimmed);
    setQ(trimmed);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch(inputValue);
  }

  function clearSearchHistory() {
    setSearchHistory([]);
    setItem(STORAGE_KEYS.searchHistory, []);
  }

  function applyCategory(category: QuickCategory) {
    if (category.keyword) {
      setInputValue(category.keyword);
      saveSearchHistory(category.keyword);
    } else {
      setInputValue("");
    }

    updateQuery({
      q: category.keyword ?? "",
      type: category.type ?? "all",
      tagSlugs: category.tagSlugs ?? [],
      sort: category.sort ?? "relevance",
    });
  }

  function hasSameTags(slugs?: string[]): boolean {
    const expected = slugs ?? [];
    return (
      expected.length === selectedTagSlugs.length &&
      expected.every((slug) => selectedTagSlugs.includes(slug))
    );
  }

  function isCategoryActive(category: QuickCategory): boolean {
    const expectedType = category.type ?? "all";
    const expectedSort = category.sort ?? "relevance";
    const expectedKeyword = category.keyword ?? "";

    return (
      activeType === expectedType &&
      (query.sort ?? "relevance") === expectedSort &&
      (query.q ?? "") === expectedKeyword &&
      hasSameTags(category.tagSlugs)
    );
  }

  function isKeywordActive(keyword: string): boolean {
    return (query.q ?? "").toLowerCase() === keyword.toLowerCase();
  }

  const total =
    results.spots.length +
    results.events.length +
    results.communities.length +
    results.discovery.length;
  const isEmpty = hasSearchIntent && total === 0;

  const filterBar = (
    <FilterBar
      tags={tags}
      selectedTagSlugs={selectedTagSlugs}
      onToggleTag={toggleTag}
      sort={query.sort ?? "relevance"}
      onChangeSort={setSort}
      onReset={() => updateQuery({ tagSlugs: [], sort: "relevance" })}
    />
  );

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden px-4 py-4 md:px-6 md:py-6">
      <div className="mb-3 md:mb-4">
        <header className="mb-3 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.back()}
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Button>
          <div className="min-w-0">
            <div className="mb-2 h-1 w-10 rounded-full bg-[var(--color-primary)]" />
            <h1 className="font-display text-xl font-bold text-[var(--color-foreground)] md:text-2xl">
              Cari yang seru
            </h1>
            <p className="hidden text-sm text-[var(--color-muted-foreground)] md:block">
              Tempat, event, komunitas, atau tag favoritmu.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex max-w-full gap-2" role="search">
          <div className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full glass border">
            <Search
              className="ml-4 h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]"
              aria-hidden
            />
            <Input
              type="search"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Cari tempat, event, komunitas..."
              className="h-full min-w-0 flex-1 border-0 bg-transparent pl-2 pr-3 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Cari spot, event, komunitas, tag, kategori, dan minat"
            />
            <span
              className="h-7 w-px shrink-0 bg-[var(--glass-bg-subtle)]"
              aria-hidden
            />
            <Link
              href="/location"
              className="flex h-full min-w-0 max-w-[42%] items-center gap-1 px-4 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:text-[var(--color-primary)]"
              aria-label="Ganti lokasi aktif"
            >
              <MapPin className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" aria-hidden />
              <span className="min-w-0 truncate">{formatHomeLocation(location)}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </Link>
          </div>
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-tr from-[#7B61FF] to-[#00F5FF] text-slate-950 shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]">
            <Search className="h-4 w-4 text-slate-950" strokeWidth={2.5} aria-hidden />
            <span className="sr-only">Cari</span>
          </Button>
        </form>
      </div>

      <section className="mb-4 space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-semibold leading-tight text-[var(--color-foreground)]">
            Terakhir dicari
          </h2>
          {searchHistory.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[var(--color-muted-foreground)]"
              onClick={clearSearchHistory}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Hapus
            </Button>
          ) : null}
        </div>
        {searchHistory.length > 0 ? (
          <div className="flex max-h-20 max-w-full flex-wrap gap-1.5 overflow-y-auto pr-1">
            {searchHistory.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => runSearch(keyword)}
                className={cn(
                  "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  isKeywordActive(keyword)
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]",
                )}
                aria-pressed={isKeywordActive(keyword)}
              >
                <Clock className="h-3 w-3 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{keyword}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Belum ada. Coba cari cafe, live music, atau komunitas.
          </p>
        )}
      </section>

      <section className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] lg:hidden">
        {filterBar}
      </section>

      <div className="grid max-w-full gap-4 overflow-x-hidden lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside
          className={cn(
            "min-w-0 max-w-full space-y-3 overflow-x-hidden lg:order-1 lg:col-start-1 lg:space-y-4",
            hasSearchIntent ? "order-3" : "order-1",
          )}
        >
          <section className="hidden space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] lg:block lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="flex items-start justify-between gap-3 lg:min-h-8">
              <h2 className="text-sm font-semibold leading-tight text-[var(--color-foreground)] lg:font-display lg:text-xl lg:font-bold">
                Terakhir dicari
              </h2>
              {searchHistory.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[var(--color-muted-foreground)]"
                  onClick={clearSearchHistory}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Hapus
                </Button>
              ) : null}
            </div>
            {searchHistory.length > 0 ? (
              <div className="flex max-w-full flex-wrap gap-1.5 overflow-x-hidden">
                {searchHistory.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => runSearch(keyword)}
                    className={cn(
                      "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      isKeywordActive(keyword)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]",
                    )}
                    aria-pressed={isKeywordActive(keyword)}
                  >
                    <Clock className="h-3 w-3" aria-hidden />
                    <span className="min-w-0 truncate">{keyword}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Belum ada. Coba cari cafe, live music, atau komunitas.
              </p>
            )}
          </section>

          <section className="hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] lg:block">
            {filterBar}
          </section>

          <section className="hidden space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] lg:block">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              Jalan pintas
            </h2>
            <div className="flex max-w-full flex-wrap gap-2 overflow-x-hidden">
              {QUICK_CATEGORIES.map((category) => {
                const active = isCategoryActive(category);
                return (
                  <button
                    key={category.label}
                    type="button"
                    onClick={() => applyCategory(category)}
                    className={cn(
                      "min-w-0 max-w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]",
                    )}
                    aria-pressed={active}
                  >
                    <span className="block truncate">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="hidden space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] lg:block">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              Lagi sering dicari
            </h2>
            <div className="flex max-w-full flex-wrap gap-1.5 overflow-x-hidden">
              {POPULAR_KEYWORDS.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => runSearch(keyword)}
                  className={cn(
                    "max-w-full rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    isKeywordActive(keyword)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]",
                  )}
                  aria-pressed={isKeywordActive(keyword)}
                >
                  <span className="block truncate">{keyword}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="contents lg:order-2 lg:col-start-2 lg:grid lg:gap-4">
        <section
          className={cn(
            "min-w-0 max-w-full overflow-x-hidden space-y-3",
            hasSearchIntent ? "order-2 lg:order-3" : "order-2 lg:order-1",
          )}
        >
          <SectionHeader
            title={`Spot & Event sekitar ${formatHomeLocation(location)}`}
            subtitle=""
            className="pb-2"
          />
          <div className="space-y-2">
            <SearchCarousel>
              {locationSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  tags={tags}
                  variant="compact"
                  distanceKm={spot.distanceKm}
                  className="w-52 shrink-0 snap-start sm:w-60"
                />
              ))}
            </SearchCarousel>
            <SearchCarousel>
              {locationEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  tags={tags}
                  variant="compact"
                  distanceKm={event.distanceKm}
                  className="w-56 shrink-0 snap-start sm:w-64"
                />
              ))}
            </SearchCarousel>
          </div>

          {!hasSearchIntent ? (
            <div className="pt-2">
              <SectionHeader
                title="Berdasarkan minat"
                subtitle="Rekomendasi dari data dummy user"
              />
              <div className="space-y-2">
                <SearchCarousel>
                  {interestSpots.map((spot) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      tags={tags}
                      variant="compact"
                      className="w-52 shrink-0 snap-start sm:w-60"
                    />
                  ))}
                </SearchCarousel>
                <SearchCarousel>
                  {interestEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      tags={tags}
                      variant="compact"
                      className="w-56 shrink-0 snap-start sm:w-64"
                    />
                  ))}
                </SearchCarousel>
              </div>
            </div>
          ) : null}
        </section>

        {hasSearchIntent ? (
          <section className="order-1 min-w-0 max-w-full overflow-x-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] lg:order-1">
              <div className="mb-3 flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                <span>
                  {formatCount(total, "hasil ditemukan")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    !hasSearchIntent ? "hidden" : "",
                  )}
                  onClick={() => {
                    setInputValue("");
                    reset();
                  }}
                >
                  Reset
                </Button>
              </div>

              {isEmpty ? (
                <EmptyState
                  title="Belum ketemu yang pas"
                  description="Coba kata kunci lain, atau lepas beberapa filter dulu."
                />
              ) : activeType === "event" ? (
                <SearchResultRow>
                  {results.events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      tags={tags}
                      className="w-56 shrink-0 snap-start md:w-full"
                    />
                  ))}
                </SearchResultRow>
              ) : activeType === "spot" ? (
                <SearchResultRow>
                  {results.spots.map((spot) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      tags={tags}
                      className="w-52 shrink-0 snap-start md:w-full"
                    />
                  ))}
                </SearchResultRow>
              ) : (
                <div className="space-y-5">
                  {results.spots.length > 0 ? (
                    <section>
                      <SectionHeader
                        title="Spot"
                        subtitle={formatCount(results.spots.length, "hasil")}
                      />
                      <SearchResultRow>
                        {results.spots.map((spot) => (
                          <SpotCard
                            key={spot.id}
                            spot={spot}
                            tags={tags}
                            className="w-52 shrink-0 snap-start md:w-full"
                          />
                        ))}
                      </SearchResultRow>
                    </section>
                  ) : null}
                  {results.events.length > 0 ? (
                    <section>
                      <SectionHeader
                        title="Event"
                        subtitle={formatCount(results.events.length, "hasil")}
                      />
                      <SearchResultRow>
                        {results.events.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            tags={tags}
                            className="w-56 shrink-0 snap-start md:w-full"
                          />
                        ))}
                      </SearchResultRow>
                    </section>
                  ) : null}
                  {results.communities.length > 0 ? (
                    <section>
                      <SectionHeader
                        title="Komunitas"
                        subtitle={formatCount(results.communities.length, "hasil")}
                      />
                      <SearchResultRow>
                        {results.communities.map((community) => (
                          <div
                            key={community.id}
                            className="w-64 shrink-0 snap-start md:w-full"
                          >
                            <CommunityCard community={community} />
                          </div>
                        ))}
                      </SearchResultRow>
                    </section>
                  ) : null}
                  {results.discovery.length > 0 ? (
                    <section>
                      <SectionHeader
                        title="Saran terkait"
                        subtitle="Mungkin ini yang kamu cari"
                      />
                      <SearchResultRow>
                        {results.discovery.map((result) => {
                          if (result.kind === "tag") {
                            const tag = result.item;
                            return (
                              <DiscoveryResultCard
                                key={`tag-${tag.id}`}
                                href={routes.tag(tag.slug)}
                                icon={<Hash className="h-3.5 w-3.5" aria-hidden />}
                                label="Tag"
                                title={tag.name}
                                description={TAG_CATEGORY_LABELS[tag.category]}
                              />
                            );
                          }

                          if (result.kind === "category") {
                            const category = result.item;
                            return (
                              <DiscoveryResultCard
                                key={`category-${category.id}`}
                                href={routes.communitiesByCategory(category.id)}
                                icon={
                                  <Compass className="h-3.5 w-3.5" aria-hidden />
                                }
                                label="Kategori"
                                title={category.title}
                                description="Jelajahi komunitas dalam kategori ini."
                              />
                            );
                          }

                          const interest = result.item;
                          return (
                            <DiscoveryResultCard
                              key={`interest-${interest.id}`}
                              href={routes.search({ q: interest.label })}
                              icon={<Heart className="h-3.5 w-3.5" aria-hidden />}
                              label="Minat"
                              title={interest.label}
                              description={`Rekomendasi untuk minat ${interest.label}`}
                            />
                          );
                        })}
                      </SearchResultRow>
                    </section>
                  ) : null}
                </div>
              )}
          </section>
        ) : null}
        </main>
      </div>
    </div>
  );
}
