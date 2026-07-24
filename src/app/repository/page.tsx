"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Search, ChevronRight, FileText, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";

export default function RepositoryPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/runs`);
        const data = await res.json();
        setRuns(data);
      } catch (err) {
        console.error("Failed to fetch runs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRuns();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <PageHeader 
        title="Research Repository" 
        subtitle="Browse and compare past AI discovery runs."
      />

      <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
        
        <div className="flex justify-between items-center bg-blinkit-card p-4 rounded-xl border border-blinkit-border">
          <div className="flex items-center gap-2 bg-background border border-blinkit-border rounded-lg px-3 py-2 w-72">
            <Search size={18} className="text-blinkit-muted" />
            <input 
              type="text" 
              placeholder="Search runs..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <Link 
            href="/"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            New Run
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-20 bg-blinkit-card rounded-xl border border-blinkit-border border-dashed">
            <h3 className="text-lg font-semibold mb-2">No research runs yet</h3>
            <p className="text-blinkit-muted mb-4">Start your first analysis to see it here.</p>
            <Link 
              href="/"
              className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm"
            >
              Start Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {runs.map((run) => (
              <Link key={run.id} href={`/runs/${run.id}`}>
                <div className="bg-blinkit-card border border-blinkit-border rounded-xl p-5 hover:border-primary/50 transition-colors flex items-center justify-between group cursor-pointer shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        Research Run
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium border",
                          run.status === "complete" ? "bg-sentiment-positive/10 text-sentiment-positive border-sentiment-positive/20" :
                          run.status === "error" ? "bg-sentiment-negative/10 text-sentiment-negative border-sentiment-negative/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {run.status}
                        </span>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-blinkit-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(run.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{run.source_counts?.scraped || 0} Scraped</span>
                        <span>•</span>
                        <span>{run.source_counts?.analyzed || 0} Analyzed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
