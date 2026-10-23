import { createHash } from "node:crypto";
import { getStore } from "@/server/store";
import {
  CONTENT_OWNER_TYPES,
  type ContentEmbedding,
  type ContentOwnerType,
} from "@/shared/telemetry";
import { embedText } from "./embedding";
import { getTelemetryRepo } from "./repo";

interface IndexableContent {
  ownerType: ContentOwnerType;
  ownerId: string;
  text: string;
  tags: string[];
  interestIds: string[];
  city?: string;
  latitude?: number;
  longitude?: number;
}

const SYNC_TTL_MS = 60_000;

let lastSyncAt = 0;
let inflight: Promise<{ total: number; indexed: number; skipped: number }> | null =
  null;
let lastResult = { total: 0, indexed: 0, skipped: 0 };

function contentHash(input: Omit<IndexableContent, "ownerType" | "ownerId">): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        text: input.text,
        tags: [...input.tags].sort(),
        interestIds: [...input.interestIds].sort(),
        city: input.city ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      }),
    )
    .digest("hex")
    .slice(0, 48);
}

/**
 * Collects every recommendable entity from the in-memory server store and
 * turns it into a text document for embedding.
 */
function collectIndexableContent(): IndexableContent[] {
  const store = getStore();
  const tagById = new Map(store.tags.map((tag) => [tag.id, tag]));
  const interestById = new Map(
    store.interests.map((interest) => [interest.id, interest]),
  );

  const tagToken = (id: string): string => {
    const tag = tagById.get(id);
    return tag ? `tag ${tag.slug} ${tag.name}` : `tag ${id}`;
  };
  const interestToken = (id: string): string => {
    const interest = interestById.get(id);
    return interest ? `interest ${interest.slug} ${interest.label}` : `interest ${id}`;
  };

  const items: IndexableContent[] = [];

  for (const spot of store.spots) {
    if (spot.publishStatus && spot.publishStatus !== "published") continue;
    items.push({
      ownerType: "spot",
      ownerId: spot.id,
      text: [
        spot.name,
        spot.description,
        spot.location.address,
        spot.location.village,
        spot.location.district,
        spot.location.city,
        `price level ${spot.priceLevel}`,
        `harga ${"$".repeat(Math.max(1, spot.priceLevel))}`,
        ...spot.tagIds.map(tagToken),
      ].join(" · "),
      tags: [...spot.tagIds],
      interestIds: [],
      city: spot.location.city,
      latitude: spot.location.latitude,
      longitude: spot.location.longitude,
    });
  }

  for (const event of store.events) {
    if (event.publishStatus && event.publishStatus !== "published") continue;
    items.push({
      ownerType: "event",
      ownerId: event.id,
      text: [
        event.title,
        event.description,
        event.venueName,
        event.location.city,
        event.location.district,
        event.price.isFree ? "gratis free" : `harga ${event.price.min}`,
        event.organizer.name,
        ...event.tagIds.map(tagToken),
        ...event.interestIds.map(interestToken),
      ].join(" · "),
      tags: [...event.tagIds],
      interestIds: [...event.interestIds],
      city: event.location.city,
      latitude: event.location.latitude,
      longitude: event.location.longitude,
    });
  }

  for (const community of store.communities) {
    if (community.publishStatus && community.publishStatus !== "published") {
      continue;
    }
    const category = store.communityCategories.find(
      (item) => item.id === community.categoryId,
    );
    items.push({
      ownerType: "community",
      ownerId: community.id,
      text: [
        community.title,
        community.description,
        category?.title ?? "",
        category?.name ?? "",
        ...community.tags,
      ].join(" · "),
      tags: [...community.tags],
      interestIds: [],
    });
  }

  for (const promo of store.promos) {
    if (promo.status && promo.status !== "active") continue;
    const spot = promo.spotId
      ? store.spots.find((item) => item.id === promo.spotId)
      : undefined;
    const event = promo.eventId
      ? store.events.find((item) => item.id === promo.eventId)
      : undefined;
    items.push({
      ownerType: "promo",
      ownerId: promo.id,
      text: [
        promo.title,
        promo.description,
        spot?.name ?? "",
        event?.title ?? "",
        promo.code ?? "",
        promo.discountPercent ? `diskon ${promo.discountPercent}%` : "",
      ].join(" · "),
      tags: spot?.tagIds ?? [],
      interestIds: [],
      city: spot?.location.city,
      latitude: spot?.location.latitude,
      longitude: spot?.location.longitude,
    });
  }

  for (const blog of store.blogs) {
    items.push({
      ownerType: "blog",
      ownerId: blog.slug,
      text: [
        blog.title,
        blog.excerpt,
        blog.category,
        blog.region,
        ...blog.tags,
        ...blog.sections.slice(0, 4).flatMap((section) => [
          section.heading,
          ...section.paragraphs.slice(0, 1),
        ]),
      ].join(" · "),
      tags: [...blog.tags],
      interestIds: [],
    });
  }

  for (const hype of store.hypeItems) {
    items.push({
      ownerType: "hype",
      ownerId: hype.id,
      text: [
        hype.eventName,
        hype.caption,
        hype.locationName,
        hype.organizerName,
        ...hype.tags,
      ].join(" · "),
      tags: [...hype.tags],
      interestIds: [],
    });
  }

  return items;
}

