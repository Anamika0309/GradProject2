# Problem Statement
## Blinkit AI-Powered Discovery Engine
### Product Management Graduation Project — Growth Product Manager

---

## 1. Project Context

I am working on a **Product Management graduation project** for **Blinkit**, one of India's leading quick-commerce platforms, in the role of a **Growth Product Manager**.

Quick commerce platforms have successfully embedded themselves into users' weekly routines. Blinkit users place frequent, recurring orders for groceries, snacks, beverages, and household essentials. While these customers are highly active and retained, their shopping behavior has become deeply siloed and repetitive — they rarely venture beyond familiar categories.

This creates a critical growth ceiling for the business.

---

## 2. The Business Problem

### Strategic Objective
Blinkit's core strategic goal for the Growth Team is:

> **Increase the percentage of Monthly Active Customers (MACs) who purchase products from at least one new category every month.**

### Observed Behavior
Currently, a large share of monthly active customers exhibit the following patterns:
- Repeatedly purchase from the same 2–3 categories across every order cycle.
- Rely almost exclusively on the **Reorder** feature or direct **Search** to complete purchases.
- Rarely browse, discover, or trial adjacent categories such as:
  - Baby Care
  - Pet Care
  - Personal Care & Beauty
  - Electronics & Accessories
  - Home Improvement
  - Wellness & Nutrition

### Business Impact
| Impact Area | Effect |
|---|---|
| Average Order Value (AOV) | Suppressed due to narrow category purchasing |
| Customer Lifetime Value (CLV) | Limited by low cross-category adoption |
| Category Revenue | Uneven — top categories over-indexed, newer ones underperform |
| Inventory Utilization | Sub-optimal for non-grocery SKUs |
| Platform Stickiness | At risk if habitual categories face competitive pressure |

---

## 3. The Insight Gap

Before proposing any product intervention or feature roadmap, the Growth Team needs **evidence-backed qualitative insights** at scale to understand:

- **Why** do users exhibit such repetitive shopping behavior?
- **What specific frictions** prevent users from exploring new categories?
- **How** do users currently discover products on the platform?
- **What role** do habits, time pressure, and decision fatigue play in purchasing decisions?
- **What information or trust signals** do users need before trialing an unfamiliar category?
- **Which user segments** are more predisposed to experimentation?
- **What unmet needs** emerge consistently across user discussions?

Answering these questions through manual review analysis or traditional surveys is insufficient at scale. A scalable, AI-powered approach is required.

---

## 4. Proposed Solution

### AI-Powered Discovery Engine

To address this insight gap, the project proposes building an **AI-Powered Qualitative Research Platform** — a real-time review ingestion and analysis system paired with an interactive research dashboard.

The system should function as an **AI Product Research Assistant** rather than a simple review summarizer. It will automatically ingest user feedback from multiple public sources, process it through an AI pipeline, and generate structured, evidence-backed product insights, hypotheses, and opportunity areas.

---

## 5. Data Sources

The platform should support ingesting user feedback from the following sources:

| Source | Type |
|---|---|
| Google Play Store | App Reviews |
| Apple App Store | App Reviews |
| Reddit | Community Discussions (r/blinkit, r/india, r/quickcommerce, etc.) |
| Social Media | Twitter/X, Instagram comments |
| Product Review Websites | Third-party e-commerce and aggregator reviews |
| Community Forums | General consumer forums |
| CSV Upload | Manually exported review datasets |
| Manual Text Input | Ad hoc research notes or screenshots |

> **Architecture Note:** The system should be modular so that additional data sources can be integrated incrementally without requiring full redesign.

---

## 6. Core AI Processing Pipeline

The engine processes all incoming feedback through a structured 10-step pipeline:

```
Step 1  → Data Ingestion
Step 2  → Data Cleaning
Step 3  → AI Classification
Step 4  → Theme Clustering
Step 5  → Sentiment Analysis
Step 6  → Root Cause Extraction
Step 7  → Insight Generation
Step 8  → Hypothesis Generation
Step 9  → Interview Question Generation
Step 10 → Opportunity Identification
```

### Step 1 — Data Ingestion
Collect reviews and discussions from one or more configured sources via APIs, scrapers, or file uploads.

---

### Step 2 — Data Cleaning
- Remove duplicate reviews
- Filter out spam and bot-generated content
- Remove irrelevant reviews (e.g., delivery partner complaints unrelated to product discovery)
- Normalize and standardize text encoding

---

### Step 3 — AI Classification
Automatically classify each review into one or more predefined product categories:

