/**
 * Reusable OpenAPI 3.1 component schemas for the NgeTag customer API.
 *
 * These describe the public DTOs (the same shapes returned by the route
 * handlers and consumed by the web app). They intentionally document the
 * fields the API guarantees; additional properties may exist on responses.
 */

type Schema = Record<string, unknown>;

const string: Schema = { type: "string" };
const number: Schema = { type: "number" };
const integer: Schema = { type: "integer" };
const boolean: Schema = { type: "boolean" };
const stringArray: Schema = { type: "array", items: string };
const isoDate: Schema = { type: "string", format: "date-time" };

const location: Schema = {
  type: "object",
  description: "Alamat + koordinat lokasi (WGS84).",
  properties: {
    latitude: { type: "number", example: -6.2769 },
    longitude: { type: "number", example: 106.8067 },
    address: string,
    village: string,
    district: string,
    city: string,
    province: { type: "string", nullable: true },
    postalCode: { type: "string", nullable: true },
  },
};

const openingHour: Schema = {
  type: "object",
  properties: {
    day: {
      type: "string",
      enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
    open: { type: "string", example: "10:00" },
    close: { type: "string", example: "22:00" },
    closed: boolean,
  },
};

const tag: Schema = {
  type: "object",
  properties: {
    id: string,
    slug: string,
    name: string,
    category: {
      type: "string",
      enum: ["vibe", "cuisine", "activity", "price", "occasion"],
    },
    iconName: string,
    trendingScore: integer,
    isActive: boolean,
  },
};

const spot: Schema = {
  type: "object",
  description: "Spot hangout (kafe, restoran, rooftop, ...).",
  properties: {
    id: string,
    ownerId: string,
    slug: string,
    name: string,
    description: string,
    coverImageUrl: string,
    galleryUrls: stringArray,
    tagIds: stringArray,
    priceLevel: { type: "integer", minimum: 1, maximum: 4 },
    location,
    openingHours: { type: "array", items: openingHour },
    promoIds: stringArray,
    featured: boolean,
    publishStatus: {
      type: "string",
      enum: ["draft", "published", "archived"],
    },
    createdAt: isoDate,
    lastUpdatedAt: isoDate,
    distanceKm: number,
  },
};

const event: Schema = {
  type: "object",
  description: "Event Jakarta beserta jadwal, venue, harga, dan organizer.",
  properties: {
    id: string,
    ownerId: string,
    slug: string,
    title: string,
    description: string,
    coverImageUrl: string,
    tagIds: stringArray,
    interestIds: stringArray,
    startAt: isoDate,
    endAt: isoDate,
    venueName: string,
    location,
    price: {
      type: "object",
      properties: {
        min: integer,
        max: { type: "integer", nullable: true },
        currency: { type: "string", example: "IDR" },
        isFree: boolean,
      },
    },
    organizer: {
      type: "object",
      properties: { id: string, name: string, logoUrl: string },
    },
    status: { type: "string", enum: ["upcoming", "ongoing", "past"] },
    capacity: { type: "integer", nullable: true },
    ticketUrl: { type: "string", nullable: true },
    featured: boolean,
    publishStatus: {
      type: "string",
      enum: ["draft", "published", "archived"],
    },
    distanceKm: number,
  },
};

const promo: Schema = {
  type: "object",
  properties: {
    id: string,
    ownerId: string,
    title: string,
    description: string,
    validUntil: isoDate,
    discountPercent: integer,
    code: string,
    imageUrl: string,
    spotId: string,
    eventId: string,
    ownerType: { type: "string", enum: ["spot", "event"] },
    status: { type: "string", enum: ["draft", "active", "expired", "archived"] },
  },
};

const review: Schema = {
  type: "object",
  properties: {
    id: string,
    spotId: string,
    authorId: string,
    authorSnapshot: {
      type: "object",
      properties: { name: string, avatarUrl: string },
    },
    comment: string,
    reviewTagIds: stringArray,
    imageUrls: stringArray,
    helpfulCount: integer,
    verifiedVisit: boolean,
    createdAt: isoDate,
    updatedAt: isoDate,
  },
};

const reviewTag: Schema = {
  type: "object",
  properties: {
    id: string,
    spotId: string,
    label: string,
    value: string,
    ownerEditable: boolean,
    sortOrder: integer,
  },
};

const community: Schema = {
  type: "object",
  properties: {
    id: string,
    ownerId: string,
    title: string,
    description: string,
    coverImage: string,
    categoryId: string,
    tags: stringArray,
    memberCount: integer,
    activeEvents: integer,
    lastActiveAt: isoDate,
    isOfficial: boolean,
    managedBy: string,
    managementName: string,
    type: {
      type: "string",
      enum: [
        "official",
        "fanbase",
        "team",
        "guild",
        "creator",
        "club",
        "learning",
        "network",
      ],
    },
    publishStatus: {
      type: "string",
      enum: ["draft", "published", "archived"],
    },
  },
};

const communityCategory: Schema = {
  type: "object",
  properties: {
    id: string,
    title: string,
    name: string,
    slug: string,
    image: string,
    totalCommunities: integer,
  },
};

const communityUpdate: Schema = {
  type: "object",
  properties: {
    id: string,
    title: string,
    body: string,
    publishedAt: isoDate,
    authorName: string,
  },
};

const communityAgenda: Schema = {
  type: "object",
  properties: {
    id: string,
    title: string,
    startAt: isoDate,
    description: string,
  },
};

const blogArticle: Schema = {
  type: "object",
  properties: {
    slug: string,
    title: string,
    excerpt: string,
    coverImageUrl: string,
    author: string,
    publishedAt: isoDate,
    category: string,
    tags: stringArray,
    region: string,
    spotIds: stringArray,
    featured: boolean,
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: string,
          paragraphs: stringArray,
        },
      },
    },
  },
};

