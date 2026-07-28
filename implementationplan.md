# Implementation Plan
## Blinkit AI-Powered Discovery Engine
### Phase-wise Technical Roadmap — Growth PM Graduation Project

---

## Project Summary

| Attribute | Detail |
|---|---|
| **Project Name** | Blinkit Category Discovery Intelligence Engine |
| **Role** | Growth Product Manager |
| **Goal** | AI-powered platform to analyze Blinkit user reviews and generate product insights about category exploration barriers |
| **Reference Apps** | ReviewLens (Spotify) + Gaana AI Discovery Intelligence |
| **Design Style** | Dark mode, Blinkit green accents, multi-page research dashboard |
| **Total Phases** | 5 |
| **Estimated Duration** | 4-5 weeks (graduation project timeline) |

---

## Architecture Overview

```
+---------------------+------------------------+-----------------------+
|   DATA LAYER        |   AI/PROCESSING LAYER  |   PRESENTATION LAYER  |
|                     |                        |                       |
|  Play Store API     |  Text Cleaning         |  Next.js Frontend     |
|  App Store Scraper  |  AI Classification     |  Dashboard            |
|  Reddit API (PRAW)  |  Theme Clustering      |  Quote Explorer       |
|  CSV Upload         |  Sentiment Analysis    |  Repository           |
|  Manual Input       |  Root Cause Extraction |  Compare Runs         |
|                     |  Insight Generation    |  AI Chatbot Panel     |
|  PostgreSQL/        |  Hypothesis Generation |                       |
|  Supabase           |  Opportunity Scoring   |  Vercel Deploy        |
|  (raw + processed)  |  (OpenAI / Groq)       |                       |
+---------------------+------------------------+-----------------------+
```

---

## Phase Overview

```
Phase 1 (Week 1)   ->  Project Setup & Foundation
Phase 2 (Week 2)   ->  Data Ingestion Engine
Phase 3 (Week 3)   ->  AI Processing Pipeline
Phase 4 (Week 4)   ->  Frontend Dashboard
Phase 5 (Week 5)   ->  AI Chatbot + Polish + Demo
```

---

## Phase 1 - Project Setup & Foundation
### Duration: Days 1-5

**Goal:** Establish the full-stack project structure, environment, database schema, and design system before writing any feature code.

---

### 1.1 Repository & Project Initialization

#### Tasks
- [ ] Create GitHub repository: blinkit-discovery-engine
- [ ] Initialize Next.js 14 project with App Router
- [ ] Initialize FastAPI backend in /backend subdirectory
- [ ] Set up .env.local (frontend) and .env (backend) with all API keys
- [ ] Configure ESLint, Prettier, and TypeScript strict mode
- [ ] Set up folder structure

#### Folder Structure
```
blinkit-discovery-engine/
+-- src/
|   +-- app/                    # Next.js App Router pages
|   |   +-- page.tsx            # Landing / LiveFetch Panel
|   |   +-- runs/
|   |   |   +-- [runId]/
|   |   |       +-- page.tsx    # Run Dashboard
|   |   |       +-- quotes/     # Quote Explorer
|   |   |       +-- evidence/   # Evidence Breakdown
|   |   +-- repository/         # Research Repository
|   |   +-- compare/            # Compare Runs
|   +-- components/
|   |   +-- ui/                 # Base UI components
|   |   +-- dashboard/          # Dashboard-specific components
|   |   +-- sidebar/            # Navigation sidebar
|   |   +-- chatbot/            # AI Assistant panel
|   |   +-- charts/             # Data visualization components
|   +-- lib/
|   |   +-- supabase.ts         # Supabase client
|   |   +-- api.ts              # Frontend API calls
|   |   +-- utils.ts            # Utility functions
|   +-- types/
|       +-- index.ts            # TypeScript interfaces
+-- backend/
|   +-- main.py                 # FastAPI entry point
|   +-- routers/
|   |   +-- ingest.py           # Data ingestion endpoints
|   |   +-- process.py          # AI processing endpoints
|   |   +-- runs.py             # Run management endpoints
|   |   +-- chat.py             # AI chatbot endpoint
|   +-- services/
|   |   +-- scraper.py          # Review scrapers
|   |   +-- cleaner.py          # Text cleaning & dedup
|   |   +-- classifier.py       # AI classification
|   |   +-- clusterer.py        # Theme clustering
|   |   +-- analyzer.py         # Sentiment + root cause
|   |   +-- insight_gen.py      # Insight generation
|   |   +-- opportunity.py      # Opportunity scoring
|   +-- models/
|       +-- schemas.py          # Pydantic models
+-- public/
    +-- demo/                   # Demo dataset JSON files
```

