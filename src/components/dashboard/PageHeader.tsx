import { cn } from "@/lib/utils";
import { Download, Share2 } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between py-6 border-b border-blinkit-border mb-8", className)}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-blinkit-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-blinkit-muted hover:text-foreground hover:bg-blinkit-surface transition-colors border border-transparent hover:border-blinkit-border">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-blinkit-green text-white hover:bg-blinkit-green/90 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}
