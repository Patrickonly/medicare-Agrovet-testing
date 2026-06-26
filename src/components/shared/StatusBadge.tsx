import type { 
  PatientStatus, AppointmentStatus, LabOrderStatus, BillingStatus, 
  InventoryStatus, TriageLevel, CasePriority, CaseStatus 
} from "@/types/models";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "primary" | "neutral" | "purple";

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-medicare-green-light text-medicare-green",
  warning: "bg-medicare-amber-light text-medicare-amber",
  danger: "bg-medicare-red-light text-medicare-red",
  info: "bg-medicare-blue-light text-medicare-blue",
  primary: "bg-medicare-teal-light text-primary",
  neutral: "bg-secondary text-muted-foreground",
  purple: "bg-medicare-purple-light text-medicare-purple",
};

export function StatusBadge({ variant, children, size = "sm", dot }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === "success" ? "bg-medicare-green" : variant === "danger" ? "bg-medicare-red" : variant === "warning" ? "bg-medicare-amber" : "bg-current"}`} />}
      {children}
    </span>
  );
}

// ── Typed mappers ───────────────────────────
export function getPatientStatusBadge(status: PatientStatus): { variant: BadgeVariant; label: string } {
  const map: Record<PatientStatus, { variant: BadgeVariant; label: string }> = {
    active: { variant: "success", label: "Active" },
    inactive: { variant: "neutral", label: "Inactive" },
    discharged: { variant: "info", label: "Discharged" },
    critical: { variant: "danger", label: "Critical" },
    follow_up: { variant: "warning", label: "Follow-up" },
    deceased: { variant: "neutral", label: "Deceased" },
  };
  return map[status];
}

export function getAppointmentStatusBadge(status: AppointmentStatus): { variant: BadgeVariant; label: string } {
  const map: Record<AppointmentStatus, { variant: BadgeVariant; label: string }> = {
    requested: { variant: "neutral", label: "Requested" },
    confirmed: { variant: "success", label: "Confirmed" },
    checked_in: { variant: "info", label: "Checked In" },
    waiting: { variant: "warning", label: "Waiting" },
    in_progress: { variant: "primary", label: "In Progress" },
    completed: { variant: "success", label: "Completed" },
    cancelled: { variant: "danger", label: "Cancelled" },
    no_show: { variant: "danger", label: "No Show" },
    rescheduled: { variant: "warning", label: "Rescheduled" },
  };
  return map[status];
}

export function getLabStatusBadge(status: LabOrderStatus): { variant: BadgeVariant; label: string } {
  const map: Record<LabOrderStatus, { variant: BadgeVariant; label: string }> = {
    ordered: { variant: "neutral", label: "Ordered" },
    specimen_collected: { variant: "primary", label: "Specimen Collected" },
    in_progress: { variant: "info", label: "In Progress" },
    completed: { variant: "success", label: "Completed" },
    verified: { variant: "success", label: "Verified" },
    critical: { variant: "danger", label: "Critical" },
    cancelled: { variant: "neutral", label: "Cancelled" },
  };
  return map[status];
}

export function getBillingStatusBadge(status: BillingStatus): { variant: BadgeVariant; label: string } {
  const map: Record<BillingStatus, { variant: BadgeVariant; label: string }> = {
    draft: { variant: "neutral", label: "Draft" },
    pending: { variant: "warning", label: "Pending" },
    partial: { variant: "primary", label: "Partial" },
    paid: { variant: "success", label: "Paid" },
    overdue: { variant: "danger", label: "Overdue" },
    insurance_pending: { variant: "info", label: "Insurance Pending" },
    refunded: { variant: "neutral", label: "Refunded" },
    waived: { variant: "neutral", label: "Waived" },
  };
  return map[status];
}

export function getInventoryStatusBadge(status: InventoryStatus): { variant: BadgeVariant; label: string } {
  const map: Record<InventoryStatus, { variant: BadgeVariant; label: string }> = {
    in_stock: { variant: "success", label: "In Stock" },
    low_stock: { variant: "warning", label: "Low Stock" },
    critical: { variant: "danger", label: "Critical" },
    out_of_stock: { variant: "danger", label: "Out of Stock" },
    expiring_soon: { variant: "danger", label: "Expiring Soon" },
  };
  return map[status];
}

export function getTriageBadge(level: TriageLevel): { variant: BadgeVariant; label: string; className: string } {
  const map: Record<TriageLevel, { variant: BadgeVariant; label: string; className: string }> = {
    red: { variant: "danger", label: "Red — Immediate", className: "bg-medicare-red text-primary-foreground" },
    orange: { variant: "warning", label: "Orange — Very Urgent", className: "bg-medicare-amber text-primary-foreground" },
    yellow: { variant: "warning", label: "Yellow — Urgent", className: "bg-medicare-amber/70 text-foreground" },
    green: { variant: "success", label: "Green — Standard", className: "bg-medicare-green text-primary-foreground" },
    blue: { variant: "info", label: "Blue — Non-Urgent", className: "bg-medicare-blue text-primary-foreground" },
  };
  return map[level];
}

export function getCasePriorityBadge(priority: CasePriority): { variant: BadgeVariant; label: string } {
  const map: Record<CasePriority, { variant: BadgeVariant; label: string }> = {
    critical: { variant: "danger", label: "Critical" },
    high: { variant: "warning", label: "High" },
    medium: { variant: "info", label: "Medium" },
    low: { variant: "neutral", label: "Low" },
  };
  return map[priority];
}

export function getCaseStatusBadge(status: CaseStatus): { variant: BadgeVariant; label: string } {
  const map: Record<CaseStatus, { variant: BadgeVariant; label: string }> = {
    active: { variant: "danger", label: "Active" },
    follow_up: { variant: "warning", label: "Follow-up" },
    closed: { variant: "success", label: "Closed" },
    escalated: { variant: "danger", label: "Escalated" },
    referred: { variant: "info", label: "Referred" },
  };
  return map[status];
}
