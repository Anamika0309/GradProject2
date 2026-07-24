import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface OpportunityCardProps {
  title: string;
  description: string;
  score: number; // Out of 10
  problem?: string;
  impact?: string;
  className?: string;
}

export function OpportunityCard({ title, description, score, problem, impact, className }: OpportunityCardProps) {
  return (
    <div className={cn("p-5 rounded-xl bg-blinkit-card border border-blinkit-border hover:border-blinkit-green transition-colors cursor-pointer", className)}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-foreground text-lg leading-tight">{title}</h4>
        <div className={cn(
          "px-2 py-1 rounded text-xs font-bold border",
          score >= 8 ? "bg-blinkit-green/10 text-blinkit-green border-blinkit-green/20" : "bg-sentiment-neutral/10 text-sentiment-neutral border-sentiment-neutral/20"
        )}>
          {score}/10
        </div>
      </div>
      <p className="text-sm text-blinkit-muted mb-4 line-clamp-3">{description}</p>
      <div className="flex items-center text-xs font-medium text-blinkit-green gap-1">
        <TrendingUp className="w-3.5 h-3.5" />
        Explore Opportunity
      </div>
    </div>
  );
}
