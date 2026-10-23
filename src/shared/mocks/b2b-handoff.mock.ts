import { events as b2cEvents } from "@/data/fixtures/events";
import {
  communities as b2cCommunities,
  communityCategories as b2cCommunityCategories,
  interests as b2cInterests,
} from "@/data/fixtures/interests";
import { promos as b2cPromos } from "@/data/fixtures/promos";
import { reviewTags as b2cReviewTags } from "@/data/fixtures/review-tags";
import { reviews as b2cReviews } from "@/data/fixtures/reviews";
import { spots as b2cSpots } from "@/data/fixtures/spots";
import { tags as b2cTags } from "@/data/fixtures/tags";
import { users as b2cUsers } from "@/data/fixtures/users";
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
  OpeningHourContract,
  OwnerContract,
  PromoContract,
  QrCodeContract,
  ReviewContract,
  ReviewTagContract,
  SpotContract,
  SpotVisitContract,
  TagContract,
} from "@/shared/contracts";

const SPOT_OWNER_PREFIX = "own-spot";
const EVENT_OWNER_PREFIX = "own-event";
const COMMUNITY_OWNER_PREFIX = "own-community";
const HANDOFF_CREATED_AT = "2026-01-01T00:00:00.000Z";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function spotOwnerId(spotId: string): string {
  return `${SPOT_OWNER_PREFIX}-${spotId}`;
}

function eventOwnerId(organizerId: string): string {
  return `${EVENT_OWNER_PREFIX}-${organizerId}`;
}

function communityOwnerId(communityId: string): string {
  return `${COMMUNITY_OWNER_PREFIX}-${communityId}`;
}

const eventById = new Map(b2cEvents.map((event) => [event.id, event]));
const spotById = new Map(b2cSpots.map((spot) => [spot.id, spot]));

export const mockTags: TagContract[] = b2cTags.map((tag) => ({
  ...tag,
  isActive: true,
}));

export const mockInterests: InterestContract[] = b2cInterests.map(
  (interest, index) => ({
    ...interest,
    isActive: true,
    sortOrder: index + 1,
  }),
);

export const mockCustomers: CustomerContract[] = uniqueBy(
  [
    ...b2cUsers.map<CustomerContract>((user) => ({
      ...user,
      role: "customer",
    })),
    ...b2cReviews.map<CustomerContract>((review) => ({
      id: review.authorId,
      name: review.authorSnapshot.name,
      email: `${review.authorId}@ngetag.mock`,
      avatarUrl: review.authorSnapshot.avatarUrl,
      role: "customer",
      interestIds: [],
      badges: [],
      joinedAt: review.createdAt,
      preferences: { favoriteTagIds: [], city: "Jakarta" },
    })),
  ],
  (customer) => customer.id,
);

export const mockOpeningHours: Record<string, OpeningHourContract[]> =
  Object.fromEntries(
    b2cSpots.map((spot) => [spot.id, spot.openingHours]),
  );

const spotGallery: GalleryAssetContract[] = b2cSpots.flatMap((spot) => [
  {
    id: `gal-${spot.id}-cover`,
    ownerType: "spot",
    ownerId: spot.id,
    type: "image",
    url: spot.coverImageUrl,
    alt: `${spot.name} cover`,
    sortOrder: 0,
    isCover: true,
    createdAt: spot.createdAt,
    updatedAt: spot.lastUpdatedAt,
  } satisfies GalleryAssetContract,
  ...spot.galleryUrls.map<GalleryAssetContract>((url, index) => ({
    id: `gal-${spot.id}-${index + 1}`,
    ownerType: "spot",
    ownerId: spot.id,
    type: "image",
    url,
    alt: `${spot.name} gallery ${index + 1}`,
    sortOrder: index + 1,
    createdAt: spot.createdAt,
    updatedAt: spot.lastUpdatedAt,
  })),
]);

const eventGallery: GalleryAssetContract[] = b2cEvents.map((event) => ({
  id: `gal-${event.id}-cover`,
  ownerType: "event",
  ownerId: event.id,
  type: "image",
  url: event.coverImageUrl,
  alt: `${event.title} cover`,
  sortOrder: 0,
  isCover: true,
  createdAt: event.createdAt,
  updatedAt: event.lastUpdatedAt,
}));

const promoGallery: GalleryAssetContract[] = b2cPromos.flatMap((promo) => {
  if (!promo.imageUrl) return [];
  return [
    {
      id: `gal-${promo.id}-cover`,
      ownerType: "promo",
      ownerId: promo.id,
      type: "image",
      url: promo.imageUrl,
      alt: `${promo.title} cover`,
      sortOrder: 0,
      isCover: true,
      createdAt: HANDOFF_CREATED_AT,
    } satisfies GalleryAssetContract,
  ];
});

