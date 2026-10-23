"use client";

import { useSearchParams } from "next/navigation";
import { CommunitiesView } from "@/features/community/components/CommunitiesView";

export function CommunitiesContent() {
  const searchParams = useSearchParams();
  const showJoinedOnly = searchParams.get("filter") === "joined";
  const categoryId = searchParams.get("category") ?? undefined;

  return (
    <CommunitiesView
      categoryId={categoryId}
      showJoinedOnly={showJoinedOnly}
    />
  );
}
