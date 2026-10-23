"use client";

import { HorizontalScroll } from "@/components/common/HorizontalScroll";
import { SectionHeader } from "@/components/common/SectionHeader";
import { routes } from "@/config/routes";
import { communities } from "@/data/fixtures/interests";
import { demoUser } from "@/data/fixtures/users";
import { CommunityCard } from "@/features/community/components/CommunityCard";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getRecommendedCommunitiesByInterestIds } from "@/lib/interests";
import { useCurrentUserStore } from "@/stores/currentUser.store";

export function HomeCommunityRecommendations() {
  const mounted = useIsMounted();
  const storedInterestIds = useCurrentUserStore(
    (state) => state.user.interestIds ?? [],
  );
  const userInterestIds = mounted ? storedInterestIds : demoUser.interestIds;
  const recommendedByInterest =
    getRecommendedCommunitiesByInterestIds(userInterestIds);
  const recommended = (recommendedByInterest.length > 0
    ? recommendedByInterest
    : communities
  ).slice(0, 5);

  if (recommended.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title="Circle buat kamu"
        actionHref={routes.communities()}
      />
      <HorizontalScroll>
        {recommended.map((community) => (
          <div key={community.id} className="w-64 shrink-0">
            <CommunityCard community={community} />
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
