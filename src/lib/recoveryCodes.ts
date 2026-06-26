// Recovery code helpers — generation + SHA-256 hashing (browser SubtleCrypto).
// Codes are 10 chars, alphanumeric upper, formatted as XXXXX-XXXXX.

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit ambiguous I/O/0/1

export function generateRecoveryCodes(count = 10): string[] {
  const out: string[] = [];
  const buf = new Uint32Array(count * 10);
  crypto.getRandomValues(buf);
  for (let i = 0; i < count; i++) {
    let s = "";
    for (let j = 0; j < 10; j++) {
      s += ALPHABET[buf[i * 10 + j] % ALPHABET.length];
    }
    out.push(`${s.slice(0, 5)}-${s.slice(5)}`);
  }
  return out;
}

export function normalizeCode(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export async function hashCode(code: string): Promise<string> {
  const normalized = normalizeCode(code);
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(hashCode));
}

export function downloadCodesAsText(codes: string[], filename = "medicare-one-recovery-codes.txt") {
  const content = [
    "MEDICARE ONE — Recovery Codes",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Keep these codes in a safe place. Each code can be used ONCE",
    "to sign in if you lose access to your authenticator app.",
    "",
    ...codes,
    "",
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
