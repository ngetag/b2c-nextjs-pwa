import { EMBEDDING_DIMENSIONS, type TelemetryEventInput } from "@/shared/telemetry";

const DIMENSIONS = EMBEDDING_DIMENSIONS;

/**
 * FNV-1a 32-bit hash. Deterministic across Node versions and platforms, which
 * matters because embeddings must stay stable between writes and reads.
 */
function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Splits text into normalised content tokens (words + numbers). */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1);
}

/** L2-normalises a vector in place-safe fashion (returns a new array). */
export function l2Normalize(vector: readonly number[]): number[] {
  let norm = 0;
  for (const value of vector) norm += value * value;
  norm = Math.sqrt(norm);
  if (norm === 0 || !Number.isFinite(norm)) {
    return new Array(vector.length).fill(0);
  }
  return vector.map((value) => value / norm);
}

/** Cosine similarity in `[-1, 1]`; `0` for zero vectors. */
export function cosineSimilarity(
  a: readonly number[],
  b: readonly number[],
): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / Math.sqrt(normA * normB);
}

interface WeightedToken {
  token: string;
  weight: number;
}

/**
 * Signed feature hashing: each token lands in one of 384 buckets with a stable
 * sign. Word unigrams, bigrams and a 4-char prefix (for morphological
 * robustness) are mixed so short queries still overlap usefully.
 */
function embedTokens(tokens: WeightedToken[]): number[] {
  const vector = new Array<number>(DIMENSIONS).fill(0);

  for (const { token, weight } of tokens) {
    const bucket = hash32(token) % DIMENSIONS;
    const sign = (hash32(`${token}::sign`) & 1) === 0 ? 1 : -1;
    vector[bucket] += sign * weight;
  }

  return l2Normalize(vector);
}

/**
 * Converts free text into a deterministic 384-dimensional embedding.
 *
 * This is the local fallback for deployments without an embedding model: it is
 * cheap, dependency-free and stable. Swap `embedText` for a hosted model
 * (e.g. `text-embedding-3-small`) and keep the same dimensions to improve
 * semantic recall without touching the rest of the pipeline.
 *
 * @param text Free-form text (spot description, query, event title, ...).
 * @param weight Multiplier applied to every token (used for profile seeds).
 */
export function embedText(text: string, weight = 1): number[] {
  const parts = tokenize(text);
  if (parts.length === 0) return new Array(DIMENSIONS).fill(0);

  const tokens: WeightedToken[] = [];
  parts.forEach((token, index) => {
    tokens.push({ token: `w:${token}`, weight });
    if (index > 0) {
      tokens.push({
        token: `b:${parts[index - 1]}_${token}`,
        weight: weight * 0.55,
      });
    }
    if (token.length > 5) {
      tokens.push({ token: `p:${token.slice(0, 4)}`, weight: weight * 0.3 });
    }
  });

  return embedTokens(tokens);
}

/**
 * Builds a weighted, normalised centroid from several texts. Used for
 * onboarding seeds and for merging interest/tag signals into one vector.
 */
export function embedMany(
  entries: Array<{ text: string; weight: number }>,
): number[] {
  const accumulator = new Array<number>(DIMENSIONS).fill(0);

  for (const entry of entries) {
    const vector = embedText(entry.text);
    for (let index = 0; index < DIMENSIONS; index += 1) {
      accumulator[index] += vector[index] * entry.weight;
    }
  }

  return l2Normalize(accumulator);
}

/** Text representation of a single telemetry event. */
export function describeTelemetryEvent(event: TelemetryEventInput): string {
  const parts = [
    event.eventType.replace(/_/g, " "),
    event.targetType ?? "",
    event.targetId ?? "",
    event.surface ?? "",
    ...(event.tagIds ?? []).map((id) => `tag ${id}`),
    ...(event.interestIds ?? []).map((id) => `interest ${id}`),
  ];

  if (event.metadata) {
    for (const [key, value] of Object.entries(event.metadata)) {
      if (typeof value === "string" && value.length < 120) {
        parts.push(`${key} ${value}`);
      }
    }
  }

  return parts.filter(Boolean).join(" · ");
}

/** Embeds a telemetry event's interaction context. */
export function embedTelemetryEvent(event: TelemetryEventInput): number[] {
  return embedText(describeTelemetryEvent(event));
}

/** Serialises a vector for a pgvector literal (`'[0.1,0.2,...]'`). */
export function toPgVector(vector: readonly number[]): string {
  return `[${vector.map((value) => Number(value.toFixed(6))).join(",")}]`;
}

/** Parses a pgvector value (array or string) back into a number array. */
export function parsePgVector(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value === "string") {
    return value
      .replace(/^\[|\]$/g, "")
      .split(",")
      .filter(Boolean)
      .map(Number);
  }
  return new Array(DIMENSIONS).fill(0);
}
