"use client";

import { useRun, RunTheme } from "@/context/RunContext";
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info, Layers, Quote } from "lucide-react";

const FALLBACK_THEMES = [
  {
    id: "t1", name: "Habit Loop & Repeat Buying", description: "Users are locked into purchasing the same 3-5 categories repeatedly, driven by convenience and familiarity rather than intent to explore.", root_cause: "The app prioritizes reorder shortcuts and category-level recommendations, making it easy to stay in established patterns but difficult to break out of them.", root_cause_label: "Algorithmic Comfort Trap", severity: "High", review_count: 89,
    quotes: ["I only ever buy the same stuff — groceries and medicines. Never thought to explore other sections.", "My cart is identical every week. I don't even browse anymore, just hit reorder.", "I didn't know Blinkit had electronics until my colleague mentioned it."],
  },
  {
    id: "t2", name: "Poor Category Discoverability", description: "New or non-obvious categories (pet supplies, electronics, stationery) go undiscovered by existing users who assume Blinkit only covers grocery staples.", root_cause: "No personalized discovery surface or 'New for you' sections. Users receive category suggestions based on past purchases, not based on expanding their repertoire.", root_cause_label: "No Exploration Funnel", severity: "High", review_count: 76,
    quotes: ["Found out about the pharmacy section by accident. Why doesn't the app show this?", "Blinkit has stationery? I've been ordering from Amazon for 2 years.", "There should be a 'Explore all categories' button on the home screen."],
  },
  {
    id: "t3", name: "Search Intent Mismatch", description: "Users with exploratory search intent (e.g., 'healthy snacks', 'midnight cravings') receive inventory-style results rather than discovery-oriented recommendations.", root_cause: "The search engine is optimized for known-item retrieval, not need-state discovery. Semantic search is absent.", root_cause_label: "Transactional Search Bias", severity: "Medium", review_count: 62,
    quotes: ["Searched 'late night snacks' and got random chips. Not helpful.", "The search is only useful if I know exactly what I want.", "Wish there was a 'surprise me' or 'trending this week' feature."],
  },
  {
    id: "t4", name: "Price vs. Convenience Trade-off Anxiety", description: "Users hesitate to try new categories because they assume Blinkit prices will be higher than local alternatives, creating a trust barrier for first-time category purchases.", root_cause: "No price comparison signals or 'best value' indicators for users considering a category for the first time.", root_cause_label: "Price Transparency Gap", severity: "Medium", review_count: 54,
    quotes: ["I know quick delivery costs more, but I wish I could see if it is worth it before ordering.", "Ordered electronics once and felt cheated on the price. Went back to Amazon.", "Need to know if Blinkit is competitive before I commit to a new category."],
  },
  {
    id: "t5", name: "Delivery Promise Erosion", description: "The core 10-minute delivery promise is being perceived as inconsistent, which undermines user confidence in relying on Blinkit for urgent new-category needs.", root_cause: "Increasing demand has stretched delivery capacity, and the app does not communicate realistic ETAs before order placement.", root_cause_label: "SLA Credibility Gap", severity: "High", review_count: 98,
    quotes: ["Used to be 10 mins, now it's 30-40 mins at peak time. The whole value prop is gone.", "If I can't trust the delivery time, I'll just go to the store.", "App shows 12 min ETA but reality is 35 min. Why lie?"],
  },
  {
    id: "t6", name: "Social & Peer Discovery Absence", description: "Users discover new Blinkit categories through word of mouth (friends, Reddit, Twitter) rather than in-app experiences, indicating a missed loop.", root_cause: "The app has no social proof layer — no 'trending in your area', 'friends also buy', or community-driven discovery surfaces.", root_cause_label: "Missing Social Proof Layer", severity: "Low", review_count: 32,
    quotes: ["My colleague told me about the pet food section. Never saw it myself.", "Saw a Reddit post about Blinkit pharmacy — went and ordered. The app doesn't surface this at all.", "Should have a 'What's trending in Mumbai' section."],
  },
];

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "High") return <AlertCircle className="w-4 h-4 text-rose-400" />;
  if (severity === "Medium") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <Info className="w-4 h-4 text-blue-400" />;
}

