"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";
import { Play, Apple, MessageCircle, PlayCircle, Loader2 } from "lucide-react";

const PIPELINE_STEPS = [
  { key: "starting",              label: "Initialising" },
  { key: "fetching",              label: "Fetching Reviews" },
  { key: "cleaning",              label: "Cleaning & Dedup" },
  { key: "classifying",           label: "AI Classification" },
  { key: "clustering",            label: "Theme Clustering" },
  { key: "generating insights",   label: "Insight Generation" },
  { key: "scoring opportunities", label: "Opportunity Scoring" },
  { key: "vectorizing",           label: "Vector Indexing" },
  { key: "complete",              label: "Complete ✓" },
];

function progressWidth(status: string): string {
  const map: Record<string, string> = {
    starting:              "w-[8%]",
    fetching:              "w-[20%]",
    cleaning:              "w-[35%]",
    classifying:           "w-[50%]",
    clustering:            "w-[65%]",
    "generating insights": "w-[78%]",
    "scoring opportunities": "w-[88%]",
    vectorizing:           "w-[95%]",
    complete:              "w-full",
  };
  return map[status] ?? "w-0";
}

export function LiveFetchPanel() {
  const router = useRouter();

  const [sources, setSources] = useState({
    play_store: true,
    app_store: false,
    reddit: true,
  });
  const [fetchCount, setFetchCount] = useState(1500);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [runId, setRunId]   = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [stats,  setStats]  = useState({ scraped: 0, analyzed: 0, discovery: 0 });

  // Poll run status every 2 s while a run is active
  useEffect(() => {
    if (!runId || status === "complete" || status === "error") return;

    const interval = setInterval(async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/runs/${runId}/status`);
        const data = await res.json();
        setStatus(data.status);
        setStats({
          scraped:   data.total_scraped   || 0,
          analyzed:  data.total_analyzed  || 0,
          discovery: data.discovery_related || 0,
        });
        if (data.status === "complete") {
          router.push(`/runs/${runId}/overview`);
        }
      } catch (e) {
        console.error("Failed to poll status:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [runId, status, router]);

  const handleStartRun = async () => {
    const activeSources = Object.entries(sources)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (activeSources.length === 0) {
      setErrorMessage("Please select at least one source before starting ingestion.");
      return;
    }
    setErrorMessage(null);
    setStatus("starting");
    setStats({ scraped: 0, analyzed: 0, discovery: 0 });

    try {
      const res  = await fetch(`${API_BASE}/api/runs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources:        activeSources,
          keyword_filter: keywordFilter,
          fetch_count:    fetchCount,
        }),
      });
      const data = await res.json();
      if (!data.run_id) throw new Error("No run ID returned from backend.");
      setRunId(data.run_id);
      // Stay on this page — auto-redirect fires when status === "complete"
    } catch (e) {
      console.error(e);
      setStatus("error");
      setErrorMessage("Failed to start ingestion. Make sure the backend is running and reachable.");
    }
  };

  const handleReset = () => {
    setRunId(null);
    setStatus("idle");
    setStats({ scraped: 0, analyzed: 0, discovery: 0 });
    setErrorMessage(null);
  };

  const isIdle = status === "idle" || status === "error";
  const currentStepIdx = PIPELINE_STEPS.findIndex(s => s.key === status);

  return (
    <div className="bg-blinkit-card border border-blinkit-border rounded-xl p-6 max-w-4xl">
      <h2 className="text-xl font-bold text-foreground mb-6">Start New Research Run</h2>

      {/* ── Config form (hidden while pipeline is running) ── */}
      {isIdle && (
        <>
          <div className="grid grid-cols-2 gap-10 mb-8">
            {/* Sources */}
            <div>
              <h3 className="text-sm font-semibold text-blinkit-muted mb-3">Data Sources</h3>
              <p className="text-xs text-blinkit-muted mb-4">
                Play Store, App Store and Reddit are supported by the ingestion pipeline.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={sources.play_store}
                    onChange={e => setSources(s => ({ ...s, play_store: e.target.checked }))}
                    className="accent-blinkit-green w-4 h-4" />
                  <Play className="w-4 h-4 text-blinkit-muted" />
                  <span className="text-sm text-foreground">Play Store</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={sources.app_store}
                    onChange={e => setSources(s => ({ ...s, app_store: e.target.checked }))}
                    className="accent-blinkit-green w-4 h-4" />
                  <Apple className="w-4 h-4 text-blinkit-muted" />
                  <span className="text-sm text-foreground">App Store</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={sources.reddit}
                    onChange={e => setSources(s => ({ ...s, reddit: e.target.checked }))}
                    className="accent-blinkit-green w-4 h-4" />
                  <MessageCircle className="w-4 h-4 text-blinkit-muted" />
                  <span className="text-sm text-foreground">Reddit</span>
                </label>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-blinkit-muted mb-2">Keywords (optional)</h3>
                <input
                  type="text"
                  placeholder="Leave blank to scrape broadly"
                  value={keywordFilter}
                  onChange={e => setKeywordFilter(e.target.value)}
                  className="w-full bg-blinkit-surface border border-blinkit-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-blinkit-green"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blinkit-muted mb-1">
                  Fetch Limit&nbsp;
                  <span className="text-blinkit-green font-bold">(per source)</span>
                </h3>
                <input
                  type="number"
                  min={100}
                  max={5000}
                  step={100}
                  value={fetchCount}
                  onChange={e => setFetchCount(Number(e.target.value))}
                  className="w-full bg-blinkit-surface border border-blinkit-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-blinkit-green"
                />
                <p className="text-xs text-blinkit-muted mt-2">
                  Expected raw reviews:&nbsp;
                  {fetchCount} × {Object.values(sources).filter(Boolean).length} source(s) =&nbsp;
                  <span className="text-blinkit-green font-semibold">
                    {fetchCount * Object.values(sources).filter(Boolean).length}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleStartRun}
            className="w-full flex items-center justify-center gap-2 bg-blinkit-green hover:bg-blinkit-green/90 text-white font-semibold py-3 rounded-md transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            Start Data Ingestion
          </button>
        </>
      )}

      {/* ── Pipeline progress tracker ── */}
      {!isIdle && (
        <div className="space-y-6 fade-in">
          {/* Step pills */}
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STEPS.map((step, i) => (
              <span
                key={step.key}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all duration-300",
                  i < currentStepIdx
                    ? "bg-blinkit-green/10 text-blinkit-green border-blinkit-green/20"
                    : i === currentStepIdx
                    ? "bg-blinkit-green text-white border-blinkit-green shadow-sm"
                    : "bg-blinkit-surface text-blinkit-muted border-blinkit-border"
                )}
              >
                {step.label}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-blinkit-muted mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                {status !== "complete" && (
                  <Loader2 className="w-3.5 h-3.5 text-blinkit-green animate-spin" />
                )}
                <span className="capitalize">{status}</span>
              </span>
            </div>
            <div className="h-2.5 w-full bg-blinkit-surface rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-blinkit-green rounded-full transition-all duration-700",
                  progressWidth(status)
                )}
              />
            </div>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blinkit-surface py-4 rounded-lg border border-blinkit-border">
              <div className="text-2xl font-bold text-foreground">{stats.scraped}</div>
              <div className="text-xs text-blinkit-muted mt-1">Raw Scraped</div>
            </div>
            <div className="bg-blinkit-surface py-4 rounded-lg border border-blinkit-border">
              <div className="text-2xl font-bold text-foreground">{stats.analyzed}</div>
              <div className="text-xs text-blinkit-muted mt-1">Unique & Clean</div>
            </div>
            <div className="bg-blinkit-surface py-4 rounded-lg border border-blinkit-border">
              <div className="text-2xl font-bold text-blinkit-green">{stats.discovery}</div>
              <div className="text-xs text-blinkit-muted mt-1">Discovery Related</div>
            </div>
          </div>

          {/* Footer message */}
          {status === "complete" ? (
            <p className="text-center text-sm text-blinkit-green font-semibold">
              ✓ Pipeline complete — redirecting to dashboard…
            </p>
          ) : status === "error" ? (
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-md border border-blinkit-border text-blinkit-muted hover:text-foreground text-sm transition-colors"
            >
              ← Start a new run
            </button>
          ) : (
            <p className="text-center text-xs text-blinkit-muted">
              You will be redirected automatically when the full pipeline finishes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
