import type { LocationContract } from "./location";

export type EventStatusContract = "upcoming" | "ongoing" | "past";
export type EventPublishStatusContract = "draft" | "published" | "archived";

export interface EventPriceContract {
  min: number;
  max?: number;
  currency: "IDR";
  isFree: boolean;
}

export interface EventOrganizerContract {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface EventContract {
  id: string;
  ownerId?: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  tagIds: string[];
  interestIds: string[];
  startAt: string;
  endAt: string;
  venueName: string;
  location: LocationContract;
  price: EventPriceContract;
  organizer: EventOrganizerContract;
  status: EventStatusContract;
  capacity?: number;
  ticketUrl?: string;
  featured?: boolean;
  publishStatus?: EventPublishStatusContract;
  createdAt: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}
