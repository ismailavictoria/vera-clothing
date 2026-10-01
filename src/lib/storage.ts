export interface StoredValue<T> {
  version: number;
  value: T;
}

export function readStoredValue<T>(key: string, version: number, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as StoredValue<T>;
    if (parsed.version !== version || parsed.value === undefined) return fallback;
    return parsed.value;
  } catch {
    return fallback;
  }
}

export function writeStoredValue<T>(key: string, version: number, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify({ version, value } satisfies StoredValue<T>));
  } catch {
    // Storage can be unavailable or full; in-memory state remains usable for this session.
  }
}
