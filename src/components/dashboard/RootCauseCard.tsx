import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RootCauseCardProps {
  title: string;
  description: string;
  severity?: string;
  reviewCount?: number;
  className?: string;
}

export function RootCauseCard({ title, description, severity, reviewCount, className }: RootCauseCardProps) {
  const getSeverityIcon = () => {
    switch (severity?.toLowerCase()) {
      case "high": return <AlertCircle className="text-red-500 w-5 h-5" />;
      case "medium": return <AlertTriangle className="text-amber-500 w-5 h-5" />;
      default: return <Info className="text-blue-500 w-5 h-5" />;
    }
  };

  return (
    <div className={cn("p-4 rounded-lg bg-blinkit-card border border-blinkit-border flex gap-4 items-start", className)}>
      <div className="w-10 h-10 rounded-full bg-blinkit-surface flex items-center justify-center shrink-0">
        {getSeverityIcon()}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h5 className="font-semibold text-foreground text-sm">{title}</h5>
          {severity && (
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium ml-2 shrink-0",
              severity.toLowerCase() === "high" ? "bg-red-500/10 text-red-500" :
              severity.toLowerCase() === "medium" ? "bg-amber-500/10 text-amber-500" :
              "bg-blue-500/10 text-blue-500"
            )}>
              {severity}
            </span>
          )}
        </div>
        <p className="text-xs text-blinkit-muted leading-relaxed mb-2">{description}</p>
        {reviewCount !== undefined && (
          <p className="text-[10px] text-blinkit-muted/70 font-medium">
            Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