---

### 1.2 Database Schema (Supabase / PostgreSQL)

All tables to be created in Supabase:

| Table | Purpose |
|---|---|
| runs | Tracks each analysis run (sources, status, counts) |
| reviews | Raw scraped reviews per run |
| classified_reviews | AI-processed reviews with category, sentiment, segment, theme |
| themes | Named theme clusters per run |
| findings | Answers to Q1-Q8 per run with confidence and evidence |
| insights | Structured insight cards per run |
| hypotheses | Testable hypotheses linked to insights |
| opportunities | Product opportunity cards with X/10 score |
| barriers | Discovery barriers identified per run |

---

### 1.3 Design System Setup

#### Blinkit Color Palette (Dark Mode)
| Token | Value | Usage |
|---|---|---|
| blinkit-green | #00b140 | Primary accent, active states |
| blinkit-dark | #0a0a0a | App background |
| blinkit-card | #111111 | Card background |
| blinkit-surface | #1a1a1a | Elevated surfaces |
| blinkit-border | #2a2a2a | Borders and dividers |
| blinkit-muted | #9ca3af | Secondary text |
| sentiment-negative | #ef4444 | Negative sentiment |
| sentiment-positive | #22c55e | Positive sentiment |
| sentiment-neutral | #f59e0b | Neutral / opportunity score |

#### Base Components to Build
- MetricCard - large stat number + label + icon
- SourceBadge - pill chip: PLAY STORE / REDDIT / APP STORE
- ConfidenceBadge - "89% confidence" with shield icon
- Sidebar - fixed left navigation with active state
- PageHeader - top bar with run context + action buttons
- SentimentDot - colored circle indicator
- QuoteCard - review quote with theme/segment/source tags
- OpportunityCard - opportunity with X/10 score
- RootCauseCard - emoji icon + cause name + description

#### Deliverables (Phase 1)
- [ ] Project scaffolded and running locally
- [ ] Supabase project created with all tables migrated
- [ ] .env files configured with all API keys
- [ ] Design system and base components built
- [ ] Empty shell pages for all routes

---

## Phase 2 - Data Ingestion Engine
### Duration: Days 6-12

**Goal:** Build all data fetching services, the cleaning pipeline, and expose them via FastAPI endpoints.

---

### 2.1 Data Source Connectors

#### A. Google Play Store Scraper
- Library: google-play-scraper
- App ID: com.grofers.customerapp (Blinkit)
- Fetches: reviewId, userName, score (1-5), content, date, thumbsUpCount
- Filter: only reviews containing discovery keywords
- Keywords: "new category", "explore", "reorder", "discover", "suggest", "never tried"

#### B. Apple App Store Scraper
- Library: app-store-scraper
- App ID: 1491249118 (Blinkit)
- Country: in (India)
- Fetches: review text, rating, date, title

#### C. Reddit Scraper (PRAW)
- Subreddits: r/blinkit, r/india, r/bangalore, r/mumbai, r/quickcommerce
- Search keywords: "blinkit", "quick commerce", "grofers"
- Fetches: post title, body, score, URL, top comments

#### D. CSV Upload Handler
- Accepts CSV with columns: text (required), source, date, rating (optional)
- Validates format before processing
- Normalizes to internal review schema

---

### 2.2 Text Cleaning Pipeline

| Step | Action |
|---|---|
| 1 | Strip whitespace, remove URLs |
| 2 | Remove special characters (keep punctuation) |
| 3 | Normalize whitespace |
| 4 | Spam detection (regex rules: too short, repeated chars, single-word reviews) |
| 5 | Semantic deduplication using sentence-transformers (cosine similarity > 0.92 = duplicate) |
| 6 | Discovery keyword tagging (is_discovery_related flag) |

---

### 2.3 FastAPI Ingestion Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| /runs/create | POST | Create run, trigger background pipeline |
| /runs/{id}/status | GET | Poll processing status |
| /runs/{id}/upload-csv | POST | Accept CSV file |
| /runs | GET | List all runs |
| /runs/{id} | GET | Get full run details |
| /runs/{id} | DELETE | Delete a run |

#### Processing Status Messages (real-time polling)
```
Fetching Play Store reviews... (47 collected)
Fetching Reddit posts... (23 collected)
Cleaning & deduplicating... (58 unique)
Running AI classification... (58/58)
Clustering themes... (7 themes found)
Generating research findings... (Q1-Q8)
Scoring opportunities...
Complete! Redirecting to dashboard...
```

