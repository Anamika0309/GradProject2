"use client";

import { useRun } from "@/context/RunContext";
import { useState } from "react";
import { ChevronDown, ChevronUp, Quote, BarChart2, Users, CheckCircle, BookOpen } from "lucide-react";

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : pct >= 75 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-rose-400 bg-rose-500/10 border-rose-500/20";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {pct}% confidence
    </span>
  );
}

function FindingCard({ finding, index }: { finding: ReturnType<typeof useRun>["data"]["findings"][0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasQuotes = finding.key_quotes && finding.key_quotes.length > 0;

  return (
    <div className={`rounded-xl bg-blinkit-card border transition-all duration-200 ${expanded ? "border-blinkit-green/30" : "border-blinkit-border"} card-hover fade-in`}
      style={{ animationDelay: `${index * 60}ms` }}>
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blinkit-green/10 text-blinkit-green border border-blinkit-green/20 uppercase tracking-wider">
              {finding.question_id}
            </span>
            {finding.confidence != null && <ConfidenceBadge value={finding.confidence} />}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blinkit-muted shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>{finding.supporting_review_count ?? 0} supporting reviews</span>
          </div>
        </div>

        {/* Question */}
        <p className="text-[11px] text-blinkit-muted uppercase tracking-wider font-medium mb-1.5">Research Question</p>
        <h3 className="text-sm font-semibold text-foreground mb-3 leading-snug">{finding.question_text}</h3>

        {/* Answer */}
        <div className="p-4 rounded-lg bg-blinkit-surface border border-blinkit-border">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-3.5 h-3.5 text-blinkit-green" />
            <p className="text-[10px] text-blinkit-muted font-medium uppercase tracking-wider">AI Finding</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{finding.answer}</p>
        </div>
      </div>

      {/* Expand/collapse quotes */}
      <button
        onClick={() => setExpanded(!expanded)}
        disabled={!hasQuotes}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-blinkit-border text-xs text-blinkit-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-1.5">
          <Quote className="w-3.5 h-3.5" />
          User Quotes ({finding.key_quotes?.length ?? 0})
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && hasQuotes && (
        <div className="px-5 pb-5 space-y-2 fade-in">
          {finding.key_quotes.map((q, i) => (
            <div key={i} className="p-3 rounded-lg bg-blinkit-surface border-l-2 border-blinkit-green">
              <p className="text-xs text-foreground leading-relaxed italic">&ldquo;{q}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvidenceBreakdownPage() {
  const { data } = useRun();
  const findings = data.findings ?? [];

  const totalQuotes = findings.reduce((acc, f) => acc + (f.key_quotes?.length ?? 0), 0);
  const avgConfidence = findings.length > 0
    ? Math.round((findings.reduce((acc, f) => acc + (f.confidence ?? 0), 0) / findings.length) * 100)
    : 0;
  const totalReviews = findings.reduce((acc, f) => acc + (f.supporting_review_count ?? 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Evidence <span className="gradient-text">Breakdown</span>
        </h1>
        <p className="text-blinkit-muted text-sm">
          AI-synthesised findings from user review analysis — each backed by direct user evidence
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Research Questions", value: findings.length, icon: BookOpen, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { label: "User Quotes", value: totalQuotes, icon: Quote, color: "text-blinkit-green bg-blinkit-green/10 border-blinkit-green/20" },
          { label: "Supporting Reviews", value: totalReviews, icon: Users, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
          { label: "Avg. Confidence", value: `${avgConfidence}%`, icon: BarChart2, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-xl bg-blinkit-card border border-blinkit-border card-hover">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-blinkit-muted uppercase tracking-wider">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Findings list */}
      {findings.length === 0 ? (
        <div className="text-center py-20 text-blinkit-muted">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No findings available for this run.</p>
          <p className="text-xs mt-1 opacity-60">Run the pipeline to generate AI findings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {findings.map((f, i) => <FindingCard key={f.id} finding={f} index={i} />)}
        </div>
      )}
    </div>
  );
}
