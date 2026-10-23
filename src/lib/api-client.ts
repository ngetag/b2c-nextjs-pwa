const isBrowser = typeof window !== "undefined";

function getServerBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  const port = process.env.PORT || "3000";
  return `http://127.0.0.1:${port}`;
}

export interface ApiFetchOptions<T> extends Omit<RequestInit, "body"> {
  body?: unknown;
  fallback?: () => T | Promise<T>;
}

/**
 * Unified API client for `/api/*` endpoints.
 * - In the browser: uses relative URLs (`/api/...`) so it works across any host/proxy.
 * - On the server: fetches from the local Next.js server, with a build-time fallback
 *   so static generation (`next build`) works even when no HTTP port is bound.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions<T> = {},
): Promise<T> {
  const { body, fallback, headers, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = isBrowser
    ? normalizedPath
    : `${getServerBaseUrl()}${normalizedPath}`;

  const requestInit: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(!isBrowser && rest.cache === undefined && !rest.next
      ? { cache: "no-store" }
      : {}),
  };

  try {
    const response = await fetch(url, requestInit);

    if (response.status === 404) {
      return null as T;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.error?.message ??
        `API request failed: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback) {
      return await fallback();
    }
    throw error;
  }
}