#### Deliverables (Phase 2)
- [ ] Play Store scraper working for Blinkit app ID
- [ ] Reddit scraper fetching from r/blinkit and related subreddits
- [ ] App Store scraper working
- [ ] CSV upload handler working
- [ ] Text cleaning + deduplication pipeline tested
- [ ] Discovery keyword filter working
- [ ] FastAPI endpoints all implemented and tested
- [ ] Reviews saved to Supabase reviews table
- [ ] LiveFetch Panel UI connected to backend
- [ ] Processing status shown in real-time (progress bar / step labels)

---

## Phase 3 - AI Processing Pipeline
### Duration: Days 13-19

**Goal:** Build all AI analysis steps - classification, clustering, sentiment, root cause extraction, insight and opportunity generation.

---

### 3.1 AI Classification (Groq - Fast Bulk Processing)

Model: llama3-8b-8192 (via Groq API)

For each review, classify and return JSON:
- category: one of [Delivery, Product Availability, Search, Recommendations, Pricing, Category Discovery, Trust, UX, Personalization, Customer Support, Others]
- sentiment: positive | neutral | negative
- user_segment: habitual_buyer | category_explorer | deal_hunter | new_user | power_shopper
- is_discovery_related: true | false
- barrier: convenience_lock_in | awareness_gap | trust_gap | time_pressure | search_dependency | none
- confidence: 0.0 to 1.0

---

### 3.2 Theme Clustering (Embeddings + KMeans)

Steps:
1. Generate embeddings using sentence-transformers (all-MiniLM-L6-v2)
2. Cluster with KMeans (n_clusters=8, adjustable)
3. Name each cluster using GPT-4o-mini (sample 10 reviews per cluster)

Expected Blinkit Themes:
- Habitual Reordering Lock-in
- Search-Dependency Over Browsing
- Low Trust in New Brands
- Category Awareness Gap
- Time Pressure During Purchase
- Positive Cross-Category Discovery
- Poor Recommendation Relevance
- Reorder Feature Over-reliance

---

### 3.3 Root Cause Extraction (GPT-4o-mini)

For each theme cluster, extract:
- root_cause: 2-3 sentence explanation of the underlying psychological/UX cause
- root_cause_label: short label (e.g., Decision Fatigue, Convenience Optimization)
- severity: High | Medium | Low

Root Cause Insight Cards for Blinkit (Q4):
- Convenience Optimization - Users optimize for speed and certainty, not discovery
- Invisible Category Architecture - New categories absent from reorder flow
- Decision Fatigue - Routine shopping creates autopilot purchasing behavior
- Trust Gap - Users lack social proof for unfamiliar category brands
- Search Tunnel Vision - Search bar usage reinforces known-item purchasing

---

### 3.4 Executive Findings Generation (GPT-4o - Q1-Q8)

> These 8 research questions are taken DIRECTLY from the project problem statement.
> Every question must be answered with evidence grounded in real user reviews.

#### Research Question Mapping (Problem Statement -> System Answer)

| # | Problem Statement Question | System Section Answering It |
|---|---|---|
| Q1 | Why do users repeatedly buy from the same categories? | Executive Finding Q1 + Root Cause Cards |
| Q2 | What prevents users from exploring new categories? | Executive Finding Q2 + Barrier Analysis + Frustration Bar Chart |
| Q3 | How do users discover products today? | Executive Finding Q3 + Shopping Behavior Frequency Bars |
| Q4 | What role do habits play in shopping behavior? | Executive Finding Q4 + Root Cause "Habit Loop" Card |
| Q5 | What information do users need before trying a new category? | Executive Finding Q5 + Trust Signal Evidence Cards |
| Q6 | What frustrations emerge repeatedly? | Executive Finding Q6 + Frustration Horizontal Bar Chart |
| Q7 | Which user segments are more likely to experiment? | Executive Finding Q7 + Segment Persona Cards Grid |
| Q8 | What unmet needs emerge consistently across discussions? | Executive Finding Q8 + Opportunity Cards (X/10) |

#### Research Questions (Exact Wording from Problem Statement)
- Q1: Why do users repeatedly buy from the same categories?
- Q2: What prevents users from exploring new categories?
- Q3: How do users discover products today?
- Q4: What role do habits play in shopping behavior?
- Q5: What information do users need before trying a new category?
- Q6: What frustrations emerge repeatedly?
- Q7: Which user segments are more likely to experiment?
- Q8: What unmet needs emerge consistently across discussions?

