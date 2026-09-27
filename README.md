# ProductScout

> **Discovers real problems and identifies software products worth building.**

ProductScout is a full-stack Next.js web application designed for founders, product builders, and entrepreneurs. It discovers real user problems from public internet communities, extracts recurring pain points, analyzes existing solutions and complaints, detects market gaps, and converts strong evidence-backed problems into concrete product opportunities and narrow MVP build profiles.

---

## ⚡ The Evidence-First Philosophy

```
Internet Discussions (Reddit, Hacker News, GitHub, Dev.to, Web)
    ↓
User Signals & Authenticity Classification
    ↓
Problem & Workaround Extraction
    ↓
Problem Clustering (Workflow Domains)
    ↓
Existing Solution & Incumbent Analysis
    ↓
Market Gap Detection (Evidence vs. AI Inference)
    ↓
Product Opportunity Formulation (20 Comprehensive Fields)
    ↓
Narrow MVP Build Profiles & Anti-Scope
    ↓
Concrete Validation Experiments (Hypothesis, Test, Kill Signals)
```

---

## 🛠️ Key Features

1. **Next.js Full-Stack Architecture**:
   - Single unified codebase: Next.js 14 App Router, Serverless Route Handlers, and Tailwind CSS.
   - Zero separate backend server needed: deployable straight to Vercel with zero configuration.

2. **Modular Multi-Source Research Engine**:
   - **Reddit**: Searches discussion posts, selftext, upvotes, and comments.
   - **Hacker News**: Queries Algolia HN search API for comments, stories, and "Ask HN" threads.
   - **GitHub Issues**: Scans developer and operator issue trackers for bug reports, pain points, and feature friction.
   - **Dev.to & Communities**: Extracts discussions from operator and tech community articles.
   - **Web / Review Feeds**: Public complaint feeds and discussion pages.
   - Graceful fallback: Continues if any single source is rate-limited and reports unavailable sources in **Research Coverage**.

3. **Strict Evidence Hierarchy & Quality Filter**:
   - Prioritizes first-hand user complaints ("I spend hours", "our workaround is", "we invoice", "there is no tool").
   - Demotes vendor marketing, SEO listicles, and generic articles.
   - Strict rule: **AI-generated inference is NEVER disguised as direct user evidence**.

4. **Problem & Workaround Extraction**:
   - Extracts: Problem statement, target user, job/workflow involved, pain point, why painful, **current workaround** (e.g. spreadsheets, manual checking), recurrence/frequency, evidence quotes, and confidence score.
   - Rejects ungrounded claims with `"Insufficient evidence."`

5. **Clustering & Gap Detection**:
   - Groups related friction points into operational clusters without artificial inflation.
   - Analyzes incumbents (software products, competitors, spreadsheets, manual steps).
   - Identifies market gaps (excessive complexity, manual steps, high price, lack of automation) with strict labeling of AI inferences.

6. **20-Field Product Opportunity Generation**:
   - Opportunity name, one-line description, target customer, user problem, evidence summary, citations with clickable URLs, existing alternatives, gap, proposed solution, core workflow, why useful, MVP scope, what NOT to build initially (anti-scope), technical complexity, estimated build time, key dependencies, major risks, monetization, distribution difficulty, validation experiment, and evidence confidence.

7. **Narrow MVP Profiling & Concrete Validation Experiments**:
   - Focuses on 1–2 week MVP footprints.
   - Formulation of concrete validation experiments: Hypothesis, test, target users to interview, success signals, and invalidation criteria.

8. **10-Point Opportunity Quality Control**:
   - Internal audit before presenting opportunities.
   - Discards or segregates items failing strict evidence standards into **Insufficient Evidence / Weak Signals**.

9. **Pluggable AI & Local Heuristic Engine**:
   - Built-in **Local Heuristic NLP Engine** runs 100% offline with zero cost and no API keys required.
   - Optional **Google Gemini API** (`gemini-1.5-flash` / `gemini-2.0-flash`) and **OpenAI-compatible** integration configurable in Settings.

