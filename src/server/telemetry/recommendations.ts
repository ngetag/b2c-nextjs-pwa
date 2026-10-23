import { getStore } from "@/server/store";
import {
  CONTENT_OWNER_TYPES,
  type ContentOwnerType,
  type ForYouResponse,
  type RecommendationItem,
  type RecommendationProfile,
  type SimilarContentMatch,
} from "@/shared/telemetry";
import { ensureContentIndex } from "./content-index";
import { getTelemetryRepo, telemetryStorageKind } from "./repo";
import {
  buildColdStartEmbedding,
  getTasteProfile,
  hasSignal,
  ownerKeyFor,
  topInterestWeights,
  topTagWeights,
} from "./taste";

const DEFAULT_OWNER_TYPES: ContentOwnerType[] = [
  "spot",
  "event",
  "community",
  "promo",
];

/** Input for the personalised feed. */
export interface ForYouInput {
  customerId?: string | null;
  anonymousId?: string | null;
  /** JWT interests, used for cold start. */
  interestIds?: string[];
  /** JWT favourite tags, used for cold start. */
  favoriteTagIds?: string[];
  lat?: number;
  lng?: number;
  limit?: number;
  types?: string[];
  debug?: boolean;
}

function normalizeTypes(types?: string[]): ContentOwnerType[] {
  if (!types || types.length === 0) return DEFAULT_OWNER_TYPES;
  const allowed = types.filter((type): type is ContentOwnerType =>
    (CONTENT_OWNER_TYPES as readonly string[]).includes(type),
  );
  return allowed.length > 0 ? allowed : DEFAULT_OWNER_TYPES;
}

/** Turns a similarity hit into a card the UI can render. */
function hydrateMatch(
  match: SimilarContentMatch,
  reason: RecommendationItem["reason"],
): RecommendationItem | null {
  const store = getStore();

  switch (match.ownerType) {
    case "spot": {
      const spot = store.spots.find((item) => item.id === match.ownerId);
      if (!spot) return null;
      return {
        ownerType: "spot",
        ownerId: spot.id,
        title: spot.name,
        subtitle: `${spot.location.district}, ${spot.location.city}`,
        imageUrl: spot.coverImageUrl,
        href: `/spots/${spot.id}`,
        score: Number(match.score.toFixed(4)),
        tagIds: spot.tagIds,
        reason,
      };
    }
    case "event": {
      const event = store.events.find((item) => item.id === match.ownerId);
      if (!event) return null;
      return {
        ownerType: "event",
        ownerId: event.id,
        title: event.title,
        subtitle: `${event.venueName} · ${event.location.city}`,
        imageUrl: event.coverImageUrl,
        href: `/events/${event.id}`,
        score: Number(match.score.toFixed(4)),
        tagIds: event.tagIds,
        reason,
      };
    }
    case "community": {
      const community = store.communities.find(
        (item) => item.id === match.ownerId,
      );
      if (!community) return null;
      return {
        ownerType: "community",
        ownerId: community.id,
        title: community.title,
        subtitle: `${community.memberCount.toLocaleString("id-ID")} anggota`,
        imageUrl: community.coverImage,
        href: `/communities/${community.id}`,
        score: Number(match.score.toFixed(4)),
        tagIds: community.tags,
        reason,
      };
    }
    case "promo": {
      const promo = store.promos.find((item) => item.id === match.ownerId);
      if (!promo) return null;
      return {
        ownerType: "promo",
        ownerId: promo.id,
        title: promo.title,
        subtitle: promo.discountPercent
          ? `Diskon ${promo.discountPercent}%`
          : promo.description.slice(0, 80),
        imageUrl: promo.imageUrl,
        href: "/promo",
        score: Number(match.score.toFixed(4)),
        tagIds: promo.spotId ? store.spots.find((s) => s.id === promo.spotId)?.tagIds ?? [] : [],
        reason,
      };
    }
    case "blog": {
      const blog = store.blogs.find((item) => item.slug === match.ownerId);
      if (!blog) return null;
      return {
        ownerType: "blog",
        ownerId: blog.slug,
        title: blog.title,
        subtitle: blog.excerpt.slice(0, 100),
        imageUrl: blog.coverImageUrl,
        href: `/blog/${blog.slug}`,
        score: Number(match.score.toFixed(4)),
        tagIds: blog.tags,
        reason,
      };
    }
    case "hype": {
      const hype = store.hypeItems.find((item) => item.id === match.ownerId);
      if (!hype) return null;
      return {
        ownerType: "hype",
        ownerId: hype.id,
        title: hype.eventName,
        subtitle: hype.caption.slice(0, 100),
        imageUrl: hype.posterUrl ?? hype.photos?.[0],
        href: "/hype",
        score: Number(match.score.toFixed(4)),
        tagIds: hype.tags,
        reason,
      };
    }
    default:
      return null;
  }
}