const hypeItem: Schema = {
  type: "object",
  properties: {
    id: string,
    type: { type: "string", enum: ["video", "photo_carousel"] },
    eventId: string,
    eventName: string,
    locationName: string,
    organizerName: string,
    organizerAvatar: string,
    caption: string,
    tags: stringArray,
    likesCount: integer,
    commentsCount: integer,
    sharesCount: integer,
    audioTitle: string,
    videoUrl: string,
    posterUrl: string,
    photos: stringArray,
  },
};

const customer: Schema = {
  type: "object",
  properties: {
    id: string,
    name: string,
    email: { type: "string", format: "email" },
    avatarUrl: string,
    role: { type: "string", enum: ["customer", "owner", "admin"] },
    bio: string,
    interestIds: stringArray,
    badges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: string,
          label: string,
          category: {
            type: "string",
            enum: [
              "community",
              "interest",
              "activity",
              "explorer",
              "contributor",
            ],
          },
        },
      },
    },
    points: integer,
    joinedAt: isoDate,
    preferences: {
      type: "object",
      properties: { favoriteTagIds: stringArray, city: string },
    },
  },
};

const owner: Schema = {
  type: "object",
  properties: {
    id: string,
    name: string,
    email: { type: "string", format: "email" },
    phone: string,
    avatarUrl: string,
    role: { type: "string", enum: ["owner", "manager", "staff"] },
    status: { type: "string", enum: ["invited", "active", "suspended"] },
    businessName: string,
    managedSpotIds: stringArray,
    managedEventIds: stringArray,
    createdAt: isoDate,
    updatedAt: isoDate,
  },
};

const galleryAsset: Schema = {
  type: "object",
  properties: {
    id: string,
    ownerType: { type: "string", enum: ["spot", "event", "promo"] },
    ownerId: string,
    type: { type: "string", enum: ["image", "video"] },
    url: string,
    alt: string,
    sortOrder: integer,
    isCover: boolean,
    createdAt: isoDate,
  },
};

const qrCode: Schema = {
  type: "object",
  properties: {
    id: string,
    ownerId: string,
    targetType: {
      type: "string",
      enum: ["spot-review", "spot", "event", "promo"],
    },
    targetId: string,
    url: string,
    label: string,
    isActive: boolean,
    createdAt: isoDate,
    updatedAt: isoDate,
  },
};

const notification: Schema = {
  type: "object",
  properties: {
    id: string,
    userId: string,
    title: string,
    description: string,
    detail: string,
    href: string,
    type: { type: "string", enum: ["ticket", "calendar", "system"] },
    unread: boolean,
    createdAt: isoDate,
  },
};

const bookmark: Schema = {
  type: "object",
  properties: {
    id: string,
    userId: string,
    targetType: { type: "string", enum: ["spot", "event"] },
    targetId: string,
    createdAt: isoDate,
  },
};

const attendance: Schema = {
  type: "object",
  properties: {
    id: string,
    eventId: string,
    userId: string,
    createdAt: isoDate,
  },
};

const spotVisit: Schema = {
  type: "object",
  properties: {
    id: string,
    userId: string,
    spotId: string,
    tagIds: stringArray,
    visitCount: integer,
    reviewCount: integer,
    firstVisitedAt: isoDate,
    lastVisitedAt: isoDate,
  },
};

