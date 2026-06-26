// =====================================================
// Security event logger — writes to audit_logs via RPC
// =====================================================
// Wraps `log_security_event` RPC. Call from anywhere we catch a PostgREST
// 401/403, role-grant attempt, or other security-relevant event. Failures
// here are swallowed (logging must never break the calling flow), but they
// emit a console warning in dev.

import { supabase } from "@/integrations/supabase/client";

export type SecurityRisk = "low" | "medium" | "high" | "critical";

export interface SecurityEventInput {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  risk?: SecurityRisk;
}

const ACTION_RE = /^[a-z0-9_.]{1,64}$/;

export async function logSecurityEvent(evt: SecurityEventInput): Promise<string | null> {
  if (!ACTION_RE.test(evt.action)) {
    if (import.meta.env.DEV) console.warn("[securityLogger] invalid action:", evt.action);
    return null;
  }
  try {
    const { data, error } = await supabase.rpc("log_security_event", {
      _action: evt.action,
      _resource_type: evt.resourceType,
      _resource_id: evt.resourceId ?? "",
      _details: (evt.details ?? {}) as never,
      _risk_level: evt.risk ?? "medium",
    } as never);
    if (error) {
      if (import.meta.env.DEV) console.warn("[securityLogger] rpc error:", error.message);
      return null;
    }
    return (data as unknown as string) ?? null;
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[securityLogger] threw:", e);
    return null;
  }
}

/**
 * Inspect a PostgREST error and, if it looks like an access-denied / RLS
 * rejection, log it. Returns true when an event was emitted.
 */
export async function logIfAccessDenied(
  error: { code?: string; message?: string; status?: number } | null | undefined,
  context: { resourceType: string; resourceId?: string; operation?: string },
): Promise<boolean> {
  if (!error) return false;
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  const status = error.status ?? 0;
  const denied =
    status === 401 ||
    status === 403 ||
    code === "42501" || // insufficient_privilege
    code === "PGRST301" || // jwt expired / unauthorized
    code === "PGRST302" ||
    msg.includes("row-level security") ||
    msg.includes("permission denied") ||
    msg.includes("violates row-level security");
  if (!denied) return false;
  await logSecurityEvent({
    action: "access_denied",
    resourceType: context.resourceType,
    resourceId: context.resourceId,
    risk: "high",
    details: {
      operation: context.operation ?? "unknown",
      code,
      status,
      message: error.message?.slice(0, 200),
    },
  });
  return true;
}
