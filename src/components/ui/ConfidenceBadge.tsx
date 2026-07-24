import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number; // 0-100
  className?: string;
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
      "bg-[#111] border-blinkit-border text-blinkit-muted",
      className
    )}>
      <ShieldCheck className={cn("w-3.5 h-3.5", score > 80 ? "text-blinkit-green" : "text-sentiment-neutral")} />
      {score}% Confidence
    </div>
  );
}