const membership: Schema = {
  type: "object",
  properties: {
    id: string,
    communityId: string,
    userId: string,
    joinedAt: isoDate,
  },
};

const error: Schema = {
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        code: { type: "string", example: "VALIDATION_ERROR" },
        message: { type: "string" },
        details: { description: "Optional validation issues." },
      },
    },
  },
};

const paginated = (itemRef: string, examplePageSize = 12): Schema => ({
  type: "object",
  properties: {
    items: { type: "array", items: { $ref: `#/components/schemas/${itemRef}` } },
    page: { type: "integer", example: 1 },
    pageSize: { type: "integer", example: examplePageSize },
    total: { type: "integer", example: 42 },
  },
});

const authUser: Schema = {
  type: "object",
  description: "Profil publik customer yang sedang login.",
  properties: {
    id: string,
    name: string,
    email: { type: "string", format: "email" },
    avatarUrl: string,
    role: { type: "string", enum: ["customer", "owner", "admin"] },
    bio: string,
    interestIds: stringArray,
    favoriteTagIds: stringArray,
    badges: {
      type: "array",
      items: {
        type: "object",
        properties: { id: string, label: string, category: string },
      },
    },
    points: integer,
    tier: { type: "string", enum: ["bronze", "silver", "gold", "platinum"] },
    city: string,
    emailVerified: boolean,
    joinedAt: isoDate,
  },
};

const jwtClaims: Schema = {
  type: "object",
  description:
    "Access-token claims (HS256). Berisi data personalisasi tampilan, bukan rahasia.",
  properties: {
    sub: { type: "string", description: "Customer id." },
    iss: { type: "string", example: "ngetag-web" },
    aud: { type: "string", example: "ngetag-customer-web" },
    iat: integer,
    exp: integer,
    jti: string,
    sid: { type: "string", description: "Session id yang bisa dicabut." },
    name: string,
    email: string,
    picture: string,
    role: { type: "string", enum: ["customer", "owner", "admin"] },
    tier: { type: "string", enum: ["bronze", "silver", "gold", "platinum"] },
    points: integer,
    badges: stringArray,
    interests: stringArray,
    favoriteTags: stringArray,
    city: string,
    locale: { type: "string", example: "id-ID" },
    scope: { type: "string", example: "openid profile email telemetry:write" },
    provider: { type: "string", enum: ["google", "github", "email"] },
    emailVerified: boolean,
  },
};

const authSessionPayload: Schema = {
  type: "object",
  properties: {
    user: { $ref: "#/components/schemas/AuthUser" },
    claims: { $ref: "#/components/schemas/JwtClaims" },
    accessToken: { type: "string", description: "Compact JWS access token." },
    refreshToken: {
      type: "string",
      description: "Rotating refresh token (also set as httpOnly cookie).",
    },
    tokenType: { type: "string", enum: ["Bearer"] },
    expiresIn: { type: "integer", example: 900 },
    demo: { type: "boolean" },
  },
};

const authSessionInfo: Schema = {
  type: "object",
  properties: {
    authenticated: { type: "boolean", example: true },
    user: { $ref: "#/components/schemas/AuthUser" },
    claims: { $ref: "#/components/schemas/JwtClaims" },
    expiresIn: integer,
  },
};

const authSessionItem: Schema = {
  type: "object",
  properties: {
    id: string,
    provider: { type: "string", enum: ["google", "github", "email"] },
    userAgent: { type: "string", nullable: true },
    createdAt: isoDate,
    lastUsedAt: isoDate,
    expiresAt: isoDate,
    current: boolean,
  },
};

