import { describe, it, expect } from "vitest";
import {
  buildCsvDataBlock,
  buildPdfDataBlock,
  buildFilename,
  canExportAudit,
  sha256Hex,
  type AuditEntry,
} from "./auditExport";

const sample: AuditEntry[] = [
  { id: "1", action: "2fa_enabled", details: "ok", created_at: "2024-01-15T10:00:00.000Z" },
  { id: "2", action: "2fa_enrollment_qr_refreshed", details: "manual", created_at: "2024-01-16T11:30:00.000Z" },
];

describe("auditExport: permissions", () => {
  it("allows admin / org_owner / super_admin / director to export", () => {
    expect(canExportAudit("admin")).toBe(true);
    expect(canExportAudit("org_owner")).toBe(true);
    expect(canExportAudit("super_admin")).toBe(true);
    expect(canExportAudit("director")).toBe(true);
  });
  it("denies non-admin / null / unknown roles", () => {
    expect(canExportAudit("doctor")).toBe(false);
    expect(canExportAudit("nurse")).toBe(false);
    expect(canExportAudit(null)).toBe(false);
    expect(canExportAudit(undefined)).toBe(false);
    expect(canExportAudit("")).toBe(false);
  });
});

describe("auditExport: SHA256 hashing", () => {
  it("produces a 64-char hex digest", async () => {
    const h = await sha256Hex("hello");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("hash matches the CSV data block that gets embedded in the export header", async () => {
    const block = buildCsvDataBlock({ entries: sample, includeRawDetails: false });
    const hash = await sha256Hex(block);
    // Re-hashing the same block must give the same digest — i.e. what the
    // UI displays equals what's serialized into the file.
    expect(await sha256Hex(block)).toBe(hash);
    // Sanity: header is the first line of the block we hashed
    expect(block.startsWith("Timestamp,Event,Raw Action,Details\n")).toBe(true);
  });

  it("hash matches the PDF JSON data block embedded in the banner", async () => {
    const block = buildPdfDataBlock({ entries: sample, includeRawDetails: false });
    const hash = await sha256Hex(block);
    expect(await sha256Hex(block)).toBe(hash);
    // Block must be valid JSON of the same length as entries
    const parsed = JSON.parse(block);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(sample.length);
  });

  it("changes the hash when filter/raw toggle changes the data block", async () => {
    const a = await sha256Hex(buildCsvDataBlock({ entries: sample, includeRawDetails: false }));
    const b = await sha256Hex(buildCsvDataBlock({ entries: sample, includeRawDetails: true }));
    const c = await sha256Hex(buildCsvDataBlock({ entries: [sample[0]], includeRawDetails: false }));
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});

describe("auditExport: raw-details toggle", () => {
  it("CSV omits Raw Event JSON column when toggle is off", () => {
    const block = buildCsvDataBlock({ entries: sample, includeRawDetails: false });
    expect(block).not.toContain("Raw Event JSON");
    expect(block).not.toContain('"id":"1"');
  });
  it("CSV includes Raw Event JSON column and per-event JSON when toggle is on", () => {
    const block = buildCsvDataBlock({ entries: sample, includeRawDetails: true });
    expect(block).toContain("Raw Event JSON");
    // CSV escapes quotes by doubling them, so {"id":"1"} becomes {""id"":""1""}
    expect(block).toContain('""id"":""1""');
    expect(block).toContain('""id"":""2""');
  });
  it("PDF data block includes raw event when toggle is on", () => {
    const off = JSON.parse(buildPdfDataBlock({ entries: sample, includeRawDetails: false }));
    const on = JSON.parse(buildPdfDataBlock({ entries: sample, includeRawDetails: true }));
    expect(off[0].raw).toBeUndefined();
    expect(on[0].raw).toBeDefined();
    expect(on[0].raw.id).toBe("1");
  });
});

describe("auditExport: filename builder", () => {
  it("substitutes tokens and slugifies organization name", () => {
    const name = buildFilename({
      template: "{org}-2fa-audit-{filter}-{date}",
      orgName: "Acme Health Group!",
      filter: "enrollment",
      ext: "csv",
      date: "2024-05-14",
    });
    expect(name).toBe("acme-health-group-2fa-audit-enrollment-2024-05-14.csv");
  });
  it("falls back when template renders empty", () => {
    const name = buildFilename({ template: "   ", orgName: "", filter: "all", ext: "pdf", date: "2024-05-14" });
    expect(name.endsWith(".pdf")).toBe(true);
  });
});

import {
  buildExportLogPayload,
  serializeExportLogDetails,
  parseExportLogDetails,
  recordExportLog,
} from "./auditExport";

describe("auditExport: structured log payload", () => {
  it("buildExportLogPayload populates derived labels", () => {
    const p = buildExportLogPayload({
      format: "csv",
      filename: "acme-2fa-audit-all-2024-05-14.csv",
      hash: "a".repeat(64),
      count: 7,
      filter: "enrollment",
      fromDate: "2024-05-01",
      toDate: "2024-05-14",
      includeRawDetails: true,
    });
    expect(p.v).toBe(1);
    expect(p.filterLabel).toBe("Enrollments");
    expect(p.dateRangeLabel).toBe("2024-05-01 → 2024-05-14");
    expect(p.includeRawDetails).toBe(true);
    expect(p.count).toBe(7);
  });

  it("dateRangeLabel falls back to 'All dates' when no bounds", () => {
    const p = buildExportLogPayload({
      format: "pdf", filename: "f.pdf", hash: "x", count: 0, filter: "all", includeRawDetails: false,
    });
    expect(p.dateRangeLabel).toBe("All dates");
    expect(p.fromDate).toBeNull();
    expect(p.toDate).toBeNull();
  });

  it("serialize → parse roundtrip preserves all fields", () => {
    const p = buildExportLogPayload({
      format: "pdf", filename: "f.pdf", hash: "h".repeat(64), count: 3, filter: "qr",
      fromDate: "2024-01-01", toDate: "2024-01-31", includeRawDetails: false,
    });
    const back = parseExportLogDetails(serializeExportLogDetails(p));
    expect(back).toEqual(p);
  });

  it("parseExportLogDetails falls back to legacy regex format", () => {
    const legacy = `Exported 12 2FA audit event(s) as CSV (acme-audit.csv). Filter: All; Date range: All dates; Raw details: yes; SHA256: ${"f".repeat(64)}.`;
    const back = parseExportLogDetails(legacy);
    expect(back?.format).toBe("csv");
    expect(back?.filename).toBe("acme-audit.csv");
    expect(back?.filterLabel).toBe("All");
    expect(back?.dateRangeLabel).toBe("All dates");
    expect(back?.includeRawDetails).toBe(true);
    expect(back?.hash).toBe("f".repeat(64));
    expect(back?.count).toBe(12);
  });

  it("parseExportLogDetails returns null for empty input", () => {
    expect(parseExportLogDetails(null)).toBeNull();
    expect(parseExportLogDetails("")).toBeNull();
  });
});

describe("auditExport: recordExportLog (integration with mock client)", () => {
  const makeMockClient = () => {
    const inserts: Array<{ table: string; row: Record<string, unknown> }> = [];
    const client = {
      from: (table: string) => ({
        insert: async (row: Record<string, unknown>) => {
          inserts.push({ table, row });
          return { error: null };
        },
      }),
    };
    return { client, inserts };
  };

  const samplePayload = buildExportLogPayload({
    format: "csv",
    filename: "acme-2fa-audit-all-2024-05-14.csv",
    hash: "deadbeef".repeat(8),
    count: 4,
    filter: "all",
    includeRawDetails: false,
  });

  it("inserts a 2fa_audit_exported row with structured JSON details for admins", async () => {
    const { client, inserts } = makeMockClient();
    const result = await recordExportLog({
      client,
      userId: "user-1",
      userEmail: "admin@acme.com",
      role: "admin",
      payload: samplePayload,
    });
    expect(result.logged).toBe(true);
    expect(inserts).toHaveLength(1);
    expect(inserts[0].table).toBe("audit_logs");
    const row = inserts[0].row;
    expect(row.action).toBe("2fa_audit_exported");
    expect(row.user_id).toBe("user-1");
    expect(row.user_name).toBe("admin@acme.com");
    // details must be valid JSON containing every structured field
    const parsed = JSON.parse(row.details as string);
    expect(parsed.format).toBe("csv");
    expect(parsed.filename).toBe(samplePayload.filename);
    expect(parsed.filter).toBe("all");
    expect(parsed.filterLabel).toBe("All");
    expect(parsed.includeRawDetails).toBe(false);
    expect(parsed.hash).toBe(samplePayload.hash);
    expect(parsed.count).toBe(4);
  });

  it.each(["doctor", "nurse", "patient", "receptionist", null, undefined])(
    "does NOT insert when role is %s (permission denied)",
    async (role) => {
      const { client, inserts } = makeMockClient();
      const result = await recordExportLog({
        client,
        userId: "user-2",
        userEmail: "u@acme.com",
        role: role as string | null,
        payload: samplePayload,
      });
      expect(result.logged).toBe(false);
      expect(inserts).toHaveLength(0);
    },
  );
});
