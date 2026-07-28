# Decision Log
## Blinkit AI-Powered Discovery Engine
### Living Document — Auto-updated Throughout Build

> **How this file works:**
> Every significant technical, architectural, product, or design decision made during the build of this project is logged here automatically. Each entry includes what was decided, why it was decided, what alternatives were considered, and the trade-offs involved.
> This file is updated in real-time as decisions are made — not retrospectively.

---

## Decision Index

| # | Decision | Category | Date | Status |
|---|---|---|---|---|
| D-001 | Use Next.js 14 App Router for frontend | Architecture | Jul 2026 | ✅ Confirmed |
| D-002 | Use FastAPI (Python) for backend | Architecture | Jul 2026 | ✅ Confirmed |
| D-003 | Use Supabase (PostgreSQL) as primary database | Database | Jul 2026 | ✅ Confirmed |
| D-004 | Use Groq (LLaMA 3) for bulk classification, GPT-4o for synthesis | AI Stack | Jul 2026 | ✅ Confirmed |
| D-005 | Use sentence-transformers + KMeans for theme clustering | AI/ML | Jul 2026 | ✅ Confirmed |
| D-006 | Dark mode with Blinkit green (#00b140) accent palette | Design | Jul 2026 | ✅ Confirmed |
| D-007 | Multi-page architecture (not single-page dashboard) | Architecture | Jul 2026 | ✅ Confirmed |
| D-008 | AI chatbot constrained to active run data only (no outside knowledge) | AI | Jul 2026 | ✅ Confirmed |
| D-009 | Deploy frontend on Vercel, backend on Railway | DevOps | Jul 2026 | ✅ Confirmed |
| D-010 | Scoped to English-only reviews in MVP | Scope | Jul 2026 | ✅ Confirmed |
| D-011 | Use Recharts for data visualizations | Frontend | Jul 2026 | ✅ Confirmed |
| D-012 | Adopt ReviewLens slide-out chatbot panel (not Gaana inline style) | UX | Jul 2026 | ✅ Confirmed |
| D-013 | Research questions use EXACT wording from problem statement (Q1-Q8) | Product | Jul 2026 | ✅ Confirmed |
| D-014 | Add 3-layer Insight Quality Validation (Grounding Validator + Coherence + Evidence view) | AI/QA | Jul 2026 | ✅ Confirmed |

---

## Detailed Decision Entries

---

### D-001 — Use Next.js 14 (App Router) for Frontend
**Date:** July 2026
**Category:** Architecture
**Status:** ✅ Confirmed

**Decision:**
Use Next.js 14 with the App Router pattern as the frontend framework.

**Rationale:**
- App Router enables nested layouts, which is critical for the sidebar + main content layout pattern used across all pages.
- Native support for server components reduces client-side JS bundle size.
- Seamless Vercel deployment with zero configuration.
- File-system-based routing makes the multi-page structure (Home, `/runs/[runId]`, `/repository`, `/compare`, `/quotes`) easy to maintain.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Vite + React (SPA) | No SSR; harder Vercel integration; manual routing setup |
| Remix | Less ecosystem tooling for the PM dashboard use case |
| Create React App | Deprecated; no App Router equivalent |

**Trade-offs:**
- (+) SSR improves initial page load for the dashboard
- (+) File-based routing matches the page structure in implementation plan
- (-) App Router has a steeper learning curve than Pages Router
- (-) Some third-party libraries have limited App Router compatibility

---

### D-002 — Use FastAPI (Python) for Backend
**Date:** July 2026
**Category:** Architecture
**Status:** ✅ Confirmed

**Decision:**
Use FastAPI as the backend API layer with Python as the primary language.

**Rationale:**
- Python is the only language with mature libraries for all three critical services: `google-play-scraper`, `praw` (Reddit), `sentence-transformers`, and `openai`.
- FastAPI provides automatic OpenAPI documentation, async support, and Pydantic validation.
- Background task support lets the processing pipeline run asynchronously while the frontend polls for status.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Node.js (Express/Hapi) | No equivalent of sentence-transformers or google-play-scraper in JS |
| Django | Too heavy for an API-only service; unnecessary admin overhead |
| Flask | Lacks native async support; no automatic validation |

**Trade-offs:**
- (+) Best AI/ML library ecosystem in Python
- (+) Fast development with Pydantic models
- (-) Python is slower than Node for pure I/O tasks (acceptable at this scale)
- (-) Requires separate deployment from Next.js frontend

---

### D-003 — Use Supabase (PostgreSQL) as Primary Database
**Date:** July 2026
**Category:** Database
**Status:** ✅ Confirmed

**Decision:**
Use Supabase as the managed PostgreSQL database for all structured data storage.

**Rationale:**
- Supabase's free tier supports up to 500MB storage and 50,000 rows — sufficient for a graduation project processing <5,000 reviews per run.
- Built-in REST API means the Next.js frontend can optionally query data directly without always routing through FastAPI.
- pgvector extension available for future semantic search on review embeddings.
- Dashboard UI simplifies schema management and data inspection during development.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| MongoDB Atlas | Relational schema fits reviews better than document store; pgvector not available |
| PlanetScale (MySQL) | No pgvector; less Python SDK support |
| Firebase Firestore | NoSQL; complex querying for analytics use case |
| Local SQLite | Cannot be accessed from Railway-deployed backend and Vercel frontend simultaneously |

**Trade-offs:**
- (+) Free tier sufficient for MVP
- (+) pgvector available for embedding search
- (+) Built-in auth for future versions
- (-) Free tier has row limits; will need upgrade for large-scale scraping
- (-) Cold start latency on free tier can add 1-2s to first query

---

### D-004 — Use Groq (LLaMA 3 8B) for Bulk Classification + GPT-4o for Synthesis
**Date:** July 2026
**Category:** AI Stack
**Status:** ✅ Confirmed

**Decision:**
Use a two-model strategy:
- **Groq (LLaMA 3 8B-8192):** Bulk classification of all raw reviews (category, sentiment, segment, barrier, discovery flag)
- **OpenAI GPT-4o:** High-quality executive synthesis (Q1–Q8 answers, opportunity scoring, cluster naming)

**Rationale:**
- Groq processes 500 reviews in ~90 seconds (vs. ~8 minutes on GPT-4o at equivalent cost). At $0.05/1M tokens input, Groq is ~20x cheaper for bulk classification.
- GPT-4o provides superior reasoning quality for complex synthesis tasks (executive findings, nuanced hypothesis generation) where speed matters less than accuracy.
- Separating bulk vs. synthesis tasks optimizes the cost/quality ratio of the pipeline.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| GPT-4o for everything | Too slow and expensive for bulk classification of 500+ reviews |
| GPT-4o-mini for everything | Insufficient reasoning quality for executive synthesis |
| Claude Sonnet for everything | Higher cost than Groq for bulk tasks; API rate limits |
| Local Ollama (LLaMA 3) | No GPU on deployment server; too slow on CPU |
| Gemini 1.5 Flash | Less tested for classification JSON output formatting |

**Trade-offs:**
- (+) ~20x cost reduction on bulk classification
- (+) Pipeline completes in <3 minutes for 200 reviews
- (+) GPT-4o quality preserved where it matters most
- (-) Two API keys to manage
- (-) Two different prompt styles to maintain
- (-) Groq context window (8192 tokens) limits batch sizes

---

### D-005 — Use Sentence-Transformers + KMeans for Theme Clustering
**Date:** July 2026
**Category:** AI/ML
**Status:** ✅ Confirmed

**Decision:**
Use `all-MiniLM-L6-v2` from sentence-transformers to generate review embeddings, then cluster with scikit-learn's KMeans (n_clusters=8 default, adjustable).

**Rationale:**
- `all-MiniLM-L6-v2` is a well-balanced model: fast (14ms/review on CPU), small (80MB), and produces high-quality semantic embeddings for English text.
- KMeans is deterministic with a fixed random seed, making runs reproducible.
- Cluster naming via GPT-4o-mini (sample 10 reviews per cluster) produces readable, PM-friendly theme labels.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| OpenAI text-embedding-3-small | Costs money per embedding; MiniLM is free and comparable quality for this task |
| HDBSCAN (density-based) | Produces variable number of clusters; harder to control; some reviews end up unclustered |
| BERTopic | Good library but adds complexity; KMeans + LLM naming achieves same result |
| Manual keyword grouping | Not scalable for 500+ reviews; misses semantic similarity |

**Trade-offs:**
- (+) Free, fast, runs on CPU
- (+) Reproducible with fixed random seed
- (-) KMeans requires pre-specifying n_clusters (mitigated by making it configurable)
- (-) May merge semantically distinct sub-themes in small datasets

---

### D-006 — Dark Mode with Blinkit Green (#00b140) Accent
**Date:** July 2026
**Category:** Design
**Status:** ✅ Confirmed

**Decision:**
Adopt a dark mode design (near-black background) with Blinkit's brand green (`#00b140`) as the primary accent color.

**Rationale:**
- The Gaana AI Discovery Intelligence reference app proved dark mode creates a more premium, "intelligence tool" aesthetic compared to the light mode of ReviewLens.
- Blinkit's brand color (green) gives the tool an unmistakable product identity suited to a graduation presentation.
- Dark backgrounds make colored sentiment indicators (red/green/amber) stand out more effectively — critical for at-a-glance data reading.

**Color Palette Finalized:**
| Token | Value | Role |
|---|---|---|
| Primary Accent | #00b140 | CTAs, active nav items, highlights |
| Background | #0a0a0a | App canvas |
| Card | #111111 | Card backgrounds |
| Surface | #1a1a1a | Elevated surfaces |
| Border | #2a2a2a | Dividers |
| Text Primary | #ffffff | Headings |
| Text Muted | #9ca3af | Labels, subtitles |
| Negative | #ef4444 | Negative sentiment |
| Positive | #22c55e | Positive sentiment |
| Opportunity | #f59e0b | Opportunity score (X/10) |

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Light mode (ReviewLens style) | Less dramatic for presentations; less "intelligence tool" feel |
| Purple/Indigo (ReviewLens palette) | Doesn't match Blinkit brand identity |
| Blinkit yellow (#ffc200) accent | Yellow on dark is high-contrast but feels consumer-app rather than analytics tool |

**Trade-offs:**
- (+) Strong visual identity tied to Blinkit brand
- (+) Sentiment indicators pop on dark backgrounds
- (-) Dark mode accessibility requires careful contrast ratio checks
- (-) Some chart libraries default to light themes and need custom theming

---

### D-007 — Multi-page Architecture (Not Single-page Dashboard)
**Date:** July 2026
**Category:** Architecture
**Status:** ✅ Confirmed

**Decision:**
Build a multi-page application with distinct routes for: Home, Run Dashboard, Quote Explorer, Repository, and Compare Runs.

**Rationale:**
- ReviewLens proved this approach is more scalable and PM-friendly: each section has enough data density to warrant its own page.
- Quote Explorer with 5 filters requires a dedicated search UX that would clutter a single-page layout.
- Research Repository and Compare Runs are independent workflows; embedding them in the main dashboard would require complex tab management.
- Deep linking to specific runs (`/runs/abc123`) is essential for sharing analysis results.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Single-page (tabs) like Gaana | Works for Gaana's simpler feature set; too cramped for our 5-section navigation |
| Modal-based navigation | Poor UX for complex research flows; no deep-linking |

**Trade-offs:**
- (+) Clean separation of concerns between features
- (+) Deep-linkable run URLs for sharing
- (-) More routing code to maintain
- (-) Navigation between pages requires explicit sidebar clicks

---

### D-008 — AI Chatbot Constrained to Active Run Data Only
**Date:** July 2026
**Category:** AI
**Status:** ✅ Confirmed

**Decision:**
The Blinkit Discovery Assistant chatbot will ONLY answer questions using the classified reviews, themes, and findings from the currently active run. It will explicitly state when a question cannot be answered from the available data.

**Rationale:**
- This is the same design principle used by ReviewLens and is critical for PM research integrity.
- If the chatbot uses outside knowledge (hallucination), a PM could present insights at a strategy review that are not grounded in real user feedback — a serious credibility risk.
- Constraining to run data forces the AI to cite actual review evidence, making every answer auditable.

**Implementation:**
- System prompt explicitly states: "Answer ONLY from the provided review data. If a question cannot be answered from this dataset, say: 'This question cannot be answered from the current dataset of X reviews.'"
- Context string is built from the run's `classified_reviews`, `findings`, `themes`, and `opportunities` tables.
- Context is capped at ~8,000 tokens to fit within GPT-4o's efficient processing window.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Allow general Blinkit knowledge | Introduces hallucination risk; not audit-safe for PM research |
| RAG with vector search | More complex; for MVP, full context string is sufficient at <200 reviews |
| No chatbot | Reduces demo impact significantly; chatbot is a key differentiator |

**Trade-offs:**
- (+) Research integrity preserved — all answers traceable to real reviews
- (+) Increases PM credibility when presenting to stakeholders
- (-) Chatbot cannot answer general Blinkit product questions
- (-) Context window limits runs with >500 discovery-related reviews

---

### D-009 — Deploy Frontend on Vercel, Backend on Railway
**Date:** July 2026
**Category:** DevOps
**Status:** ✅ Confirmed

**Decision:**
Deploy the Next.js frontend on Vercel and the FastAPI backend on Railway.

**Rationale:**
- Vercel is the canonical deployment platform for Next.js (built by the same team). Zero configuration, auto-deploy on git push.
- Railway supports Dockerized Python apps with environment variable management, persistent storage, and generous free tier for hobby projects.
- Both platforms are free-tier friendly for a graduation project with low traffic.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| AWS EC2 (both) | Requires significant DevOps setup; overkill for graduation project |
| Render (backend) | Similar to Railway; Railway has better Python + Docker DX |
| Heroku (backend) | Free tier eliminated in 2022; now paid |
| Fly.io (backend) | Valid alternative; Railway chosen for simpler UX |

**Trade-offs:**
- (+) Zero-config CI/CD from GitHub
- (+) Both free tiers sufficient for MVP traffic
- (-) Railway free tier apps sleep after inactivity (cold start ~10s)
- (-) Vercel free tier has 100GB bandwidth limit (non-issue for this project)

---

### D-010 — Scope to English-only Reviews in MVP
**Date:** July 2026
**Category:** Scope
**Status:** ✅ Confirmed

**Decision:**
The MVP processes only English-language reviews. Hindi, Hinglish, Marathi, and other Indian language reviews are out of scope.

**Rationale:**
- The AI classification and theme clustering prompts are written in English. Sending non-English text degrades classification accuracy significantly.
- Blinkit's Play Store page contains a significant volume of English reviews from urban Indian users — sufficient for the research corpus needed (200–500 reviews).
- Multilingual NLP (e.g., IndicBERT, MuRIL) adds complexity that is not justified for a graduation project MVP.

**Future Consideration:**
Adding Hindi/Hinglish support in v2 using a multilingual embedding model (`paraphrase-multilingual-MiniLM-L12-v2`) and translated classification prompts.

**Trade-offs:**
- (+) Simpler, more reliable classification pipeline
- (+) Consistent quality across all processed reviews
- (-) Misses a significant portion of authentic Indian user voice (Hinglish speakers)
- (-) May skew corpus toward urban, tech-literate user segments

---

### D-011 — Use Recharts for Data Visualizations
**Date:** July 2026
**Category:** Frontend
**Status:** ✅ Confirmed

**Decision:**
Use Recharts as the charting library for the dashboard (horizontal bar charts, sentiment distribution, segment comparison bars).

**Rationale:**
- Recharts is built for React and integrates natively with Next.js without SSR issues.
- Declarative API matches React's component model — charts are defined as JSX.
- Supports custom theming to match the dark mode palette.
- Lightweight (~150KB gzipped) vs. Chart.js (~200KB) or D3 (~500KB).

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Chart.js | Imperative API; requires canvas refs in React; more verbose |
| D3.js | Powerful but low-level; too much boilerplate for simple bar charts |
| Nivo | Beautiful but heavy bundle; more suited to complex analytical dashboards |
| Victory | Less maintained; smaller community |

**Trade-offs:**
- (+) Native React integration
- (+) Easy custom theming for dark mode
- (-) Recharts animations can flicker on hot reload during development
- (-) Limited chart types (sufficient for our use case: bar, line, pie)

---

### D-012 — Use ReviewLens Slide-out Chatbot Panel (Not Gaana Inline Style)
**Date:** July 2026
**Category:** UX
**Status:** ✅ Confirmed

**Decision:**
Implement the AI chatbot as a slide-out right panel (triggered by a floating button, same as ReviewLens) rather than an inline input in the header (Gaana style).

**Rationale:**
- Slide-out panel gives the chatbot a dedicated 400px-wide conversation space with message history, which is essential for follow-up questions.
- Gaana's inline style only shows one response at a time — insufficient for a multi-turn research conversation.
- Floating button placement (bottom-right corner) is a widely recognized UX pattern for chat interfaces (Intercom, Zendesk, etc.).
- Slide-out panel can show suggested questions as tappable chips, reducing the cognitive load of formulating the first query.

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Gaana inline header input | Single-turn only; no conversation history visible |
| Full-page chat route (/chat) | Breaks context — user loses sight of the dashboard data while chatting |
| Modal dialog | Blocks underlying dashboard content; bad UX for reference-while-chatting |

**Trade-offs:**
- (+) Multi-turn conversation supported
- (+) User can see dashboard while chatting (overlay, not replacement)
- (+) Familiar UX pattern reduces learning curve
- (-) Slide-out reduces visible dashboard width on smaller screens
- (-) More complex animation/state management than inline input

---

## Decision Log Template

*Use this template when adding new entries during the build:*

```markdown
### D-XXX — [Short Decision Title]
**Date:** [Date]
**Category:** [Architecture | Database | AI | Design | Frontend | Backend | DevOps | Scope | UX | Product | AI/QA]
**Status:** [✅ Confirmed | 🔄 Under Review | ⚠️ Revisited | ❌ Reversed]

**Decision:**
[1-2 sentence summary of what was decided]

**Rationale:**
[Why this decision was made — key reasons]

**Alternatives Considered:**
| Alternative | Why Rejected |
|---|---|
| Option A | Reason |
| Option B | Reason |

**Trade-offs:**
- (+) Advantage
- (-) Disadvantage

**Impact:**
[What files/components/systems this decision affects]
```

---

*Document Version: 2.0 | Project: Blinkit Growth PM Graduation Project | Last Updated: July 2026*
*Updated: Added D-013 (exact problem statement Q1-Q8 alignment) and D-014 (3-layer quality validation system).*
*This file is maintained automatically throughout the project build.*