const telemetryEvent: Schema = {
  type: "object",
  description: "Satu event aktivitas pengguna.",
  properties: {
    id: { type: "string", description: "Idempotency key (uuid)." },
    customerId: {
      type: "string",
      maxLength: 64,
      description: "Compatibility field; ignored. Customer identity comes from the JWT.",
    },
    customer_id: {
      type: "string",
      maxLength: 64,
      description: "Compatibility field; ignored. Customer identity comes from the JWT.",
    },
    anonymousId: { type: "string", description: "Device id untuk guest." },
    sessionId: string,
    eventType: {
      type: "string",
      enum: [
        "page_view",
        "spot_view",
        "event_view",
        "community_view",
        "promo_view",
        "blog_view",
        "hype_view",
        "search",
        "tag_click",
        "filter_apply",
        "qr_scan",
        "bookmark_add",
        "bookmark_remove",
        "attendance_add",
        "attendance_remove",
        "membership_add",
        "membership_remove",
        "review_create",
        "review_helpful",
        "share",
        "dwell",
        "recommendation_impression",
        "recommendation_click",
        "spot_directions",
        "signup",
        "login",
      ],
    },
    targetType: {
      type: "string",
      nullable: true,
      enum: [
        "spot",
        "event",
        "community",
        "promo",
        "blog",
        "hype",
        "tag",
        "interest",
        "review",
        "search",
        "page",
        "spot_collection",
      ],
    },
    targetId: { type: "string", nullable: true },
    surface: { type: "string", example: "/spots/coffee-xyz" },
    tagIds: stringArray,
    interestIds: stringArray,
    value: {
      type: "number",
      nullable: true,
      description: "Dwell ms, rating, jumlah hasil pencarian, dsb.",
    },
    metadata: { type: "object", additionalProperties: true },
    latitude: { type: "number", nullable: true },
    longitude: { type: "number", nullable: true },
    source: { type: "string", enum: ["web", "pwa", "qr", "api", "system"] },
    occurredAt: isoDate,
  },
  required: ["eventType"],
};

const telemetryIngestResponse: Schema = {
  type: "object",
  properties: {
    accepted: { type: "integer", example: 3 },
    buffered: integer,
    storage: { type: "string", enum: ["postgres", "memory"] },
    ids: stringArray,
    receivedAt: isoDate,
  },
};

const tasteProfileResponse: Schema = {
  type: "object",
  properties: {
    ownerKey: { type: "string", example: "cust:cus_abc" },
    eventCount: integer,
    dimensions: { type: "integer", example: 384 },
    embeddingPreview: {
      type: "array",
      items: number,
      description: "12 dimensi pertama dari vektor rasa.",
    },
    tagWeights: {
      type: "array",
      items: {
        type: "object",
        properties: { tagId: string, weight: number },
      },
    },
    interestWeights: {
      type: "array",
      items: {
        type: "object",
        properties: { interestId: string, weight: number },
      },
    },
    lastEventAt: { type: "string", format: "date-time", nullable: true },
    recentEvents: { type: "array", items: { $ref: "#/components/schemas/TelemetryEvent" } },
    storage: { type: "string", enum: ["postgres", "memory"] },
  },
};

const recommendationItem: Schema = {
  type: "object",
  properties: {
    ownerType: {
      type: "string",
      enum: ["spot", "event", "community", "promo", "blog", "hype"],
    },
    ownerId: string,
    title: string,
    subtitle: string,
    imageUrl: string,
    href: string,
    score: { type: "number", example: 0.8123 },
    tagIds: stringArray,
    reason: {
      type: "string",
      enum: ["taste-vector", "cold-start", "trending", "similar-content"],
    },
  },
};

const forYouResponse: Schema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: { $ref: "#/components/schemas/RecommendationItem" },
    },
    profile: {
      type: "object",
      properties: {
        source: {
          type: "string",
          enum: ["taste-vector", "cold-start", "trending"],
        },
        ownerKey: { type: "string", nullable: true },
        dimensions: integer,
        eventCount: integer,
        topTags: {
          type: "array",
          items: {
            type: "object",
            properties: { tagId: string, weight: number },
          },
        },
        topInterests: {
          type: "array",
          items: {
            type: "object",
            properties: { interestId: string, weight: number },
          },
        },
      },
    },
    generatedAt: isoDate,
    storage: { type: "string", enum: ["postgres", "memory"] },
  },
};

const telemetrySummaryResponse: Schema = {
  type: "object",
  properties: {
    totalEvents: integer,
    uniqueVisitors: integer,
    eventsByType: {
      type: "object",
      additionalProperties: { type: "integer" },
    },
    topTargets: {
      type: "array",
      items: {
        type: "object",
        properties: { targetType: string, targetId: string, count: integer },
      },
    },
    topTags: {
      type: "array",
      items: {
        type: "object",
        properties: { tagId: string, count: integer },
      },
    },
    lastEventAt: { type: "string", format: "date-time", nullable: true },
    bufferedEvents: integer,
    tasteProfiles: integer,
    contentIndex: {
      type: "object",
      properties: {
        total: integer,
        byType: { type: "object", additionalProperties: { type: "integer" } },
        lastSyncAt: { type: "string", format: "date-time", nullable: true },
      },
    },
    storage: { type: "string", enum: ["postgres", "memory"] },
    generatedAt: isoDate,
  },
};

