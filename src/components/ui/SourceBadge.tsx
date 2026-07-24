import { cn } from "@/lib/utils";
import { Play, Apple, MessageCircle, FileText } from "lucide-react";

interface SourceBadgeProps {
  source: "PLAY STORE" | "APP STORE" | "REDDIT" | "CSV";
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const getIcon = () => {
    switch (source) {
      case "PLAY STORE": return <Play className="w-3 h-3 mr-1" />;
      case "APP STORE": return <Apple className="w-3 h-3 mr-1" />;
      case "REDDIT": return <MessageCircle className="w-3 h-3 mr-1" />;
      case "CSV": return <FileText className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border",
      "bg-blinkit-surface border-blinkit-border text-blinkit-muted",
      className
    )}>
      {getIcon()}
      {source}
    </span>
  );
}
