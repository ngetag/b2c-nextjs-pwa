export type CustomerRoleContract = "customer" | "owner" | "admin";

export interface CustomerBadgeContract {
  id: string;
  label: string;
  category: "community" | "interest" | "activity" | "explorer" | "contributor";
}

export interface CustomerPreferencesContract {
  favoriteTagIds: string[];
  city?: string;
}

export interface CustomerContract {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: CustomerRoleContract;
  bio?: string;
  interestIds: string[];
  badges: CustomerBadgeContract[];
  joinedAt: string;
  preferences?: CustomerPreferencesContract;
}