export const mockGallery: GalleryAssetContract[] = [
  ...spotGallery,
  ...eventGallery,
  ...promoGallery,
];

export const mockSpots: SpotContract[] = b2cSpots.map((spot) => ({
  ...spot,
  ownerId: spotOwnerId(spot.id),
  gallery: mockGallery.filter(
    (item) => item.ownerType === "spot" && item.ownerId === spot.id,
  ),
  publishStatus: "published",
  lastUpdatedBy: spot.lastUpdatedBy ?? "Admin NgeTag",
}));

export const mockEvents: EventContract[] = b2cEvents.map((event) => ({
  ...event,
  ownerId: eventOwnerId(event.organizer.id),
  publishStatus: "published",
  lastUpdatedBy: event.lastUpdatedBy ?? "Admin NgeTag",
}));

const spotOwners = b2cSpots.map<OwnerContract>((spot) => ({
  id: spotOwnerId(spot.id),
  name: `${spot.name} Owner`,
  email: `owner+${spot.slug}@ngetag.mock`,
  role: "owner",
  status: "active",
  businessName: spot.name,
  managedSpotIds: [spot.id],
  managedEventIds: [],
  createdAt: spot.createdAt,
  updatedAt: spot.lastUpdatedAt,
}));

const eventOwners = uniqueBy(
  b2cEvents.map<OwnerContract>((event) => ({
    id: eventOwnerId(event.organizer.id),
    name: event.organizer.name,
    email: `organizer+${event.organizer.id}@ngetag.mock`,
    avatarUrl: event.organizer.logoUrl,
    role: "manager",
    status: "active",
    businessName: event.organizer.name,
    managedSpotIds: [],
    managedEventIds: b2cEvents
      .filter((item) => item.organizer.id === event.organizer.id)
      .map((item) => item.id),
    createdAt: event.createdAt,
    updatedAt: event.lastUpdatedAt,
  })),
  (owner) => owner.id,
);

const communityOwners = b2cCommunities.map<OwnerContract>((community) => ({
  id: communityOwnerId(community.id),
  name: community.managementName ?? community.managedBy ?? community.title,
  email: `community+${community.id}@ngetag.mock`,
  role: "manager",
  status: "active",
  businessName: community.managementName ?? community.title,
  managedSpotIds: [],
  managedEventIds: [],
  createdAt: community.lastActiveAt,
  updatedAt: community.lastActiveAt,
}));

export const mockOwners: OwnerContract[] = [
  ...spotOwners,
  ...eventOwners,
  ...communityOwners,
];

export const mockCommunityCategories: CommunityCategoryContract[] =
  b2cCommunityCategories.map((category) => ({
    ...category,
    slug: category.slug ?? slugify(category.title),
    totalCommunities:
      category.totalCommunities ??
      b2cCommunities.filter((community) => community.categoryId === category.id)
        .length,
  }));

export const mockCommunities: CommunityContract[] = b2cCommunities.map(
  (community) => ({
    ...community,
    ownerId: communityOwnerId(community.id),
    publishStatus: "published",
    createdAt: community.lastActiveAt,
    updatedAt: community.lastActiveAt,
  }),
);

function getPromoOwner(promo: (typeof b2cPromos)[number]): {
  ownerId?: string;
  ownerType?: "spot" | "event";
  createdAt: string;
  updatedAt?: string;
} {
  if (promo.spotId) {
    const spot = spotById.get(promo.spotId);
    return {
      ownerId: spot ? spotOwnerId(spot.id) : undefined,
      ownerType: "spot",
      createdAt: spot?.createdAt ?? HANDOFF_CREATED_AT,
      updatedAt: spot?.lastUpdatedAt,
    };
  }

  if (promo.eventId) {
    const event = eventById.get(promo.eventId);
    return {
      ownerId: event ? eventOwnerId(event.organizer.id) : undefined,
      ownerType: "event",
      createdAt: event?.createdAt ?? HANDOFF_CREATED_AT,
      updatedAt: event?.lastUpdatedAt,
    };
  }

  return { createdAt: HANDOFF_CREATED_AT };
}

export const mockPromos: PromoContract[] = b2cPromos.map((promo) => {
  const owner = getPromoOwner(promo);
  return {
    ...promo,
    ...owner,
    status: "active",
  };
});

export const mockQrCodes: QrCodeContract[] = b2cSpots.map((spot) => ({
  id: `qr-review-${spot.id}`,
  ownerId: spotOwnerId(spot.id),
  targetType: "spot-review",
  targetId: spot.id,
  url: `https://ngetag.id/reviews/new?spotId=${spot.id}&source=qr`,
  label: `QR Review ${spot.name}`,
  isActive: true,
  createdAt: spot.createdAt,
  updatedAt: spot.lastUpdatedAt,
}));

