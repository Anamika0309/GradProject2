"use client";

import { useRun } from "@/context/RunContext";
import { MessageSquare, TrendingUp, AlertTriangle, Search, ThumbsUp, Layers, Star, Clock } from "lucide-react";

function MetricCard({ title, value, subtitle, icon: Icon, color = "green" }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; color?: "green" | "red" | "amber" | "blue";
}) {
  const colors = {
    green: "text-blinkit-green bg-blinkit-green/10 border-blinkit-green/20",
    red: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };
  return (
    <div className="p-5 rounded-xl bg-blinkit-card border border-blinkit-border card-hover fade-in">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-blinkit-muted uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      {subtitle && <p className="text-xs text-blinkit-muted">{subtitle}</p>}
    </div>
  );
}

function SourceBadge({ source, count, pct }: { source: string; count: number; pct: number }) {
  const colorMap: Record<string, string> = {
    "play_store": "bg-blinkit-green/10 text-blinkit-green border-blinkit-green/20",
    "app_store": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "reddit": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "community_forum": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "social_media": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };
  const label: Record<string, string> = {
    play_store: "Play Store", app_store: "App Store", reddit: "Reddit",
    community_forum: "Community Forum", social_media: "Social Media",
  };
  const cls = colorMap[source] || "bg-blinkit-surface text-blinkit-muted border-blinkit-border";
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-blinkit-surface border border-blinkit-border">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cls}`}>{label[source] || source}</span>
        <span className="text-sm font-semibold text-foreground">{count}</span>
        <span className="text-xs text-blinkit-muted">reviews</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-blinkit-border rounded-full overflow-hidden">
          <div className="h-full bg-blinkit-green rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-blinkit-muted w-8 text-right">{pct}%</span>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { data } = useRun();
  const sc = data.source_counts;
  const total = sc.analyzed || sc.scraped || 0;
  const discoveryPct = total > 0 ? Math.round((sc.discovery_related / total) * 100) : 0;
  const negativePct = total > 0 ? Math.round((data.metrics.negative_reviews / total) * 100) : 0;
  const positivePct = total > 0 ? Math.round((data.metrics.positive_reviews / total) * 100) : 0;
  const avgSentiment = positivePct - negativePct;
  const createdDate = new Date(data.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Source breakdown mock for demo (replace with real data when available)
  const sourceCounts: Record<string, number> = { play_store: Math.round(total * 0.45), app_store: Math.round(total * 0.2), reddit: Math.round(total * 0.2), community_forum: Math.round(total * 0.1), social_media: Math.round(total * 0.05) };

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-blinkit-muted mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Analysis completed · {createdDate}</span>
          <span className="px-2 py-0.5 rounded-full bg-blinkit-green/10 text-blinkit-green border border-blinkit-green/20 text-[10px] font-medium ml-1">{data.status}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Research <span className="gradient-text">Overview</span>
        </h1>
        <p className="text-blinkit-muted text-sm">
          AI-powered analysis of Blinkit user reviews — uncovering discovery barriers & shopping behavior patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Reviews" value={total.toLocaleString()} subtitle="Scraped & cleaned" icon={MessageSquare} color="blue" />
        <MetricCard title="Discovery-Related" value={sc.discovery_related} subtitle={`${discoveryPct}% of corpus`} icon={Search} color="green" />
        <MetricCard title="Themes Identified" value={data.themes.length} subtitle="Semantic clusters" icon={Layers} color="amber" />
        <MetricCard title="Avg. Sentiment" value={`${avgSentiment > 0 ? "+" : ""}${avgSentiment}%`} subtitle="Net sentiment score" icon={avgSentiment >= 0 ? ThumbsUp : AlertTriangle} color={avgSentiment >= 0 ? "green" : "red"} />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Breakdown */}
        <div className="p-6 rounded-xl bg-blinkit-card border border-blinkit-border">
          <h2 className="text-sm font-semibold text-foreground mb-1">Sentiment Distribution</h2>
          <p className="text-xs text-blinkit-muted mb-5">How users feel about their Blinkit experience</p>
          <div className="space-y-4">
            {[
              { label: "Positive", pct: positivePct, color: "bg-emerald-500", textColor: "text-emerald-400" },
              { label: "Neutral", pct: 100 - positivePct - negativePct, color: "bg-amber-500", textColor: "text-amber-400" },
              { label: "Negative", pct: negativePct, color: "bg-rose-500", textColor: "text-rose-400" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={s.textColor + " font-medium"}>{s.label}</span>
                  <span className="text-blinkit-muted">{Math.max(0, s.pct)}%</span>
                </div>
                <div className="h-2 bg-blinkit-surface rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${Math.max(0, s.pct)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="p-6 rounded-xl bg-blinkit-card border border-blinkit-border">
          <h2 className="text-sm font-semibold text-foreground mb-1">Data Sources</h2>
          <p className="text-xs text-blinkit-muted mb-5">Review coverage across platforms</p>
          <div className="space-y-2">
            {Object.entries(sourceCounts).filter(([, c]) => c > 0).map(([src, count]) => (
              <SourceBadge key={src} source={src} count={count} pct={total > 0 ? Math.round((count / total) * 100) : 0} />
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="p-6 rounded-xl bg-blinkit-card border border-blinkit-border">
        <h2 className="text-sm font-semibold text-foreground mb-1">Pipeline Summary</h2>
        <p className="text-xs text-blinkit-muted mb-5">Data flow from raw reviews to actionable insights</p>
        <div className="flex items-center gap-0">
          {[
            { label: "Scraped", value: sc.scraped, color: "bg-blue-500" },
            { label: "Cleaned", value: sc.analyzed, color: "bg-amber-500" },
            { label: "Discovery", value: sc.discovery_related, color: "bg-blinkit-green" },
            { label: "Themes", value: data.themes.length, color: "bg-purple-500" },
            { label: "Findings", value: data.findings.length, color: "bg-rose-500" },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white font-bold text-sm">{step.value}</span>
                </div>
                <p className="text-[10px] text-blinkit-muted whitespace-nowrap">{step.label}</p>
              </div>
              {i < 4 && <div className="w-12 h-px bg-blinkit-border mx-1 mb-5" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
