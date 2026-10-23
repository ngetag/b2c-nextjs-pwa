import type {
  Coordinates,
  GeoLocation,
  UserLocation,
  WithDistance,
} from "@/types/location";

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(from: Coordinates, to: Coordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function formatAdministrativeLocation(location: GeoLocation): string {
  return `${location.village}, ${location.district}`;
}

export function formatUserLocation(location: UserLocation): string {
  if (location.displayName) return location.displayName;
  if (location.village) return location.village;
  if (location.district) return location.district;
  if (location.city) return location.city;
  return "Lokasi belum tersedia";
}

export function formatHomeLocation(location: UserLocation): string {
  return formatUserLocation(location);
}

export function formatAroundLocation(location: UserLocation): string {
  const label = formatUserLocation(location);
  return label === "Lokasi belum tersedia" ? label : `Sekitar ${label}`;
}

export function sortByDistance<T extends { location: Coordinates }>(
  items: T[],
  userLocation: Coordinates,
): Array<T & WithDistance> {
  return items
    .map((item) => ({
      ...item,
      distanceKm: calculateDistanceKm(userLocation, item.location),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
