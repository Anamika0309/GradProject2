import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteCard } from "./QuoteCard";

interface FindingCardProps {
  questionId: string;
  questionText: string;
  answer: string;
  confidence: number;
  reviewCount: number;
  quotes: string[];
}

export function FindingCard({
  questionId,
  questionText,
  answer,
  confidence,
  reviewCount,
  quotes,
}: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Confidence color mapping
  let confColor = "text-sentiment-positive";
  let confBadge = "bg-sentiment-positive/10 text-sentiment-positive border-sentiment-positive/20";
  if (confidence < 0.7) {
    confColor = "text-sentiment-neutral";
    confBadge = "bg-sentiment-neutral/10 text-sentiment-neutral border-sentiment-neutral/20";
  }
  if (confidence < 0.5) {
    confColor = "text-sentiment-negative";
    confBadge = "bg-sentiment-negative/10 text-sentiment-negative border-sentiment-negative/20";
  }

  return (
    <div className="bg-blinkit-card border border-blinkit-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary font-bold px-2 py-1 rounded">
              {questionId}
            </div>
            <h3 className="text-lg font-semibold">{questionText}</h3>
          </div>
          <div className={cn("px-2 py-1 rounded text-xs font-semibold border", confBadge)}>
            {Math.round(confidence * 100)}% Confidence
          </div>
        </div>

        <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm mb-6">
          {answer}
        </p>

        <div className="flex items-center justify-between border-t border-blinkit-border pt-4">
          <div className="flex items-center gap-2 text-sm text-blinkit-muted">
            <FileText size={16} />
            <span>Based on {reviewCount} reviews</span>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            {expanded ? "Hide Evidence" : "View Evidence"}
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && quotes.length > 0 && (
        <div className="bg-background p-6 border-t border-blinkit-border">
          <h4 className="text-sm font-semibold mb-4 text-blinkit-muted">Synthesized Evidence</h4>
          <div className="grid grid-cols-1 gap-4">
            {quotes.map((quote, i) => (
              <div key={i} className="bg-blinkit-card p-4 rounded-lg border border-blinkit-border italic text-sm border-l-4 border-l-primary">
                &quot;{quote}&quot;
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