async function syncContentIndex(): Promise<{
  total: number;
  indexed: number;
  skipped: number;
}> {
  const repo = getTelemetryRepo();
  const items = collectIndexableContent();
  const existing = await repo.listContentEmbeddings();
  const existingByKey = new Map(
    existing.map((row) => [`${row.ownerType}:${row.ownerId}`, row]),
  );

  const changed: ContentEmbedding[] = [];
  let skipped = 0;

  for (const item of items) {
    const hash = contentHash(item);
    const key = `${item.ownerType}:${item.ownerId}`;
    const current = existingByKey.get(key);

    if (current && current.contentHash === hash) {
      skipped += 1;
      continue;
    }

    changed.push({
      id: key,
      ownerType: item.ownerType,
      ownerId: item.ownerId,
      embedding: embedText(item.text),
      tags: item.tags,
      contentHash: hash,
      updatedAt: new Date().toISOString(),
    });
  }

  if (changed.length > 0) {
    await repo.saveContentEmbeddings(changed);
  }

  lastSyncAt = Date.now();
  lastResult = { total: items.length, indexed: changed.length, skipped };
  return lastResult;
}

/**
 * Ensures every spot, event, community, promo, blog article and hype item has
 * an up-to-date embedding.
 *
 * Runs at most once per minute unless `force` is set, and recomputes only the
 * content whose hashed fields changed.
 */
export async function ensureContentIndex(options: { force?: boolean } = {}) {
  if (!options.force && Date.now() - lastSyncAt < SYNC_TTL_MS) {
    return lastResult;
  }
  if (inflight) return inflight;

  inflight = syncContentIndex().finally(() => {
    inflight = null;
  });

  return inflight;
}

/** Force a full re-embedding synchronously (admin/debug endpoint). */
export async function rebuildContentIndex() {
  lastSyncAt = 0;
  return ensureContentIndex({ force: true });
}

/** Stats about the current content index (for `/api/telemetry/summary`). */
export async function contentIndexStats() {
  const repo = getTelemetryRepo();
  const rows = await repo.listContentEmbeddings();
  const byType = Object.fromEntries(
    CONTENT_OWNER_TYPES.map((type) => [
      type,
      rows.filter((row) => row.ownerType === type).length,
    ]),
  );
  return {
    total: rows.length,
    byType,
    lastSyncAt: lastSyncAt ? new Date(lastSyncAt).toISOString() : null,
  };
}