Each finding includes:
- answer: AI-synthesized 2-3 paragraph response (grounded ONLY in fetched reviews)
- confidence: 0.0 to 1.0
- supporting_review_count: number of reviews backing this finding
- key_quotes: 3 representative verbatim quotes from actual reviews
- segment_breakdown: per-segment review counts
- methodology_note: which pipeline step produced this finding (for transparency)

---

### 3.5 Opportunity Scoring (GPT-4o)

Each opportunity card includes:
- title: opportunity name
- problem: specific user friction
- user_need: underlying job-to-be-done
- product_opportunity: suggested feature/experience
- business_impact: impact on AOV/MACs/CLV
- primary_segment: target user segment
- mention_rate: % of discovery reviews mentioning this
- opportunity_score: 1-10
- representative_quote: best verbatim supporting quote

Expected Blinkit Opportunities:
- Smart Category Nudges in Reorder Flow (9/10)
- Social Proof for New Categories (8/10)
- Personalized Category Discovery Feed (8/10)
- Try Something New Gamified Challenge (7/10)
- Category Onboarding Cards for New Users (7/10)

---

### 3.6 Key Metrics Computed Per Run

| Metric | Definition |
|---|---|
| Category Exploration Rate % | % of all reviews mentioning new category exploration |
| Negative Review % | % of classified reviews with negative sentiment |
| Positive Review % | % of classified reviews with positive sentiment |
| Discovery Friction Index | Weighted score of barrier severity x frequency |
| Top Barrier | Most frequent barrier by review count |

---

### 3.7 Insight Quality Validation (REQUIRED DEMONSTRATION)

> The problem statement explicitly requires demonstrating **"how you validated the quality of insights."**
> This section defines the full validation methodology built into the system.

Insight quality validation happens at three layers:

#### Layer 1 - Evidence Grounding Check (Automated)
Every generated insight must pass a grounding test before being saved:
- The AI system generates an answer to each Q1-Q8 research question
- A second "Grounding Validator" prompt re-reads the same reviews and checks:
  - Does the answer contain any claims NOT supported by a specific review?
  - Are all quoted phrases verbatim from the source reviews?
  - Does the confidence score match the actual review count ratio?
- Any finding that fails grounding is flagged with a "LOW CONFIDENCE - VERIFY" tag
- Only findings that pass are shown in the Executive Research Report

Grounding Validator Prompt:
```
You are a research QA auditor. Check if this insight is fully supported
by the provided reviews. Return JSON:
{
  "is_grounded": true/false,
  "unsupported_claims": ["claim not in reviews"],
  "verified_quotes": ["exact quote found in review text"],
  "recommended_confidence": 0.0 to 1.0,
  "validation_notes": "explanation"
}
```

#### Layer 2 - Theme Coherence Check (Automated)
After KMeans clustering, each cluster is tested for coherence:
- Silhouette Score: clusters with score < 0.3 are flagged as "low coherence" and merged
- Cluster size filter: any cluster with fewer than 3 reviews is merged into "Others"
- Diversity check: cluster must contain reviews from at least 2 different sources
  (e.g., a theme cannot be formed from Play Store reviews only)
- Result: only coherent, multi-source themes are displayed in the dashboard

#### Layer 3 - Human Spot-Check Interface (Dashboard Feature)
The dashboard includes an "Evidence" mode (Evidence button in header) that lets the PM:
- Click any finding card to see ALL raw review quotes that contributed to it
- Read the exact verbatim text that the AI used as evidence
- Rate each quote as Relevant / Irrelevant (stored in DB for future model improvement)
- See which percentage of supporting reviews are from each source
- Compare AI-generated theme name against the actual review content

This Evidence view answers: "How do I know the AI didn't hallucinate this insight?"

#### Quality Validation Metrics Displayed in Dashboard

| Metric | Where Shown | What it Proves |
|---|---|---|
| Confidence % per finding | Every Q1-Q8 card | Proportion of reviews supporting this finding |
| Supporting review count | Every Q1-Q8 card | Volume of evidence behind each insight |
| Source distribution | Evidence breakdown | Insight not biased to one source |
| Grounding pass/fail badge | Admin view | Automated grounding check result |
| Coherence score per theme | Theme Explorer | Statistical coherence of the cluster |
| Quote count per opportunity | Opportunity cards | Number of distinct users mentioning this need |

