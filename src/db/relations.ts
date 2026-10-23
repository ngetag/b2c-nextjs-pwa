import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  owners: {
    spots: r.many.spots(),
    events: r.many.events(),
    communities: r.many.communities(),
    promos: r.many.promos(),
    qrCodes: r.many.qrCodes(),
    ownerSpots: r.many.ownerSpots(),
    ownerEvents: r.many.ownerEvents(),
    ownerCommunities: r.many.ownerCommunities(),
  },

  customers: {
    customerInterests: r.many.customerInterests(),
    customerFavoriteTags: r.many.customerFavoriteTags(),
  },

  tags: {
    spotTags: r.many.spotTags(),
    eventTags: r.many.eventTags(),
    customerFavoriteTags: r.many.customerFavoriteTags(),
  },

  interests: {
    eventInterests: r.many.eventInterests(),
    customerInterests: r.many.customerInterests(),
  },

  spots: {
    owner: r.one.owners({
      from: r.spots.ownerId,
      to: r.owners.id,
    }),
    openingHours: r.many.spotOpeningHours(),
    spotTags: r.many.spotTags(),
    promos: r.many.promos(),
    reviews: r.many.reviews(),
    reviewTags: r.many.reviewTags(),
    visits: r.many.spotVisits(),
    ownerSpots: r.many.ownerSpots(),
  },

  spotOpeningHours: {
    spot: r.one.spots({
      from: r.spotOpeningHours.spotId,
      to: r.spots.id,
    }),
  },

  events: {
    owner: r.one.owners({
      from: r.events.ownerId,
      to: r.owners.id,
    }),
    eventTags: r.many.eventTags(),
    eventInterests: r.many.eventInterests(),
    promos: r.many.promos(),
    attendances: r.many.eventAttendances(),
    hypeItems: r.many.hypeItems(),
    ownerEvents: r.many.ownerEvents(),
  },

  promos: {
    owner: r.one.owners({
      from: r.promos.ownerId,
      to: r.owners.id,
    }),
    spot: r.one.spots({
      from: r.promos.spotId,
      to: r.spots.id,
    }),
    event: r.one.events({
      from: r.promos.eventId,
      to: r.events.id,
    }),
  },

  reviewTags: {
    spot: r.one.spots({
      from: r.reviewTags.spotId,
      to: r.spots.id,
    }),
    reviewSelectedTags: r.many.reviewSelectedTags(),
  },

  reviews: {
    spot: r.one.spots({
      from: r.reviews.spotId,
      to: r.spots.id,
    }),
    selectedTags: r.many.reviewSelectedTags(),
  },

  communityCategories: {
    communities: r.many.communities(),
  },

  communities: {
    owner: r.one.owners({
      from: r.communities.ownerId,
      to: r.owners.id,
    }),
    category: r.one.communityCategories({
      from: r.communities.categoryId,
      to: r.communityCategories.id,
    }),
    updates: r.many.communityUpdates(),
    agendas: r.many.communityAgendas(),
    memberships: r.many.communityMemberships(),
    ownerCommunities: r.many.ownerCommunities(),
  },

  communityUpdates: {
    community: r.one.communities({
      from: r.communityUpdates.communityId,
      to: r.communities.id,
    }),
  },

  communityAgendas: {
    community: r.one.communities({
      from: r.communityAgendas.communityId,
      to: r.communities.id,
    }),
  },

  qrCodes: {
    owner: r.one.owners({
      from: r.qrCodes.ownerId,
      to: r.owners.id,
    }),
  },

  hypeItems: {
    event: r.one.events({
      from: r.hypeItems.eventId,
      to: r.events.id,
    }),
  },

  spotTags: {
    spot: r.one.spots({
      from: r.spotTags.spotId,
      to: r.spots.id,
    }),
    tag: r.one.tags({
      from: r.spotTags.tagId,
      to: r.tags.id,
    }),
  },

  eventTags: {
    event: r.one.events({
      from: r.eventTags.eventId,
      to: r.events.id,
    }),
    tag: r.one.tags({
      from: r.eventTags.tagId,
      to: r.tags.id,
    }),
  },

  eventInterests: {
    event: r.one.events({
      from: r.eventInterests.eventId,
      to: r.events.id,
    }),
    interest: r.one.interests({
      from: r.eventInterests.interestId,
      to: r.interests.id,
    }),
  },

  customerInterests: {
    customer: r.one.customers({
      from: r.customerInterests.customerId,
      to: r.customers.id,
    }),
    interest: r.one.interests({
      from: r.customerInterests.interestId,
      to: r.interests.id,
    }),
  },

  customerFavoriteTags: {
    customer: r.one.customers({
      from: r.customerFavoriteTags.customerId,
      to: r.customers.id,
    }),
    tag: r.one.tags({
      from: r.customerFavoriteTags.tagId,
      to: r.tags.id,
    }),
  },

  ownerSpots: {
    owner: r.one.owners({
      from: r.ownerSpots.ownerId,
      to: r.owners.id,
    }),
    spot: r.one.spots({
      from: r.ownerSpots.spotId,
      to: r.spots.id,
    }),
  },

  ownerEvents: {
    owner: r.one.owners({
      from: r.ownerEvents.ownerId,
      to: r.owners.id,
    }),
    event: r.one.events({
      from: r.ownerEvents.eventId,
      to: r.events.id,
    }),
  },

  ownerCommunities: {
    owner: r.one.owners({
      from: r.ownerCommunities.ownerId,
      to: r.owners.id,
    }),
    community: r.one.communities({
      from: r.ownerCommunities.communityId,
      to: r.communities.id,
    }),
  },

  reviewSelectedTags: {
    review: r.one.reviews({
      from: r.reviewSelectedTags.reviewId,
      to: r.reviews.id,
    }),
    reviewTag: r.one.reviewTags({
      from: r.reviewSelectedTags.reviewTagId,
      to: r.reviewTags.id,
    }),
  },

  eventAttendances: {
    event: r.one.events({
      from: r.eventAttendances.eventId,
      to: r.events.id,
    }),
  },

  spotVisits: {
    spot: r.one.spots({
      from: r.spotVisits.spotId,
      to: r.spots.id,
    }),
  },

  communityMemberships: {
    community: r.one.communities({
      from: r.communityMemberships.communityId,
      to: r.communities.id,
    }),
  },
}));