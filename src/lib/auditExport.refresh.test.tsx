import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

import {
  refreshAuditDialogData,
  recordExportLog,
  buildExportLogPayload,
  buildCsvDataBlock,
  buildPdfDataBlock,
  parseExportLogDetails,
  serializeExportLogDetails,
  sha256Hex,
  AUDIT_TIMELINE_ACTIONS,
  type AuditEntry,
} from "./auditExport";

// ---------- Mock supabase query-builder ----------

type TimelineRow = AuditEntry;
type ExportRow = { created_at: string; details: string | null } | null;

interface MockOpts {
  timeline?: { data?: TimelineRow[] | null; error?: unknown; throws?: unknown };
  lastExport?: { data?: ExportRow; error?: unknown; throws?: unknown };
}

const makeQueryClient = (opts: MockOpts = {}) => {
  const calls: Array<{ kind: "timeline" | "lastExport"; userId: unknown; actions?: readonly string[] | string }> = [];

  const client = {
    from: (_table: string) => ({
      select: (cols: string) => {
        const isTimeline = cols.includes("id, action");
        return {
          eq: (_c: string, userId: unknown) => ({
            // timeline path
            in: (_col: string, actions: readonly string[]) => ({
              order: () => ({
                limit: async () => {
                  calls.push({ kind: "timeline", userId, actions });
                  if (opts.timeline?.throws) throw opts.timeline.throws;
                  return { data: opts.timeline?.data ?? [], error: opts.timeline?.error };
                },
              }),
            }),
            // lastExport path
            eq: (_col2: string, action: string) => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => {
                    calls.push({ kind: "lastExport", userId, actions: action });
                    if (opts.lastExport?.throws) throw opts.lastExport.throws;
                    return { data: opts.lastExport?.data ?? null, error: opts.lastExport?.error };
                  },
                }),
              }),
            }),
          }),
        };
      },
    }),
  };
  return { client, calls };
};

// ============================================================
// 1. openAudit / refreshAuditDialogData integration
// ============================================================
describe("refreshAuditDialogData — openAudit always re-fetches", () => {
  it("fetches BOTH timeline and last-export event in a single call for admins", async () => {
    const tl: TimelineRow[] = [
      { id: "a", action: "2fa_enabled", details: null, created_at: "2024-05-01T00:00:00Z" },
    ];
    const ev: ExportRow = { created_at: "2024-05-14T12:00:00Z", details: "{}" };
    const { client, calls } = makeQueryClient({ timeline: { data: tl }, lastExport: { data: ev } });

    const res = await refreshAuditDialogData({ client, userId: "u-1", role: "admin" });

    expect(res.entries).toEqual(tl);
    expect(res.lastExportEvent).toEqual(ev);
    expect(res.lastExportFetched).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls.find((c) => c.kind === "timeline")?.actions).toBe(AUDIT_TIMELINE_ACTIONS);
    expect(calls.find((c) => c.kind === "lastExport")?.actions).toBe("2fa_audit_exported");
    expect(calls.every((c) => c.userId === "u-1")).toBe(true);
  });

  it("calling twice issues fresh queries each time (no stale cache)", async () => {
    const { client, calls } = makeQueryClient();
    await refreshAuditDialogData({ client, userId: "u-1", role: "admin" });
    await refreshAuditDialogData({ client, userId: "u-1", role: "admin" });
    // 2 calls per invocation × 2 invocations = 4
    expect(calls).toHaveLength(4);
  });

  it("skips the last-export query for roles that cannot export", async () => {
    const { client, calls } = makeQueryClient();
    const res = await refreshAuditDialogData({ client, userId: "u-2", role: "doctor" });
    expect(res.lastExportFetched).toBe(false);
    expect(res.lastExportEvent).toBeNull();
    expect(calls.every((c) => c.kind === "timeline")).toBe(true);
  });
});

