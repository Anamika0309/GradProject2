"use client";

import { useRun } from "@/context/RunContext";
import { useState } from "react";
import { Filter, Search, BarChart2, TrendingUp } from "lucide-react";

const SOURCES = ["All Sources", "Play Store", "App Store", "Reddit", "Community Forums", "Social Media", "Product Reviews", "Quick-commerce Discussions"];
const SENTIMENTS = ["All Sentiments", "Positive", "Neutral", "Negative"];

const SAMPLE_REVIEWS = [
  { source: "Play Store", sentiment: "negative", theme: "Delivery", date: "Jul 2026", text: "Delivery is getting slower every week. Used to be 10 mins now it takes 30+. The whole promise is broken." },
  { source: "Reddit", sentiment: "positive", theme: "Category Discovery", date: "Jun 2026", text: "Just discovered Blinkit has a pet food section — ordered for the first time and delivery was super fast! Why isn't this promoted more?" },
  { source: "App Store", sentiment: "neutral", theme: "Search", date: "Jun 2026", text: "The search works but the suggestions could be smarter. I type 'oat' and get random results before oat milk." },
  { source: "Play Store", sentiment: "negative", theme: "Pricing", date: "May 2026", text: "Prices are higher than local stores. The convenience premium is fine but not when delivery is also delayed." },
  { source: "Community Forums", sentiment: "positive", theme: "New Categories", date: "Jul 2026", text: "They added a pharmacy section and it is actually useful. Ordered medicines at midnight and got it in 18 mins." },
  { source: "Social Media", sentiment: "negative", theme: "App UX", date: "Jun 2026", text: "The app pushes same categories every time. I want to explore but there is no way to browse new things easily." },
  { source: "Reddit", sentiment: "neutral", theme: "Category Discovery", date: "May 2026", text: "I only shop groceries on Blinkit. Did not know they had electronics accessories until a friend told me. Discovery is terrible." },
  { source: "Play Store", sentiment: "positive", theme: "Delivery", date: "Jul 2026", text: "8 minute delivery is insane. My kids needed a fever medicine at 2am and it was here before the paracetamol even kicked in." },
];

const CATEGORY_DATA = [
  { category: "Delivery Speed", mentions: 142, pct: 68 },
  { category: "Category Discovery", mentions: 98, pct: 47 },
  { category: "Search & Browse UX", mentions: 87, pct: 42 },
  { category: "Pricing & Value", mentions: 76, pct: 36 },
  { category: "App Navigation", mentions: 63, pct: 30 },
  { category: "New Category Awareness", mentions: 54, pct: 26 },
  { category: "Product Availability", mentions: 45, pct: 21 },
  { category: "Habitual Repurchase", mentions: 38, pct: 18 },
];

export default function AnalyticsPage() {
  const { data } = useRun();
  const [source, setSource] = useState("All Sources");
  const [sentiment, setSentiment] = useState("All Sentiments");
  const [search, setSearch] = useState("");

  const total = data.source_counts.analyzed || data.source_counts.scraped || 0;

  const filtered = SAMPLE_REVIEWS.filter((r) => {
    const matchSource = source === "All Sources" || r.source.toLowerCase() === source.toLowerCase().replace(" ", "_");
    const matchSentiment = sentiment === "All Sentiments" || r.sentiment === sentiment.toLowerCase();
    const matchSearch = !search || r.text.toLowerCase().includes(search.toLowerCase()) || r.theme.toLowerCase().includes(search.toLowerCase());
    return matchSource && matchSentiment && matchSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Analytics <span className="gradient-text">Deep-Dive</span></h1>
        <p className="text-blinkit-muted text-sm">Filter and explore {total} reviews across sources, sentiment, and themes</p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blinkit-card border border-blinkit-border text-xs text-blinkit-muted">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>
        <select value={source} onChange={(e) => setSource(e.target.value)}
          className="px-3 py-2 rounded-lg bg-blinkit-card border border-blinkit-border text-xs text-foreground focus:outline-none focus:border-blinkit-green cursor-pointer">
          {SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={sentiment} onChange={(e) => setSentiment(e.target.value)}
          className="px-3 py-2 rounded-lg bg-blinkit-card border border-blinkit-border text-xs text-foreground focus:outline-none focus:border-blinkit-green cursor-pointer">
          {SENTIMENTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blinkit-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by keyword or theme..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-blinkit-card border border-blinkit-border text-xs text-foreground placeholder-blinkit-muted focus:outline-none focus:border-blinkit-green" />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category Frequency Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-blinkit-card border border-blinkit-border">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 text-blinkit-green" />
            <h2 className="text-sm font-semibold text-foreground">Topic Frequency</h2>
          </div>
          <p className="text-xs text-blinkit-muted mb-5">Most discussed categories</p>
          <div className="space-y-3">
            {CATEGORY_DATA.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blinkit-subtle truncate pr-2">{c.category}</span>
                  <span className="text-blinkit-muted shrink-0">{c.mentions}</span>
                </div>
                <div className="h-1.5 bg-blinkit-surface rounded-full overflow-hidden">
                  <div className="h-full bg-blinkit-green rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Review Feed <span className="text-blinkit-muted font-normal ml-1">({filtered.length} shown)</span>
            </h2>
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-blinkit-muted text-sm rounded-xl bg-blinkit-card border border-blinkit-border">
                No reviews match your filters.
              </div>
            ) : (
              filtered.map((r, i) => {
                const sentColor = r.sentiment === "positive" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : r.sentiment === "negative" ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20";
                return (
                  <div key={i} className="p-4 rounded-xl bg-blinkit-card border border-blinkit-border card-hover">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${sentColor}`}>{r.sentiment}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blinkit-surface border border-blinkit-border text-blinkit-muted">{r.source}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blinkit-surface border border-blinkit-border text-blinkit-muted">{r.theme}</span>
                      <span className="text-[10px] text-blinkit-muted ml-auto">{r.date}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
