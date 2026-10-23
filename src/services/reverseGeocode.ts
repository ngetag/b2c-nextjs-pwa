import type { Coordinates } from "@/types/location";

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
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

export interface ReverseGeocodeResult extends Coordinates {
  village: string;
  district: string;
  city: string;
  displayName?: string;
}

function pickFirst(...values: Array<string | undefined>): string {
  return values.find((value) => value && value.trim().length > 0)?.trim() ?? "";
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodeResult> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "id",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.status}`);
  }

  const data = (await response.json()) as NominatimResponse;
  const address = data.address ?? {};

  return {
    latitude,
    longitude,
    village: pickFirst(
      address.village,
      address.neighbourhood,
      address.quarter,
      address.hamlet,
    ),
    district: pickFirst(
      address.district,
      address.city_district,
      address.suburb,
      address.county,
    ),
    city: pickFirst(
      address.city,
      address.town,
      address.municipality,
      address.regency,
      address.state,
    ),
    displayName: data.display_name,
  };
}