// ============================================================
// 5. Graceful failure handling (UI empty/error states)
// ============================================================
describe("refreshAuditDialogData — graceful failure", () => {
  it("returns empty entries + captured error when timeline query throws", async () => {
    const { client } = makeQueryClient({ timeline: { throws: new Error("network down") } });
    const res = await refreshAuditDialogData({ client, userId: "u", role: "admin" });
    expect(res.entries).toEqual([]);
    expect(res.entriesError).toBeInstanceOf(Error);
    // last-export still attempted independently
    expect(res.lastExportFetched).toBe(true);
  });

  it("returns null lastExportEvent + captured error when that query throws, without breaking timeline", async () => {
    const tl: TimelineRow[] = [
      { id: "a", action: "2fa_enabled", details: null, created_at: "2024-05-01T00:00:00Z" },
    ];
    const { client } = makeQueryClient({ timeline: { data: tl }, lastExport: { throws: new Error("boom") } });
    const res = await refreshAuditDialogData({ client, userId: "u", role: "admin" });
    expect(res.entries).toEqual(tl);
    expect(res.lastExportEvent).toBeNull();
    expect(res.lastExportError).toBeInstanceOf(Error);
  });

  it("surfaces supabase-style { error } responses without throwing", async () => {
    const { client } = makeQueryClient({
      timeline: { data: null, error: { message: "rls" } },
      lastExport: { data: null, error: { message: "rls" } },
    });
    const res = await refreshAuditDialogData({ client, userId: "u", role: "admin" });
    expect(res.entries).toEqual([]);
    expect(res.entriesError).toEqual({ message: "rls" });
    expect(res.lastExportEvent).toBeNull();
    expect(res.lastExportError).toEqual({ message: "rls" });
  });

  it("recordExportLog swallows insert errors and returns { logged: false, error }", async () => {
    const client = {
      from: () => ({
        insert: async () => ({ error: { message: "constraint" } }),
      }),
    };
    const payload = buildExportLogPayload({
      format: "csv", filename: "x.csv", hash: "h", count: 0, filter: "all", includeRawDetails: false,
    });
    const r = await recordExportLog({ client, userId: "u", userEmail: "e", role: "admin", payload });
    expect(r.logged).toBe(false);
    expect(r.error).toEqual({ message: "constraint" });
  });

  it("recordExportLog swallows network exceptions", async () => {
    const client = {
      from: () => ({
        insert: async () => { throw new Error("offline"); },
      }),
    };
    const payload = buildExportLogPayload({
      format: "pdf", filename: "x.pdf", hash: "h", count: 0, filter: "all", includeRawDetails: false,
    });
    const r = await recordExportLog({ client, userId: "u", userEmail: "e", role: "admin", payload });
    expect(r.logged).toBe(false);
    expect((r.error as Error).message).toBe("offline");
  });

  it("role gating still holds when the insert path would have failed", async () => {
    const insert = vi.fn(async () => { throw new Error("offline"); });
    const client = { from: () => ({ insert }) };
    const payload = buildExportLogPayload({
      format: "csv", filename: "x.csv", hash: "h", count: 0, filter: "all", includeRawDetails: false,
    });
    const r = await recordExportLog({ client, userId: "u", userEmail: "e", role: "doctor", payload });
    expect(r.logged).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });
});

// ============================================================
// 2. Hash stored in JSON details + UI displays correct truncation
// ============================================================
describe("Export SHA256 — JSON storage + UI truncation contract", () => {
  it("stores the full 64-char hash inside JSON details and round-trips it", async () => {
    const block = buildCsvDataBlock({
      entries: [{ id: "1", action: "2fa_enabled", details: null, created_at: "2024-01-01T00:00:00Z" }],
      includeRawDetails: false,
    });
    const hash = await sha256Hex(block);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);

    const payload = buildExportLogPayload({
      format: "csv", filename: "f.csv", hash, count: 1, filter: "all", includeRawDetails: false,
    });
    const serialized = serializeExportLogDetails(payload);
    // Must be JSON, not legacy string
    expect(serialized.startsWith("{")).toBe(true);
    const parsed = parseExportLogDetails(serialized);
    expect(parsed?.hash).toBe(hash);
    expect(parsed?.hash?.length).toBe(64);
  });

  it("UI truncates the hash as `${hash.slice(0,16)}…` for the most recent event", async () => {
    const { LastExportBlock } = await import("@/components/auth/LastExportBlock");
    const { render, screen } = await import("@testing-library/react");
    const hash = "deadbeefcafef00d" + "0".repeat(48);
    const payload = buildExportLogPayload({
      format: "pdf", filename: "f.pdf", hash, count: 1, filter: "all", includeRawDetails: false,
    });
    render(
      <LastExportBlock
        role="admin"
        event={{ created_at: "2024-05-14T12:00:00Z", details: serializeExportLogDetails(payload) }}
      />,
    );
    const el = screen.getByTestId("last-export-hash");
    expect(el.textContent).toBe(`${hash.slice(0, 16)}…`);
    // Spot-check exact prefix
    expect(el.textContent?.startsWith("deadbeefcafef00d")).toBe(true);
  });
});

