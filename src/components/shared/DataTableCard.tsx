import React from "react";
import { ArrowUpRight } from "lucide-react";

interface DataTableCardProps {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DataTableCard({ title, subtitle, headerAction, children, footer }: DataTableCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {headerAction}
      </div>
      {children}
      {footer}
    </div>
  );
}

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export function Th({ children, className = "" }: TableHeaderCellProps) {
  return (
    <th className={`text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-5 py-3.5 text-sm ${className}`}>
      {children}
    </td>
  );
}

export function ViewAllLink({ href = "#", label = "View All" }: { href?: string; label?: string }) {
  return (
    <a href={href} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline transition-colors">
      {label} <ArrowUpRight size={12} />
    </a>
  );
}
