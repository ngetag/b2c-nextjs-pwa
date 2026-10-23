import {
  EMBEDDING_DIMENSIONS,
  type StoredTelemetryEvent,
  type TasteVector,
} from "@/shared/telemetry";
import { embedMany, embedTelemetryEvent, l2Normalize } from "./embedding";
import { getTelemetryRepo } from "./repo";

/** Half-life (days) of the exponential decay applied to older interactions. */
export const TASTE_HALF_LIFE_DAYS = 30;

const MAX_TRACKED_KEYS = 200;
const MIN_WEIGHT = 0.01;

/** `cust:<id>` for signed-in customers, `anon:<id>` for guests. */
export function ownerKeyFor(input: {
  customerId?: string | null;
  anonymousId?: string | null;
}): string | null {
  if (input.customerId) return `cust:${input.customerId}`;
  if (input.anonymousId) return `anon:${input.anonymousId}`;
  return null;
}

/** Exponential decay factor for a time delta. */
export function decayFactor(
  fromIso: string,
  toIso: string,
  halfLifeDays = TASTE_HALF_LIFE_DAYS,
): number {
  const days = Math.max(
    0,
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000,
  );
  return Math.pow(0.5, days / halfLifeDays);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function decayWeights(
  weights: Record<string, number>,
  factor: number,
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [key, value] of Object.entries(weights)) {
    const decayed = value * factor;
    if (Math.abs(decayed) >= MIN_WEIGHT) next[key] = decayed;
  }
  return next;
}

function trimWeights(weights: Record<string, number>): Record<string, number> {
  const entries = Object.entries(weights)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, MAX_TRACKED_KEYS);
  return Object.fromEntries(entries);
}

/** Zero vector used for a brand-new taste profile. */
export function emptyTasteVector(): number[] {
  return new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
}

/**
 * Cold-start embedding built from onboarding signals: interests and favourite
 * tags selected during signup or on the profile page.
 */
export function buildColdStartEmbedding(input: {
  interestIds?: string[];
  favoriteTagIds?: string[];
}): number[] {
  return embedMany([
    ...(input.interestIds ?? []).map((id) => ({
      text: `interest ${id.replace(/[-_]/g, " ")}`,
      weight: 1.2,
    })),
    ...(input.favoriteTagIds ?? []).map((id) => ({
      text: `tag ${id.replace(/[-_]/g, " ")}`,
      weight: 1,
    })),
  ]);
}

/**
 * Applies a batch of events to the affected taste profiles.
 *
 * For each owner the profile embedding moves towards (or away from, for
 * negative weights such as `bookmark_remove`) the event embedding, while older
 * signals decay with a 30-day half-life. Tag/interest affinities are decayed
 * and updated in the same pass, then pruned.
 *
 * Called by the ingestion worker after events are persisted — never on the
 * request path.
 */
export async function applyEventsToTasteProfiles(
  events: StoredTelemetryEvent[],
): Promise<number> {
  if (events.length === 0) return 0;

  const repo = getTelemetryRepo();
  const grouped = new Map<string, StoredTelemetryEvent[]>();

  for (const event of events) {
    const ownerKey = ownerKeyFor(event);
    if (!ownerKey) continue;
    const list = grouped.get(ownerKey);
    if (list) list.push(event);
    else grouped.set(ownerKey, [event]);
  }

  let updatedProfiles = 0;

  for (const [ownerKey, ownerEvents] of grouped) {
    const existing = await repo.getTaste(ownerKey);
    ownerEvents.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

    let embedding = existing?.embedding ?? emptyTasteVector();
    let tagWeights = existing?.tagWeights ?? {};
    let interestWeights = existing?.interestWeights ?? {};
    let eventCount = existing?.eventCount ?? 0;
    let lastEventAt = existing?.lastEventAt ?? ownerEvents[0].occurredAt;

    for (const event of ownerEvents) {
      const factor = decayFactor(lastEventAt, event.occurredAt);
      const base = l2Normalize(embedding.map((value) => value * factor));
      const vector = event.embedding ?? embedTelemetryEvent(event);
      const magnitude = Math.abs(event.weight);
      const alpha = clamp(0.08 + 0.12 * magnitude, 0.08, 0.4);
      const sign = event.weight < 0 ? -1 : 1;

      embedding = l2Normalize(
        base.map((value, index) => value * (1 - alpha) + sign * alpha * vector[index]),
      );

      tagWeights = decayWeights(tagWeights, factor);
      for (const tagId of event.tagIds ?? []) {
        tagWeights[tagId] = (tagWeights[tagId] ?? 0) + event.weight;
      }

      interestWeights = decayWeights(interestWeights, factor);
      for (const interestId of event.interestIds ?? []) {
        interestWeights[interestId] =
          (interestWeights[interestId] ?? 0) + event.weight;
      }

      eventCount += 1;
      lastEventAt = event.occurredAt;
    }

    const profile: TasteVector = {
      ownerKey,
      customerId: ownerKey.startsWith("cust:") ? ownerKey.slice(5) : null,
      anonymousId: ownerKey.startsWith("anon:") ? ownerKey.slice(5) : null,
      embedding,
      tagWeights: trimWeights(tagWeights),
      interestWeights: trimWeights(interestWeights),
      eventCount,
      lastEventAt,
      updatedAt: new Date().toISOString(),
    };

    await repo.saveTaste(profile);
    updatedProfiles += 1;
  }

  return updatedProfiles;
}

/** Loads a taste profile, if one exists. */
export async function getTasteProfile(
  ownerKey: string | null,
): Promise<TasteVector | null> {
  if (!ownerKey) return null;
  return getTelemetryRepo().getTaste(ownerKey);
}

/** Top tag affinities sorted by absolute weight. */
export function topTagWeights(
  taste: TasteVector | null,
  limit = 8,
): Array<{ tagId: string; weight: number }> {
  if (!taste) return [];
  return Object.entries(taste.tagWeights)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, limit)
    .map(([tagId, weight]) => ({ tagId, weight: Number(weight.toFixed(3)) }));
}

/** Top interest affinities sorted by absolute weight. */
export function topInterestWeights(
  taste: TasteVector | null,
  limit = 8,
): Array<{ interestId: string; weight: number }> {
  if (!taste) return [];
  return Object.entries(taste.interestWeights)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, limit)
    .map(([interestId, weight]) => ({
      interestId,
      weight: Number(weight.toFixed(3)),
    }));
}

/** True when the vector contains at least one non-zero component. */
export function hasSignal(vector: readonly number[]): boolean {
  return vector.some((value) => Math.abs(value) > 1e-6);
}
