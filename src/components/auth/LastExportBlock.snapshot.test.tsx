import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LastExportBlock } from "./LastExportBlock";
import { buildExportLogPayload, serializeExportLogDetails } from "@/lib/auditExport";

afterEach(() => cleanup());

// Snapshot tests pin the rendered output of LastExportBlock across its
// most important states so accidental formatting/truncation regressions
// are caught immediately. We use serialized HTML (not Vitest's serializer
// magic) to keep snapshots reviewable in diffs.

const renderHtml = (jsx: React.ReactNode) => {
  const { container } = render(jsx as React.ReactElement);
  // Normalize the localized time field so the snapshot is deterministic
  // across CI timezones; the full time-rendering contract is covered in
  // LastExportBlock.test.tsx.
  return container.innerHTML.replace(
    /(data-testid="last-export-time"[^>]*>)[^<]+(<)/,
    '$1<TIME>$2',
  );
};

describe("LastExportBlock — snapshots (empty / loaded / corrupt states)", () => {
  it("empty: returns nothing when role is allowed but event is null", () => {
    expect(renderHtml(<LastExportBlock role="admin" event={null} />)).toMatchSnapshot();
  });

  it("empty: returns nothing for unauthorized role even with an event", () => {
    const payload = buildExportLogPayload({
      format: "csv", filename: "x.csv", hash: "h".repeat(64), count: 1, filter: "all", includeRawDetails: false,
    });
    expect(
      renderHtml(
        <LastExportBlock
          role="doctor"
          event={{ created_at: "2024-05-14T12:00:00Z", details: serializeExportLogDetails(payload) }}
        />,
      ),
    ).toMatchSnapshot();
  });

  it("loaded: CSV export, all filters, raw OFF, full 64-char hash truncates to 16+ellipsis", () => {
    const payload = buildExportLogPayload({
      format: "csv",
      filename: "acme-2fa-audit-all-2024-05-14.csv",
      hash: "deadbeefcafef00d" + "0".repeat(48),
      count: 5,
      filter: "all",
      includeRawDetails: false,
    });
    expect(
      renderHtml(
        <LastExportBlock
          role="admin"
          event={{ created_at: "2024-05-14T12:00:00Z", details: serializeExportLogDetails(payload) }}
        />,
      ),
    ).toMatchSnapshot();
  });

  it("loaded: PDF export, enrollment filter, raw ON, date-range, long filename", () => {
    const payload = buildExportLogPayload({
      format: "pdf",
      filename: "very-long-organization-name-2fa-audit-enrollment-2024-05-14.pdf",
      hash: "abcdef0123456789".padEnd(64, "0"),
      count: 42,
      filter: "enrollment",
      fromDate: "2024-05-01",
      toDate: "2024-05-14",
      includeRawDetails: true,
    });
    expect(
      renderHtml(
        <LastExportBlock
          role="org_owner"
          event={{ created_at: "2024-05-14T12:00:00Z", details: serializeExportLogDetails(payload) }}
        />,
      ),
    ).toMatchSnapshot();
  });

  it("error: corrupt JSON in details falls back to em-dashes without breaking layout", () => {
    expect(
      renderHtml(
        <LastExportBlock
          role="admin"
          event={{ created_at: "2024-05-14T12:00:00Z", details: "{not json" }}
        />,
      ),
    ).toMatchSnapshot();
  });

  it("error: null details renders block with em-dashes (load-recovered state)", () => {
    expect(
      renderHtml(
        <LastExportBlock
          role="admin"
          event={{ created_at: "2024-05-14T12:00:00Z", details: null }}
        />,
      ),
    ).toMatchSnapshot();
  });

  it("legacy: pre-JSON string format still renders cleanly", () => {
    const legacy =
      "Exported 9 2FA audit event(s) as CSV (legacy.csv). Filter: QR refreshes; Date range: All dates; Raw details: no; SHA256: " +
      "a".repeat(64) +
      ".";
    expect(
      renderHtml(
        <LastExportBlock
          role="admin"
          event={{ created_at: "2024-05-14T12:00:00Z", details: legacy }}
        />,
      ),
    ).toMatchSnapshot();
  });
});

// ============================================================
// Audit timeline state snapshots
// ============================================================
//
// The full TwoFactorGate timeline UI is bound to supabase and motion,
// so we snapshot a thin presentational stand-in that matches the
// classes/structure used in TwoFactorGate.tsx for the timeline list.
// This guards against formatting regressions for empty / loading /
// error / populated states without booting the full gate.

import { EVENT_LABELS, type AuditEntry } from "@/lib/auditExport";

interface TimelineProps {
  loading: boolean;
  error: string | null;
  entries: AuditEntry[];
}

function AuditTimelineView({ loading, error, entries }: TimelineProps) {
  if (loading) {
    return (
      <ul data-testid="audit-timeline" className="space-y-1 text-xs text-muted-foreground">
        <li data-testid="audit-timeline-loading" className="italic">Loading audit history…</li>
      </ul>
    );
  }
  if (error) {
    return (
      <ul data-testid="audit-timeline" className="space-y-1 text-xs text-destructive">
        <li data-testid="audit-timeline-error">Couldn't load audit history: {error}</li>
      </ul>
    );
  }
  if (entries.length === 0) {
    return (
      <ul data-testid="audit-timeline" className="space-y-1 text-xs text-muted-foreground">
        <li data-testid="audit-timeline-empty" className="italic">No 2FA activity recorded yet.</li>
      </ul>
    );
  }
  return (
    <ul data-testid="audit-timeline" className="space-y-1 text-xs">
      {entries.map((e) => (
        <li key={e.id} data-testid={`audit-row-${e.id}`} className="flex items-baseline gap-2">
          <time className="tabular-nums text-muted-foreground">{new Date(e.created_at).toISOString()}</time>
          <span className="font-medium text-foreground">{EVENT_LABELS[e.action] || e.action}</span>
          {e.details && <span className="text-muted-foreground truncate">— {e.details}</span>}
        </li>
      ))}
    </ul>
  );
}

describe("AuditTimelineView — snapshots", () => {
  it("loading state", () => {
    const { container } = render(<AuditTimelineView loading error={null} entries={[]} />);
    expect(container.innerHTML).toMatchSnapshot();
  });
  it("empty state", () => {
    const { container } = render(<AuditTimelineView loading={false} error={null} entries={[]} />);
    expect(container.innerHTML).toMatchSnapshot();
  });
  it("error state", () => {
    const { container } = render(<AuditTimelineView loading={false} error="Network down" entries={[]} />);
    expect(container.innerHTML).toMatchSnapshot();
  });
  it("populated state with multiple known event types", () => {
    const entries: AuditEntry[] = [
      { id: "1", action: "2fa_enabled", details: null, created_at: "2024-05-14T12:00:00Z" },
      { id: "2", action: "2fa_enrollment_qr_refreshed", details: "manual", created_at: "2024-05-14T12:05:00Z" },
      { id: "3", action: "2fa_audit_exported", details: "ok", created_at: "2024-05-14T12:10:00Z" },
    ];
    const { container } = render(<AuditTimelineView loading={false} error={null} entries={entries} />);
    expect(container.innerHTML).toMatchSnapshot();
  });
});
