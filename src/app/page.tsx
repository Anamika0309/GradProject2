import { Sidebar } from "@/components/sidebar/Sidebar";
import { LiveFetchPanel } from "@/components/dashboard/LiveFetchPanel";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-blinkit-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header card */}
          <div className="rounded-2xl border border-blinkit-border bg-blinkit-card p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blinkit-green flex items-center justify-center font-black text-white text-base glow-green">
                B
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Blinkit <span className="gradient-text">Discovery Engine</span>
              </h1>
            </div>
            <p className="text-sm text-blinkit-muted leading-7 max-w-2xl">
              Configure your data sources below, set how many reviews to fetch per source, then click{" "}
              <span className="text-blinkit-green font-semibold">Start Data Ingestion</span>.
              The AI pipeline will scrape, clean, classify, cluster and generate insights automatically —
              then take you straight to the dashboard when it finishes.
            </p>
          </div>

          {/* Main fetch panel — this is where you start a run */}
          <LiveFetchPanel />
        </div>
      </main>
    </div>
  );
}
