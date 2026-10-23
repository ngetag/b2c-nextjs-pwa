"use client";

import {
  Bookmark,
  CalendarDays,
  ChevronDown,
  RotateCcw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { InterestChip } from "@/features/interest/components/InterestChip";
import { useIsMounted } from "@/hooks/useIsMounted";
import { formatDate } from "@/lib/format";
import { getInterestsByIds } from "@/lib/interests";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useBookmarkStore } from "@/stores/bookmark.store";
import { useCommunityStore } from "@/stores/community.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import { useReviewStore } from "@/stores/review.store";
import { useVisitStore } from "@/stores/visit.store";
import { UserBadgeChip } from "@/features/profile/components/UserBadgeChip";

interface ProfileMenuLinkProps {
  href: string;
  icon: typeof Bookmark;
  title: string;
  description: string;
}

function ProfileMenuLink({
  href,
  icon: Icon,
  title,
  description,
}: ProfileMenuLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-elevated)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          {title}
        </p>
        <p className="line-clamp-1 text-xs text-[var(--color-muted-foreground)]">
          {description}
        </p>
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
    </Link>
  );
}

export function ProfileView() {
  const mounted = useIsMounted();
  const user = useCurrentUserStore((s) => s.user);
  const resetUser = useCurrentUserStore((s) => s.resetUser);
  const bookmarks = useBookmarkStore((s) => s.items);
  const clearBookmarks = useBookmarkStore((s) => s.clear);
  const attendanceItems = useAttendanceStore((s) => s.items);
  const clearAttendance = useAttendanceStore((s) => s.clear);
  const clearCommunities = useCommunityStore((s) => s.clear);
  const reviews = useReviewStore((s) => s.items);
  const clearReviews = useReviewStore((s) => s.clear);
  const clearVisits = useVisitStore((s) => s.clear);

  const reviewCount = mounted
    ? reviews.filter((r) => r.authorId === user.id).length
    : 0;
  const bookmarkCount = mounted ? Object.keys(bookmarks).length : 0;
  const attendanceCount = mounted ? Object.keys(attendanceItems).length : 0;
  const userInterestIds = user.interestIds ?? [];
  const userInterests = getInterestsByIds(userInterestIds);

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  function handleResetDemoData() {
    clearBookmarks();
    clearAttendance();
    clearCommunities();
    clearReviews();
    clearVisits();
    resetUser();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 shrink-0 md:h-20 md:w-20">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-bold text-[var(--color-foreground)] md:text-2xl">
                  {user.name}
                </h2>
                <p className="truncate text-sm text-[var(--color-muted-foreground)]">
                  {user.email}
                </p>
                {user.bio ? (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-foreground)]">
                    {user.bio}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  Gabung sejak {formatDate(user.joinedAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid w-full grid-cols-3 gap-2">
              <Link
                href={routes.myReviews()}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 text-center transition-colors hover:border-[var(--color-primary)]"
              >
                <p className="font-display text-xl font-bold text-[var(--color-foreground)]">
                  {reviewCount}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Ulasan
                </p>
              </Link>
              <Link
                href={routes.bookmarks()}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 text-center transition-colors hover:border-[var(--color-primary)]"
              >
                <p className="font-display text-xl font-bold text-[var(--color-foreground)]">
                  {bookmarkCount}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Disimpan
                </p>
              </Link>
              <Link
                href={routes.calendar()}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 text-center transition-colors hover:border-[var(--color-primary)]"
              >
                <p className="font-display text-xl font-bold text-[var(--color-foreground)]">
                  {attendanceCount}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Kalender
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4 md:p-5">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                Minat
              </h3>
              {userInterests.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {userInterests.map((interest) => (
                    <InterestChip key={interest.id} interest={interest} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Belum ada minat yang dipilih.
                </p>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                Badge
              </h3>
              {user.badges.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {user.badges.map((badge) => (
                    <UserBadgeChip key={badge.id} badge={badge} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Badge kamu nanti muncul di sini.
                </p>
              )}
            </section>
          </CardContent>
        </Card>

      </div>

      <aside className="space-y-4 lg:sticky lg:top-20">
        <Card>
          <CardContent className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
              Akses cepat
            </h3>
            <div className="space-y-2">
              <ProfileMenuLink
                href={routes.myCommunities()}
                icon={Users}
                title="Komunitas Saya"
                description="Circle yang sudah kamu ikuti"
              />
              <ProfileMenuLink
                href={routes.bookmarks()}
                icon={Bookmark}
                title="Bookmark"
                description="Tempat dan event simpananmu"
              />
              <ProfileMenuLink
                href={routes.calendar()}
                icon={CalendarDays}
                title="Event Mendatang"
                description="Jadwal seru berikutnya"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                Mode Demo
              </h3>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                Reset bookmark, kalender, ulasan, dan profil dummy.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemoData}
              disabled={!mounted}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset data demo
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
