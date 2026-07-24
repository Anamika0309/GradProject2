import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendDirection?: "up" | "down" | "neutral" | string;
  className?: string;
}

export function MetricCard({ title, value, icon, trend, trendDirection, className }: MetricCardProps) {
  return (
    <div className={cn("p-5 rounded-xl bg-blinkit-card border border-blinkit-border flex flex-col gap-3", className)}>
      <div className="flex justify-between items-center text-blinkit-muted">
        <span className="text-sm font-medium">{title}</span>
        <div className="text-blinkit-muted/70">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs font-semibold",
            trend.isPositive ? "text-sentiment-positive" : "text-sentiment-negative"
          )}>
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
        {trendDirection && !trend && (
          <span className={cn(
            "text-xs font-semibold",
            trendDirection === "up" ? "text-sentiment-positive" : 
            trendDirection === "down" ? "text-sentiment-negative" : "text-blinkit-muted"
          )}>
            {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
