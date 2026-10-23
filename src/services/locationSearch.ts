import { calculateDistanceKm } from "@/lib/location";
import type { Coordinates, UserLocation } from "@/types/location";

type LocationSearchProvider = "nominatim";

interface NominatimAddress {
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  hamlet?: string;
  city_district?: string;
  district?: string;
  county?: string;
  city?: string;
  town?: string;
  municipality?: string;
  state?: string;
  regency?: string;
  road?: string;
  house_number?: string;
}

interface NominatimSearchResult {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  address?: NominatimAddress;
}

export interface LocationSearchSuggestion extends UserLocation {
  id: string;
  name: string;
  address: string;
  detail: string;
  provider: LocationSearchProvider;
  distanceKm?: number;
}

interface SearchLocationOptions {
  near?: Coordinates;
  signal?: AbortSignal;
}

function pickFirst(...values: Array<string | undefined>): string {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

function formatDetail(address: NominatimAddress, fallback: string): string {
  const parts = [
    pickFirst(address.road, address.neighbourhood, address.suburb),
    pickFirst(address.village, address.quarter),
    pickFirst(address.district, address.city_district, address.county),
    pickFirst(address.city, address.town, address.municipality, address.regency),
  ].filter(Boolean);

  return parts.length > 0 ? Array.from(new Set(parts)).join(", ") : fallback;
}

function toSuggestion(
  item: NominatimSearchResult,
  near?: Coordinates,
): LocationSearchSuggestion | null {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const address = item.address ?? {};
  const displayName = item.display_name ?? "";
  const village = pickFirst(
    address.village,
    address.neighbourhood,
    address.quarter,
    address.hamlet,
  );
  const district = pickFirst(
    address.district,
    address.city_district,
    address.suburb,
    address.county,
  );
  const city = pickFirst(
    address.city,
    address.town,
    address.municipality,
    address.regency,
    address.state,
  );
  const name = pickFirst(item.name, village, district, city, displayName.split(",")[0]);
  const detail = formatDetail(address, displayName);
  const coordinates = { latitude, longitude };

  return {
    id: `${item.osm_type ?? "place"}-${item.osm_id ?? item.place_id ?? `${latitude}-${longitude}`}`,
    name,
    address: displayName || detail,
    displayName: name,
    detail,
    village,
    district,
    city,
    latitude,
    longitude,
    source: "manual",
    isApproximate: !village,
    provider: "nominatim",
    distanceKm: near ? calculateDistanceKm(near, coordinates) : undefined,
  };
}

export async function searchLocationSuggestions(
  query: string,
  options: SearchLocationOptions = {},
): Promise<LocationSearchSuggestion[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: "jsonv2",
    addressdetails: "1",
    limit: "8",
    countrycodes: "id",
    "accept-language": "id",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { signal: options.signal },
  );

  if (!response.ok) {
    throw new Error(`Location search failed: ${response.status}`);
  }

  const data = (await response.json()) as NominatimSearchResult[];

  return data
    .map((item) => toSuggestion(item, options.near))
    .filter((item): item is LocationSearchSuggestion => Boolean(item))
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}