// ============================================================
// 3. End-to-end: raw toggle reflected in details + exported block
// ============================================================
describe("Raw-details toggle — end-to-end roundtrip", () => {
  const entries: AuditEntry[] = [
    { id: "1", action: "2fa_enabled", details: "ok", created_at: "2024-01-15T10:00:00Z" },
  ];

  const runExport = async (includeRawDetails: boolean, format: "csv" | "pdf") => {
    const block = format === "csv"
      ? buildCsvDataBlock({ entries, includeRawDetails })
      : buildPdfDataBlock({ entries, includeRawDetails });
    const hash = await sha256Hex(block);
    const payload = buildExportLogPayload({
      format, filename: `audit.${format}`, hash, count: entries.length, filter: "all", includeRawDetails,
    });

    const inserts: Array<Record<string, unknown>> = [];
    const client = { from: () => ({ insert: async (row: Record<string, unknown>) => { inserts.push(row); return { error: null }; } }) };
    const res = await recordExportLog({ client, userId: "u", userEmail: "a@b.c", role: "admin", payload });
    return { block, hash, payload, inserts, res };
  };

  it("raw=true: details JSON has includeRawDetails=true and CSV block contains raw event JSON", async () => {
    const { block, hash, inserts, res } = await runExport(true, "csv");
    expect(res.logged).toBe(true);
    const stored = JSON.parse(inserts[0].details as string);
    expect(stored.includeRawDetails).toBe(true);
    expect(stored.hash).toBe(hash);
    expect(block).toContain("Raw Event JSON");
    // hash matches the actual block embedded in the export
    expect(await sha256Hex(block)).toBe(hash);
  });

  it("raw=false: details JSON has includeRawDetails=false and CSV omits raw column", async () => {
    const { block, hash, inserts } = await runExport(false, "csv");
    const stored = JSON.parse(inserts[0].details as string);
    expect(stored.includeRawDetails).toBe(false);
    expect(stored.hash).toBe(hash);
    expect(block).not.toContain("Raw Event JSON");
  });

  it("raw=true PDF block includes per-entry raw field and hash matches stored payload", async () => {
    const { block, hash, inserts } = await runExport(true, "pdf");
    const stored = JSON.parse(inserts[0].details as string);
    expect(stored.format).toBe("pdf");
    expect(stored.includeRawDetails).toBe(true);
    const parsedBlock = JSON.parse(block);
    expect(parsedBlock[0].raw).toBeDefined();
    expect(await sha256Hex(block)).toBe(hash);
  });

  it("toggling raw produces different hashes for the same entries (so UI never reuses a stale digest)", async () => {
    const off = await runExport(false, "csv");
    const on = await runExport(true, "csv");
    expect(off.hash).not.toBe(on.hash);
  });
});

