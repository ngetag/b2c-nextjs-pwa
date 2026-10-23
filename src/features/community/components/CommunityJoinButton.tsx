"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useCommunityStore } from "@/stores/community.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";

interface CommunityJoinButtonProps {
  communityId: string;
  size?: "sm" | "default";
}

export function CommunityJoinButton({
  communityId,
  size = "sm",
}: CommunityJoinButtonProps) {
  const mounted = useIsMounted();
  const userId = useCurrentUserStore((state) => state.user.id);
  const storedJoined = useCommunityStore((state) => state.isJoined(communityId));
  const toggleCommunity = useCommunityStore((state) => state.toggle);
  const [feedback, setFeedback] = useState<string>();
  const joined = mounted ? storedJoined : false;

  function handleClick() {
    if (!mounted) return;
    const nextJoined = toggleCommunity(communityId, userId);
    setFeedback(nextJoined ? "Kamu sudah gabung. Selamat masuk circle." : "Kamu keluar dari komunitas ini.");
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        size={size}
        variant={joined ? "default" : "outline"}
        onClick={handleClick}
        aria-pressed={joined}
        className="w-full"
      >
        {joined ? <Check className="h-4 w-4" aria-hidden /> : null}
        {joined ? "Sudah gabung" : "Gabung komunitas"}
      </Button>
      {feedback ? (
        <p className="text-xs text-[var(--color-muted-foreground)]" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