#### What This Demonstrates to Evaluators
When presenting the project, you can show:
1. "Here is a raw review from the Play Store" (Source data)
2. "The AI classified it as Category Discovery / Negative / Habitual Buyer" (Classification step)
3. "It was grouped into the Habitual Reordering Lock-in theme" (Clustering step)
4. "This theme produced Finding Q1 with 89% confidence" (Insight generation)
5. "Click Evidence - here are the 47 reviews that justify this finding" (Quality validation)
6. "The Grounding Validator confirmed no unsupported claims exist" (Automated QA)

---

#### Deliverables (Phase 3)
- [ ] Groq classification running on all fetched reviews
- [ ] Theme clustering producing 6-10 named themes with coherence scores
- [ ] Root cause extraction for each theme
- [ ] Answers to Q1-Q8 with confidence scores (exact problem statement wording)
- [ ] Grounding Validator running on every generated finding
- [ ] Evidence breakdown stored per finding (supporting review IDs)
- [ ] Theme coherence check with silhouette score filtering
- [ ] Human spot-check Evidence view in dashboard
- [ ] 5+ opportunities scored X/10
- [ ] Category Exploration Rate % calculated
- [ ] Shopping behavior frequency bars computed
- [ ] All results persisted to Supabase

---

## Phase 4 - Frontend Dashboard
### Duration: Days 20-28

**Goal:** Build the complete multi-page research dashboard. Match the visual quality bar of both reference apps. All data rendered from Supabase via API.

---

### 4.1 Page: Home (LiveFetch Panel)
Route: /

Layout: Split - left hero, right configuration panel

Left hero section:
- Blinkit logo + app name
- Headline: "Fetch & analyze Blinkit reviews."
- Subtext: Live fetch and analysis for the Blinkit app focused on category discovery
- Feature bullets with icons

Right LiveFetch Panel card:
- DATA SOURCE toggles: Play Store (default on), App Store, Reddit, CSV Upload
- Fetch Amount slider: 10 to 500 reviews
- Discovery keyword filter (pre-filled: new category, explore, reorder, discover)
- Step wizard: 1. Fetch -> 2. Cleanup -> 3. Analyze
- Start Analysis button (Blinkit green)
- Real-time progress bar during processing

---

### 4.2 Page: Run Dashboard
Route: /runs/[runId]

#### A. Top Header (sticky)
- Left: Run name slug + BLINKIT source badge + "X analyzed . Y discovery-related"
- Right: Export, Evidence, Assistant, New buttons

#### B. Hero Insight Card
- Section label: BLINKIT CATEGORY DISCOVERY INSIGHT
- Large AI-synthesized sentence summarizing the run
- Two metrics: DISCOVERY REVIEWS count | EXECUTIVE FINDINGS count

#### C. Metric Cards Row (4 cards)
- Reviews Analyzed (high-signal count)
- Category Exploration Rate % (e.g., 8.7%)
- Negative Reviews (count + top issue label)
- Positive Reviews (count + label)

#### D. Data Pipeline Overview
- Total scraped count
- Per-source breakdown: Play Store, App Store, Reddit, CSV

#### E. Sidebar Widgets (within left sidebar when on run page)
- Active Themes count with "View theme breakdown" link
- Discovery Barriers count with "View barrier analysis" link

#### F. Executive Research Report (Q1-Q8)
Each question rendered as a numbered card with:
- Question number + icon + question text + subtitle (X% of reviews mention this)
- AI-synthesized answer paragraph
- Supporting review count + confidence %
- Expandable "View evidence breakdown" section:
  - Matching review quotes
  - Source badges per quote
  - User segment label per quote

#### G. Q2 - Top Frustrations (Horizontal Bar Chart)
- Title: What are the most common frustrations preventing category exploration?
- Subtitle: Groq-classified frustration categories across all reviews
- Horizontal bar chart with colored bars:
  - Habitual Reordering
  - Awareness Gap
  - Trust Gap
  - Time Pressure
  - Poor Recommendations

#### H. Q3 - Shopping Behavior Frequency Bars
- Title: What shopping behaviors are users trying to achieve?
- Subtitle: Detected from keyword patterns in review text
- Progress bars ranked by frequency:
  - Routine Grocery Top-up
  - Urgent Delivery Need
  - Price Deal Hunting
  - Explore New Category
  - Gift / Occasion Purchase

#### I. Q4 - Root Cause Insight Cards (3-column grid)
Each card shows:
- Emoji icon + cause name
- 2-3 sentence description
- Severity badge (High/Medium/Low)
Examples: "Convenience Optimization", "Invisible Category Architecture", "Decision Fatigue"

#### J. Q5 - Segment Persona Cards Grid
Each card shows:
- Icon + segment name
- Review count (large colored number)
- % negative sentiment dot indicator
Below cards: Segment Size Comparison bar chart

