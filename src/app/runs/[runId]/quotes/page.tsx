"use client";

import { useRun } from "@/context/RunContext";
import { useState, useMemo } from "react";
import { Quote, Search, Filter, ChevronDown, Star, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

type SentimentFilter = "all" | "positive" | "negative" | "neutral";

// Flatten all key_quotes from findings into a rich quote list
function buildQuoteList(data: ReturnType<typeof useRun>["data"]) {
  const quotes: Array<{
    id: string;
    text: string;
    source: string;
    confidence: number;
    questionText: string;
    questionId: string;
  }> = [];

  data.findings.forEach((f) => {
    (f.key_quotes ?? []).forEach((q, i) => {
      quotes.push({
        id: `${f.id}-${i}`,
        text: q,
        source: "User Review",
        confidence: f.confidence,
        questionText: f.question_text,
        questionId: f.question_id,
      });
    });
  });

  return quotes;
}

// Infer rough sentiment from quote text
function inferSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const negativeWords = ["didn't", "don't", "never", "not", "can't", "hard", "bad", "fail", "wrong", "cheat", "lie", "frustrated", "slow", "worse"];
  const positiveWords = ["great", "love", "amazing", "excellent", "happy", "best", "helpful", "perfect", "good", "nice"];
  const negScore = negativeWords.filter((w) => lower.includes(w)).length;
  const posScore = positiveWords.filter((w) => lower.includes(w)).length;
  if (negScore > posScore) return "negative";
  if (posScore > negScore) return "positive";
  return "neutral";
}

function SentimentIcon({ sentiment }: { sentiment: "positive" | "negative" | "neutral" }) {
  if (sentiment === "positive") return <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (sentiment === "negative") return <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />;
  return <Minus className="w-3.5 h-3.5 text-amber-400" />;
}

function QuoteCard({ quote, index }: {
  quote: ReturnType<typeof buildQuoteList>[0] & { sentiment: "positive" | "negative" | "neutral" };
  index: number;
}) {
  const sentimentStyle = {
    positive: "border-l-emerald-500",
    negative: "border-l-rose-500",
    neutral: "border-l-amber-500",
  }[quote.sentiment];

  const confPct = Math.round(quote.confidence * 100);

  return (
    <div
      className={`p-4 rounded-xl bg-blinkit-card border border-blinkit-border card-hover fade-in border-l-2 ${sentimentStyle}`}
      style={{ animationDelay: `${(index % 12) * 50}ms` }}
    >
      {/* Badge row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blinkit-green/10 text-blinkit-green border border-blinkit-green/20 uppercase tracking-wider">
          {quote.questionId}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-blinkit-muted">
          <SentimentIcon sentiment={quote.sentiment} />
          <span className="capitalize">{quote.sentiment}</span>
        </span>
        <span className="ml-auto text-[10px] text-blinkit-muted">{confPct}% confidence</span>
      </div>

      {/* Quote text */}
      <div className="flex gap-2">
        <Quote className="w-4 h-4 text-blinkit-green/40 shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed italic">{quote.text}</p>
      </div>

      {/* Research question context */}
      <p className="text-[10px] text-blinkit-muted mt-3 pl-6 leading-relaxed opacity-70">
        Re: {quote.questionText}
      </p>
    </div>
  );
}

export default function QuoteExplorerPage() {
  const { data } = useRun();
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [questionFilter, setQuestionFilter] = useState("all");

  const rawQuotes = useMemo(() => buildQuoteList(data), [data]);

  // Attach sentiment to each quote
  const quotesWithSentiment = useMemo(
    () => rawQuotes.map((q) => ({ ...q, sentiment: inferSentiment(q.text) as "positive" | "negative" | "neutral" })),
    [rawQuotes]
  );

  // Unique question IDs for filter
  const questionIds = useMemo(() => {
    const ids = [...new Set(rawQuotes.map((q) => q.questionId))];
    return ids;
  }, [rawQuotes]);

  // Apply filters
  const filtered = useMemo(() => {
    return quotesWithSentiment.filter((q) => {
      const matchesSearch = search === "" || q.text.toLowerCase().includes(search.toLowerCase());
      const matchesSentiment = sentimentFilter === "all" || q.sentiment === sentimentFilter;
      const matchesQuestion = questionFilter === "all" || q.questionId === questionFilter;
      return matchesSearch && matchesSentiment && matchesQuestion;
    });
  }, [quotesWithSentiment, search, sentimentFilter, questionFilter]);

  const positiveCount = quotesWithSentiment.filter((q) => q.sentiment === "positive").length;
  const negativeCount = quotesWithSentiment.filter((q) => q.sentiment === "negative").length;
  const neutralCount = quotesWithSentiment.filter((q) => q.sentiment === "neutral").length;

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Quote <span className="gradient-text">Explorer</span>
        </h1>
        <p className="text-blinkit-muted text-sm">
          Direct user voices — every quote extracted from real reviews backing the research findings
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: `${quotesWithSentiment.length} total quotes`, color: "bg-blinkit-card border-blinkit-border text-foreground" },
          { label: `${positiveCount} positive`, color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
          { label: `${negativeCount} negative`, color: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
          { label: `${neutralCount} neutral`, color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
        ].map((pill) => (
          <div key={pill.label} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium ${pill.color}`}>
            <Star className="w-3 h-3 opacity-60" />
            {pill.label}
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl bg-blinkit-card border border-blinkit-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blinkit-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotes…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-blinkit-surface border border-blinkit-border rounded-lg text-foreground placeholder:text-blinkit-muted focus:outline-none focus:border-blinkit-green/50 transition-colors"
          />
        </div>

        {/* Sentiment filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blinkit-muted" />
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value as SentimentFilter)}
            className="pl-9 pr-8 py-2 text-sm bg-blinkit-surface border border-blinkit-border rounded-lg text-foreground focus:outline-none focus:border-blinkit-green/50 appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-blinkit-muted pointer-events-none" />
        </div>

        {/* Question filter */}
        <div className="relative">
          <select
            value={questionFilter}
            onChange={(e) => setQuestionFilter(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm bg-blinkit-surface border border-blinkit-border rounded-lg text-foreground focus:outline-none focus:border-blinkit-green/50 appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All questions</option>
            {questionIds.map((id) => (
              <option key={id} value={id}>{id.toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-blinkit-muted pointer-events-none" />
        </div>

        <span className="ml-auto self-center text-xs text-blinkit-muted">
          {filtered.length} of {quotesWithSentiment.length} quotes
        </span>
      </div>

      {/* Quote grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-blinkit-muted">
          <Quote className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No quotes match your filters.</p>
          <button onClick={() => { setSearch(""); setSentimentFilter("all"); setQuestionFilter("all"); }}
            className="mt-3 text-xs text-blinkit-green hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((q, i) => <QuoteCard key={q.id} quote={q} index={i} />)}
        </div>
      )}
    </div>
  );
}
