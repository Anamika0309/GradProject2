"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";
import { Play, Apple, MessageCircle, PlayCircle, Loader2, ShoppingCart, Users, FileText, Keyboard } from "lucide-react";

export function LiveFetchPanel() {
  const [sources, setSources] = useState({
    play_store: true,
    app_store: false,
    reddit: true,
    social_media: false,
    product_reviews: false,
    forums: false,
    csv: false,
  });
  const [fetchCount, setFetchCount] = useState(2000);
  const [keywordFilter, setKeywordFilter] = useState("new category, explore, discover");
  
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [stats, setStats] = useState({ scraped: 0, analyzed: 0, discovery: 0 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (runId && status !== "complete" && status !== "error") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/runs/${runId}/status`);
          const data = await res.json();
          
          setStatus(data.status);
          setStats({
            scraped: data.total_scraped || 0,
            analyzed: data.total_analyzed || 0,
            discovery: data.discovery_related || 0
          });
        } catch (e) {
          console.error("Failed to poll status:", e);
        }
      }, 2000);
    }
    
    return () => clearInterval(interval);
  }, [runId, status]);

  const handleStartRun = async () => {
    setStatus("starting");
    setStats({ scraped: 0, analyzed: 0, discovery: 0 });
    
    const activeSources = Object.entries(sources).filter(([_, active]) => active).map(([key]) => key);
    
    try {
      const res = await fetch(`${API_BASE}/api/runs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: activeSources,
          keyword_filter: keywordFilter,
          fetch_count: fetchCount
        })
      });
      const data = await res.json();
      setRunId(data.run_id);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="bg-blinkit-card border border-blinkit-border rounded-xl p-6 max-w-4xl">
      <h2 className="text-xl font-bold text-foreground mb-6">Start New Research Run</h2>
      
      <div className="grid grid-cols-2 gap-10 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-blinkit-muted mb-4">Data Sources</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sources.play_store} onChange={e => setSources(s => ({...s, play_store: e.target.checked}))} className="accent-blinkit-green w-4 h-4" />
              <Play className="w-4 h-4 text-blinkit-muted" />
              <span className="text-sm text-foreground">Play Store</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sources.app_store} onChange={e => setSources(s => ({...s, app_store: e.target.checked}))} className="accent-blinkit-green w-4 h-4" />
              <Apple className="w-4 h-4 text-blinkit-muted" />
              <span className="text-sm text-foreground">App Store</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sources.reddit} onChange={e => setSources(s => ({...s, reddit: e.target.checked}))} className="accent-blinkit-green w-4 h-4" />
              <MessageCircle className="w-4 h-4 text-blinkit-muted" />
              <span className="text-sm text-foreground">Reddit</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sources.social_media} onChange={e => setSources({...sources, social_media: e.target.checked})} className="rounded text-primary focus:ring-primary bg-background border-blinkit-border" />
              <MessageCircle className="w-4 h-4 text-blinkit-muted" />
              <span className="text-sm text-foreground">Social Media</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sources.forums} onChange={e => setSources(s => ({...s, forums: e.target.checked}))} className="accent-blinkit-green w-4 h-4" />
              <Users className="w-4 h-4 text-blinkit-muted" />
              <span className="text-sm text-foreground">Forums</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sources.product_reviews} onChange={e => setSources(s => ({...s, product_reviews: e.target.checked}))} className="accent-blinkit-green w-4 h-4" />
              <ShoppingCart className="w-4 h-4 text-blinkit-muted" />
              <span className="text-sm text-foreground">Product Reviews</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sources.csv} onChange={e => setSources(s => ({...s, csv: e.target.checked}))} className="accent-blinkit-green w-4 h-4" />
              <FileText className="w-4 h-4 text-blinkit-muted" />
              <span className="text-sm text-foreground">CSV Upload</span>
            </label>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-blinkit-muted mb-2">Keywords (comma separated)</h3>
            <input 
              type="text" 
              value={keywordFilter}
              onChange={e => setKeywordFilter(e.target.value)}
              className="w-full bg-blinkit-surface border border-blinkit-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-blinkit-green"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blinkit-muted mb-2">Fetch Limit (per source)</h3>
            <input 
              type="number" 
              value={fetchCount}
              onChange={e => setFetchCount(Number(e.target.value))}
              className="w-full bg-blinkit-surface border border-blinkit-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:border-blinkit-green"
            />
          </div>
        </div>
      </div>
      
      {status === "idle" || status === "error" ? (
        <button 
          onClick={handleStartRun}
          className="w-full flex items-center justify-center gap-2 bg-blinkit-green hover:bg-blinkit-green/90 text-white font-semibold py-3 rounded-md transition-colors"
        >
          <PlayCircle className="w-5 h-5" />
          Start Data Ingestion
        </button>
      ) : (
        <div className="bg-blinkit-surface border border-blinkit-border rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {status !== "complete" && <Loader2 className="w-5 h-5 text-blinkit-green animate-spin" />}
              <span className="font-semibold text-foreground capitalize">Status: {status}</span>
            </div>
            {status === "complete" && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-sentiment-positive font-semibold">Done!</span>
                <a 
                  href={`/runs/${runId}`}
                  className="bg-blinkit-green hover:bg-blinkit-green/90 text-white text-sm font-semibold py-1.5 px-4 rounded-md transition-colors"
                >
                  View Dashboard
                </a>
              </div>
            )}
          </div>
          
          <div className="h-2 w-full bg-blinkit-card rounded-full overflow-hidden mb-4">
            <div className={cn(
              "h-full bg-blinkit-green transition-all duration-500",
              status === "starting" ? "w-[10%]" : 
              status === "fetching" ? "w-[40%]" : 
              status === "cleaning" ? "w-[75%]" : 
              status === "complete" ? "w-full" : "w-0"
            )} />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blinkit-card py-3 rounded-md border border-blinkit-border">
              <div className="text-2xl font-bold text-foreground">{stats.scraped}</div>
              <div className="text-xs text-blinkit-muted">Raw Scraped</div>
            </div>
            <div className="bg-blinkit-card py-3 rounded-md border border-blinkit-border">
              <div className="text-2xl font-bold text-foreground">{stats.analyzed}</div>
              <div className="text-xs text-blinkit-muted">Unique & Clean</div>
            </div>
            <div className="bg-blinkit-card py-3 rounded-md border border-blinkit-border">
              <div className="text-2xl font-bold text-blinkit-green">{stats.discovery}</div>
              <div className="text-xs text-blinkit-muted">Discovery Related</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
