"use client";

import { useSearchParams } from "next/navigation";
import { CommunitiesView } from "@/features/community/components/CommunitiesView";
import type { Community, CommunityCategory } from "@/types/interest";

interface CommunitiesContentProps {
  initialCommunities?: Community[];
  initialCategories?: CommunityCategory[];
}

export function CommunitiesContent({
  initialCommunities,
  initialCategories,
}: CommunitiesContentProps) {
  const searchParams = useSearchParams();
  const showJoinedOnly = searchParams.get("filter") === "joined";
  const categoryId = searchParams.get("category") ?? undefined;

  return (
    <CommunitiesView
      categoryId={categoryId}
      showJoinedOnly={showJoinedOnly}
      initialCommunities={initialCommunities}
      initialCategories={initialCategories}
    />
  );
}
