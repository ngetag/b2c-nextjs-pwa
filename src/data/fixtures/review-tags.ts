import type { ReviewTag } from "@/types/review";

const defaultReviewTags: Omit<ReviewTag, "id" | "spotId">[] = [
  { label: "Pelayanan ramah", value: "friendly-service", sortOrder: 1, ownerEditable: true },
  { label: "Tempat nyaman", value: "comfortable-place", sortOrder: 2, ownerEditable: true },
  { label: "Worth it", value: "worth-it", sortOrder: 3, ownerEditable: true },
  { label: "Datang lagi", value: "will-return", sortOrder: 4, ownerEditable: true },
];

const spotReviewTagPresets: Record<string, Array<Omit<ReviewTag, "id" | "spotId">>> = {
  s1: [
    { label: "Kopi enak", value: "great-coffee", sortOrder: 1, ownerEditable: true },
    { label: "Aesthetic", value: "aesthetic", sortOrder: 2, ownerEditable: true },
    { label: "Nyaman WFC", value: "work-friendly", sortOrder: 3, ownerEditable: true },
    { label: "Pelayanan cepat", value: "quick-service", sortOrder: 4, ownerEditable: true },
    { label: "Datang lagi", value: "will-return", sortOrder: 5, ownerEditable: true },
  ],
  s2: [
    { label: "View rooftop", value: "rooftop-view", sortOrder: 1, ownerEditable: true },
    { label: "Sunset bagus", value: "sunset-spot", sortOrder: 2, ownerEditable: true },
    { label: "Cocok date", value: "date-friendly", sortOrder: 3, ownerEditable: true },
    { label: "Minuman oke", value: "good-drinks", sortOrder: 4, ownerEditable: true },
  ],
  s3: [
    { label: "WiFi stabil", value: "stable-wifi", sortOrder: 1, ownerEditable: true },
    { label: "Colokan banyak", value: "many-outlets", sortOrder: 2, ownerEditable: true },
    { label: "Tenang", value: "quiet", sortOrder: 3, ownerEditable: true },
    { label: "Meja nyaman", value: "good-desk", sortOrder: 4, ownerEditable: true },
  ],
  s4: [
    { label: "Makanan Korea enak", value: "great-korean-food", sortOrder: 1, ownerEditable: true },
    { label: "Porsi pas", value: "good-portion", sortOrder: 2, ownerEditable: true },
    { label: "Cocok ramean", value: "group-friendly", sortOrder: 3, ownerEditable: true },
    { label: "Harga sesuai", value: "fair-price", sortOrder: 4, ownerEditable: true },
  ],
  s5: [
    { label: "Rasa autentik", value: "authentic-taste", sortOrder: 1, ownerEditable: true },
    { label: "Family friendly", value: "family-friendly", sortOrder: 2, ownerEditable: true },
    { label: "Menu lengkap", value: "complete-menu", sortOrder: 3, ownerEditable: true },
    { label: "Pelayanan ramah", value: "friendly-service", sortOrder: 4, ownerEditable: true },
  ],
};

function buildSpotTags(
  spotId: string,
  tags: Array<Omit<ReviewTag, "id" | "spotId">>,
): ReviewTag[] {
  return tags.map((tag) => ({
    ...tag,
    id: `rt-${spotId}-${tag.value}`,
    spotId,
  }));
}

export const reviewTags: ReviewTag[] = [
  ...Object.entries(spotReviewTagPresets).flatMap(([spotId, tags]) =>
    buildSpotTags(spotId, tags),
  ),
  ...Array.from({ length: 25 }, (_, index) => {
    const spotId = `s${index + 1}`;
    if (spotReviewTagPresets[spotId]) return [];
    return buildSpotTags(spotId, defaultReviewTags);
  }).flat(),
];

export function getReviewTagsBySpotId(spotId: string): ReviewTag[] {
  return reviewTags
    .filter((tag) => tag.spotId === spotId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

export function getReviewTagsByIds(ids: string[]): ReviewTag[] {
  const idSet = new Set(ids);
  return reviewTags
    .filter((tag) => idSet.has(tag.id))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}
