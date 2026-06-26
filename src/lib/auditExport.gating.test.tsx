import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import {
  canExportAudit,
  refreshAuditDialogData,
  buildExportLogPayload,
  serializeExportLogDetails,
  type AuditEntry,
} from "./auditExport";
import { LastExportBlock } from "@/components/auth/LastExportBlock";

afterEach(() => cleanup());

// ============================================================
// 1. Role-gating: non-admins cannot open export-dialog UI
// ============================================================
// The export dialog is rendered inside TwoFactorGate. Mounting the full
// gate is heavy and brings supabase + framer-motion + recovery flows into
// the test, which is unnecessary for the gating contract — that contract
// lives entirely in `canExportAudit` and `LastExportBlock`. These tests
// pin both layers.
describe("Role gating — non-admins", () => {
  const NON_ADMINS = ["doctor", "nurse", "receptionist", "patient", "viewer", null, undefined, ""] as const;
  const ADMINS = ["admin", "org_owner", "super_admin", "director"] as const;

  it.each(NON_ADMINS)("canExportAudit denies %s", (role) => {
    expect(canExportAudit(role as string | null | undefined)).toBe(false);
  });

  it.each(ADMINS)("canExportAudit allows %s", (role) => {
    expect(canExportAudit(role)).toBe(true);
  });

  it.each(NON_ADMINS)("LastExportBlock does not render for %s even with a valid event", (role) => {
    const payload = buildExportLogPayload({
      format: "csv", filename: "f.csv", hash: "h".repeat(64), count: 1, filter: "all", includeRawDetails: false,
    });
    const { container } = render(
      <LastExportBlock
        role={role as string | null}
        event={{ created_at: "2024-05-14T12:00:00Z", details: serializeExportLogDetails(payload) }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("last-export-block")).toBeNull();
    expect(screen.queryByTestId("last-export-hash")).toBeNull();
  });

  it("refreshAuditDialogData never queries the export-event endpoint for non-admins", async () => {
    const calls: string[] = [];
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            in: () => ({ order: () => ({ limit: async () => { calls.push("timeline"); return { data: [] }; } }) }),
            eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => { calls.push("lastExport"); return { data: null }; } }) }) }),
          }),
        }),
      }),
    };
    const res = await refreshAuditDialogData({ client, userId: "u", role: "nurse" });
    expect(calls).toEqual(["timeline"]);
    expect(res.lastExportFetched).toBe(false);
    expect(res.lastExportEvent).toBeNull();
  });
});

