import { LiveFetchPanel } from "@/components/dashboard/LiveFetchPanel";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function NewRunPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-blinkit-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        <LiveFetchPanel />
      </main>
    </div>
  );
}
