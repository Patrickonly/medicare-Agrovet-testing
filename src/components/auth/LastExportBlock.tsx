import { Download } from "lucide-react";
import { canExportAudit, parseExportLogDetails } from "@/lib/auditExport";

export interface LastExportBlockProps {
  role: string | null | undefined;
  event: { created_at: string; details: string | null } | null;
}

/**
 * Shows the most recent `2fa_audit_exported` event from `audit_logs`.
 * - Only renders for roles that can export the audit history.
 * - Renders fields from a structured JSON `details` payload, falling back
 *   to legacy string parsing for historic rows.
 */
export function LastExportBlock({ role, event }: LastExportBlockProps) {
  if (!canExportAudit(role)) return null;
  if (!event) return null;
  const parsed = parseExportLogDetails(event.details);
  const fmt = (parsed?.format || "—").toString().toUpperCase();
  const filename = parsed?.filename || "—";
  const filter = parsed?.filterLabel || "—";
  const dateRange = parsed?.dateRangeLabel || "—";
  const raw = parsed?.includeRawDetails === undefined ? "—" : parsed.includeRawDetails ? "yes" : "no";
  const hash = parsed?.hash || "";

  return (
    <div data-testid="last-export-block" className="rounded-md border border-primary/20 bg-primary/5 p-2 space-y-1">
      <div className="flex items-center gap-1.5">
        <Download size={11} className="text-primary" />
        <span className="text-[10px] font-semibold text-foreground">Last export on record</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
        <span>Time:</span>
        <span data-testid="last-export-time" className="text-foreground tabular-nums">{new Date(event.created_at).toLocaleString()}</span>
        <span>Format:</span>
        <span data-testid="last-export-format" className="text-foreground font-medium">{fmt}</span>
        <span>Filename:</span>
        <span data-testid="last-export-filename" className="text-foreground font-mono break-all">{filename}</span>
        <span>Filter:</span>
        <span data-testid="last-export-filter" className="text-foreground">{filter}</span>
        <span>Date range:</span>
        <span data-testid="last-export-daterange" className="text-foreground">{dateRange}</span>
        <span>Raw details:</span>
        <span data-testid="last-export-raw" className="text-foreground">{raw}</span>
        {hash && (
          <>
            <span>SHA256:</span>
            <span data-testid="last-export-hash" className="text-foreground font-mono break-all">{hash.slice(0, 16)}…</span>
          </>
        )}
      </div>
    </div>
  );
}