export const mockReviewTags: ReviewTagContract[] = b2cReviewTags.map((tag) => ({
  ...tag,
  ownerEditable: tag.ownerEditable ?? true,
}));

export const mockReviews: ReviewContract[] = b2cReviews.map((review) => ({
  id: review.id,
  spotId: review.spotId,
  authorId: review.authorId,
  authorSnapshot: review.authorSnapshot,
  comment: review.comment,
  reviewTagIds: review.reviewTagIds,
  imageUrls: review.imageUrls,
  helpfulCount: review.helpfulCount,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
}));

export const mockBookmarks: BookmarkContract[] = b2cUsers.flatMap((user) => {
  const favoriteTagIds = user.preferences?.favoriteTagIds ?? [];
  const bookmarkedSpots = b2cSpots
    .filter((spot) => spot.tagIds.some((tagId) => favoriteTagIds.includes(tagId)))
    .slice(0, 2)
    .map<BookmarkContract>((spot) => ({
      id: `${user.id}:spot:${spot.id}`,
      userId: user.id,
      targetType: "spot",
      targetId: spot.id,
      createdAt: user.joinedAt,
    }));

  const bookmarkedEvents = b2cEvents
    .filter((event) =>
      event.interestIds.some((interestId) => user.interestIds.includes(interestId)),
    )
    .slice(0, 1)
    .map<BookmarkContract>((event) => ({
      id: `${user.id}:event:${event.id}`,
      userId: user.id,
      targetType: "event",
      targetId: event.id,
      createdAt: user.joinedAt,
    }));

  return [...bookmarkedSpots, ...bookmarkedEvents];
});

export const mockEventAttendances: EventAttendanceContract[] = b2cUsers.flatMap(
  (user) =>
    b2cEvents
      .filter((event) =>
        event.interestIds.some((interestId) => user.interestIds.includes(interestId)),
      )
      .slice(0, 3)
      .map((event) => ({
        id: `${user.id}:event:${event.id}`,
        eventId: event.id,
        userId: user.id,
        createdAt: event.startAt > user.joinedAt ? user.joinedAt : event.createdAt,
      })),
);

const spotVisitGroups = new Map<string, ReviewContract[]>();
b2cReviews.forEach((review) => {
  const key = `${review.authorId}:${review.spotId}`;
  spotVisitGroups.set(key, [...(spotVisitGroups.get(key) ?? []), review]);
});

export const mockSpotVisits: SpotVisitContract[] = Array.from(
  spotVisitGroups.entries(),
).flatMap(([key, reviews]) => {
  const [userId, spotId] = key.split(":");
  const spot = spotById.get(spotId);
  if (!spot) return [];

  const sortedReviews = [...reviews].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  return [
    {
      id: `${userId}:spot:${spotId}`,
      userId,
      spotId,
      tagIds: spot.tagIds,
      visitCount: sortedReviews.length,
      reviewCount: sortedReviews.length,
      firstVisitedAt: sortedReviews[0].createdAt,
      lastVisitedAt: sortedReviews[sortedReviews.length - 1].createdAt,
    },
  ];
});

const categoryInterestMap: Record<string, string[]> = {
  "band-music": ["i-music"],
  gaming: ["i-gaming"],
  sport: ["i-sports"],
  "startup-tech": ["i-startup"],
  creator: ["i-photo"],
  "anime-pop": ["i-photo"],
  "coffee-wfc": ["i-coffee", "i-wfc"],
};

export const mockCommunityMemberships: CommunityMembershipContract[] =
  b2cUsers.flatMap((user) =>
    b2cCommunities
      .filter((community) =>
        (categoryInterestMap[community.categoryId] ?? []).some((interestId) =>
          user.interestIds.includes(interestId),
        ),
      )
      .slice(0, 3)
      .map((community) => ({
        id: `${user.id}:community:${community.id}`,
        communityId: community.id,
        userId: user.id,
        joinedAt: user.joinedAt,
      })),
  );

export const b2bHandoffMock = {
  owners: mockOwners,
  customers: mockCustomers,
  tags: mockTags,
  interests: mockInterests,
  openingHours: mockOpeningHours,
  gallery: mockGallery,
  spots: mockSpots,
  events: mockEvents,
  communityCategories: mockCommunityCategories,
  communities: mockCommunities,
  promos: mockPromos,
  qrCodes: mockQrCodes,
  reviewTags: mockReviewTags,
  reviews: mockReviews,
  bookmarks: mockBookmarks,
  eventAttendances: mockEventAttendances,
  spotVisits: mockSpotVisits,
  communityMemberships: mockCommunityMemberships,
};
