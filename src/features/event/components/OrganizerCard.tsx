import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { EventOrganizer } from "@/types/event";

interface OrganizerCardProps {
  organizer: EventOrganizer;
}

export function OrganizerCard({ organizer }: OrganizerCardProps) {
  const initials = organizer.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <Avatar className="h-12 w-12">
          {organizer.logoUrl ? <AvatarImage src={organizer.logoUrl} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[var(--color-muted-foreground)]">
            Dibawa oleh
          </p>
          <p className="font-display text-sm font-semibold text-[var(--color-foreground)]">
            {organizer.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
