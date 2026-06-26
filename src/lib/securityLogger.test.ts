// Unit tests for the security event logger and access-denied detection.
import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: (...args: unknown[]) => rpcMock(...args) },
}));

import { logSecurityEvent, logIfAccessDenied } from "./securityLogger";

beforeEach(() => {
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: "evt-1", error: null });
});

describe("logSecurityEvent", () => {
  it("rejects invalid action strings without calling RPC", async () => {
    const id = await logSecurityEvent({ action: "BAD ACTION!!", resourceType: "x" });
    expect(id).toBeNull();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("invokes log_security_event RPC with normalized payload", async () => {
    const id = await logSecurityEvent({
      action: "access_denied",
      resourceType: "patients",
      resourceId: "p-123",
      details: { op: "select" },
      risk: "high",
    });
    expect(id).toBe("evt-1");
    expect(rpcMock).toHaveBeenCalledWith("log_security_event", expect.objectContaining({
      _action: "access_denied",
      _resource_type: "patients",
      _resource_id: "p-123",
      _risk_level: "high",
    }));
  });

  it("swallows RPC errors and returns null", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: "nope" } });
    const id = await logSecurityEvent({ action: "ok_action", resourceType: "x" });
    expect(id).toBeNull();
  });
});

describe("logIfAccessDenied", () => {
  it("returns false when no error", async () => {
    expect(await logIfAccessDenied(null, { resourceType: "x" })).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("logs on 403 status", async () => {
    const r = await logIfAccessDenied({ status: 403, message: "forbidden" }, { resourceType: "patients", operation: "select" });
    expect(r).toBe(true);
    expect(rpcMock).toHaveBeenCalled();
  });

  it("logs on PG 42501 insufficient_privilege", async () => {
    const r = await logIfAccessDenied({ code: "42501", message: "permission denied for table" }, { resourceType: "audit_logs" });
    expect(r).toBe(true);
  });

  it("logs on row-level security violations", async () => {
    const r = await logIfAccessDenied({ message: "new row violates row-level security policy" }, { resourceType: "user_roles" });
    expect(r).toBe(true);
  });

  it("ignores unrelated errors (e.g. validation)", async () => {
    const r = await logIfAccessDenied({ code: "23505", message: "duplicate key" }, { resourceType: "x" });
    expect(r).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