#### K. Q6-Q7 - Standard Finding Cards
Standard Q format: answer paragraph + evidence count + confidence badge

#### L. Q8 - Opportunity Cards (2xN Grid)
Each card shows:
- Lightbulb icon
- Opportunity score (X/10) in top-right corner (amber/gold)
- Title + description
- Verbatim quote chip
- Primary segment badge + mention rate %

---

### 4.3 Page: Quote Explorer
Route: /runs/[runId]/quotes

Features:
- Full-text search bar
- 5 filter dropdowns: Theme, Segment, Root Cause, Unmet Need, Barrier
- Quote cards showing: theme tag, source badge, segment label, full text, root cause, unmet need
- "Back to dashboard" link

---

### 4.4 Page: Research Repository
Route: /repository

Features:
- Header: "Analysis History - Research Repository"
- Subtitle: "Persistent research runs - reopen, compare, and export findings"
- Run cards: name, date, sources, review count, discovery count, [Open] [Compare] [Export]
- Empty state with CTA

---

### 4.5 Page: Compare Runs
Route: /compare

Features:
- Run A selector + Run B selector (dropdown of all saved runs)
- Side-by-side: top themes, barrier counts, segment distribution, discovery rate %
- Key differences highlighted in amber

#### Deliverables (Phase 4)
- [ ] Home / LiveFetch Panel connected to backend
- [ ] Run Dashboard with all sections (A-L) rendering real data
- [ ] Q2 horizontal bar chart (Recharts BarChart)
- [ ] Q3 behavior frequency bars
- [ ] Q4 root cause cards with emoji icons
- [ ] Q5 segment persona cards + chart
- [ ] Q8 opportunity grid with X/10 score
- [ ] Quote Explorer with 5 filters
- [ ] Research Repository listing all runs
- [ ] Compare Runs side-by-side view
- [ ] Demo Mode toggle with pre-loaded dataset
- [ ] Export button (CSV + JSON)

---

## Phase 5 - AI Chatbot + Polish + Demo
### Duration: Days 29-35

**Goal:** AI Assistant chatbot, UI polish, demo dataset, and deployment.

---

### 5.1 AI Discovery Assistant (Chatbot)

Design: Floating button (bottom-right corner) -> slide-out right panel (same as ReviewLens)

Architecture:
1. User types question
2. Frontend sends: { run_id, question, conversation_history }
3. Backend loads all classified_reviews, findings, themes for run_id
4. Builds context string (capped at ~8000 tokens)
5. System prompt constrains chatbot to run data only
6. Calls GPT-4o with context + question
7. Returns answer with evidence citations

System Prompt Constraint:
"You are the Blinkit Discovery Insight Assistant. Answer ONLY from the provided review data.
If a question cannot be answered from this dataset, explicitly say so."

Pre-loaded Suggested Questions:
- "Why do users repeatedly buy the same categories?"
- "What are the top barriers to category exploration?"
- "Which user segment is most likely to explore new categories?"
- "How do Play Store reviews differ from Reddit discussions?"
- "What product opportunities have the strongest evidence?"
- "What should we build first to increase category exploration?"

Backend endpoint: POST /runs/{run_id}/chat

---

### 5.2 Demo Dataset

Pre-built JSON file: /public/demo/blinkit-demo-run.json

Composition:
- 100 Play Store reviews
- 60 Reddit posts (r/blinkit, r/india)
- 30 App Store reviews
- 10 CSV entries (manually curated)
- Total: 200 reviews
- Discovery-related: ~35 reviews (17.5%)
- Themes: 7 named clusters
- Opportunities: 5 scored cards
- Findings: Q1-Q8 all answered

Demo Mode toggle: loads this pre-built dataset instantly (no API call needed)

---

### 5.3 UI Polish Checklist

Animations and Micro-interactions:
- [ ] Sidebar nav item hover: Blinkit green left border slide-in
- [ ] Metric cards: count-up animation on page load
- [ ] Research question cards: smooth expand/collapse for evidence
- [ ] Opportunity cards: hover lift effect (translateY -2px + shadow)
- [ ] Chat panel: smooth slide-in from right
- [ ] Source badge colors: green=Play Store, blue=Reddit, orange=App Store
- [ ] Processing: animated progress bar with step labels

Empty States:
- [ ] Repository with no runs
- [ ] Dashboard with zero discovery-related reviews
- [ ] Chatbot initial state with suggested questions visible

Error Handling:
- [ ] API fetch failure -> retry button
- [ ] Invalid CSV format -> inline validation
- [ ] Rate limit -> "Using cached results" banner

