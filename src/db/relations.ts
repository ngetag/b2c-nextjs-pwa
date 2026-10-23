import { relations } from "drizzle-orm";
import {
  communities,
  communityAgendas,
  communityCategories,
  communityMemberships,
  communityUpdates,
  customerFavoriteTags,
  customerInterests,
  customers,
  eventAttendances,
  eventInterests,
  events,
  eventTags,
  hypeItems,
  interests,
  ownerCommunities,
  ownerEvents,
  owners,
  ownerSpots,
  promos,
  qrCodes,
  reviews,
  reviewSelectedTags,
  reviewTags,
  spotOpeningHours,
  spots,
  spotTags,
  spotVisits,
  tags,
} from "./schema";

export const ownersRelations = relations(owners, ({ many }) => ({
  spots: many(spots),
  events: many(events),
  communities: many(communities),
  promos: many(promos),
  qrCodes: many(qrCodes),
  ownerSpots: many(ownerSpots),
  ownerEvents: many(ownerEvents),
  ownerCommunities: many(ownerCommunities),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  customerInterests: many(customerInterests),
  customerFavoriteTags: many(customerFavoriteTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  spotTags: many(spotTags),
  eventTags: many(eventTags),
  customerFavoriteTags: many(customerFavoriteTags),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  eventInterests: many(eventInterests),
  customerInterests: many(customerInterests),
}));

export const spotsRelations = relations(spots, ({ one, many }) => ({
  owner: one(owners, {
    fields: [spots.ownerId],
    references: [owners.id],
  }),
  openingHours: many(spotOpeningHours),
  spotTags: many(spotTags),
  promos: many(promos),
  reviews: many(reviews),
  reviewTags: many(reviewTags),
  visits: many(spotVisits),
  ownerSpots: many(ownerSpots),
}));

export const spotOpeningHoursRelations = relations(
  spotOpeningHours,
  ({ one }) => ({
    spot: one(spots, {
      fields: [spotOpeningHours.spotId],
      references: [spots.id],
    }),
  }),
);

export const eventsRelations = relations(events, ({ one, many }) => ({
  owner: one(owners, {
    fields: [events.ownerId],
    references: [owners.id],
  }),
  eventTags: many(eventTags),
  eventInterests: many(eventInterests),
  promos: many(promos),
  attendances: many(eventAttendances),
  hypeItems: many(hypeItems),
  ownerEvents: many(ownerEvents),
}));

export const promosRelations = relations(promos, ({ one }) => ({
  owner: one(owners, {
    fields: [promos.ownerId],
    references: [owners.id],
  }),
  spot: one(spots, {
    fields: [promos.spotId],
    references: [spots.id],
  }),
  event: one(events, {
    fields: [promos.eventId],
    references: [events.id],
  }),
}));

export const reviewTagsRelations = relations(reviewTags, ({ one, many }) => ({
  spot: one(spots, {
    fields: [reviewTags.spotId],
    references: [spots.id],
  }),
  reviewSelectedTags: many(reviewSelectedTags),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  spot: one(spots, {
    fields: [reviews.spotId],
    references: [spots.id],
  }),
  selectedTags: many(reviewSelectedTags),
}));

export const communityCategoriesRelations = relations(
  communityCategories,
  ({ many }) => ({
    communities: many(communities),
  }),
);

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  owner: one(owners, {
    fields: [communities.ownerId],
    references: [owners.id],
  }),
  category: one(communityCategories, {
    fields: [communities.categoryId],
    references: [communityCategories.id],
  }),
  updates: many(communityUpdates),
  agendas: many(communityAgendas),
  memberships: many(communityMemberships),
  ownerCommunities: many(ownerCommunities),
}));

export const communityUpdatesRelations = relations(
  communityUpdates,
  ({ one }) => ({
    community: one(communities, {
      fields: [communityUpdates.communityId],
      references: [communities.id],
    }),
  }),
);

export const communityAgendasRelations = relations(
  communityAgendas,
  ({ one }) => ({
    community: one(communities, {
      fields: [communityAgendas.communityId],
      references: [communities.id],
    }),
  }),
);

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  owner: one(owners, {
    fields: [qrCodes.ownerId],
    references: [owners.id],
  }),
}));

export const hypeItemsRelations = relations(hypeItems, ({ one }) => ({
  event: one(events, {
    fields: [hypeItems.eventId],
    references: [events.id],
  }),
}));

export const spotTagsRelations = relations(spotTags, ({ one }) => ({
  spot: one(spots, {
    fields: [spotTags.spotId],
    references: [spots.id],
  }),
  tag: one(tags, {
    fields: [spotTags.tagId],
    references: [tags.id],
  }),
}));

export const eventTagsRelations = relations(eventTags, ({ one }) => ({
  event: one(events, {
    fields: [eventTags.eventId],
    references: [events.id],
  }),
  tag: one(tags, {
    fields: [eventTags.tagId],
    references: [tags.id],
  }),
}));

export const eventInterestsRelations = relations(eventInterests, ({ one }) => ({
  event: one(events, {
    fields: [eventInterests.eventId],
    references: [events.id],
  }),
  interest: one(interests, {
    fields: [eventInterests.interestId],
    references: [interests.id],
  }),
}));

export const customerInterestsRelations = relations(
  customerInterests,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerInterests.customerId],
      references: [customers.id],
    }),
    interest: one(interests, {
      fields: [customerInterests.interestId],
      references: [interests.id],
    }),
  }),
);

export const customerFavoriteTagsRelations = relations(
  customerFavoriteTags,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerFavoriteTags.customerId],
      references: [customers.id],
    }),
    tag: one(tags, {
      fields: [customerFavoriteTags.tagId],
      references: [tags.id],
    }),
  }),
);

export const ownerSpotsRelations = relations(ownerSpots, ({ one }) => ({
  owner: one(owners, {
    fields: [ownerSpots.ownerId],
    references: [owners.id],
  }),
  spot: one(spots, {
    fields: [ownerSpots.spotId],
    references: [spots.id],
  }),
}));

export const ownerEventsRelations = relations(ownerEvents, ({ one }) => ({
  owner: one(owners, {
    fields: [ownerEvents.ownerId],
    references: [owners.id],
  }),
  event: one(events, {
    fields: [ownerEvents.eventId],
    references: [events.id],
  }),
}));

export const ownerCommunitiesRelations = relations(
  ownerCommunities,
  ({ one }) => ({
    owner: one(owners, {
      fields: [ownerCommunities.ownerId],
      references: [owners.id],
    }),
    community: one(communities, {
      fields: [ownerCommunities.communityId],
      references: [communities.id],
    }),
  }),
);

export const reviewSelectedTagsRelations = relations(
  reviewSelectedTags,
  ({ one }) => ({
    review: one(reviews, {
      fields: [reviewSelectedTags.reviewId],
      references: [reviews.id],
    }),
    reviewTag: one(reviewTags, {
      fields: [reviewSelectedTags.reviewTagId],
      references: [reviewTags.id],
    }),
  }),
);

export const eventAttendancesRelations = relations(
  eventAttendances,
  ({ one }) => ({
    event: one(events, {
      fields: [eventAttendances.eventId],
      references: [events.id],
    }),
  }),
);

export const spotVisitsRelations = relations(spotVisits, ({ one }) => ({
  spot: one(spots, {
    fields: [spotVisits.spotId],
    references: [spots.id],
  }),
}));

export const communityMembershipsRelations = relations(
  communityMemberships,
  ({ one }) => ({
    community: one(communities, {
      fields: [communityMemberships.communityId],
      references: [communities.id],
    }),
  }),
);