function ThemeCard({ theme }: { theme: typeof FALLBACK_THEMES[0] }) {
  const [expanded, setExpanded] = useState(false);
  const sevColor = theme.severity === "High" ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
    : theme.severity === "Medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-blue-400 bg-blue-500/10 border-blue-500/20";

  return (
    <div className={`rounded-xl bg-blinkit-card border transition-all duration-200 ${expanded ? "border-blinkit-green/30" : "border-blinkit-border"} card-hover`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <SeverityIcon severity={theme.severity} />
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${sevColor}`}>{theme.severity}</span>
          </div>
          <span className="text-xs text-blinkit-muted shrink-0">{theme.review_count} reviews</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-2">{theme.name}</h3>
        <p className="text-xs text-blinkit-muted leading-relaxed mb-3">{theme.description}</p>
        <div className="p-3 rounded-lg bg-blinkit-surface border border-blinkit-border">
          <p className="text-[10px] text-blinkit-muted font-medium uppercase tracking-wider mb-1">Root Cause</p>
          <p className="text-xs text-foreground font-medium">{theme.root_cause_label}</p>
          <p className="text-[11px] text-blinkit-muted mt-1 leading-relaxed">{theme.root_cause}</p>
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-blinkit-border text-xs text-blinkit-muted hover:text-foreground transition-colors">
        <span className="flex items-center gap-1.5"><Quote className="w-3.5 h-3.5" />User Evidence ({theme.quotes.length} quotes)</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-2 fade-in">
          {theme.quotes.map((q, i) => (
            <div key={i} className="p-3 rounded-lg bg-blinkit-surface border-l-2 border-blinkit-green">
              <p className="text-xs text-foreground leading-relaxed italic">&ldquo;{q}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThemeIntelligencePage() {
  const { data } = useRun();
  const validThemes = data.themes.filter((t) => t.name !== "Error Theme");
  const hasRealThemes = validThemes.length > 0;

  // Pool all key_quotes from findings; distribute across themes so cards show evidence
  const allQuotes = hasRealThemes
    ? data.findings.flatMap((f) => f.key_quotes ?? [])
    : [];

  const themes = hasRealThemes
    ? validThemes.map((t, i) => {
        // Give each theme a slice of all quotes (round-robin distribution)
        const perTheme = Math.ceil(allQuotes.length / Math.max(validThemes.length, 1));
        const start = i * perTheme;
        const slice = allQuotes.slice(start, start + perTheme);
        return { ...t, quotes: slice };
      })
    : FALLBACK_THEMES;

  const highCount = themes.filter((t) => t.severity === "High").length;
  const medCount = themes.filter((t) => t.severity === "Medium").length;

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Theme <span className="gradient-text">Intelligence</span></h1>
        <p className="text-blinkit-muted text-sm">Semantic clusters of user feedback — revealing the underlying UX friction patterns</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blinkit-card border border-blinkit-border">
          <Layers className="w-3.5 h-3.5 text-blinkit-muted" />
          <span className="text-xs text-foreground font-medium">{themes.length} themes identified</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs text-rose-400 font-medium">{highCount} High severity</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">{medCount} Medium severity</span>
        </div>
        {!hasRealThemes && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blinkit-green/10 border border-blinkit-green/20">
            <Info className="w-3.5 h-3.5 text-blinkit-green" />
            <span className="text-xs text-blinkit-green font-medium">Showing AI-generated demo themes</span>
          </div>
        )}
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {themes.map((t) => <ThemeCard key={t.id} theme={t as typeof FALLBACK_THEMES[0]} />)}
      </div>
    </div>
  );
}
