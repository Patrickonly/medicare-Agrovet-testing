/**
 * Lightweight role/organization cache, scoped per user-id and persisted to
 * sessionStorage. Used so TOKEN_REFRESHED / USER_UPDATED events don't have to
 * hit the database again — and so the AuthProvider can hydrate `userRole`
 * synchronously on first render without flipping `roleLoading` to true.
 *
 * 5-minute TTL keeps things fresh without re-querying on every focus.
 */

const STORAGE_KEY = "medicare_role_cache_v1";
const TTL_MS = 5 * 60 * 1000;

export interface CachedRole {
  userId: string;
  role: string | null;
  organizationId: string | null;
  cachedAt: number;
}

export function readRoleCache(userId: string): CachedRole | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRole;
    if (parsed.userId !== userId) return null;
    if (Date.now() - parsed.cachedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeRoleCache(entry: Omit<CachedRole, "cachedAt">) {
  try {
    const payload: CachedRole = { ...entry, cachedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* sessionStorage unavailable — non-fatal */
  }
}

export function clearRoleCache() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