10. **Durable CevonX Products Supabase Persistence**:
    - Backed by the **CevonX Products unified database** (`gzhiltwyuhclzbhaypzd` / PostgreSQL 17.6) with 13 dedicated namespaced tables (`public.productscout_*`).
    - Every table references the central catalog `public.products(id)` with `product_id = 'productscout'`.
    - Full relational provenance chain: `ResearchRuns` → `Sources` → `Signals` → `Problems` → `Clusters` → `Gaps` → `Opportunities` → `Evidence Junction` → `Validation Experiments`.
    - Strict distinction between user-backed facts and AI inferences (`is_ai_inference: boolean`).
    - Enterprise Row Level Security (RLS) enabled on all 13 tables with cached scalar subquery InitPlans (`(SELECT auth.uid())`).
    - Auth-ready multi-tenant schema with nullable `user_id` and `organization_id`.
    - Resilient dual-mode operation: connects directly to Supabase via `@supabase/supabase-js` repository layer (`ProductScoutRepository`), with automated fallback to local storage for offline development.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v20/v22/v24)
- npm 9+
- Access to CevonX Products Supabase project `gzhiltwyuhclzbhaypzd` (or offline local mode)

### Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://gzhiltwyuhclzbhaypzd.supabase.co
SUPABASE_URL=https://gzhiltwyuhclzbhaypzd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Start server on Port 3002
npm run start
```

Open **http://localhost:3002** in your browser.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. Framework Preset: **Next.js** (detected automatically).
5. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://gzhiltwyuhclzbhaypzd.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key.
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API key.
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API key.
6. Click **Deploy**!

All API routes, research pipelines, Supabase database persistence, and UI run seamlessly on Vercel Serverless.

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts                # Health check API
│   │   │   ├── research/
│   │   │   │   ├── run/route.ts               # Run research pipeline (maxDuration=60)
│   │   │   │   └── runs/                      # Runs list and [id] detail/deletion
│   │   │   ├── opportunities/                 # Bookmarks and notes API
│   │   │   └── settings/route.ts              # API settings
│   │   ├── globals.css                        # Tailwind & radar styles
│   │   ├── layout.tsx                         # Root dark theme layout
│   │   └── page.tsx                           # Main app view orchestrator
│   ├── components/
│   │   ├── Navbar.tsx                         # Top navigation & status
│   │   ├── DashboardView.tsx                  # Metrics, blueprints & recent scans
│   │   ├── NewResearchView.tsx                # Topic input & config form
│   │   ├── RunProgressView.tsx                # 8-stage progress tracker
│   │   ├── ResultsView.tsx                    # Cards, clusters, gaps, report tabs
│   │   ├── OpportunityCard.tsx                # Opportunity card & confidence badge
│   │   ├── OpportunityDetailModal.tsx         # 20-field deep dive modal
│   │   ├── HistoryView.tsx                    # Historical scans archive
│   │   ├── SavedView.tsx                      # Bookmarks & notes
│   │   └── SettingsView.tsx                   # Engine & API key settings
│   ├── lib/
│   │   ├── collectors/                        # Reddit, HN, GitHub, Devto, Web collectors
│   │   ├── engine/                            # Evidence filter, extractor, clustering, QC
│   │   ├── db/database.ts                     # Vercel-resilient storage & seed data
│   │   └── api/client.ts                      # Client-side API caller & local sync
│   └── types/index.ts                         # Complete TypeScript data contracts
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.js
```

---

## 🛡️ Opportunity Quality Control Checklist

Before presenting any opportunity, the system internally audits:
1. Is this based on an actual user problem?
2. Is there first-hand evidence?
3. Is the problem repeated independently?
4. Is there evidence across more than one source?
5. Does the user currently use a workaround?
6. Are existing solutions inadequate in a specific way?
7. Is the proposed solution meaningfully different?
8. Can the problem be validated quickly?
9. Can a narrow MVP be built?
10. Are we distinguishing evidence from inference?
