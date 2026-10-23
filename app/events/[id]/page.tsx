import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminActivityMeta } from "@/components/common/AdminActivityMeta";
import { ShareButton } from "@/components/common/ShareButton";
import { TagChip } from "@/components/common/TagChip";
import { routes } from "@/config/routes";
import { getEventById } from "@/data/repositories/event.repo";
import { listTags } from "@/data/repositories/tag.repo";
import { EventHeroBanner } from "@/features/event/components/EventHeroBanner";
import { EventMeta } from "@/features/event/components/EventMeta";
import { AttendanceButton } from "@/features/event/components/AttendanceButton";
import { InterestChip } from "@/features/interest/components/InterestChip";
import { OrganizerCard } from "@/features/event/components/OrganizerCard";
import { LocationCard } from "@/features/spot/components/LocationCard";
import { getInterestsByIds } from "@/lib/interests";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Event tidak ditemukan" };
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [{ url: event.coverImageUrl }],
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const tags = await listTags();
  const eventTags = tags.filter((t) => event.tagIds.includes(t.id));
  const eventInterests = getInterestsByIds(event.interestIds);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-6 md:py-10">
      <EventHeroBanner imageUrl={event.coverImageUrl} alt={event.title} />

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <header className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)] md:text-3xl">
                {event.title}
              </h1>
              <ShareButton
                title={event.title}
                text={event.description.slice(0, 100)}
                url={routes.event(event.id)}
              />
            </div>
            {eventTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {eventTags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} variant="outline" />
                ))}
              </div>
            ) : null}
            {eventInterests.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)]">
                  Minat terkait
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {eventInterests.map((interest) => (
                    <InterestChip key={interest.id} interest={interest} asLink />
                  ))}
                </div>
              </div>
            ) : null}
          </header>

          <EventMeta event={event} />
          <AdminActivityMeta
            lastUpdatedAt={event.lastUpdatedAt}
            lastUpdatedBy={event.lastUpdatedBy}
          />

          <section className="space-y-2">
            <h2 className="font-display text-base font-semibold text-[var(--color-foreground)]">
              Tentang Event
            </h2>
            <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
              {event.description}
            </p>
          </section>
        </div>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <OrganizerCard organizer={event.organizer} />
          <AttendanceButton event={event} />
          <LocationCard
            location={event.location}
            name={event.venueName}
          />
        </aside>
      </div>
    </div>
  );
}
