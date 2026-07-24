"use client";

import { createContext, useContext, ReactNode } from "react";

export interface RunMetrics {
  exploration_rate: number;
  negative_reviews: number;
  positive_reviews: number;
}

export interface RunTheme {
  id: string;
  name: string;
  description: string;
  root_cause: string;
  root_cause_label: string;
  severity: string;
  review_count: number;
}

export interface RunFinding {
  id: string;
  question_id: string;
  question_text: string;
  answer: string;
  confidence: number;
  supporting_review_count: number;
  key_quotes: string[];
  segment_breakdown: Record<string, number>;
}

export interface RunOpportunity {
  id: string;
  title: string;
  problem: string;
  product_opportunity: string;
  business_impact: string;
  opportunity_score: number;
}

export interface RunData {
  id: string;
  created_at: string;
  status: string;
  source_counts: {
    scraped: number;
    analyzed: number;
    discovery_related: number;
  };
  metrics: RunMetrics;
  themes: RunTheme[];
  findings: RunFinding[];
  opportunities: RunOpportunity[];
}

interface RunContextValue {
  data: RunData;
  runId: string;
}

const RunContext = createContext<RunContextValue | null>(null);

export function RunProvider({ children, data, runId }: { children: ReactNode; data: RunData; runId: string }) {
  return (
    <RunContext.Provider value={{ data, runId }}>
      {children}
    </RunContext.Provider>
  );
}

export function useRun(): RunContextValue {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error("useRun must be used within RunProvider");
  return ctx;
}
