/**
 * Trusted device fingerprinting. We hash a stable client signature
 * (UA + platform + language + screen) plus a per-install random ID held
 * in localStorage. Combined with server-side expiry (30 days), this lets
 * a user skip TOTP on devices they've previously verified.
 *
 * NOT a security boundary on its own — only meaningful AFTER successful
 * TOTP verification. A copied localStorage value alone won't help an
 * attacker without also matching browser fingerprint AND being inside
 * the 30-day window AND having the correct user session.
 */

const STORAGE_KEY = "medicare_device_id";

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

function clientSignature(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    navigator.platform || "",
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    new Date().getTimezoneOffset().toString(),
  ];
  return parts.join("|");
}

export async function getDeviceHash(): Promise<string> {
  const raw = `${getOrCreateDeviceId()}::${clientSignature()}`;
  const buf = new TextEncoder().encode(raw);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  let browser = "Unknown browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}
