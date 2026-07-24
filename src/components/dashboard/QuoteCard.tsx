import { cn } from "@/lib/utils";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { SentimentDot } from "@/components/ui/SentimentDot";

interface QuoteCardProps {
  quote: string;
  source: "PLAY STORE" | "APP STORE" | "REDDIT" | "CSV";
  theme: string;
  sentiment: "positive" | "negative" | "neutral";
  date?: string;
  className?: string;
}

export function QuoteCard({ quote, source, theme, sentiment, date, className }: QuoteCardProps) {
  return (
    <div className={cn("p-4 rounded-xl bg-blinkit-surface border border-blinkit-border flex flex-col gap-3", className)}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <SentimentDot sentiment={sentiment} />
          <SourceBadge source={source} />
        </div>
        {date && <span className="text-xs text-blinkit-muted">{date}</span>}
      </div>
      <p className="text-sm text-foreground italic">&quot;{quote}&quot;</p>
      <div className="mt-1">
        <span className="inline-block px-2 py-1 bg-blinkit-card border border-blinkit-border rounded text-xs text-blinkit-muted">
          {theme}
        </span>
      </div>
    </div>
  );
}
