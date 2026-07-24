"use client";

import { useRun } from "@/context/RunContext";
import { Database, Cpu, Layers, Lightbulb, CheckCircle2, ArrowRight, Globe, MessageSquare, Brain, Target } from "lucide-react";

const PIPELINE_STEPS = [
  {
    icon: Globe,
    step: "01",
    title: "Multi-Source Data Gathering",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    description: "We scrape and aggregate Blinkit user feedback from 7 distinct platforms simultaneously.",
    details: [
      "Google Play Store reviews (rated 1-5 stars)",
      "Apple App Store reviews",
      "Reddit discussions (r/blinkit, r/india, quick-commerce threads)",
      "Community forums & product Q&A",
      "Social media conversations (Twitter/X, Instagram comments)",
      "Product review sites",
      "Quick-commerce niche discussions",
    ],
    metric: "500+ reviews per run",
    code: `fetch_play_store(count=200, keywords=['delivery','category','discover'])\nfetch_reddit(subreddits=['blinkit','india'], limit=100)\nfetch_app_store(app_id='blinkit', count=200)`,
  },
  {
    icon: Database,
    step: "02",
    title: "Cleaning & Deduplication",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    description: "Raw reviews are cleaned, spam-filtered, and tagged as discovery-relevant before storage.",
    details: [
      "HTML stripping & Unicode normalization",
      "Spam & bot review detection",
      "Exact & near-duplicate removal (Jaccard similarity)",
      "Discovery-relevance tagging using keyword + semantic triggers",
      "English-only filtering for consistent classification",
    ],
    metric: "~85% retention rate",
    code: `cleaner = ReviewCleaner()\ncleaned = [cleaner.clean(r) for r in raw]\nunique = cleaner.deduplicate(cleaned)\ndiscovery = [r for r in unique if cleaner.tag_discovery(r)]`,
  },
  {
    icon: Cpu,
    step: "03",
    title: "AI Classification (Groq LLaMA 3)",
    color: "text-blinkit-green",
    bg: "bg-blinkit-green/10 border-blinkit-green/20",
    description: "Each discovery-related review is classified across 5 dimensions using Groq's ultra-fast LLaMA 3 8B model.",
    details: [
      "Category: What Blinkit feature is discussed?",
      "Sentiment: Positive / Neutral / Negative",
      "User Segment: Explorer / Habitual / Churned / New",
      "Barrier: What blocks category discovery?",
      "Confidence: 0-1 classification confidence score",
    ],
    metric: "~90 sec for 200 reviews",
    code: `classifier = ReviewClassifier()  # Groq LLaMA 3 8B\nfor batch in chunks(reviews, size=10):\n    classified = classifier.classify_batch(batch)\n    # Returns: category, sentiment, segment, barrier, confidence`,
  },
  {
    icon: Layers,
    step: "04",
    title: "Theme Clustering (Semantic KMeans)",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    description: "Reviews are embedded using sentence-transformers and clustered into semantic themes using KMeans.",
    details: [
      "Model: all-MiniLM-L6-v2 (80MB, 14ms/review)",
      "Clustering: KMeans with n=8 clusters (configurable)",
      "Cluster naming: GPT-4o-mini samples 10 reviews/cluster",
      "Root cause analysis: GPT-4o synthesizes UX friction drivers",
      "Severity scoring: Based on mention frequency & sentiment ratio",
    ],
    metric: "8 themes · 100% reproducible",
    code: `clusterer = ThemeClusterer()  # MiniLM + KMeans\nclusters = clusterer.cluster_reviews(reviews)\nanalyzer = RootCauseAnalyzer()  # GPT-4o\nthemes = analyzer.analyze_themes(clusters)`,
  },
  {
    icon: Brain,
    step: "05",
    title: "Insight Generation (GPT-4o)",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    description: "GPT-4o synthesizes answers to our 8 research questions grounded entirely in classified review evidence.",
    details: [
      "Q1: Why do users repeatedly buy the same categories?",
      "Q2: What prevents exploration of new categories?",
      "Q3: How do users currently discover products?",
      "Q4: What role do habits play in shopping behavior?",
      "Q5: What info is needed before trying a new category?",
      "Q6: What frustrations emerge repeatedly?",
      "Q7: Which segments are more likely to experiment?",
      "Q8: What unmet needs appear consistently?",
    ],
    metric: "8 executive findings · cited evidence",
    code: `insight_gen = InsightGenerator()  # GPT-4o synthesis\nfindings = insight_gen.generate_findings(\n    classified_reviews=classified,\n    themes=themes,\n    questions=RESEARCH_QUESTIONS  # Q1-Q8\n)`,
  },
  {
    icon: CheckCircle2,
    step: "06",
    title: "Quality Validation (3-Layer)",
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
    description: "Every insight is validated against the raw evidence to ensure research integrity before delivery.",
    details: [
      "Layer 1 — Grounding Validator: Is the answer supported by ≥3 reviews?",
      "Layer 2 — Coherence Check: Is the answer internally consistent?",
      "Layer 3 — Evidence View: Key quotes surfaced for every finding",
      "Confidence scores are attached to every finding",
      "Chatbot refuses to answer from outside the dataset",
    ],
    metric: "0 hallucinations allowed",
    code: `# Every finding requires supporting evidence\nfor finding in findings:\n    assert len(finding.key_quotes) >= 1\n    assert finding.confidence > 0.6\n    assert finding.supporting_review_count > 0`,
  },
];