// ============================================================
// 4. Legacy regex fallback — extra string formats
// ============================================================
describe("parseExportLogDetails — additional legacy formats", () => {
  const HASH = "a".repeat(64);

  it("parses canonical legacy string", () => {
    const txt = `Exported 5 2FA audit event(s) as CSV (acme-audit.csv). Filter: Enrollments; Date range: 2024-05-01 → 2024-05-14; Raw details: yes; SHA256: ${HASH}.`;
    const p = parseExportLogDetails(txt);
    expect(p?.format).toBe("csv");
    expect(p?.filename).toBe("acme-audit.csv");
    expect(p?.filterLabel).toBe("Enrollments");
    expect(p?.dateRangeLabel).toBe("2024-05-01 → 2024-05-14");
    expect(p?.includeRawDetails).toBe(true);
    expect(p?.hash).toBe(HASH);
    expect(p?.count).toBe(5);
  });

  it("parses lowercase format keyword (`as pdf`)", () => {
    const txt = `Exported 1 2FA audit event(s) as pdf (x.pdf). Filter: All; Date range: All dates; Raw details: no; SHA256: ${HASH}.`;
    const p = parseExportLogDetails(txt);
    expect(p?.format).toBe("pdf");
    expect(p?.filename).toBe("x.pdf");
    expect(p?.includeRawDetails).toBe(false);
  });

  it("parses raw=NO uppercase", () => {
    const txt = `Exported 3 2FA audit event(s) as CSV (f.csv). Filter: QR refreshes; Date range: All dates; Raw details: NO; SHA256: ${HASH}.`;
    const p = parseExportLogDetails(txt);
    expect(p?.includeRawDetails).toBe(false);
    expect(p?.filterLabel).toBe("QR refreshes");
  });

  it("extracts whatever it can when some fields are missing", () => {
    const txt = `Exported 2 2FA audit event(s) as PDF (only.pdf). SHA256: ${HASH}.`;
    const p = parseExportLogDetails(txt);
    expect(p?.format).toBe("pdf");
    expect(p?.filename).toBe("only.pdf");
    expect(p?.hash).toBe(HASH);
    expect(p?.count).toBe(2);
    expect(p?.filterLabel).toBeUndefined();
    expect(p?.dateRangeLabel).toBeUndefined();
    expect(p?.includeRawDetails).toBeUndefined();
  });

  it("handles ASCII arrow `->` in legacy date ranges", () => {
    const txt = `Exported 4 2FA audit event(s) as CSV (a.csv). Filter: Recovery codes; Date range: 2024-01-01 -> 2024-01-31; Raw details: yes; SHA256: ${HASH}.`;
    const p = parseExportLogDetails(txt);
    expect(p?.dateRangeLabel).toBe("2024-01-01 -> 2024-01-31");
    expect(p?.filterLabel).toBe("Recovery codes");
  });

  it("falls back to undefined hash when no SHA256 is present", () => {
    const txt = `Exported 0 2FA audit event(s) as CSV (e.csv). Filter: All; Date range: All dates; Raw details: no.`;
    const p = parseExportLogDetails(txt);
    expect(p?.hash).toBeUndefined();
    expect(p?.count).toBe(0);
  });

  it("returns null for null/empty input", () => {
    expect(parseExportLogDetails(null)).toBeNull();
    expect(parseExportLogDetails("")).toBeNull();
    expect(parseExportLogDetails(undefined)).toBeNull();
  });
});

// ============================================================
// 5b. LastExportBlock UI: empty/error states preserve role gating
// ============================================================
describe("LastExportBlock — empty/error UI states", () => {
  it("renders nothing for admin when event is null (load failed or no exports yet)", async () => {
    const { LastExportBlock } = await import("@/components/auth/LastExportBlock");
    const { render } = await import("@testing-library/react");
    const { container } = render(<LastExportBlock role="admin" event={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not render for non-admin even if a stray event payload is passed in", async () => {
    const { LastExportBlock } = await import("@/components/auth/LastExportBlock");
    const { render } = await import("@testing-library/react");
    const payload = buildExportLogPayload({
      format: "csv", filename: "f.csv", hash: "h".repeat(64), count: 1, filter: "all", includeRawDetails: false,
    });
    const { container } = render(
      <LastExportBlock role="doctor" event={{ created_at: "2024-01-01T00:00:00Z", details: serializeExportLogDetails(payload) }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders gracefully with em-dashes when details payload is corrupt JSON", async () => {
    const { LastExportBlock } = await import("@/components/auth/LastExportBlock");
    const { render, screen } = await import("@testing-library/react");
    render(<LastExportBlock role="admin" event={{ created_at: "2024-01-01T00:00:00Z", details: "{not json" }} />);
    // Block still renders (role allowed + event provided), fields fall back to —
    expect(screen.getByTestId("last-export-block")).toBeInTheDocument();
    expect(screen.getByTestId("last-export-format")).toHaveTextContent("—");
    expect(screen.getByTestId("last-export-filename")).toHaveTextContent("—");
    expect(screen.getByTestId("last-export-raw")).toHaveTextContent("—");
  });
});
