/**
 * Minimal, dependency-free REST client for Vercel KV (Upstash-compatible).
 *
 * Uses the Upstash REST "command in JSON body" form — POST the whole
 * command as a JSON array to the base REST URL — which avoids having to
 * URL-encode values that may contain slashes, spaces or JSON. No
 * `@vercel/kv` / `@upstash/redis` package is used, matching this
 * codebase's zero-extra-dependency approach. Configure by setting
 * `KV_REST_API_URL` and `KV_REST_API_TOKEN` in the Vercel dashboard —
 * these are injected automatically once a KV database is linked to the
 * project (Project → Storage → Create Database → KV).
 */

function restUrl(): string | null {
  return process.env.KV_REST_API_URL || null;
}

function restToken(): string | null {
  return process.env.KV_REST_API_TOKEN || null;
}

/** True once KV_REST_API_URL / KV_REST_API_TOKEN are configured in the environment. */
export function isKvConfigured(): boolean {
  return Boolean(restUrl() && restToken());
}

class KvNotConfiguredError extends Error {
  constructor() {
    super("Vercel KV is not configured (KV_REST_API_URL / KV_REST_API_TOKEN missing).");
    this.name = "KvNotConfiguredError";
  }
}

async function command<T = unknown>(parts: (string | number)[]): Promise<T> {
  const url = restUrl();
  const token = restToken();
  if (!url || !token) throw new KvNotConfiguredError();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(parts.map((p) => String(p))),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Vercel KV request failed (${res.status}): ${text || res.statusText}`);
  }

  const data = (await res.json()) as { result: T; error?: string };
  if (data.error) throw new Error(`Vercel KV error: ${data.error}`);
  return data.result;
}

/** Get a string value by key, or null if it doesn't exist. */
export async function kvGet(key: string): Promise<string | null> {
  const result = await command<string | null>(["GET", key]);
  return result ?? null;
}

/** Get and JSON-parse a value, or null if it doesn't exist / fails to parse. */
export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Set a string value, optionally with a TTL in seconds. */
export async function kvSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const parts: (string | number)[] = ["SET", key, value];
  if (ttlSeconds) parts.push("EX", ttlSeconds);
  await command(parts);
}

/** JSON-stringify and set a value, optionally with a TTL in seconds. */
export async function kvSetJSON(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  await kvSet(key, JSON.stringify(value), ttlSeconds);
}

/** Delete a key. */
export async function kvDel(key: string): Promise<void> {
  await command(["DEL", key]);
}

/**
 * Atomically set a key only if it doesn't already exist, with a TTL.
 * Returns true if the lock was acquired, false if the key was already held.
 * This is the primitive double-booking protection relies on: only one
 * request can successfully acquire the lock for a given slot.
 */
export async function kvSetNX(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  const result = await command<string | null>(["SET", key, value, "EX", ttlSeconds, "NX"]);
  return result === "OK";
}