---

### 5.4 Deployment

Frontend: Vercel (auto-deploy from GitHub main branch)
Backend: Railway (Docker container with FastAPI)
Database: Supabase (managed PostgreSQL)

Required environment variables in production:
- OPENAI_API_KEY
- GROQ_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- REDDIT_CLIENT_ID
- REDDIT_CLIENT_SECRET
- NEXT_PUBLIC_API_URL

---

### 5.5 Workflow Demonstration Checklist

> The problem statement requires demonstrating 4 things. This section maps each
> required demonstration to a specific part of the application.

| Required Demonstration | Where It Is in the App | How to Show It |
|---|---|---|
| How workflow gathers and analyzes data | Home page - LiveFetch Panel | Show source toggles, keyword filter, fetch count slider, click Start, watch progress bar step through Fetch -> Cleanup -> Analyze |
| How themes are identified | Run Dashboard - Q4 Root Cause Cards + Theme section | Show the 7 named theme clusters, each with review count and coherence score. Explain embedding + KMeans approach |
| How insights are generated | Run Dashboard - Q1-Q8 Executive Finding Cards | Show a finding card: answer paragraph + review count + confidence % + key quotes. Explain Groq classification -> GPT-4o synthesis pipeline |
| How quality of insights is validated | Evidence button -> Evidence Breakdown modal | Click Evidence on any finding -> show all raw reviews that contributed -> show Grounding Validator pass badge -> show source distribution across Play Store / Reddit / App Store |

---

### 5.6 Presentation Demo Flow (Full Script)

**Part 1 - Demonstrate Workflow (How data is gathered and analyzed)**
1. Open app -> Show LiveFetch Panel
2. Explain: "This is the LiveFetch Panel. I can pull reviews from Play Store, App Store, Reddit, or upload a CSV."
3. Select Play Store + Reddit. Set keyword filter: "new category, explore, reorder, habits, discover"
4. Set fetch count: 200. Click Start Analysis.
5. Walk through the progress bar steps live: Fetching -> Cleaning -> Classifying -> Clustering -> Generating
6. Say: "Every review passes through a 10-step AI pipeline before appearing as an insight."

**Part 2 - Demonstrate Theme Identification**
7. Arrive at Run Dashboard. Point to the Active Themes count (7).
8. Show Q4 Root Cause Cards: "Convenience Optimization", "Invisible Category Architecture", "Habit Loop"
9. Say: "Reviews were embedded using sentence-transformers and grouped into 7 coherent clusters using KMeans. Each cluster was then named by GPT-4o by reading a sample of 10 reviews."

**Part 3 - Demonstrate Insight Generation (Q1-Q8)**
10. Walk through each Q1-Q8 finding card in order:
    - Q1: Why do users repeatedly buy the same categories? -> show answer + 89% confidence
    - Q2: What prevents exploration? -> show frustration bar chart (GROQ-classified)
    - Q3: How do users discover today? -> show behavior frequency bars
    - Q4: What role do habits play? -> show root cause cards with emoji
    - Q5: What info is needed before trying new category? -> show trust signal evidence
    - Q6: What frustrations emerge repeatedly? -> bar chart + evidence quotes
    - Q7: Which segments experiment more? -> segment persona cards grid
    - Q8: What unmet needs exist? -> opportunity grid with X/10 scores
11. Say: "Every answer is grounded exclusively in the fetched reviews - no outside AI knowledge."

**Part 4 - Demonstrate Quality Validation**
12. Click the [Evidence] button in the top header
13. Click on Finding Q1 card -> Evidence Breakdown expands
14. Show: "Here are the 47 raw Play Store and Reddit reviews that generated this insight."
15. Show the Grounding Validator badge: "GROUNDING: PASSED - No unsupported claims detected"
16. Show source distribution: "31 Play Store / 12 Reddit / 4 App Store - multi-source validation"
17. Open Quote Explorer -> search "new category" -> show filtered real user quotes
18. Say: "Any PM can audit every insight back to its raw user evidence."

**Part 5 - AI Chatbot**
19. Open AI Assistant panel (floating button)
20. Ask: "What should we build first to increase category exploration?"
21. Show response grounded in run data with cited evidence
22. Ask: "Which user segment should we target first?"

**Part 6 - Repository & Export**
23. Open Research Repository -> show saved runs
24. Click Export -> download CSV of all findings + evidence
25. End: "This system turns 200 raw user reviews into 8 evidence-backed product insights in under 3 minutes."

