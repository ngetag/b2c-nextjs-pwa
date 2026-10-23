import { reviews } from "@/data/fixtures/reviews";
import { simulateLatency } from "@/data/repositories/_latency";
import type { Review } from "@/types/review";

export async function listReviewsBySpotId(spotId: string): Promise<Review[]> {
  const items = reviews
    .filter((r) => r.spotId === spotId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  return simulateLatency(items);
}

export async function listReviewsByAuthor(authorId: string): Promise<Review[]> {
  const items = reviews
    .filter((r) => r.authorId === authorId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  return simulateLatency(items);
}
