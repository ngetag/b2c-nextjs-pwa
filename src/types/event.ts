/**
 * Event domain types.
 * Note: type name `NgetagEvent` to avoid clash with DOM `Event`.
 */

import type { GeoLocation } from "@/types/location";

export type EventStatus = "upcoming" | "ongoing" | "past";

export interface EventPrice {
  min: number;
  max?: number;
  currency: "IDR";
  isFree: boolean;
}

export interface EventOrganizer {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface NgetagEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  /** Multiple discovery tags/categories attached to this event. */
  tagIds: string[];
  /** Interest domains connected to this event. */
  interestIds: string[];
  /** ISO datetime. */
  startAt: string;
  /** ISO datetime. */
  endAt: string;
  venueName: string;
  location: GeoLocation;
  price: EventPrice;
  organizer: EventOrganizer;
  status: EventStatus;
  capacity?: number;
  ticketUrl?: string;
  featured?: boolean;
  createdAt: string;
  /** Admin activity metadata. Filled by backend/admin panel later. */
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}