| Category | Description |
|---|---|
| Delivery | Speed, accuracy, packaging |
| Product Availability | Out-of-stock, catalog gaps |
| Search | Search relevance, filters |
| Recommendations | Algorithm quality, personalization |
| Pricing | Price perception, discounts |
| **Category Discovery** | Cross-category exploration, awareness |
| Trust | Brand trust, product authenticity |
| UX | App usability, navigation |
| Personalization | User preference learning |
| Customer Support | Resolution, responsiveness |
| Others | Uncategorized feedback |

---

### Step 4 — Theme Clustering
Group semantically similar reviews into recurring behavioral themes using LLMs or embedding-based clustering.

**Example Themes:**
- Habitual reordering / convenience lock-in
- Low awareness of available categories
- Time pressure during shopping sessions
- Search-dependency over browsing
- Low trust in unfamiliar product brands
- Fear of receiving poor quality in new categories
- Lack of discovery surfaces or recommendation quality

---

### Step 5 — Sentiment Analysis
For each identified theme cluster:
- Classify sentiment as **Positive**, **Neutral**, or **Negative**
- Calculate sentiment distribution percentages
- Highlight high-frequency negative sentiment themes as priority areas

---

### Step 6 — Root Cause Extraction
Move beyond surface-level complaint summarization. Identify the **likely root causes** driving observed behaviors.

**Example:**

| Observation | Root Cause |
|---|---|
| Users reorder identical products repeatedly | Shopping is goal-oriented; users experience decision fatigue during routine purchases and default to familiar items to reduce cognitive load |
| Users do not browse recommended categories | Recommendations feel irrelevant or are positioned too far down in the app flow |
| Users express low trust in unknown brands | No social proof, ratings, or return policy clarity shown at the point of discovery |

---

### Step 7 — Insight Generation
Generate structured, evidence-backed product insights for each major theme.

**Each Insight includes:**
- **Insight Title**
- **Description** — what the insight reveals
- **Supporting Evidence** — direct quotes and review sources
- **Frequency** — how often this theme appears
- **Confidence Level** — Low / Medium / High
- **Business Implication** — impact on AOV, MACs, CLV, retention
- **User Impact** — friction level experienced by users

---

### Step 8 — Hypothesis Generation
Transform validated insights into **testable product hypotheses** for experiment design.

**Example:**
> *"Users who rely heavily on the Reorder feature rarely browse adjacent categories because the current experience is optimized for convenience over discovery. If we introduce contextual cross-category nudges at the point of reorder, we can increase new category trials without disrupting the reorder flow."*

---

### Step 9 — Interview Question Generation
For each hypothesis, automatically generate **qualitative interview questions** for user research validation.

**Example:**

| Hypothesis | Suggested Interview Question |
|---|---|
| Users primarily rely on search rather than browsing | *"Can you walk me through your last Blinkit purchase and explain how you decided what to buy?"* |
| Users lack awareness of available categories | *"If I asked you to buy a pet product from Blinkit today, what would you do first?"* |
| Time pressure limits exploration | *"How much time do you usually spend on a Blinkit session? What does that session look like?"* |

---

### Step 10 — Opportunity Identification
Generate ranked product opportunity areas. Each opportunity includes:

| Field | Description |
|---|---|
| **Problem** | Core friction identified |
| **User Need** | Underlying user job-to-be-done |
| **Possible Product Opportunity** | Feature or experience intervention |
| **Business Impact** | Projected growth lever |
| **Confidence** | Evidence strength |

---

## 7. Research Dashboard Requirements

The platform should provide a **modern, interactive research dashboard** built for a Growth Product Manager. Sections should include:

### 7.1 Executive Summary
- Total Reviews Processed
- Data Sources Connected
- Themes Identified
- Insights Generated
- Hypotheses Generated
- Date Range Covered

### 7.2 Theme Explorer
- View all recurring themes ranked by frequency
- Filter by sentiment, source, or category
- Drill down into supporting review quotes

### 7.3 Insight Repository
- Searchable, filterable display of all generated insights
- Each insight shows: evidence, source, supporting quotes, and confidence score

### 7.4 Hypothesis Repository
- All generated hypotheses listed with:
  - Related Insights
  - Supporting Evidence
  - Confidence Level
  - Suggested Validation Questions

### 7.5 Opportunity Repository
- Ranked opportunity areas using scoring criteria:
  - User Impact
  - Business Value
  - Frequency
  - Confidence Level

### 7.6 Source Explorer
- Filter all insights and themes by source:
  - Play Store
  - App Store
  - Reddit
  - CSV Upload
  - Social Media

---

## 8. AI Capabilities Required

The platform must leverage LLMs and AI models to:

| Capability | Description |
|---|---|
| Theme Extraction | Identify recurring patterns across thousands of reviews |
| Review Clustering | Group semantically similar feedback using embeddings |
| Discussion Summarization | Condense long Reddit threads into structured summaries |
| Behavioral Pattern Detection | Identify habitual behaviors and cognitive triggers |
| Unmet Need Identification | Surface latent user needs not explicitly stated |
| Hypothesis Generation | Convert insights into testable product hypotheses |
| Interview Question Synthesis | Auto-generate research validation questions |
| Opportunity Ranking | Score and rank product opportunities by potential |

