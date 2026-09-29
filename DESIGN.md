# ProductScout UX & Workspace Design Specification

> **Parent Specification**: This document extends [x:\Products\DESIGN.md](file:///x:/Products/DESIGN.md).  
> All global design tokens (Inter typography scale, 6px `rounded-md` controls, 8px `rounded-lg` cards, 1px structural borders, and monochrome-first palette) are inherited directly from the root design system.

---

## 1. Domain Purpose & Workspace Role

ProductScout is an **evidence-first market research workstation** for founders and product engineers. It autonomously gathers public user signals from developer and operator communities, extracts grounded problems and workarounds, clusters friction points, and formulates high-confidence product opportunities with narrow MVP build profiles.

Because ProductScout is an analytical tool rather than a marketing website, its interface is optimized for **deep data density, high-speed inspection, and rigorous source provenance**.

---

## 2. Workspace Density & Dark Operator Canvas

### 2.1 Workspace Theme Extension
While the corporate site and catalog operate on a clean light canvas (`#ffffff`), ProductScout implements a **dark operator workspace** to support extended research sessions:
- **Workspace Canvas**: `#08080a` (`bg-[#08080a]`)
- **Panel Surface**: `rgba(18, 18, 22, 0.65)` (`glass-panel`) with 1px border `rgba(255, 255, 255, 0.08)`
- **Card Surface**: `rgba(14, 14, 18, 0.55)` (`glass-card`) with 1px border `rgba(255, 255, 255, 0.07)`
- **Primary Text**: `#f4f4f5` (`text-zinc-100` / `text-white`)
- **Secondary Text**: `#a1a1aa` (`text-zinc-400`)
- **Muted Text / Metadata**: `#71717a` (`text-zinc-500`)

### 2.2 Information Density
- **Viewport Utilization**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (utilizing wide displays for multi-column comparison).
- **Component Padding**: `p-4 sm:p-5` for cards and tables (as opposed to relaxed `p-8` marketing cards).
- **Compact Metric Tiles**: `p-3 sm:p-4` with tight 4px vertical label-to-value spacing.

---

## 3. Evidence Presentation & Provenance Visualization

The fundamental promise of ProductScout is that **AI inference is NEVER disguised as real user evidence**. The UI must enforce this distinction visually.

### 3.1 Source Provenance Badges
Every extracted signal must display its authentic origin badge using monospaced category tags:
* `[REDDIT]` — `#ff4500` icon dot / `bg-white/5 text-zinc-300 border-white/10`
* `[HACKER NEWS]` — `#ff6600` icon dot / `bg-white/5 text-zinc-300 border-white/10`
* `[GITHUB]` — `#ffffff` icon dot / `bg-white/5 text-zinc-300 border-white/10`
* `[DEV.TO]` — `#0a0a0a` icon dot / `bg-white/5 text-zinc-300 border-white/10`
* `[WEB / FEED]` — `#3b82f6` icon dot / `bg-white/5 text-zinc-300 border-white/10`

### 3.2 Direct Evidence vs. AI Inference
1. **Direct User Evidence**:
   - Formatted in blockquote styling with a 2px left border: `border-l-2 border-zinc-500 pl-3.5 py-1 text-zinc-300 italic text-sm`.
   - Accompanied by direct metadata: thread author, post timestamp, upvotes, and direct hyperlink to the original thread.
2. **AI Inference & Gap Detection**:
   - Formatted with an explicit uppercase disclaimer badge: `[AI INFERENCE]` (`bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md`).
   - Clear explanatory copy explaining *why* the gap was inferred from the problem cluster.

---

## 4. Opportunity Presentation & Composite Scoring

Product cards synthesize complex research data into an actionable decision matrix.

### 4.1 Composite Opportunity Card
Each opportunity displays:
- **Opportunity Title & One-Line Hook**: `text-lg font-bold text-white tracking-tight`
- **Target User & Job-to-be-Done**: Concise role identification (`Founder`, `DevOps Lead`, `Data Engineer`)
- **Score Chip**: High-contrast score badge (e.g. `87/100`) using semantic tiering:
  - `90-100`: `text-emerald-400 bg-emerald-500/10 border-emerald-500/20`
  - `75-89`: `text-blue-400 bg-blue-500/10 border-blue-500/20`
  - `60-74`: `text-amber-400 bg-amber-500/10 border-amber-500/20`
  - `<60`: `text-zinc-400 bg-zinc-500/10 border-zinc-500/20`
- **Key Problem & Incumbent Workarounds**: What users are currently forced to do (e.g. "Manual Google Sheets copy-paste").
- **MVP Build Scope vs. Anti-Scope**: Clear 2-column checklist:
  - Scope: Green checkmarks (`text-emerald-400`)
  - Anti-Scope: Red crosses (`text-zinc-500`) defining what *not* to build.

---

## 5. Research Progress & Pipeline State Indicators

Research runs execute asynchronously across external APIs and LLM pipelines.

### 5.1 Pipeline Stepper Stages
The research runner displays a linear 5-stage progress indicator:
1. `Signal Gathering` (Scanning Reddit, HN, GitHub)
2. `Problem Extraction` (Isolating pain points & workarounds)
3. `Cluster Formation` (Grouping related friction domains)
4. `Incumbent Analysis` (Detecting market gaps & flaws)
5. `Opportunity Formulation` (Scoring, MVP scoping, validation tests)

### 5.2 State Presentation
* **Pending / In Queue**: `text-zinc-500` with hollow circle indicator
* **Active / Running**: `text-white font-medium` with rotating or pulsing indicator dot (`bg-white subtle-pulse`)
* **Completed**: `text-emerald-400` with solid checkmark
* **Rate-Limited / Warning**: `text-amber-400` with warning triangle (indicating degraded multi-source coverage without aborting)
* **Failed**: `text-red-400` with error summary and retry action

---

## 6. Application Navigation & View Hierarchy

ProductScout employs a top-docked workspace navigation shell (`Navbar.tsx`):
- **Brand Unit**: CevonX badge + `ProductScout` wordmark + version chip (`v1.0`).
- **Primary Views**:
  - `Dashboard`: High-level intelligence overview, recent runs, top opportunities.
  - `New Research`: Parameter setup, source selection, topic query, run launcher.
  - `Results`: Full analytical breakdown, cluster matrix, opportunity cards.
  - `History`: Historical research runs with persistence to Supabase (`productscout_research_runs`).
  - `Saved`: Bookmarked opportunities for active product development.
  - `Settings`: Supabase credentials, model configuration, API rate-limits.
- **Active Navigation Pill**: Highlighted with `bg-white/10 text-white font-medium rounded-md px-3 py-1.5`.

---

## 7. Inspector Drawer & Detail Modals

Deep examination of an opportunity opens the `OpportunityDetailModal`:
- **Overlay**: `bg-black/80 backdrop-blur-md`
- **Container**: `max-w-4xl w-full rounded-xl border border-white/10 bg-[#0e0e12] p-6 sm:p-8 shadow-2xl`
- **Tabs**: `Overview`, `Signals & Quotes`, `Validation Experiments`, `MVP Architecture`, `Raw JSON`
- **Actions**: `Export JSON`, `Save Opportunity`, `Launch Validation Experiment`

---

## 8. Alignment with Root Design Rules

ProductScout adheres to the root CevonX design rules:
1. **Controls Radius**: All buttons, inputs, and tab triggers strictly use `rounded-md` (6px).
2. **Card Geometry**: Outer cards use `rounded-lg` (8px); modal containers use `rounded-xl` (12px).
3. **Typography**: Clean `Inter` font stack with tabular figures and monospaced metadata chips.
4. **Zero Unearned Decoration**: No rainbow gradients, neon glow halos, or bouncing elements.
