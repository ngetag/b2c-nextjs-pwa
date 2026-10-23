import { Badge } from "@/components/ui/badge";
import type { UserBadge } from "@/types/user";

interface UserBadgeChipProps {
  badge: UserBadge;
}

export function UserBadgeChip({ badge }: UserBadgeChipProps) {
  return (
    <Badge variant="outline" className="rounded-full text-xs font-medium">
      {badge.label}
    </Badge>
  );
}