---

## 9. Recommended Technology Stack

### Frontend
- **Framework:** Next.js + React
- **Styling:** Tailwind CSS
- **Charts:** Recharts / Chart.js / D3.js

### Backend
- **API Layer:** FastAPI (Python) or Node.js (Express)
- **Data Processing:** Python (Pandas, NLTK, SpaCy)

### AI & LLMs
- **Primary LLM:** OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro
- **Fast Inference:** Groq (LLaMA / Mixtral)
- **Embeddings:** OpenAI text-embedding-3-small or Sentence Transformers

### Database
- **Primary:** Supabase (PostgreSQL) or direct PostgreSQL
- **Vector Store:** pgvector or Pinecone (for semantic search)

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway / Render / AWS EC2

---

## 10. Design Requirements

The user interface should resemble a **professional product research platform** used by Growth Product Managers at tech-first companies.

Design principles:
- **Minimal** — no clutter, focused information hierarchy
- **Modern** — clean typography, generous whitespace
- **Interactive** — filterable tables, clickable theme cards, drill-down views
- **Dashboard-first** — executive summary view loads by default
- **Easy to navigate** — clear section tabs and breadcrumbs

---

## 11. Expected Outputs

The system should enable a Product Manager to definitively answer:

| Research Question | Expected Answer Format |
|---|---|
| Why do users repeatedly buy from the same categories? | Insight cards with root causes and supporting quotes |
| What prevents category exploration? | Barrier-themed clusters with sentiment and frequency |
| Which shopping behaviors emerge repeatedly? | Theme explorer with ranked behavioral patterns |
| Which user segments appear more exploratory? | Segmented insight view with behavioral markers |
| What unmet needs exist? | Opportunity repository ranked by confidence |
| Which opportunities have the highest business potential? | Scored opportunity ranking with business impact labels |
| What interview questions validate these findings? | Auto-generated qualitative research question bank |
| Which hypotheses are supported by strongest evidence? | Hypothesis cards with evidence citations and confidence scores |

---

## 12. Success Criteria

The project will be considered successful if the AI Discovery Engine can:

1. Ingest reviews from at least 2 live data sources (e.g., Play Store + Reddit)
2. Process and cluster a minimum of 500+ reviews into meaningful themes
3. Generate at least 8–10 structured product insights with evidence
4. Produce testable hypotheses for each major insight
5. Suggest qualitative interview questions for hypothesis validation
6. Rank and display product opportunities by business potential
7. Deliver insights via a functional, navigable research dashboard
8. Demonstrate that AI-generated insights are grounded in real user feedback

---

## 13. Out of Scope (MVP)

The following capabilities are explicitly **excluded from the MVP** to maintain project focus and deliver within graduation project timelines:

| Out of Scope Item | Reason |
|---|---|
| Real-time social media streaming (live Twitter/Instagram feed) | Requires paid API access and significant infrastructure; deferred to v2 |
| User authentication & multi-user login | MVP is single-user; auth adds complexity without learning value for the project |
| Multi-language review support (Hindi, Marathi, etc.) | Requires multilingual NLP models; English-only corpus sufficient for MVP |
| Automated review scraping without manual trigger | Always-on scrapers need background job infrastructure; out of MVP scope |
| CRM or Blinkit internal data integration | Internal data access not available; engine relies solely on public feedback |
| Native mobile app (iOS/Android) | Web dashboard is sufficient for a PM research tool |
| A/B testing or experiment management features | Hypothesis validation through the system is out of scope; that is done manually |
| Payment, billing, or subscription tiers | Not applicable for a graduation project |
| Real-time notifications or alerts | No live monitoring pipeline in MVP |
| Third-party integrations (Slack, Notion, Jira) | Export as CSV/JSON covers sharing needs; direct integrations are v2 features |

> **Note:** Any item marked as "Out of Scope" for the MVP may be considered as future enhancements in a post-graduation product roadmap.

---

## 14. Reference Application Analysis

