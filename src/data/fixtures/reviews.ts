import { getReviewTagsBySpotId } from "@/data/fixtures/review-tags";
import type { Review } from "@/types/review";

const authors = [
  { id: "u1", name: "Andini Wijaya", avatar: "https://picsum.photos/seed/u-andini/100/100" },
  { id: "u2", name: "Reza Pratama", avatar: "https://picsum.photos/seed/u-reza/100/100" },
  { id: "u3", name: "Dewi Lestari", avatar: "https://picsum.photos/seed/u-dewi/100/100" },
  { id: "u4", name: "Bagas Saputra", avatar: "https://picsum.photos/seed/u-bagas/100/100" },
  { id: "u5", name: "Citra Maharani", avatar: "https://picsum.photos/seed/u-citra/100/100" },
  { id: "u6", name: "Faisal Hakim", avatar: "https://picsum.photos/seed/u-faisal/100/100" },
  { id: "u7", name: "Nadia Rahmadani", avatar: "https://picsum.photos/seed/u-nadia/100/100" },
  { id: "u8", name: "Ilham Aditya", avatar: "https://picsum.photos/seed/u-ilham/100/100" },
];

const comments = [
  "Tempatnya cozy banget, kopinya juga enak. Wi-Fi cepat cocok buat WFC.",
  "Pelayanan ramah, makanan datang cepat. Pasti balik lagi!",
  "View-nya juara, terutama pas sunset. Worth the price.",
  "Suasananya enak, tapi harga sedikit di atas rata-rata.",
  "Salah satu hangout spot favorit saya di Jakarta. Recommended.",
  "Menu variatif dan presentasinya cantik. Foto-friendly.",
  "Tempat parkir agak susah, tapi pengalaman dining-nya seru.",
  "Akustik dan live music-nya enak banget didengar.",
  "Pas banget buat date night. Lighting romantis.",
  "Suasananya tenang, cocok buat reading session.",
  "Porsi mantap, harga ramah kantong.",
  "Tempatnya rame banget pas weekend, perlu reservasi.",
  "Kualitas konsisten, sudah berkali-kali ke sini.",
  "Ada beberapa menu yang biasa aja, tapi overall oke.",
  "Suasananya beneran instagrammable dari segala sudut.",
];

let counter = 0;
function nextId(spotId: string): string {
  return `r-${spotId}-${++counter}`;
}

const mockReviewBaseTime = Date.UTC(2026, 5, 15, 13, 14, 0);

function getHelpfulCount(authorIdx: number, commentIdx: number, daysAgo: number): number {
  return (authorIdx * 7 + commentIdx * 5 + daysAgo * 3) % 40;
}

function makeReview(
  spotId: string,
  authorIdx: number,
  commentIdx: number,
  daysAgo: number,
): Review {
  const author = authors[authorIdx % authors.length];
  const availableReviewTags = getReviewTagsBySpotId(spotId);
  const reviewTagIds = availableReviewTags
    .filter((_, index) => (index + commentIdx) % 2 === 0)
    .slice(0, 2)
    .map((tag) => tag.id);

  return {
    id: nextId(spotId),
    spotId,
    authorId: author.id,
    authorSnapshot: { name: author.name, avatarUrl: author.avatar },
    comment: comments[commentIdx % comments.length],
    reviewTagIds,
    helpfulCount: getHelpfulCount(authorIdx, commentIdx, daysAgo),
    createdAt: new Date(mockReviewBaseTime - daysAgo * 86400000).toISOString(),
  };
}

/** ~80 reviews tersebar di seluruh spot. */
export const reviews: Review[] = [
  makeReview("s1", 0, 0, 1),
  makeReview("s1", 1, 4, 5),
  makeReview("s1", 2, 1, 12),
  makeReview("s1", 3, 10, 30),

  makeReview("s2", 4, 0, 2),
  makeReview("s2", 5, 9, 8),
  makeReview("s2", 6, 4, 20),

  makeReview("s3", 0, 9, 3),
  makeReview("s3", 7, 13, 14),

  makeReview("s4", 1, 2, 4),
  makeReview("s4", 2, 8, 9),
  makeReview("s4", 3, 3, 18),
  makeReview("s4", 4, 14, 25),

  makeReview("s5", 5, 10, 5),
  makeReview("s5", 6, 4, 11),
  makeReview("s5", 7, 12, 22),

  makeReview("s6", 0, 11, 6),
  makeReview("s6", 1, 13, 16),

  makeReview("s7", 2, 0, 7),
  makeReview("s7", 3, 5, 13),
  makeReview("s7", 4, 11, 23),

  makeReview("s8", 5, 14, 8),
  makeReview("s8", 6, 4, 17),
  makeReview("s8", 0, 13, 28),

  makeReview("s9", 1, 6, 9),
  makeReview("s9", 2, 4, 19),

  makeReview("s10", 3, 8, 10),
  makeReview("s10", 4, 2, 21),
  makeReview("s10", 5, 13, 32),

  makeReview("s11", 6, 10, 11),
  makeReview("s11", 7, 4, 24),

  makeReview("s12", 0, 0, 12),
  makeReview("s12", 1, 9, 26),

  makeReview("s13", 2, 2, 13),
  makeReview("s13", 3, 7, 27),
  makeReview("s13", 4, 11, 35),

  makeReview("s14", 5, 9, 14),
  makeReview("s14", 6, 4, 29),

  makeReview("s15", 7, 13, 15),
  makeReview("s15", 0, 5, 30),

  makeReview("s16", 1, 0, 16),
  makeReview("s16", 2, 9, 33),

  makeReview("s17", 3, 13, 17),
  makeReview("s17", 4, 14, 34),

  makeReview("s18", 5, 7, 18),
  makeReview("s18", 6, 8, 36),

  makeReview("s19", 7, 10, 19),
  makeReview("s19", 0, 4, 38),
  makeReview("s19", 1, 13, 40),

  makeReview("s20", 2, 8, 20),
  makeReview("s20", 3, 5, 42),

  makeReview("s21", 4, 14, 21),
  makeReview("s21", 5, 0, 43),

  makeReview("s22", 6, 13, 22),
  makeReview("s22", 7, 6, 45),

  makeReview("s23", 0, 4, 23),
  makeReview("s23", 1, 11, 47),

  makeReview("s24", 2, 14, 24),
  makeReview("s24", 3, 7, 48),

  makeReview("s25", 4, 10, 25),
  makeReview("s25", 5, 4, 50),
];
