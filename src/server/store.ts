import { blogs as initialBlogs } from "@/data/fixtures/blogs";
import { hypeItems as initialHypeItems } from "@/data/fixtures/hype";
import { demoUser } from "@/data/fixtures/users";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { calculateDistanceKm, sortByDistance } from "@/lib/location";
import type {
  CreateBlogArticleInput,
  CreateCommunityAgendaInput,
  CreateCommunityInput,
  CreateCommunityUpdatePostInput,
  CreateEventInput,
  CreateGalleryAssetInput,
  CreateHypeItemInput,
  CreateInterestInput,
  CreateNotificationInput,
  CreateOwnerInput,
  CreatePromoInput,
  CreateQrCodeInput,
  CreateReviewInput,
  CreateReviewTagInput,
  CreateSpotInput,
  CreateTagInput,
  MarkSpotVisitInput,
  OpeningHourInput,
  PatchNotificationsInput,
  ToggleAttendanceInput,
  ToggleBookmarkInput,
  ToggleMembershipInput,
  UpdateBlogArticleInput,
  UpdateCommunityInput,
  UpdateEventInput,
  UpdateHypeItemInput,
  UpdateInterestInput,
  UpdateOwnerInput,
  UpdatePromoInput,
  UpdateQrCodeInput,
  UpdateReviewInput,
  UpdateSpotInput,
  UpdateTagInput,
  UpdateUserInput,
} from "@/schemas";
import type {
  BookmarkContract,
  CommunityCategoryContract,
  CommunityContract,
  CommunityMembershipContract,
  CustomerContract,
  EventAttendanceContract,
  EventContract,
  GalleryAssetContract,
  InterestContract,
  OwnerContract,
  PromoContract,
  QrCodeContract,
  ReviewContract,
  ReviewTagContract,
  SpotContract,
  SpotVisitContract,
  TagContract,
} from "@/shared/contracts";
import {
  mockBookmarks,
  mockCommunities,
  mockCommunityCategories,
  mockCommunityMemberships,
  mockCustomers,
  mockEventAttendances,
  mockEvents,
  mockGallery,
  mockInterests,
  mockOwners,
  mockPromos,
  mockQrCodes,
  mockReviews,
  mockReviewTags,
  mockSpots,
  mockSpotVisits,
  mockTags,
} from "@/shared/mocks/b2b-handoff.mock";
import type { NgetagNotification } from "@/stores/notification.store";
import type { BlogArticle } from "@/types/blog";
import type { HypeItem } from "@/types/hype";
import type { Paginated, SearchQuery } from "@/types/index";
import type { Coordinates, WithDistance } from "@/types/location";

export function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const INTEREST_CATEGORY_MAP: Record<string, string[]> = {
  "i-coffee": ["coffee-wfc"],
  "i-gaming": ["gaming", "anime-pop"],
  "i-music": ["band-music"],
  "i-sports": ["sport"],
  "i-startup": ["startup-tech"],
  "i-photo": ["creator"],
  "i-wfc": ["coffee-wfc", "startup-tech"],
};

const initialNotificationsSeed: NgetagNotification[] = [
  {
    id: "ticket-available",
    title: "Tiket sudah tersedia",
    description: "Indonesia Coffee Festival sudah mulai menjual tiketnya.",
    detail: "5 September 2026 · Wishlist kamu",
    href: "/calendar?event=e12",
    type: "ticket",
    unread: true,
    createdAt: "2026-08-29T08:00:00.000Z",
  },
  {
    id: "event-calendar",
    title: "Event masuk ke kalender",
    description: "Indie Clash Vol. 5 tersimpan dari wishlist kamu.",
    detail: "19 September 2026 · M Bloc Space",
    href: "/calendar?event=e5",
    type: "calendar",
    unread: true,
    createdAt: "2026-08-28T10:00:00.000Z",
  },
  {
    id: "promoter-update",
    title: "Ada update dari promotor",
    description: "Java Festival Production mengumumkan detail terbaru event.",
    detail: "Kemarin · Java Festival Production",
    href: "/calendar?event=e1",
    type: "ticket",
    unread: false,
    createdAt: "2026-08-27T12:00:00.000Z",
  },
];

export interface ServerStoreState {
  spots: SpotContract[];
  events: EventContract[];
  promos: PromoContract[];
  tags: TagContract[];
  interests: InterestContract[];
  reviews: ReviewContract[];
  reviewTags: ReviewTagContract[];
  communities: CommunityContract[];
  communityCategories: CommunityCategoryContract[];
  blogs: BlogArticle[];
  hypeItems: HypeItem[];
  customers: CustomerContract[];
  owners: OwnerContract[];
  gallery: GalleryAssetContract[];
  qrCodes: QrCodeContract[];
  bookmarks: BookmarkContract[];
  eventAttendances: EventAttendanceContract[];
  spotVisits: SpotVisitContract[];
  communityMemberships: CommunityMembershipContract[];
  notifications: NgetagNotification[];
}

function createInitialState(): ServerStoreState {
  return {
    spots: structuredClone(mockSpots),
    events: structuredClone(mockEvents),
    promos: structuredClone(mockPromos),
    tags: structuredClone(mockTags),
    interests: structuredClone(mockInterests),
    reviews: structuredClone(mockReviews),
    reviewTags: structuredClone(mockReviewTags),
    communities: structuredClone(mockCommunities),
    communityCategories: structuredClone(mockCommunityCategories),
    blogs: structuredClone(initialBlogs),
    hypeItems: structuredClone(initialHypeItems),
    customers: structuredClone(mockCustomers),
    owners: structuredClone(mockOwners),
    gallery: structuredClone(mockGallery),
    qrCodes: structuredClone(mockQrCodes),
    bookmarks: structuredClone(mockBookmarks),
    eventAttendances: structuredClone(mockEventAttendances),
    spotVisits: structuredClone(mockSpotVisits),
    communityMemberships: structuredClone(mockCommunityMemberships),
    notifications: structuredClone(initialNotificationsSeed),
  };
}

declare global {
  var __ngetagServerStore: ServerStoreState | undefined;
}

export function getStore(): ServerStoreState {
  if (!globalThis.__ngetagServerStore) {
    globalThis.__ngetagServerStore = createInitialState();
  }
  return globalThis.__ngetagServerStore;
}

export function resetServerStore(): ServerStoreState {
  globalThis.__ngetagServerStore = createInitialState();
  return globalThis.__ngetagServerStore;
}

// ============================================================================
// Tags & Interests
// ============================================================================

