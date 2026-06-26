import { describe, expect, it } from "vitest";
import { ROLE_HIERARCHY, ROLE_LABELS, ROLE_PERMISSIONS, canGrantRole, hasPermission } from "@/types/rbac";

describe("RBAC — new ERP roles", () => {
  const newRoles = [
    "cfo", "finance_manager", "procurement_officer", "warehouse_manager",
    "biomedical_engineer", "compliance_officer", "billing_officer",
    "ot_coordinator", "ward_manager", "quality_officer",
  ] as const;

  it("every new role has a hierarchy rank", () => {
    for (const r of newRoles) expect(ROLE_HIERARCHY[r]).toBeGreaterThan(0);
  });

  it("every new role has a human label", () => {
    for (const r of newRoles) expect(ROLE_LABELS[r]).toBeTruthy();
  });

  it("CFO outranks finance_manager and billing_officer", () => {
    expect(ROLE_HIERARCHY.cfo).toBeGreaterThan(ROLE_HIERARCHY.finance_manager);
    expect(ROLE_HIERARCHY.cfo).toBeGreaterThan(ROLE_HIERARCHY.billing_officer);
  });

  it("CFO can grant lower-ranked roles, not org_owner", () => {
    expect(canGrantRole("cfo", "billing_officer")).toBe(true);
    expect(canGrantRole("cfo", "org_owner")).toBe(false);
  });

  it("compliance_officer has audit-view permission", () => {
    const perms = ROLE_PERMISSIONS.compliance_officer ?? [];
    expect(hasPermission(perms, "admin.view_audit")).toBe(true);
  });

  it("procurement_officer cannot view emr by default", () => {
    const perms = ROLE_PERMISSIONS.procurement_officer ?? [];
    expect(hasPermission(perms, "emr.view")).toBe(false);
  });

  it("CFO wildcard grants any permission", () => {
    expect(hasPermission(ROLE_PERMISSIONS.cfo ?? [], "billing.process_refund")).toBe(true);
  });
});
