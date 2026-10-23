import type { User } from "@/types/user";

/**
 * MVP single mock user. No real auth — every visitor "is" Demo User.
 */
export const demoUser: User = {
  id: "u-demo",
  name: "Demo User",
  email: "demo@ngetag.id",
  avatarUrl: "https://picsum.photos/seed/demo-user/200/200",
  role: "customer",
  bio: "Penjelajah kafe aesthetic dan event live music di Jakarta.",
  interestIds: ["i-coffee", "i-music", "i-photo", "i-wfc"],
  badges: [
    {
      id: "b-community-jakarta",
      label: "Komunitas Jakarta",
      category: "community",
    },
    {
      id: "b-interest-coffee",
      label: "Coffee Enthusiast",
      category: "interest",
    },
    {
      id: "b-activity-reviewer",
      label: "Aktif Review",
      category: "activity",
    },
    {
      id: "b-explorer-local",
      label: "Local Explorer",
      category: "explorer",
    },
    {
      id: "b-contributor-early",
      label: "Early Contributor",
      category: "contributor",
    },
  ],
  joinedAt: "2025-01-15T08:00:00.000Z",
  preferences: {
    favoriteTagIds: ["t1", "t3", "t8"],
    city: "Jakarta",
  },
};

export const users: User[] = [demoUser];