#### Deliverables (Phase 5)
- [ ] AI chatbot working (context-constrained to run data)
- [ ] Suggested questions pre-loaded (8 questions matching problem statement)
- [ ] Demo dataset JSON complete (200 reviews, all 8 findings answered)
- [ ] Demo Mode toggle working
- [ ] Evidence Breakdown modal working per finding
- [ ] Grounding Validator badge displayed per finding
- [ ] Source distribution shown in Evidence view
- [ ] All UI animations implemented
- [ ] Empty states and error handling done
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Demo run pre-populated in production DB
- [ ] Full 6-part presentation demo script rehearsed

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | Multi-page React application |
| Styling | Tailwind CSS | Dark theme + Blinkit colors |
| Charts | Recharts | Bar charts, progress bars, comparison views |
| Backend API | FastAPI (Python) | Data ingestion + AI processing endpoints |
| Bulk AI Classification | Groq (LLaMA 3 8B) | Fast cheap classification of 1000+ reviews |
| Executive Synthesis | OpenAI GPT-4o | High-quality Q1-Q8 answers + chatbot |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | Theme clustering |
| Play Store Scraper | google-play-scraper (Python) | Blinkit reviews |
| App Store Scraper | app-store-scraper (Python) | Blinkit iOS reviews |
| Reddit API | PRAW | r/blinkit discussions |
| Database | Supabase (PostgreSQL) | All structured data |
| Frontend Deploy | Vercel | Zero-config Next.js hosting |
| Backend Deploy | Railway | FastAPI container hosting |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Play Store scraper blocked | Medium | High | Rotating user agents; fall back to CSV |
| Non-English App Store reviews | Medium | Medium | Filter to English locale at fetch time |
| OpenAI rate limits during bulk | Low | High | Use Groq for classification; GPT-4o for synthesis only |
| Reddit API rate limits | Low | Medium | Cache results; exponential backoff |
| Supabase free tier row limit | Low | Low | MVP uses fewer than 50k rows |
| LLM hallucination in chatbot | Medium | High | System prompt constrains to run data; fallback message |
| Demo fails during presentation | Low | Very High | Pre-populate demo dataset; test demo mode offline |

---

## Problem Statement Alignment Verification

This section confirms every requirement from the original problem statement is covered.

### Required Questions -> System Coverage

| Problem Statement Requirement | Covered? | Where |
|---|---|---|
| Why do users repeatedly buy from the same categories? | YES | Q1 Finding + Root Cause Cards |
| What prevents users from exploring new categories? | YES | Q2 Finding + Barrier Analysis + Frustration Chart |
| How do users discover products today? | YES | Q3 Finding + Behavior Frequency Bars |
| What role do habits play in shopping behavior? | YES | Q4 Finding + Habit Loop Root Cause Card |
| What information do users need before trying a new category? | YES | Q5 Finding + Trust Signal Evidence Cards |
| What frustrations emerge repeatedly? | YES | Q6 Finding + GROQ-classified Frustration Bar Chart |
| Which user segments are more likely to experiment? | YES | Q7 Finding + Segment Persona Cards |
| What unmet needs emerge consistently across discussions? | YES | Q8 Finding + Opportunity Cards (X/10) |

### Required Demonstrations -> System Coverage

| Required Demonstration | Covered? | Where |
|---|---|---|
| How workflow gathers and analyzes data | YES | LiveFetch Panel + 10-step pipeline progress bar |
| How themes are identified | YES | KMeans clustering + GPT-4o naming + Root Cause Cards |
| How insights are generated | YES | Groq classification -> GPT-4o synthesis -> Q1-Q8 finding cards |
| How quality of insights is validated | YES | Grounding Validator + Evidence Breakdown + Source Distribution + Quote Explorer |

### Data Sources -> System Coverage

| Required Source | Covered? | Implementation |
|---|---|---|
| App Store reviews | YES | app-store-scraper Python library |
| Play Store reviews | YES | google-play-scraper Python library |
| Reddit discussions | YES | PRAW API (r/blinkit, r/india, r/bangalore) |
| Community forums | PARTIAL | Reddit covers forum-style discussions |
| Social media conversations | PARTIAL | CSV upload can accept manually collected posts |
| Product reviews | YES | Play Store + App Store cover product reviews |

---

*Document Version: 2.0 | Project: Blinkit Growth PM Graduation Project | Last Updated: July 2026*
*Updated: Aligned Q1-Q8 to exact problem statement wording. Added Insight Quality Validation (Step 3.7). Added Workflow Demonstration Checklist. Added Problem Statement Alignment Verification table.*
