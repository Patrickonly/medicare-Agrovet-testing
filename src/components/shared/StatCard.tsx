import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useAnimatedCounter, formatNumber, formatCurrency } from "@/hooks/use-data";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: "number" | "currency" | "percent";
  change?: number;
  changeLabel?: string;
  colorClass?: string;
  delay?: number;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  format = "number",
  change,
  changeLabel,
  colorClass = "bg-primary/10 text-primary",
  delay = 0,
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value, 800);

  const displayValue = (() => {
    switch (format) {
      case "currency":
        return formatCurrency(animatedValue);
      case "percent":
        return `${animatedValue}%`;
      default:
        return formatNumber(animatedValue);
    }
  })();

  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="medicare-stat-card group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-medicare-green" : "text-medicare-red"}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground tracking-tight">{displayValue}</p>
      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
      {changeLabel && (
        <p className="text-[10px] text-muted-foreground/70 mt-1">{changeLabel}</p>
      )}
    </motion.div>
  );
}