// ============================================================
// 2. Rapid opens / toggle switches — no stale data
// ============================================================
// Simulates the user spam-clicking "View audit history" or flipping the
// raw-toggle while a fetch is still in flight. The newest invocation must
// win and the timeline + hash must reflect the freshest data.
describe("Rapid refresh — no stale SHA256 or timeline", () => {
  const makeClient = (responses: Array<{ timeline: AuditEntry[]; lastExport: { created_at: string; details: string | null } | null; delayMs: number }>) => {
    // Each refresh issues exactly TWO `select()` calls (timeline + lastExport).
    // We pair them by Math.floor(selectCount / 2) so concurrent refreshes
    // get distinct response slots even when their select() calls interleave.
    let selectCount = 0;
    return {
      from: () => ({
        select: () => {
          const myIdx = Math.floor(selectCount / 2);
          selectCount++;
          return {
            eq: () => ({
              in: () => ({
                order: () => ({
                  limit: async () => {
                    const r = responses[myIdx];
                    await new Promise((res) => setTimeout(res, r.delayMs));
                    return { data: r.timeline };
                  },
                }),
              }),
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    maybeSingle: async () => {
                      const r = responses[myIdx];
                      await new Promise((res) => setTimeout(res, r.delayMs));
                      return { data: r.lastExport };
                    },
                  }),
                }),
              }),
            }),
          };
        },
      }),
    };
  };

  it("rapid sequential refreshes all complete and the LAST one returns the freshest data", async () => {
    const evOld = { created_at: "2024-05-01T00:00:00Z", details: serializeExportLogDetails(buildExportLogPayload({
      format: "csv", filename: "old.csv", hash: "0".repeat(64), count: 1, filter: "all", includeRawDetails: false,
    })) };
    const evNew = { created_at: "2024-05-14T12:00:00Z", details: serializeExportLogDetails(buildExportLogPayload({
      format: "pdf", filename: "new.pdf", hash: "f".repeat(64), count: 9, filter: "enrollment", includeRawDetails: true,
    })) };
    const client = makeClient([
      { timeline: [{ id: "1", action: "2fa_enabled", details: null, created_at: "2024-05-01T00:00:00Z" }], lastExport: evOld, delayMs: 0 },
      { timeline: [
        { id: "1", action: "2fa_enabled", details: null, created_at: "2024-05-01T00:00:00Z" },
        { id: "2", action: "2fa_audit_exported", details: null, created_at: "2024-05-14T12:00:00Z" },
      ], lastExport: evNew, delayMs: 0 },
    ]);

    // Spam two opens back-to-back, await both
    const [r1, r2] = await Promise.all([
      refreshAuditDialogData({ client, userId: "u", role: "admin" }),
      refreshAuditDialogData({ client, userId: "u", role: "admin" }),
    ]);

    // Each invocation got its own indexed response, NOT a shared cache
    const allHashes = [r1, r2].map((r) => {
      const p = JSON.parse(r.lastExportEvent!.details!);
      return p.hash;
    });
    expect(allHashes).toContain("0".repeat(64));
    expect(allHashes).toContain("f".repeat(64));
    // The second response is the freshest (newer created_at)
    expect(r2.lastExportEvent?.created_at).toBe("2024-05-14T12:00:00Z");
    expect(r2.entries).toHaveLength(2);
  });

  it("an in-flight slow fetch followed immediately by a fast fetch — both resolve to their own data (no cross-talk)", async () => {
    const slowEv = { created_at: "2024-01-01T00:00:00Z", details: serializeExportLogDetails(buildExportLogPayload({
      format: "csv", filename: "slow.csv", hash: "a".repeat(64), count: 1, filter: "all", includeRawDetails: false,
    })) };
    const fastEv = { created_at: "2024-12-31T00:00:00Z", details: serializeExportLogDetails(buildExportLogPayload({
      format: "pdf", filename: "fast.pdf", hash: "b".repeat(64), count: 2, filter: "qr", includeRawDetails: true,
    })) };
    const client = makeClient([
      { timeline: [], lastExport: slowEv, delayMs: 25 },
      { timeline: [{ id: "x", action: "2fa_enabled", details: null, created_at: "2024-12-31T00:00:00Z" }], lastExport: fastEv, delayMs: 0 },
    ]);

    const slow = refreshAuditDialogData({ client, userId: "u", role: "admin" });
    const fast = refreshAuditDialogData({ client, userId: "u", role: "admin" });
    const [s, f] = await Promise.all([slow, fast]);

    const slowHash = JSON.parse(s.lastExportEvent!.details!).hash;
    const fastHash = JSON.parse(f.lastExportEvent!.details!).hash;
    // Hashes are NOT swapped between invocations — each refresh sees its own data
    expect(slowHash).toBe("a".repeat(64));
    expect(fastHash).toBe("b".repeat(64));
    expect(s.entries).toHaveLength(0);
    expect(f.entries).toHaveLength(1);
  });

  it("rapid toggle switches: 10 back-to-back refreshes each return fresh, independent results", async () => {
    const responses = Array.from({ length: 10 }, (_, i) => ({
      timeline: [{ id: `e-${i}`, action: "2fa_enabled", details: String(i), created_at: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z` }],
      lastExport: {
        created_at: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
        details: serializeExportLogDetails(buildExportLogPayload({
          format: i % 2 === 0 ? "csv" : "pdf",
          filename: `f-${i}.${i % 2 === 0 ? "csv" : "pdf"}`,
          hash: String(i).padEnd(64, "0"),
          count: i,
          filter: "all",
          includeRawDetails: i % 3 === 0,
        })),
      },
      delayMs: 0,
    }));
    const client = makeClient(responses);

    const results = await Promise.all(
      Array.from({ length: 10 }, () => refreshAuditDialogData({ client, userId: "u", role: "admin" })),
    );

    // Each result must have the entries from its corresponding response slot —
    // no two results share the same entry id (no stale cache reuse).
    const ids = results.map((r) => r.entries[0]?.id);
    expect(new Set(ids).size).toBe(10);
    const hashes = results.map((r) => JSON.parse(r.lastExportEvent!.details!).hash);
    expect(new Set(hashes).size).toBe(10);
  });
});
