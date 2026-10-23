/**
 * Location contracts shared by domain data, recommendations, and future
 * geolocation/backend adapters.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoLocation extends Coordinates {
  address: string;
  village: string;
  district: string;
  city: string;
}

export interface UserLocation extends Coordinates {
  village: string;
  district: string;
  city: string;
  address?: string;
  displayName?: string;
  source: "mock" | "browser" | "backend" | "manual";
  isApproximate?: boolean;
}

export interface WithDistance {
  distanceKm: number;
}
