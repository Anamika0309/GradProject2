"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Layers,
  Bot,
  Info,
  ChevronRight,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "overview", icon: LayoutDashboard, description: "Metrics & summary" },
  { name: "Analytics", href: "analytics", icon: BarChart3, description: "Charts & filters" },
  { name: "Theme Intelligence", href: "theme-intelligence", icon: Layers, description: "Clusters & causes" },
  { name: "Discovery Copilot", href: "copilot", icon: Bot, description: "AI assistant" },
  { name: "How It Works", href: "how-it-works", icon: Info, description: "Pipeline walkthrough" },
];

export function RunSidebar({ runId }: { runId: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-blinkit-border bg-blinkit-card flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-blinkit-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blinkit-green flex items-center justify-center font-black text-white text-sm glow-green">
            B
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">Blinkit</p>
            <p className="text-[10px] text-blinkit-muted leading-tight">Discovery Engine</p>
          </div>
        </Link>
      </div>

      {/* Run Info Badge */}
      <div className="px-4 py-3 border-b border-blinkit-border">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blinkit-surface">
          <div className="w-1.5 h-1.5 rounded-full bg-blinkit-green pulse-dot" />
          <span className="text-[10px] text-blinkit-muted font-mono truncate">Run: {runId.slice(0, 8)}…</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const href = `/runs/${runId}/${item.href}`;
          const isActive = pathname === href || pathname?.startsWith(href);
          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group transition-all",
                isActive
                  ? "bg-blinkit-green/10 text-blinkit-green border border-blinkit-green/20"
                  : "text-blinkit-muted hover:text-foreground hover:bg-blinkit-surface border border-transparent"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blinkit-green" : "text-blinkit-muted group-hover:text-foreground")} />
              <div className="flex-1 min-w-0">
                <p className="leading-tight">{item.name}</p>
                <p className={cn("text-[10px] leading-tight mt-0.5", isActive ? "text-blinkit-green/60" : "text-blinkit-muted/60")}>{item.description}</p>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-blinkit-green shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blinkit-border">
        <div className="flex items-center gap-2 px-2 py-2 rounded-md">
          <Zap className="w-3.5 h-3.5 text-blinkit-green shrink-0" />
          <div>
            <p className="text-[10px] text-foreground font-semibold">Blinkit Growth PM</p>
            <p className="text-[9px] text-blinkit-muted">Graduation Project · 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// The global sidebar (for non-run pages)
export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const GLOBAL_NAV = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Research Runs", href: "/runs", icon: BarChart3 },
    { name: "New Run", href: "/new-run", icon: Zap },
  ];

  return (
    <aside className={cn("w-60 border-r border-blinkit-border bg-blinkit-card flex flex-col h-screen sticky top-0", className)}>
      <div className="p-5 border-b border-blinkit-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blinkit-green flex items-center justify-center font-black text-white text-sm glow-green">B</div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">Blinkit</p>
            <p className="text-[10px] text-blinkit-muted leading-tight">Discovery Engine</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {GLOBAL_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border",
                isActive ? "bg-blinkit-green/10 text-blinkit-green border-blinkit-green/20" : "text-blinkit-muted hover:text-foreground hover:bg-blinkit-surface border-transparent"
              )}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
