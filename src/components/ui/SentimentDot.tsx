import { cn } from "@/lib/utils";

interface SentimentDotProps {
  sentiment: "positive" | "negative" | "neutral";
  className?: string;
}

export function SentimentDot({ sentiment, className }: SentimentDotProps) {
  return (
    <span
      className={cn(
        "inline-block w-2.5 h-2.5 rounded-full",
        {
          "bg-sentiment-positive": sentiment === "positive",
          "bg-sentiment-negative": sentiment === "negative",
          "bg-sentiment-neutral": sentiment === "neutral",
        },
        className
      )}
    />
  );
}
