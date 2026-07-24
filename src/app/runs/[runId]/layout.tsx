import { redirect } from "next/navigation";
import { RunProvider, RunData } from "@/context/RunContext";
import { RunSidebar } from "@/components/sidebar/Sidebar";
import { API_BASE } from "@/lib/api";

async function getRunData(runId: string): Promise<RunData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/runs/${runId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data as RunData;
  } catch (error) {
    console.error("Error fetching run data:", error);
    return null;
  }
}

export default async function RunLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const data = await getRunData(runId);

  if (!data) {
    redirect("/");
  }

  return (
    <RunProvider data={data} runId={runId}>
      <div className="flex h-screen overflow-hidden">
        <RunSidebar runId={runId} />
        <main className="flex-1 overflow-y-auto bg-blinkit-dark">
          {children}
        </main>
      </div>
    </RunProvider>
  );
}