The system to be built is modeled after **ReviewLens** ([review-discovery-engine-opal.vercel.app](https://review-discovery-engine-opal.vercel.app)), a working reference application built for Spotify discovery research. The Blinkit version will adapt the same architectural patterns and UX structure for category discovery research.

### 14.1 Reference App Feature Map

| ReviewLens Feature | Blinkit Equivalent | Notes |
|---|---|---|
| **LiveFetch Panel** | **LiveFetch Panel** | Fetch reviews from Play Store, App Store, Reddit; Blinkit-specific keyword filters (category discovery, reorder, exploration) |
| **Research Repository** | **Research Repository** | Persistent analysis run history; reopen, compare, and export prior research sessions |
| **Compare Runs** | **Compare Runs** | Side-by-side dataset comparison of how themes, barriers, and segment distributions shift across runs |
| **Run Dashboard** | **Run Dashboard** | Executive summary, active themes count, discovery barriers count, and research findings by question |
| **Executive Research Report** | **Executive Research Report** | AI-synthesized director-level insights (not just frequency counts); answers the 8 strategic research questions |
| **Evidence Breakdown** | **Evidence Breakdown** | Per-finding modal showing matched reviews, source, user segment, and LLM confidence score |
| **Quote Explorer** | **Quote Explorer** | Searchable, filterable database of representative user quotes by theme, segment, root cause, unmet need, and barrier |
| **ReviewLens Assistant (Chatbot)** | **Blinkit Discovery Assistant** | Context-aware AI chatbot constrained to the active run's analyzed reviews; answers PM research questions from the data |
| **Demo Mode** | **Demo Mode** | Pre-loaded demo dataset for presentation purposes |
| **Export** | **Export** | Download full analysis as CSV or JSON |

### 14.2 Key UI/UX Patterns to Replicate

Based on analysis of the reference application, the following design patterns should be adopted:

**Layout:**
- **Left sidebar navigation** (fixed) with: Dashboard, Repository, Compare Runs, Quote Explorer, New Analysis
- **Top header** with run context info (run name, review count, source badge) and action buttons (Export, Evidence, Assistant, New)
- **Main content area** (scrollable) with sectioned cards

**Design Language:**
- Soft indigo/periwinkle color palette (`#6366f1` primary, light lavender backgrounds)
- Clean sans-serif typography with strong visual hierarchy
- Numbered question cards for executive findings
- Confidence badges (`89% confidence`, `Strong evidence`) on every insight
- Pill-style source badges (PLAY STORE, REDDIT, APP STORE, SOCIAL)
- Floating AI Assistant button (bottom-right corner)

**Data Display Patterns:**
- Executive Summary as a large hero statement summarizing the dataset in 1–2 sentences
- Metric cards (Discovery Reviews count, Executive Findings count, Active Themes count, Discovery Barriers count)
- Numbered research question cards, each with: answer paragraph, supporting review count, confidence %, "View evidence breakdown" expandable section, and user segment breakdown
- Strategic Opportunities section with evidence strength labels (Strong / Medium / Weak)

**AI Chatbot (Discovery Insight Assistant):**
- Slide-in right panel triggered by floating button
- Constrained to the active run's data only (no hallucination from outside data)
- Pre-populated suggested questions for quick access
- Free-text input for custom questions
- Displays source-grounded answers only

### 14.3 Blinkit-Specific Adaptations

| Dimension | Spotify Version | Blinkit Version |
|---|---|---|
| **App Focus** | Music discovery & recommendations | Product category discovery & cross-category exploration |
| **Data Sources** | Play Store, App Store, Reddit, Spotify Community, Social Media | Play Store, App Store, Reddit (r/blinkit, r/india), Social Media |
| **Keyword Filters** | "recommendations", "Discover Weekly", "shuffle", "algorithm" | "new category", "reorder", "explore", "suggest", "discovery", "recommendations" |
| **User Segments** | Discovery Seeker, Casual Listener, Power Listener, Music Explorer | Habitual Buyer, Category Explorer, Deal Hunter, New User, Power Shopper |
| **Research Questions** | Why can't users discover new music? | Why don't users explore new categories on Blinkit? |
| **Themes** | Similarity-based reinforcement, shuffle loop, algorithm fatigue | Habitual reordering, search dependency, low trust, awareness gap, time pressure |
| **Barriers** | Low novelty, poor personalization context | Convenience lock-in, unfamiliar brands, lack of category awareness, decision fatigue |

---

## 15. Success Criteria (Updated)

The project will be considered successful if the Blinkit AI Discovery Engine can:

1. Ingest reviews from at least **2 live data sources** (e.g., Play Store + Reddit)
2. Process and cluster a minimum of **200+ discovery-relevant reviews** into meaningful themes
3. Generate at least **8–10 structured executive findings** with evidence citations and confidence scores
4. Identify **4+ discovery barriers** grounded in real user feedback
5. Identify **3+ user behavioral segments** with distinct discovery friction profiles
6. Produce **testable product hypotheses** for each major insight
7. Power an **AI chatbot** that answers research questions strictly from ingested data
8. Provide a **Quote Explorer** with filterable user evidence
9. Enable **run comparison** across different data fetches
10. Deliver all the above through a **functional, navigable research dashboard** matching the quality bar of the reference application

---

*Document Version: 2.0 | Project: Blinkit Growth PM Graduation Project | Last Updated: July 2026*