export function storeListTags(opts?: {
  category?: string;
  includeInactive?: boolean;
  trendingLimit?: number;
}): TagContract[] {
  const store = getStore();
  let list = [...store.tags];
  if (!opts?.includeInactive) {
    list = list.filter((t) => t.isActive !== false);
  }
  if (opts?.category) {
    list = list.filter((t) => t.category === opts.category);
  }
  if (opts?.trendingLimit && opts.trendingLimit > 0) {
    list.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));
    return list.slice(0, opts.trendingLimit);
  }
  return list;
}

export function storeGetTagBySlugOrId(slugOrId: string): TagContract | null {
  const store = getStore();
  return (
    store.tags.find((t) => t.slug === slugOrId || t.id === slugOrId) ?? null
  );
}

export function storeGetTagsByIds(ids: string[]): TagContract[] {
  const store = getStore();
  const idSet = new Set(ids);
  return store.tags.filter((t) => idSet.has(t.id));
}

export function storeCreateTag(input: CreateTagInput): TagContract {
  const store = getStore();
  const now = new Date().toISOString();
  const slug = input.slug ?? slugifyText(input.name);
  const tag: TagContract = {
    id: input.id ?? `t-${Date.now()}`,
    slug,
    name: input.name,
    category: input.category,
    iconName: input.iconName,
    trendingScore: input.trendingScore ?? 50,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.tags.push(tag);
  return tag;
}

export function storeUpdateTag(
  slugOrId: string,
  patch: UpdateTagInput,
): TagContract | null {
  const store = getStore();
  const idx = store.tags.findIndex(
    (t) => t.slug === slugOrId || t.id === slugOrId,
  );
  if (idx === -1) return null;
  const updated: TagContract = {
    ...store.tags[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.tags[idx] = updated;
  return updated;
}

export function storeDeleteTag(slugOrId: string): boolean {
  const store = getStore();
  const idx = store.tags.findIndex(
    (t) => t.slug === slugOrId || t.id === slugOrId,
  );
  if (idx === -1) return false;
  store.tags.splice(idx, 1);
  return true;
}

export function storeListInterests(opts?: {
  ids?: string[];
  includeInactive?: boolean;
}): InterestContract[] {
  const store = getStore();
  let list = [...store.interests];
  if (!opts?.includeInactive) {
    list = list.filter((i) => i.isActive !== false);
  }
  if (opts?.ids && opts.ids.length > 0) {
    const idSet = new Set(opts.ids);
    list = list.filter((i) => idSet.has(i.id));
  }
  return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function storeGetInterestById(idOrSlug: string): InterestContract | null {
  const store = getStore();
  return (
    store.interests.find((i) => i.id === idOrSlug || i.slug === idOrSlug) ??
    null
  );
}

export function storeCreateInterest(
  input: CreateInterestInput,
): InterestContract {
  const store = getStore();
  const now = new Date().toISOString();
  const slug = input.slug ?? slugifyText(input.label);
  const interest: InterestContract = {
    id: input.id ?? `i-${slug}`,
    label: input.label,
    slug,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? store.interests.length + 1,
    createdAt: now,
    updatedAt: now,
  };
  store.interests.push(interest);
  return interest;
}

export function storeUpdateInterest(
  idOrSlug: string,
  patch: UpdateInterestInput,
): InterestContract | null {
  const store = getStore();
  const idx = store.interests.findIndex(
    (i) => i.id === idOrSlug || i.slug === idOrSlug,
  );
  if (idx === -1) return null;
  const updated: InterestContract = {
    ...store.interests[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.interests[idx] = updated;
  return updated;
}

export function storeDeleteInterest(idOrSlug: string): boolean {
  const store = getStore();
  const idx = store.interests.findIndex(
    (i) => i.id === idOrSlug || i.slug === idOrSlug,
  );
  if (idx === -1) return false;
  store.interests.splice(idx, 1);
  return true;
}

// ============================================================================
// Spots
// ============================================================================

function tagSlugsToIds(slugs: string[]): string[] {
  const store = getStore();
  return store.tags.filter((t) => slugs.includes(t.slug)).map((t) => t.id);
}

export interface SpotSearchOptions extends SearchQuery {
  featured?: boolean;
  publishStatus?: "draft" | "published" | "archived" | "all";
  ownerId?: string;
  lat?: number;
  lng?: number;
  anyTagMatch?: boolean;
}

export function storeSearchSpots(
  query: SpotSearchOptions = {},
): Paginated<SpotContract & Partial<WithDistance>> {
  const store = getStore();
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

  let result: Array<SpotContract & Partial<WithDistance>> = [...store.spots];

  if (query.publishStatus && query.publishStatus !== "all") {
    result = result.filter(
      (s) => (s.publishStatus ?? "published") === query.publishStatus,
    );
  } else if (!query.publishStatus && !query.ownerId) {
    result = result.filter(
      (s) => !s.publishStatus || s.publishStatus === "published",
    );
  }

  if (query.ownerId) {
    result = result.filter((s) => s.ownerId === query.ownerId);
  }

  if (query.featured !== undefined) {
    result = result.filter((s) => Boolean(s.featured) === query.featured);
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.location.address.toLowerCase().includes(q) ||
        s.location.village.toLowerCase().includes(q) ||
        s.location.district.toLowerCase().includes(q),
    );
  }

  if (query.tagSlugs && query.tagSlugs.length > 0) {
    const ids = tagSlugsToIds(query.tagSlugs);
    if (ids.length > 0) {
      result = result.filter((s) =>
        query.anyTagMatch
          ? ids.some((id) => s.tagIds.includes(id))
          : ids.every((id) => s.tagIds.includes(id)),
      );
    } else {
      result = [];
    }
  }

  if (query.city) {
    result = result.filter(
      (s) => s.location.city.toLowerCase() === query.city!.toLowerCase(),
    );
  }

  const hasCoords =
    typeof query.lat === "number" &&
    Number.isFinite(query.lat) &&
    typeof query.lng === "number" &&
    Number.isFinite(query.lng);

  if (hasCoords) {
    const userCoords: Coordinates = {
      latitude: query.lat!,
      longitude: query.lng!,
    };
    result = result.map((spot) => ({
      ...spot,
      distanceKm: calculateDistanceKm(userCoords, spot.location),
    }));
  }

  switch (query.sort) {
    case "newest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "distance":
      if (hasCoords) {
        result.sort(
          (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
        );
      } else {
        result.sort(
          (a, b) =>
            Number(b.featured ?? false) - Number(a.featured ?? false) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }
      break;
    case "relevance":
    default:
      result.sort(
        (a, b) =>
          Number(b.featured ?? false) - Number(a.featured ?? false) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  const start = (page - 1) * pageSize;
  const items = result.slice(start, start + pageSize);
  return { items, page, pageSize, total: result.length };
}

export function storeListFeaturedSpots(limit = 8): SpotContract[] {
  const store = getStore();
  const published = store.spots.filter(
    (s) => !s.publishStatus || s.publishStatus === "published",
  );
  const featured = published.filter((s) => s.featured);
  const rest = published.filter((s) => !s.featured);
  const ordered = [...featured, ...rest].sort(
    (a, b) =>
      Number(b.featured ?? false) - Number(a.featured ?? false) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return ordered.slice(0, limit);
}

export function storeListRecommendedSpotsByLocation(
  userLocation: Coordinates,
  limit = 8,
): Array<SpotContract & WithDistance> {
  const store = getStore();
  const published = store.spots.filter(
    (s) => !s.publishStatus || s.publishStatus === "published",
  );
  return sortByDistance(published, userLocation).slice(0, limit);
}

export function storeGetSpotById(idOrSlug: string): SpotContract | null {
  const store = getStore();
  return (
    store.spots.find((s) => s.id === idOrSlug || s.slug === idOrSlug) ?? null
  );
}

export function storeCreateSpot(input: CreateSpotInput): SpotContract {
  const store = getStore();
  const now = new Date().toISOString();
  const id = input.id ?? `s${store.spots.length + 1}-${Date.now()}`;
  const slug = input.slug ?? slugifyText(input.name);
  const spot: SpotContract = {
    id,
    ownerId: input.ownerId ?? `own-spot-${id}`,
    slug,
    name: input.name,
    description: input.description,
    coverImageUrl: input.coverImageUrl,
    galleryUrls: input.galleryUrls,
    tagIds: input.tagIds,
    priceLevel: input.priceLevel,
    location: input.location,
    openingHours: input.openingHours,
    promoIds: input.promoIds,
    contact: input.contact,
    featured: input.featured,
    publishStatus: input.publishStatus,
    createdAt: now,
    lastUpdatedAt: now,
    lastUpdatedBy: input.lastUpdatedBy ?? "Owner NgeTag",
  };
  store.spots.unshift(spot);
  return spot;
}

export function storeUpdateSpot(
  idOrSlug: string,
  patch: UpdateSpotInput,
): SpotContract | null {
  const store = getStore();
  const idx = store.spots.findIndex(
    (s) => s.id === idOrSlug || s.slug === idOrSlug,
  );
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const updated: SpotContract = {
    ...store.spots[idx],
    ...patch,
    lastUpdatedAt: now,
    lastUpdatedBy:
      patch.lastUpdatedBy ?? store.spots[idx].lastUpdatedBy ?? "Owner NgeTag",
  };
  store.spots[idx] = updated;
  return updated;
}

export function storeUpdateSpotOpeningHours(
  spotId: string,
  openingHours: OpeningHourInput[],
): SpotContract | null {
  return storeUpdateSpot(spotId, { openingHours });
}

export function storeDeleteSpot(idOrSlug: string): boolean {
  const store = getStore();
  const idx = store.spots.findIndex(
    (s) => s.id === idOrSlug || s.slug === idOrSlug,
  );
  if (idx === -1) return false;
  store.spots.splice(idx, 1);
  return true;
}

// ============================================================================
// Events
// ============================================================================

export interface EventSearchOptions extends SearchQuery {
  featured?: boolean;
  publishStatus?: "draft" | "published" | "archived" | "all";
  ownerId?: string;
  interestIds?: string[];
  lat?: number;
  lng?: number;
  anyTagMatch?: boolean;
}

export function storeSearchEvents(
  query: EventSearchOptions = {},
): Paginated<EventContract & Partial<WithDistance>> {
  const store = getStore();
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

  let result: Array<EventContract & Partial<WithDistance>> = [...store.events];

  if (query.publishStatus && query.publishStatus !== "all") {
    result = result.filter(
      (e) => (e.publishStatus ?? "published") === query.publishStatus,
    );
  } else if (!query.publishStatus && !query.ownerId) {
    result = result.filter(
      (e) => !e.publishStatus || e.publishStatus === "published",
    );
  }

  if (query.ownerId) {
    result = result.filter((e) => e.ownerId === query.ownerId);
  }

  if (query.featured !== undefined) {
    result = result.filter((e) => Boolean(e.featured) === query.featured);
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.location.village.toLowerCase().includes(q) ||
        e.location.district.toLowerCase().includes(q),
    );
  }

  if (query.tagSlugs && query.tagSlugs.length > 0) {
    const ids = tagSlugsToIds(query.tagSlugs);
    if (ids.length > 0) {
      result = result.filter((e) =>
        query.anyTagMatch
          ? ids.some((id) => e.tagIds.includes(id))
          : ids.every((id) => e.tagIds.includes(id)),
      );
    } else {
      result = [];
    }
  }

  if (query.interestIds && query.interestIds.length > 0) {
    const interestSet = new Set(query.interestIds);
    result = result.filter((e) =>
      e.interestIds.some((id) => interestSet.has(id)),
    );
  }

  if (query.city) {
    result = result.filter(
      (e) => e.location.city.toLowerCase() === query.city!.toLowerCase(),
    );
  }

  const hasCoords =
    typeof query.lat === "number" &&
    Number.isFinite(query.lat) &&
    typeof query.lng === "number" &&
    Number.isFinite(query.lng);

  if (hasCoords) {
    const userCoords: Coordinates = {
      latitude: query.lat!,
      longitude: query.lng!,
    };
    result = result.map((event) => ({
      ...event,
      distanceKm: calculateDistanceKm(userCoords, event.location),
    }));
  }

  switch (query.sort) {
    case "newest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "distance":
      if (hasCoords) {
        result.sort(
          (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
        );
      } else {
        result.sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );
      }
      break;
    case "relevance":
    default:
      result.sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
  }

  const start = (page - 1) * pageSize;
  const items = result.slice(start, start + pageSize);
  return { items, page, pageSize, total: result.length };
}

export function storeListFeaturedEvents(limit = 8): EventContract[] {
  const store = getStore();
  const published = store.events.filter(
    (e) => !e.publishStatus || e.publishStatus === "published",
  );
  const featured = published.filter((e) => e.featured);
  const rest = published.filter((e) => !e.featured);
  const ordered = [...featured, ...rest].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
  return ordered.slice(0, limit);
}

export function storeListRecommendedEventsByLocation(
  userLocation: Coordinates,
  limit = 8,
): Array<EventContract & WithDistance> {
  const store = getStore();
  const published = store.events.filter(
    (e) => !e.publishStatus || e.publishStatus === "published",
  );
  return sortByDistance(published, userLocation).slice(0, limit);
}

export function storeGetEventById(idOrSlug: string): EventContract | null {
  const store = getStore();
  return (
    store.events.find((e) => e.id === idOrSlug || e.slug === idOrSlug) ?? null
  );
}

export function storeCreateEvent(input: CreateEventInput): EventContract {
  const store = getStore();
  const now = new Date().toISOString();
  const id = input.id ?? `e${store.events.length + 1}-${Date.now()}`;
  const slug = input.slug ?? slugifyText(input.title);
  const event: EventContract = {
    id,
    ownerId: input.ownerId ?? `own-event-${input.organizer.id}`,
    slug,
    title: input.title,
    description: input.description,
    coverImageUrl: input.coverImageUrl,
    tagIds: input.tagIds,
    interestIds: input.interestIds,
    startAt: input.startAt,
    endAt: input.endAt,
    venueName: input.venueName,
    location: input.location,
    price: input.price,
    organizer: input.organizer,
    status: input.status,
    capacity: input.capacity,
    ticketUrl: input.ticketUrl,
    featured: input.featured,
    publishStatus: input.publishStatus,
    createdAt: now,
    lastUpdatedAt: now,
    lastUpdatedBy: input.lastUpdatedBy ?? "Promotor NgeTag",
  };
  store.events.unshift(event);
  return event;
}

export function storeUpdateEvent(
  idOrSlug: string,
  patch: UpdateEventInput,
): EventContract | null {
  const store = getStore();
  const idx = store.events.findIndex(
    (e) => e.id === idOrSlug || e.slug === idOrSlug,
  );
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const updated: EventContract = {
    ...store.events[idx],
    ...patch,
    lastUpdatedAt: now,
    lastUpdatedBy:
      patch.lastUpdatedBy ??
      store.events[idx].lastUpdatedBy ??
      "Promotor NgeTag",
  };
  store.events[idx] = updated;
  return updated;
}

export function storeDeleteEvent(idOrSlug: string): boolean {
  const store = getStore();
  const idx = store.events.findIndex(
    (e) => e.id === idOrSlug || e.slug === idOrSlug,
  );
  if (idx === -1) return false;
  store.events.splice(idx, 1);
  return true;
}

// ============================================================================
// Promos
// ============================================================================

export function storeListPromos(opts?: {
  ids?: string[];
  spotId?: string;
  eventId?: string;
  ownerId?: string;
  status?: string;
  limit?: number;
}): PromoContract[] {
  const store = getStore();
  let list = [...store.promos];
  if (opts?.ids && opts.ids.length > 0) {
    const idSet = new Set(opts.ids);
    list = list.filter((p) => idSet.has(p.id));
  }
  if (opts?.spotId) {
    list = list.filter((p) => p.spotId === opts.spotId);
  }
  if (opts?.eventId) {
    list = list.filter((p) => p.eventId === opts.eventId);
  }
  if (opts?.ownerId) {
    list = list.filter((p) => p.ownerId === opts.ownerId);
  }
  if (opts?.status && opts.status !== "all") {
    list = list.filter((p) => (p.status ?? "active") === opts.status);
  }
  if (opts?.limit && opts.limit > 0) {
    return list.slice(0, opts.limit);
  }
  return list;
}

export function storeGetPromoById(id: string): PromoContract | null {
  const store = getStore();
  return store.promos.find((p) => p.id === id) ?? null;
}

export function storeCreatePromo(input: CreatePromoInput): PromoContract {
  const store = getStore();
  const now = new Date().toISOString();
  const id = input.id ?? `pr-${Date.now()}`;
  const promo: PromoContract = {
    id,
    ownerId: input.ownerId,
    title: input.title,
    description: input.description,
    validUntil: input.validUntil,
    discountPercent: input.discountPercent,
    code: input.code,
    imageUrl: input.imageUrl,
    spotId: input.spotId,
    eventId: input.eventId,
    ownerType:
      input.ownerType ??
      (input.spotId ? "spot" : input.eventId ? "event" : undefined),
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
  store.promos.unshift(promo);
  if (promo.spotId) {
    const spot = store.spots.find((s) => s.id === promo.spotId);
    if (spot && !spot.promoIds.includes(promo.id)) {
      spot.promoIds.push(promo.id);
    }
  }
  return promo;
}

export function storeUpdatePromo(
  id: string,
  patch: UpdatePromoInput,
): PromoContract | null {
  const store = getStore();
  const idx = store.promos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: PromoContract = {
    ...store.promos[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.promos[idx] = updated;
  return updated;
}

export function storeDeletePromo(id: string): boolean {
  const store = getStore();
  const idx = store.promos.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  const [removed] = store.promos.splice(idx, 1);
  if (removed?.spotId) {
    const spot = store.spots.find((s) => s.id === removed.spotId);
    if (spot) {
      spot.promoIds = spot.promoIds.filter((pid) => pid !== id);
    }
  }
  return true;
}

// ============================================================================
// Reviews & Review Tags
// ============================================================================

export function storeListReviews(opts?: {
  spotId?: string;
  authorId?: string;
}): ReviewContract[] {
  const store = getStore();
  let list = [...store.reviews];
  if (opts?.spotId) {
    list = list.filter((r) => r.spotId === opts.spotId);
  }
  if (opts?.authorId) {
    list = list.filter((r) => r.authorId === opts.authorId);
  }
  return list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function storeGetReviewById(id: string): ReviewContract | null {
  const store = getStore();
  return store.reviews.find((r) => r.id === id) ?? null;
}

export function storeCreateReview(input: CreateReviewInput): ReviewContract {
  const store = getStore();
  const now = new Date().toISOString();
  const review: ReviewContract = {
    id: input.id ?? `r-${input.spotId}-${Date.now()}`,
    spotId: input.spotId,
    authorId: input.authorId,
    authorSnapshot: input.authorSnapshot,
    comment: input.comment.trim(),
    reviewTagIds: input.reviewTagIds,
    imageUrls: input.imageUrls,
    helpfulCount: input.helpfulCount ?? 0,
    createdAt: now,
  };
  store.reviews.unshift(review);

  // Also record verified spot visit
  const spot = storeGetSpotById(input.spotId);
  storeMarkSpotVisit({
    userId: input.authorId,
    spotId: input.spotId,
    tagIds: spot?.tagIds ?? [],
    reviewed: true,
  });

  return review;
}

export function storeUpdateReview(
  id: string,
  patch: UpdateReviewInput,
): ReviewContract | null {
  const store = getStore();
  const idx = store.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated: ReviewContract = {
    ...store.reviews[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.reviews[idx] = updated;
  return updated;
}

export function storeIncrementReviewHelpful(id: string): ReviewContract | null {
  const store = getStore();
  const idx = store.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store.reviews[idx] = {
    ...store.reviews[idx],
    helpfulCount: store.reviews[idx].helpfulCount + 1,
    updatedAt: new Date().toISOString(),
  };
  return store.reviews[idx];
}

export function storeDeleteReview(id: string): boolean {
  const store = getStore();
  const idx = store.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.reviews.splice(idx, 1);
  return true;
}

export function storeListReviewTags(opts?: {
  spotId?: string;
  ids?: string[];
}): ReviewTagContract[] {
  const store = getStore();
  let list = [...store.reviewTags];
  if (opts?.spotId) {
    list = list.filter((rt) => rt.spotId === opts.spotId);
  }
  if (opts?.ids && opts.ids.length > 0) {
    const idSet = new Set(opts.ids);
    list = list.filter((rt) => idSet.has(rt.id));
  }
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function storeCreateReviewTag(
  input: CreateReviewTagInput,
): ReviewTagContract {
  const store = getStore();
  const value = input.value ?? slugifyText(input.label);
  const tag: ReviewTagContract = {
    id: input.id ?? `rt-${input.spotId}-${value}`,
    spotId: input.spotId,
    label: input.label,
    value,
    ownerEditable: input.ownerEditable ?? true,
    sortOrder: input.sortOrder ?? 1,
  };
  store.reviewTags.push(tag);
  return tag;
}

export function storeReplaceSpotReviewTags(
  spotId: string,
  tags: Array<{ label: string; value?: string; sortOrder?: number; ownerEditable?: boolean }>,
): ReviewTagContract[] {
  const store = getStore();
  store.reviewTags = store.reviewTags.filter((rt) => rt.spotId !== spotId);
  const created = tags.map((tag, index) => {
    const value = tag.value ?? slugifyText(tag.label);
    return {
      id: `rt-${spotId}-${value}`,
      spotId,
      label: tag.label,
      value,
      ownerEditable: tag.ownerEditable ?? true,
      sortOrder: tag.sortOrder ?? index + 1,
    } satisfies ReviewTagContract;
  });
  store.reviewTags.push(...created);
  return created;
}

// ============================================================================
// Communities & Categories
// ============================================================================

export function storeListCommunityCategories(): CommunityCategoryContract[] {
  const store = getStore();
  return store.communityCategories.map((cat) => ({
    ...cat,
    totalCommunities: store.communities.filter(
      (c) =>
        c.categoryId === cat.id &&
        (!c.publishStatus || c.publishStatus === "published"),
    ).length,
  }));
}

export function storeGetCommunityCategoryById(
  idOrSlug: string,
): CommunityCategoryContract | null {
  const categories = storeListCommunityCategories();
  return (
    categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null
  );
}

export function storeListCommunities(opts?: {
  categoryId?: string;
  interestIds?: string[];
  tags?: string[];
  q?: string;
  ownerId?: string;
  publishStatus?: "draft" | "published" | "archived" | "all";
}): CommunityContract[] {
  const store = getStore();
  let list = [...store.communities];

  if (opts?.publishStatus && opts.publishStatus !== "all") {
    list = list.filter(
      (c) => (c.publishStatus ?? "published") === opts.publishStatus,
    );
  } else if (!opts?.publishStatus && !opts?.ownerId) {
    list = list.filter(
      (c) => !c.publishStatus || c.publishStatus === "published",
    );
  }

  if (opts?.ownerId) {
    list = list.filter((c) => c.ownerId === opts.ownerId);
  }

  if (opts?.categoryId) {
    list = list.filter((c) => c.categoryId === opts.categoryId);
  }

  if (opts?.interestIds && opts.interestIds.length > 0) {
    const categoryIds = new Set(
      opts.interestIds.flatMap((id) => INTEREST_CATEGORY_MAP[id] ?? []),
    );
    list = list.filter((c) => categoryIds.has(c.categoryId));
  }

  if (opts?.tags && opts.tags.length > 0) {
    const tagSet = new Set(opts.tags.map((t) => t.toLowerCase()));
    list = list.filter((c) =>
      c.tags.some((t) => tagSet.has(t.toLowerCase())),
    );
  }

  if (opts?.q) {
    const q = opts.q.toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return list;
}

export function storeGetCommunityById(id: string): CommunityContract | null {
  const store = getStore();
  return store.communities.find((c) => c.id === id) ?? null;
}

export function storeCreateCommunity(
  input: CreateCommunityInput,
): CommunityContract {
  const store = getStore();
  const now = new Date().toISOString();
  const id = input.id ?? `c-${slugifyText(input.title)}-${Date.now()}`;
  const community: CommunityContract = {
    id,
    ownerId: input.ownerId ?? `own-community-${id}`,
    title: input.title,
    description: input.description,
    coverImage: input.coverImage,
    categoryId: input.categoryId,
    tags: input.tags,
    memberCount: input.memberCount,
    activeEvents: input.activeEvents,
    lastActiveAt: now,
    isOfficial: input.isOfficial,
    managedBy: input.managedBy,
    managementName: input.managementName,
    communityType: input.communityType,
    updates: input.updates,
    agendas: input.agendas,
    publishStatus: input.publishStatus,
    createdAt: now,
    updatedAt: now,
  };
  store.communities.unshift(community);
  return community;
}

export function storeUpdateCommunity(
  id: string,
  patch: UpdateCommunityInput,
): CommunityContract | null {
  const store = getStore();
  const idx = store.communities.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const updated: CommunityContract = {
    ...store.communities[idx],
    ...patch,
    lastActiveAt: now,
    updatedAt: now,
  };
  store.communities[idx] = updated;
  return updated;
}

export function storeAddCommunityUpdatePost(
  communityId: string,
  input: CreateCommunityUpdatePostInput,
): CommunityContract | null {
  const store = getStore();
  const community = store.communities.find((c) => c.id === communityId);
  if (!community) return null;
  const now = new Date().toISOString();
  community.updates.unshift({
    id: input.id ?? `cu-${communityId}-${Date.now()}`,
    title: input.title,
    body: input.body,
    authorName: input.authorName,
    publishedAt: input.publishedAt ?? now,
  });
  community.lastActiveAt = now;
  community.updatedAt = now;
  return community;
}

export function storeAddCommunityAgenda(
  communityId: string,
  input: CreateCommunityAgendaInput,
): CommunityContract | null {
  const store = getStore();
  const community = store.communities.find((c) => c.id === communityId);
  if (!community) return null;
  const now = new Date().toISOString();
  community.agendas.push({
    id: input.id ?? `ca-${communityId}-${Date.now()}`,
    title: input.title,
    startAt: input.startAt,
    description: input.description,
  });
  community.activeEvents = community.agendas.length;
  community.lastActiveAt = now;
  community.updatedAt = now;
  return community;
}

export function storeDeleteCommunity(id: string): boolean {
  const store = getStore();
  const idx = store.communities.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.communities.splice(idx, 1);
  return true;
}

// ============================================================================
// Blogs & Hype
// ============================================================================

export function storeListBlogs(opts?: {
  category?: string;
  featured?: boolean;
}): BlogArticle[] {
  const store = getStore();
  let list = [...store.blogs];
  if (opts?.category) {
    list = list.filter(
      (b) => b.category.toLowerCase() === opts.category!.toLowerCase(),
    );
  }
  if (opts?.featured !== undefined) {
    list = list.filter((b) => Boolean(b.featured) === opts.featured);
  }
  return list.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function storeGetBlogBySlug(slug: string): BlogArticle | null {
  const store = getStore();
  return store.blogs.find((b) => b.slug === slug) ?? null;
}

export function storeCreateBlog(input: CreateBlogArticleInput): BlogArticle {
  const store = getStore();
  const slug = input.slug ?? slugifyText(input.title);
  const blog: BlogArticle = {
    slug,
    title: input.title,
    excerpt: input.excerpt,
    coverImageUrl: input.coverImageUrl,
    author: input.author,
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    category: input.category,
    tags: input.tags,
    region: input.region,
    spotIds: input.spotIds,
    sections: input.sections,
    featured: input.featured,
  };
  store.blogs.unshift(blog);
  return blog;
}

export function storeUpdateBlog(
  slug: string,
  patch: UpdateBlogArticleInput,
): BlogArticle | null {
  const store = getStore();
  const idx = store.blogs.findIndex((b) => b.slug === slug);
  if (idx === -1) return null;
  store.blogs[idx] = { ...store.blogs[idx], ...patch };
  return store.blogs[idx];
}

export function storeDeleteBlog(slug: string): boolean {
  const store = getStore();
  const idx = store.blogs.findIndex((b) => b.slug === slug);
  if (idx === -1) return false;
  store.blogs.splice(idx, 1);
  return true;
}

export function storeListHypeItems(opts?: { eventId?: string }): HypeItem[] {
  const store = getStore();
  let list = [...store.hypeItems];
  if (opts?.eventId) {
    list = list.filter((h) => h.eventId === opts.eventId);
  }
  return list;
}

export function storeGetHypeItemById(id: string): HypeItem | null {
  const store = getStore();
  return store.hypeItems.find((h) => h.id === id) ?? null;
}

export function storeCreateHypeItem(input: CreateHypeItemInput): HypeItem {
  const store = getStore();
  const item: HypeItem = {
    id: input.id ?? `hype-${Date.now()}`,
    type: input.type,
    eventId: input.eventId,
    eventName: input.eventName,
    locationName: input.locationName,
    organizerName: input.organizerName,
    organizerAvatar: input.organizerAvatar,
    caption: input.caption,
    tags: input.tags,
    likesCount: input.likesCount,
    commentsCount: input.commentsCount,
    sharesCount: input.sharesCount,
    audioTitle: input.audioTitle,
    videoUrl: input.videoUrl,
    posterUrl: input.posterUrl,
    photos: input.photos,
  };
  store.hypeItems.unshift(item);
  return item;
}

export function storeUpdateHypeItem(
  id: string,
  patch: UpdateHypeItemInput,
): HypeItem | null {
  const store = getStore();
  const idx = store.hypeItems.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  store.hypeItems[idx] = { ...store.hypeItems[idx], ...patch };
  return store.hypeItems[idx];
}

export function storeDeleteHypeItem(id: string): boolean {
  const store = getStore();
  const idx = store.hypeItems.findIndex((h) => h.id === id);
  if (idx === -1) return false;
  store.hypeItems.splice(idx, 1);
  return true;
}

// ============================================================================
// Users (Customers) & Owners
// ============================================================================

export function storeListCustomers(): CustomerContract[] {
  return [...getStore().customers];
}

export function storeGetCustomerById(
  id: string = demoUser.id,
): CustomerContract | null {
  const store = getStore();
  return store.customers.find((u) => u.id === id) ?? null;
}

export function storeUpdateCustomer(
  id: string,
  patch: UpdateUserInput,
): CustomerContract | null {
  const store = getStore();
  const idx = store.customers.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  store.customers[idx] = {
    ...store.customers[idx],
    ...patch,
    preferences: patch.preferences
      ? {
          ...store.customers[idx].preferences,
          ...patch.preferences,
        }
      : store.customers[idx].preferences,
  };
  return store.customers[idx];
}

export function storeListOwners(): OwnerContract[] {
  return [...getStore().owners];
}

export function storeGetOwnerById(id: string): OwnerContract | null {
  return getStore().owners.find((o) => o.id === id) ?? null;
}

export function storeCreateOwner(input: CreateOwnerInput): OwnerContract {
  const store = getStore();
  const now = new Date().toISOString();
  const owner: OwnerContract = {
    id: input.id ?? `own-${Date.now()}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    avatarUrl: input.avatarUrl,
    role: input.role,
    status: input.status,
    businessName: input.businessName,
    managedSpotIds: input.managedSpotIds,
    managedEventIds: input.managedEventIds,
    createdAt: now,
    updatedAt: now,
  };
  store.owners.unshift(owner);
  return owner;
}

export function storeUpdateOwner(
  id: string,
  patch: UpdateOwnerInput,
): OwnerContract | null {
  const store = getStore();
  const idx = store.owners.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  store.owners[idx] = {
    ...store.owners[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return store.owners[idx];
}

// ============================================================================
// Gallery & QR Codes (B2B)
// ============================================================================

export function storeListGalleryAssets(opts?: {
  ownerType?: "spot" | "event" | "promo";
  ownerId?: string;
}): GalleryAssetContract[] {
  const store = getStore();
  let list = [...store.gallery];
  if (opts?.ownerType) {
    list = list.filter((g) => g.ownerType === opts.ownerType);
  }
  if (opts?.ownerId) {
    list = list.filter((g) => g.ownerId === opts.ownerId);
  }
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function storeCreateGalleryAsset(
  input: CreateGalleryAssetInput,
): GalleryAssetContract {
  const store = getStore();
  const now = new Date().toISOString();
  const asset: GalleryAssetContract = {
    id: input.id ?? `gal-${input.ownerId}-${Date.now()}`,
    ownerType: input.ownerType,
    ownerId: input.ownerId,
    type: input.type,
    url: input.url,
    alt: input.alt,
    sortOrder: input.sortOrder,
    isCover: input.isCover,
    createdAt: now,
    updatedAt: now,
  };
  store.gallery.push(asset);
  return asset;
}

export function storeDeleteGalleryAsset(id: string): boolean {
  const store = getStore();
  const idx = store.gallery.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  store.gallery.splice(idx, 1);
  return true;
}

export function storeListQrCodes(opts?: {
  targetType?: string;
  targetId?: string;
  ownerId?: string;
}): QrCodeContract[] {
  const store = getStore();
  let list = [...store.qrCodes];
  if (opts?.targetType) {
    list = list.filter((q) => q.targetType === opts.targetType);
  }
  if (opts?.targetId) {
    list = list.filter((q) => q.targetId === opts.targetId);
  }
  if (opts?.ownerId) {
    list = list.filter((q) => q.ownerId === opts.ownerId);
  }
  return list;
}

export function storeGetQrCodeById(id: string): QrCodeContract | null {
  return getStore().qrCodes.find((q) => q.id === id) ?? null;
}

export function storeCreateQrCode(input: CreateQrCodeInput): QrCodeContract {
  const store = getStore();
  const now = new Date().toISOString();
  const id = input.id ?? `qr-${input.targetType}-${input.targetId}`;
  const defaultUrl =
    input.targetType === "spot-review"
      ? `https://ngetag.id/reviews/new?spotId=${input.targetId}&source=qr`
      : `https://ngetag.id/${input.targetType}s/${input.targetId}`;
  const qr: QrCodeContract = {
    id,
    ownerId: input.ownerId,
    targetType: input.targetType,
    targetId: input.targetId,
    url: input.url ?? defaultUrl,
    label: input.label ?? `QR ${input.targetType} ${input.targetId}`,
    isActive: input.isActive,
    createdAt: now,
    updatedAt: now,
  };
  store.qrCodes.unshift(qr);
  return qr;
}

export function storeUpdateQrCode(
  id: string,
  patch: UpdateQrCodeInput,
): QrCodeContract | null {
  const store = getStore();
  const idx = store.qrCodes.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  store.qrCodes[idx] = {
    ...store.qrCodes[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return store.qrCodes[idx];
}

export function storeDeleteQrCode(id: string): boolean {
  const store = getStore();
  const idx = store.qrCodes.findIndex((q) => q.id === id);
  if (idx === -1) return false;
  store.qrCodes.splice(idx, 1);
  return true;
}

// ============================================================================
// Engagements (Bookmarks, Attendances, Visits, Memberships, Notifications)
// ============================================================================

export function storeListBookmarks(opts?: {
  userId?: string;
  targetType?: "spot" | "event";
}): BookmarkContract[] {
  const store = getStore();
  let list = [...store.bookmarks];
  if (opts?.userId) {
    list = list.filter((b) => b.userId === opts.userId);
  }
  if (opts?.targetType) {
    list = list.filter((b) => b.targetType === opts.targetType);
  }
  return list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function storeToggleBookmark(input: ToggleBookmarkInput): {
  bookmarked: boolean;
  item?: BookmarkContract;
} {
  const store = getStore();
  const id = `${input.userId}:${input.targetType}:${input.targetId}`;
  const idx = store.bookmarks.findIndex((b) => b.id === id);
  if (idx !== -1) {
    store.bookmarks.splice(idx, 1);
    return { bookmarked: false };
  }
  const item: BookmarkContract = {
    id,
    userId: input.userId,
    targetType: input.targetType,
    targetId: input.targetId,
    createdAt: new Date().toISOString(),
  };
  store.bookmarks.unshift(item);
  return { bookmarked: true, item };
}

export function storeListAttendances(opts?: {
  userId?: string;
  eventId?: string;
}): EventAttendanceContract[] {
  const store = getStore();
  let list = [...store.eventAttendances];
  if (opts?.userId) {
    list = list.filter((a) => a.userId === opts.userId);
  }
  if (opts?.eventId) {
    list = list.filter((a) => a.eventId === opts.eventId);
  }
  return list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function storeToggleAttendance(input: ToggleAttendanceInput): {
  attending: boolean;
  item?: EventAttendanceContract;
} {
  const store = getStore();
  const id = `${input.userId}:event:${input.eventId}`;
  const idx = store.eventAttendances.findIndex((a) => a.id === id);
  if (idx !== -1) {
    store.eventAttendances.splice(idx, 1);
    return { attending: false };
  }
  const item: EventAttendanceContract = {
    id,
    eventId: input.eventId,
    userId: input.userId,
    createdAt: new Date().toISOString(),
  };
  store.eventAttendances.unshift(item);
  return { attending: true, item };
}

export function storeListSpotVisits(opts?: {
  userId?: string;
  spotId?: string;
}): SpotVisitContract[] {
  const store = getStore();
  let list = [...store.spotVisits];
  if (opts?.userId) {
    list = list.filter((v) => v.userId === opts.userId);
  }
  if (opts?.spotId) {
    list = list.filter((v) => v.spotId === opts.spotId);
  }
  return list.sort(
    (a, b) =>
      new Date(b.lastVisitedAt).getTime() -
      new Date(a.lastVisitedAt).getTime(),
  );
}

export function storeMarkSpotVisit(
  input: MarkSpotVisitInput,
): SpotVisitContract {
  const store = getStore();
  const id = `${input.userId}:spot:${input.spotId}`;
  const now = new Date().toISOString();
  const idx = store.spotVisits.findIndex((v) => v.id === id);
  if (idx !== -1) {
    const existing = store.spotVisits[idx];
    const updated: SpotVisitContract = {
      ...existing,
      tagIds: Array.from(new Set([...existing.tagIds, ...input.tagIds])),
      visitCount: existing.visitCount + 1,
      reviewCount: existing.reviewCount + (input.reviewed ? 1 : 0),
      lastVisitedAt: now,
    };
    store.spotVisits[idx] = updated;
    return updated;
  }
  const created: SpotVisitContract = {
    id,
    userId: input.userId,
    spotId: input.spotId,
    tagIds: input.tagIds,
    visitCount: 1,
    reviewCount: input.reviewed ? 1 : 0,
    firstVisitedAt: now,
    lastVisitedAt: now,
  };
  store.spotVisits.unshift(created);
  return created;
}

export function storeListCommunityMemberships(opts?: {
  userId?: string;
  communityId?: string;
}): CommunityMembershipContract[] {
  const store = getStore();
  let list = [...store.communityMemberships];
  if (opts?.userId) {
    list = list.filter((m) => m.userId === opts.userId);
  }
  if (opts?.communityId) {
    list = list.filter((m) => m.communityId === opts.communityId);
  }
  return list.sort(
    (a, b) =>
      new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
  );
}

export function storeToggleCommunityMembership(input: ToggleMembershipInput): {
  joined: boolean;
  item?: CommunityMembershipContract;
} {
  const store = getStore();
  const id = `${input.userId}:community:${input.communityId}`;
  const idx = store.communityMemberships.findIndex((m) => m.id === id);
  const community = store.communities.find((c) => c.id === input.communityId);

  if (idx !== -1) {
    store.communityMemberships.splice(idx, 1);
    if (community && community.memberCount > 0) {
      community.memberCount -= 1;
    }
    return { joined: false };
  }

  const item: CommunityMembershipContract = {
    id,
    communityId: input.communityId,
    userId: input.userId,
    joinedAt: new Date().toISOString(),
  };
  store.communityMemberships.unshift(item);
  if (community) {
    community.memberCount += 1;
  }
  return { joined: true, item };
}

export function storeListNotifications(): NgetagNotification[] {
  return [...getStore().notifications];
}

export function storeCreateNotification(
  input: CreateNotificationInput,
): NgetagNotification {
  const store = getStore();
  const notification: NgetagNotification = {
    id: `notif-${Date.now()}`,
    title: input.title,
    description: input.description,
    detail: input.detail,
    href: input.href,
    type: input.type,
    unread: true,
    createdAt: new Date().toISOString(),
  };
  store.notifications.unshift(notification);
  return notification;
}

export function storePatchNotifications(
  input: PatchNotificationsInput,
): NgetagNotification[] {
  const store = getStore();
  if (input.markAllAsRead) {
    store.notifications = store.notifications.map((n) => ({
      ...n,
      unread: false,
    }));
  } else if (input.id) {
    store.notifications = store.notifications.map((n) =>
      n.id === input.id ? { ...n, unread: false } : n,
    );
  }
  return [...store.notifications];
}

// ============================================================================
// Recommendations & B2B Analytics
// ============================================================================

export function storeGetRecommendations(opts?: {
  lat?: number;
  lng?: number;
  favoriteTagIds?: string[];
  interestIds?: string[];
  limit?: number;
}) {
  const store = getStore();
  const limit = opts?.limit ?? 8;
  const publishedSpots = store.spots.filter(
    (s) => !s.publishStatus || s.publishStatus === "published",
  );
  const publishedEvents = store.events.filter(
    (e) => !e.publishStatus || e.publishStatus === "published",
  );

  const coords: Coordinates = {
    latitude: opts?.lat ?? -6.2769,
    longitude: opts?.lng ?? 106.8067,
  };

  const locationSpots = sortByDistance(publishedSpots, coords).slice(0, limit);
  const locationEvents = sortByDistance(publishedEvents, coords).slice(
    0,
    limit,
  );

  const favTagSet = new Set(opts?.favoriteTagIds ?? []);
  const interestSet = new Set(opts?.interestIds ?? []);

  const interestSpots = publishedSpots
    .filter((spot) =>
      favTagSet.size === 0
        ? true
        : spot.tagIds.some((id) => favTagSet.has(id)),
    )
    .sort(
      (a, b) =>
        Number(b.featured ?? false) - Number(a.featured ?? false) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);

  const interestEvents = publishedEvents
    .filter((event) =>
      favTagSet.size === 0 && interestSet.size === 0
        ? true
        : event.tagIds.some((id) => favTagSet.has(id)) ||
          event.interestIds.some((id) => interestSet.has(id)),
    )
    .sort(
      (a, b) =>
        Number(b.featured ?? false) - Number(a.featured ?? false) ||
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .slice(0, limit);

  const recommendedCommunities = storeListCommunities({
    interestIds: opts?.interestIds,
  }).slice(0, limit);

  return {
    locationSpots,
    locationEvents,
    interestSpots,
    interestEvents,
    recommendedCommunities:
      recommendedCommunities.length > 0
        ? recommendedCommunities
        : storeListCommunities().slice(0, limit),
  };
}

export function storeGetB2BAnalytics(ownerId?: string) {
  const store = getStore();
  const spots = ownerId
    ? store.spots.filter((s) => s.ownerId === ownerId)
    : store.spots;
  const events = ownerId
    ? store.events.filter((e) => e.ownerId === ownerId)
    : store.events;
  const promos = ownerId
    ? store.promos.filter((p) => p.ownerId === ownerId)
    : store.promos;
  const communities = ownerId
    ? store.communities.filter((c) => c.ownerId === ownerId)
    : store.communities;

  const spotIds = new Set(spots.map((s) => s.id));
  const eventIds = new Set(events.map((e) => e.id));

  const reviews = store.reviews.filter((r) => spotIds.has(r.spotId));
  const visits = store.spotVisits.filter((v) => spotIds.has(v.spotId));
  const spotBookmarks = store.bookmarks.filter(
    (b) => b.targetType === "spot" && spotIds.has(b.targetId),
  );
  const eventBookmarks = store.bookmarks.filter(
    (b) => b.targetType === "event" && eventIds.has(b.targetId),
  );
  const attendances = store.eventAttendances.filter((a) =>
    eventIds.has(a.eventId),
  );

  const spotPerformance = spots.map((spot) => {
    const spotReviews = reviews.filter((r) => r.spotId === spot.id);
    const spotVisitList = visits.filter((v) => v.spotId === spot.id);
    const totalVisits = spotVisitList.reduce((acc, v) => acc + v.visitCount, 0);
    const bookmarkCount = spotBookmarks.filter(
      (b) => b.targetId === spot.id,
    ).length;

    return {
      spotId: spot.id,
      name: spot.name,
      slug: spot.slug,
      publishStatus: spot.publishStatus ?? "published",
      reviewCount: spotReviews.length,
      verifiedVisitCount: totalVisits,
      bookmarkCount,
      helpfulVotes: spotReviews.reduce((acc, r) => acc + r.helpfulCount, 0),
    };
  });

  return {
    summary: {
      totalSpots: spots.length,
      publishedSpots: spots.filter(
        (s) => (s.publishStatus ?? "published") === "published",
      ).length,
      totalEvents: events.length,
      upcomingEvents: events.filter((e) => e.status === "upcoming").length,
      activePromos: promos.filter((p) => (p.status ?? "active") === "active")
        .length,
      totalCommunities: communities.length,
      totalReviews: reviews.length,
      totalVerifiedVisits: visits.reduce((acc, v) => acc + v.visitCount, 0),
      totalBookmarks: spotBookmarks.length + eventBookmarks.length,
      totalEventAttendances: attendances.length,
    },
    spotPerformance: spotPerformance.sort(
      (a, b) =>
        b.reviewCount - a.reviewCount ||
        b.verifiedVisitCount - a.verifiedVisitCount,
    ),
    topTrendingTags: storeListTags({ trendingLimit: 10 }),
  };
}
