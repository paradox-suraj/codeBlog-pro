import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <div className={cn("rounded-[32px] border-2 border-border bg-card p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs">
          <span className={cn("font-semibold", isPositive ? "text-emerald-500" : "text-red-500")}>
            {isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
