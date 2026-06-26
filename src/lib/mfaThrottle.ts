// Client-side throttle for repeated wrong 2FA codes.
// We CANNOT enforce a real lockout from the browser (a refresh wipes state),
// but we CAN: (a) slow down the UI to discourage brute-force, (b) warn the
// user clearly, and (c) write audit_logs entries that admins can monitor.
//
// Tier schedule (per failed attempt within the window):
//   1-2 fails  → no cooldown
//   3-4 fails  → 15s cooldown
//   5-6 fails  → 60s cooldown
//   7+ fails   → 300s cooldown + high-risk audit log
//
// State persists in sessionStorage keyed by user id, so a tab refresh keeps
// the cooldown running. Cleared on successful verify.

const KEY = (userId: string) => `mfa_failures:${userId}`;
const WINDOW_MS = 15 * 60 * 1000; // failures older than 15min are forgiven

interface FailureState {
  count: number;
  firstAt: number;
  lastAt: number;
  cooldownUntil: number;
}

function read(userId: string): FailureState {
  try {
    const raw = sessionStorage.getItem(KEY(userId));
    if (!raw) return { count: 0, firstAt: 0, lastAt: 0, cooldownUntil: 0 };
    const s = JSON.parse(raw) as FailureState;
    if (s.firstAt && Date.now() - s.firstAt > WINDOW_MS) {
      sessionStorage.removeItem(KEY(userId));
      return { count: 0, firstAt: 0, lastAt: 0, cooldownUntil: 0 };
    }
    return s;
  } catch {
    return { count: 0, firstAt: 0, lastAt: 0, cooldownUntil: 0 };
  }
}

function write(userId: string, s: FailureState) {
  try {
    sessionStorage.setItem(KEY(userId), JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}

function cooldownForCount(count: number): number {
  if (count >= 7) return 300_000;
  if (count >= 5) return 60_000;
  if (count >= 3) return 15_000;
  return 0;
}

export interface ThrottleSnapshot {
  count: number;
  cooldownUntil: number;
  msRemaining: number;
  blocked: boolean;
  highRisk: boolean; // 7+ failures
}

export function getThrottleSnapshot(userId: string): ThrottleSnapshot {
  const s = read(userId);
  const msRemaining = Math.max(0, s.cooldownUntil - Date.now());
  return {
    count: s.count,
    cooldownUntil: s.cooldownUntil,
    msRemaining,
    blocked: msRemaining > 0,
    highRisk: s.count >= 7,
  };
}

export function recordFailure(userId: string): ThrottleSnapshot {
  const prev = read(userId);
  const now = Date.now();
  const next: FailureState = {
    count: prev.count + 1,
    firstAt: prev.firstAt || now,
    lastAt: now,
    cooldownUntil: now + cooldownForCount(prev.count + 1),
  };
  write(userId, next);
  return getThrottleSnapshot(userId);
}

export function clearFailures(userId: string) {
  sessionStorage.removeItem(KEY(userId));
}

export function formatCooldown(ms: number): string {
  if (ms <= 0) return "0s";
  const total = Math.ceil(ms / 1000);
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}
