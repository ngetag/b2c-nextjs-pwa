/**
 * User domain types.
 * MVP: single mock user, no auth. Role/preferences kept future-ready.
 */

export type UserRole = "customer" | "owner" | "admin";
export type UserBadgeCategory =
  | "community"
  | "interest"
  | "activity"
  | "explorer"
  | "contributor";

export interface UserBadge {
  id: string;
  label: string;
  category: UserBadgeCategory;
}

export interface UserPreferences {
  favoriteTagIds: string[];
  city?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  /** User interests used for profile, communities, and event recommendations. */
  interestIds: string[];
  badges: UserBadge[];
  joinedAt: string; // ISO
  preferences?: UserPreferences;
}
