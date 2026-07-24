import { redirect } from "next/navigation";
import { API_BASE } from "@/lib/api";

async function getLatestRun(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/runs`, { cache: "no-store" });
    if (!res.ok) return null;
    const runs = await res.json();
    if (!runs || runs.length === 0) return null;
    // Prefer the most recent run that has actual data
    const runWithData = runs.find(
      (r: { id: string; source_counts: { scraped: number } }) =>
        r.source_counts?.scraped > 0
    );
    return runWithData?.id ?? runs[0].id;
  } catch (error) {
    console.error("Error fetching root runs:", error);
    return null;
  }
}

export default async function Home() {
  const latestRunId = await getLatestRun();
  if (latestRunId) {
    redirect(`/runs/${latestRunId}/overview`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blinkit-dark">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-blinkit-green flex items-center justify-center mx-auto mb-6 font-black text-white text-2xl">B</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Blinkit Discovery Engine</h1>
        <p className="text-blinkit-muted text-sm mb-6">No research runs found. Start the backend and trigger a data collection run.</p>
        <p className="text-xs text-blinkit-muted font-mono bg-blinkit-card border border-blinkit-border px-4 py-2 rounded-lg">POST {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/runs/create</p>
      </div>
    </div>
  );
}