function trendingFallback(limit: number): RecommendationItem[] {
  const store = getStore();
  const spots = [...store.spots]
    .filter((spot) => !spot.publishStatus || spot.publishStatus === "published")
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    .slice(0, Math.ceil(limit / 2))
    .map<RecommendationItem>((spot, index) => ({
      ownerType: "spot",
      ownerId: spot.id,
      title: spot.name,
      subtitle: `${spot.location.district}, ${spot.location.city}`,
      imageUrl: spot.coverImageUrl,
      href: `/spots/${spot.id}`,
      // Popularity proxy: featured-first order with a gentle decay.
      score: Math.max(0.05, 0.5 - index * 0.03),
      tagIds: spot.tagIds,
      reason: "trending",
    }));

  const events = [...store.events]
    .filter(
      (event) => !event.publishStatus || event.publishStatus === "published",
    )
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    .slice(0, Math.max(0, limit - spots.length))
    .map<RecommendationItem>((event, index) => ({
      ownerType: "event",
      ownerId: event.id,
      title: event.title,
      subtitle: `${event.venueName} · ${event.location.city}`,
      imageUrl: event.coverImageUrl,
      href: `/events/${event.id}`,
      score: Math.max(0.05, 0.45 - index * 0.03),
      tagIds: event.tagIds,
      reason: "trending",
    }));

  return [...spots, ...events].slice(0, limit);
}

/**
 * Hybrid recommendation feed backed by the pgvector content index.
 *
 * 1. Resolve the query vector: stored taste vector → onboarding cold start →
 *    trending fallback.
 * 2. ANN search against `content_embeddings` (`<=>` cosine distance) with an
 *    optional PostGIS radius filter.
 * 3. Hydrate the hits into UI cards.
 *
 * @param input Identity, geo coordinates and display options.
 */
export async function getForYouRecommendations(
  input: ForYouInput,
): Promise<ForYouResponse> {
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 24);
  const ownerTypes = normalizeTypes(input.types);
  const ownerKey = ownerKeyFor({
    customerId: input.customerId,
    anonymousId: input.anonymousId,
  });

  await ensureContentIndex();

  const taste = await getTasteProfile(ownerKey);
  const coldStart = buildColdStartEmbedding({
    interestIds: input.interestIds,
    favoriteTagIds: input.favoriteTagIds,
  });

  const tasteHasSignal = Boolean(taste && hasSignal(taste.embedding));
  const coldStartHasSignal = hasSignal(coldStart);

  const source: RecommendationProfile["source"] = tasteHasSignal
    ? "taste-vector"
    : coldStartHasSignal
      ? "cold-start"
      : "trending";

  const queryEmbedding = tasteHasSignal
    ? taste!.embedding
    : coldStartHasSignal
      ? coldStart
      : null;

  const repo = getTelemetryRepo();
  let items: RecommendationItem[] = [];

  if (queryEmbedding) {
    const matches = await repo.findSimilarContent({
      embedding: queryEmbedding,
      ownerTypes,
      limit: limit * 4,
      lat: input.lat,
      lng: input.lng,
      radiusKm: 30,
    });

    items = matches
      .map((match) => hydrateMatch(match, source === "taste-vector" ? "taste-vector" : "cold-start"))
      .filter((item): item is RecommendationItem => item !== null)
      // Keep the strongest positive signals first; drop clearly opposite ones.
      .filter((item) => item.score > -0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  if (items.length === 0) {
    items = trendingFallback(limit);
  }

  return {
    items,
    profile: {
      source,
      ownerKey,
      dimensions: queryEmbedding?.length ?? 0,
      eventCount: taste?.eventCount ?? 0,
      topTags: topTagWeights(taste),
      topInterests: topInterestWeights(taste),
    },
    generatedAt: new Date().toISOString(),
    storage: telemetryStorageKind(),
  };
}

/**
 * Finds items similar to a given piece of content (e.g. "more like this spot").
 *
 * @param input Seed content type + id and result limit.
 */
export async function getSimilarContent(input: {
  ownerType: ContentOwnerType;
  ownerId: string;
  limit?: number;
  lat?: number;
  lng?: number;
}): Promise<RecommendationItem[]> {
  await ensureContentIndex();
  const repo = getTelemetryRepo();
  const rows = await repo.listContentEmbeddings([input.ownerType]);
  const seed = rows.find((row) => row.ownerId === input.ownerId);
  if (!seed) return [];

  const matches = await repo.findSimilarContent({
    embedding: seed.embedding,
    ownerTypes: [input.ownerType],
    limit: (input.limit ?? 8) + 1,
    excludeKeys: [`${input.ownerType}:${input.ownerId}`],
    lat: input.lat,
    lng: input.lng,
    radiusKm: 30,
  });

  return matches
    .map((match) => hydrateMatch(match, "similar-content"))
    .filter((item): item is RecommendationItem => item !== null)
    .slice(0, input.limit ?? 8);
}
