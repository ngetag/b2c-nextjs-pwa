import { ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeoLocation } from "@/types/location";

interface LocationCardProps {
  location: GeoLocation;
  name: string;
}

/**
 * Static map placeholder + deeplink to Google Maps.
 * Real map (Leaflet/Mapbox) will plug here later without changing call sites.
 */
export function LocationCard({ location, name }: LocationCardProps) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name} ${location.address}`,
  )}`;
  // Static placeholder seeded by coordinates for a stable image.
  const placeholderUrl = `https://picsum.photos/seed/map-${Math.abs(
    Math.round(location.latitude * 1000),
  )}/800/400`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Lokasi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-background)]">
          <Image
            src={placeholderUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-[var(--color-primary)]/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-lg">
              <MapPin className="h-5 w-5" aria-hidden />
            </div>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <p className="font-medium text-[var(--color-foreground)]">
            {location.address}
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            {[location.village, location.district, location.city].join(", ")}
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={mapsHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden />
            Buka Maps
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
