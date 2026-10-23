import { handleApiError, jsonOk } from "@/lib/api-response";
import { getStore, resetServerStore } from "@/server/store";

export async function GET() {
  try {
    const store = getStore();
    const openingHours = Object.fromEntries(
      store.spots.map((spot) => [spot.id, spot.openingHours]),
    );
    return jsonOk({
      owners: store.owners,
      customers: store.customers,
      tags: store.tags,
      interests: store.interests,
      openingHours,
      gallery: store.gallery,
      spots: store.spots,
      events: store.events,
      communityCategories: store.communityCategories,
      communities: store.communities,
      promos: store.promos,
      qrCodes: store.qrCodes,
      reviewTags: store.reviewTags,
      reviews: store.reviews,
      bookmarks: store.bookmarks,
      eventAttendances: store.eventAttendances,
      spotVisits: store.spotVisits,
      communityMemberships: store.communityMemberships,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  try {
    const store = resetServerStore();
    return jsonOk({
      reset: true,
      spots: store.spots.length,
      events: store.events.length,
      promos: store.promos.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