const healthResponse: Schema = {
  type: "object",
  properties: {
    status: { type: "string", example: "ok" },
    service: { type: "string", example: "ngetag-api" },
    version: string,
    timestamp: isoDate,
    counts: { type: "object", additionalProperties: { type: "integer" } },
    endpoints: stringArray,
    database: {
      type: "object",
      properties: {
        configured: boolean,
        vector: boolean,
        postgis: boolean,
      },
    },
  },
};

const schemaManifest: Schema = {
  type: "object",
  properties: {
    dialect: { type: "string", example: "postgresql" },
    tables: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: string,
          columns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: string,
                type: string,
                nullable: boolean,
                primaryKey: boolean,
              },
            },
          },
        },
      },
    },
    enums: { type: "object", additionalProperties: { type: "array", items: string } },
    contracts: stringArray,
  },
};

/** Component schema registry keyed by the name used in `$ref`. */
export const componentSchemas: Record<string, Schema> = {
  Error: error,
  Spot: spot,
  Event: event,
  Promo: promo,
  Tag: tag,
  Interest: {
    type: "object",
    properties: {
      id: string,
      label: string,
      slug: string,
      isActive: boolean,
      sortOrder: integer,
    },
  },
  Review: review,
  ReviewTag: reviewTag,
  Community: community,
  CommunityCategory: communityCategory,
  CommunityUpdate: communityUpdate,
  CommunityAgenda: communityAgenda,
  BlogArticle: blogArticle,
  HypeItem: hypeItem,
  Customer: customer,
  Owner: owner,
  GalleryAsset: galleryAsset,
  QrCode: qrCode,
  Notification: notification,
  Bookmark: bookmark,
  EventAttendance: attendance,
  SpotVisit: spotVisit,
  CommunityMembership: membership,
  OpeningHour: openingHour,
  Location: location,
  AuthUser: authUser,
  JwtClaims: jwtClaims,
  AuthSessionPayload: authSessionPayload,
  AuthSessionInfo: authSessionInfo,
  AuthSessionItem: authSessionItem,
  TelemetryEvent: telemetryEvent,
  TelemetryIngestResponse: telemetryIngestResponse,
  TasteProfileResponse: tasteProfileResponse,
  RecommendationItem: recommendationItem,
  ForYouResponse: forYouResponse,
  TelemetrySummaryResponse: telemetrySummaryResponse,
  HealthResponse: healthResponse,
  SchemaManifest: schemaManifest,
  PaginatedSpots: paginated("Spot"),
  PaginatedEvents: paginated("Event"),
  SearchResponse: {
    type: "object",
    properties: {
      query: { type: "object", additionalProperties: true },
      spots: { $ref: "#/components/schemas/PaginatedSpots" },
      events: { $ref: "#/components/schemas/PaginatedEvents" },
      communities: { type: "array", items: { $ref: "#/components/schemas/Community" } },
      discovery: {
        type: "object",
        properties: {
          tags: { type: "array", items: { $ref: "#/components/schemas/Tag" } },
          categories: {
            type: "array",
            items: { $ref: "#/components/schemas/CommunityCategory" },
          },
          interests: {
            type: "array",
            items: { $ref: "#/components/schemas/Interest" },
          },
        },
      },
    },
  },
};

/** API tag metadata used by the Swagger UI grouping. */
export const apiTags = [
  { name: "System", description: "Health, schema manifest, dan OpenAPI." },
  { name: "Auth", description: "Signup, login, refresh, sesi, dan OAuth." },
  {
    name: "Telemetry",
    description:
      "Asynchronous activity ingest + taste vector (pgvector) untuk recommendation engine.",
  },
  { name: "Spots", description: "Discovery dan pengelolaan spot." },
  { name: "Events", description: "Discovery dan pengelolaan event." },
  { name: "Promos", description: "Promo aktif untuk spot dan event." },
  { name: "Taxonomy", description: "Tag dan interest." },
  { name: "Reviews", description: "Ulasan terverifikasi dan chip pengalaman." },
  { name: "Communities", description: "Komunitas, update, dan agenda." },
  { name: "Content", description: "Blog editorial dan feed Hype." },
  { name: "Search", description: "Pencarian terpadu lintas entitas." },
  {
    name: "Recommendations",
    description:
      "Rekomendasi hibrida: taste vector + cosine similarity + geo filter.",
  },
  { name: "Users", description: "Profil customer." },
  { name: "Engagements", description: "Bookmark, kalender, kunjungan, membership." },
  { name: "Notifications", description: "Notifikasi tiket, kalender, sistem." },
  { name: "B2B", description: "Owner, gallery, QR, analytics, handoff." },
] as const;