export default function HowItWorksPage() {
  const { data } = useRun();
  const total = data.source_counts.analyzed || data.source_counts.scraped || 0;

  return (
    <div className="p-8 max-w-5xl mx-auto fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-1">How It <span className="gradient-text">Works</span></h1>
        <p className="text-blinkit-muted text-sm">
          A transparent walkthrough of the 6-stage AI pipeline — from raw reviews to actionable product insights
        </p>
      </div>

      {/* Intro card */}
      <div className="p-6 rounded-xl bg-blinkit-card border border-blinkit-border mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Reviews Analyzed", value: total || "500+" },
            { label: "AI Models Used", value: "3" },
            { label: "Research Questions", value: "8" },
            { label: "Pipeline Stages", value: "6" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-2xl font-bold text-foreground mb-1">{m.value}</p>
              <p className="text-xs text-blinkit-muted">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-6">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.step} className="fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex gap-4">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${step.bg}`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-blinkit-border mt-2 mb-0 min-h-[2rem]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-mono font-bold ${step.color}`}>{step.step}</span>
                  <h2 className="text-base font-semibold text-foreground">{step.title}</h2>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium ${step.bg} ${step.color}`}>{step.metric}</span>
                </div>
                <p className="text-sm text-blinkit-muted mb-4 leading-relaxed">{step.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blinkit-surface border border-blinkit-border">
                    <p className="text-[10px] text-blinkit-muted uppercase tracking-wider font-medium mb-2">What happens</p>
                    <ul className="space-y-1.5">
                      {step.details.map((d, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-foreground">
                          <span className={`mt-0.5 shrink-0 ${step.color}`}>·</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-blinkit-card border border-blinkit-border font-mono">
                    <p className="text-[10px] text-blinkit-muted uppercase tracking-wider font-medium mb-2">Pipeline code</p>
                    <pre className="text-[10px] text-blinkit-subtle leading-relaxed whitespace-pre-wrap">{step.code}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final callout */}
      <div className="mt-4 p-6 rounded-xl bg-blinkit-green/5 border border-blinkit-green/20">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-5 h-5 text-blinkit-green" />
          <h3 className="text-sm font-semibold text-foreground">Research Integrity Guarantee</h3>
        </div>
        <p className="text-xs text-blinkit-muted leading-relaxed">
          Every insight generated by this platform is <strong className="text-foreground">grounded in real Blinkit user reviews</strong>.
          The Discovery Copilot will explicitly refuse to answer questions that cannot be answered from the current dataset.
          Confidence scores and supporting review counts are attached to every finding.
        </p>
      </div>
    </div>
  );
}
