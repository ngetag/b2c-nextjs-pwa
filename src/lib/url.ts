/**
 * URL search params helpers for client-side navigation.
 */

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

/**
 * Build a URLSearchParams string from a flat record.
 * Arrays serialized as repeated keys: { tags: ['a', 'b'] } → "tags=a&tags=b".
 * Empty / undefined values omitted.
 */
export function buildSearchParams(params: SearchParamsRecord): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v) usp.append(key, v);
      }
    } else {
      usp.set(key, value);
    }
  }
  const str = usp.toString();
  return str ? `?${str}` : "";
}

/**
 * Read array param from URLSearchParams or Next.js searchParams record.
 */
export function readArrayParam(
  value: string | string[] | undefined,
): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((item) => item.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Read single string param.
 */
export function readStringParam(
  value: string | string[] | undefined,
): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Read number param with default.
 */
export function readNumberParam(
  value: string | string[] | undefined,
  fallback?: number,
): number | undefined {
  const str = readStringParam(value);
  if (!str) return fallback;
  const num = Number(str);
  return Number.isFinite(num) ? num : fallback;
}
