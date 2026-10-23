export interface CoordinatesContract {
  latitude: number;
  longitude: number;
}

export interface LocationContract extends CoordinatesContract {
  address: string;
  village: string;
  district: string;
  city: string;
  province?: string;
  postalCode?: string;
  displayName?: string;
}

export interface UserLocationContract extends CoordinatesContract {
  village: string;
  district: string;
  city: string;
  address?: string;
  displayName?: string;
  source: "mock" | "browser" | "backend" | "manual";
  isApproximate?: boolean;
}
