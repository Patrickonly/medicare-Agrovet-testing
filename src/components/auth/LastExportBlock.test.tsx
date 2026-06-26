import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LastExportBlock } from "./LastExportBlock";
import { buildExportLogPayload, serializeExportLogDetails } from "@/lib/auditExport";

const structuredEvent = {
  created_at: "2024-05-14T12:00:00.000Z",
  details: serializeExportLogDetails(
    buildExportLogPayload({
      format: "pdf",
      filename: "acme-2fa-audit-enrollment-2024-05-14.pdf",
      hash: "abc123".padEnd(64, "0"),
      count: 5,
      filter: "enrollment",
      fromDate: "2024-05-01",
      toDate: "2024-05-14",
      includeRawDetails: true,
    }),
  ),
};

describe("LastExportBlock — authorization", () => {
  it.each(["org_owner", "admin", "super_admin", "director"])(
    "renders for authorized role: %s",
    (role) => {
      render(<LastExportBlock role={role} event={structuredEvent} />);
      expect(screen.getByTestId("last-export-block")).toBeInTheDocument();
    },
  );

  it.each(["doctor", "nurse", "receptionist", "patient", null, undefined, ""])(
    "does NOT render for unauthorized role: %s",
    (role) => {
      const { container } = render(
        <LastExportBlock role={role as string | null} event={structuredEvent} />,
      );
      expect(container).toBeEmptyDOMElement();
    },
  );

  it("renders nothing when event is null even for an admin", () => {
    const { container } = render(<LastExportBlock role="admin" event={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("LastExportBlock — field rendering from JSON details", () => {
  it("shows time/format/filename/filter/date-range/raw toggle from structured payload", () => {
    render(<LastExportBlock role="admin" event={structuredEvent} />);
    expect(screen.getByTestId("last-export-format")).toHaveTextContent("PDF");
    expect(screen.getByTestId("last-export-filename")).toHaveTextContent(
      "acme-2fa-audit-enrollment-2024-05-14.pdf",
    );
    expect(screen.getByTestId("last-export-filter")).toHaveTextContent("Enrollments");
    expect(screen.getByTestId("last-export-daterange")).toHaveTextContent("2024-05-01 → 2024-05-14");
    expect(screen.getByTestId("last-export-raw")).toHaveTextContent("yes");
    // Time should be a non-empty localized string derived from created_at
    expect(screen.getByTestId("last-export-time").textContent?.length).toBeGreaterThan(0);
  });

  it("renders raw=no when toggle was off", () => {
    const ev = {
      created_at: "2024-05-14T12:00:00.000Z",
      details: serializeExportLogDetails(
        buildExportLogPayload({
          format: "csv",
          filename: "f.csv",
          hash: "0".repeat(64),
          count: 1,
          filter: "all",
          includeRawDetails: false,
        }),
      ),
    };
    render(<LastExportBlock role="admin" event={ev} />);
    expect(screen.getByTestId("last-export-raw")).toHaveTextContent("no");
    expect(screen.getByTestId("last-export-format")).toHaveTextContent("CSV");
  });

  it("falls back to legacy regex parsing for historic string-format rows", () => {
    const legacy = {
      created_at: "2024-05-14T12:00:00.000Z",
      details:
        "Exported 9 2FA audit event(s) as CSV (legacy.csv). Filter: QR refreshes; Date range: All dates; Raw details: no; SHA256: " +
        "a".repeat(64) +
        ".",
    };
    render(<LastExportBlock role="admin" event={legacy} />);
    expect(screen.getByTestId("last-export-format")).toHaveTextContent("CSV");
    expect(screen.getByTestId("last-export-filename")).toHaveTextContent("legacy.csv");
    expect(screen.getByTestId("last-export-filter")).toHaveTextContent("QR refreshes");
    expect(screen.getByTestId("last-export-raw")).toHaveTextContent("no");
  });
});
