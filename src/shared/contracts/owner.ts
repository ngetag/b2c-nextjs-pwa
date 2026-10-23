export type OwnerRoleContract = "owner" | "manager" | "staff";
export type OwnerAccountStatusContract = "invited" | "active" | "suspended";

export interface OwnerContract {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: OwnerRoleContract;
  status: OwnerAccountStatusContract;
  businessName: string;
  managedSpotIds: string[];
  managedEventIds?: string[];
  createdAt: string;
  updatedAt?: string;
}
