-- ============================================================================
-- Migration: 20260927103000_create_productscout_schema.sql
-- Product: ProductScout (A CevonX Product)
-- Slug: productscout
-- Project Ref: gzhiltwyuhclzbhaypzd (CevonX Products Shared Platform)
-- Description: Creates the complete durable persistence schema for ProductScout:
--   1. Ensures productscout entry in public.products
--   2. Creates 13 namespaced tables with product_id foreign keys:
--      - productscout_research_runs
--      - productscout_sources
--      - productscout_signals
--      - productscout_problems
--      - productscout_problem_clusters
--      - productscout_existing_solutions
--      - productscout_gaps
--      - productscout_opportunities
--      - productscout_opportunity_evidence
--      - productscout_validation_experiments
--      - productscout_weak_signals
--      - productscout_saved_opportunities
--      - productscout_settings
--   3. Applies RLS policies with InitPlan caching
--   4. Configures updated_at triggers
--   5. Applies targeted indexes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Ensure Product Catalog Registration
-- ----------------------------------------------------------------------------
INSERT INTO public.products (id, name, slug, description, status)
VALUES (
    'productscout',
    'ProductScout',
    'productscout',
    'Discovers real problems and identifies software products worth building.',
    'active'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());

-- ----------------------------------------------------------------------------
-- 2. Research Runs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_research_runs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    timeframe TEXT NOT NULL DEFAULT '30d',
    max_sources INTEGER NOT NULL DEFAULT 30,
    focus TEXT,
    target_user TEXT,
    geography TEXT,
    industry TEXT,
    enabled_sources TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collecting', 'analyzing', 'completed', 'failed')),
    current_step TEXT,
    raw_evidence_count INTEGER NOT NULL DEFAULT 0,
    coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
    report_markdown TEXT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. Raw Sources Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_sources (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    author TEXT,
    published_at TIMESTAMPTZ,
    content TEXT,
    score INTEGER,
    comments_count INTEGER,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. Classified Evidence / Signals Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_signals (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    source_id TEXT REFERENCES public.productscout_sources(id) ON DELETE SET NULL,
    raw_id TEXT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL,
    author TEXT,
    published_date TEXT,
    snippet TEXT NOT NULL,
    evidence_type TEXT NOT NULL,
    quality TEXT NOT NULL CHECK (quality IN ('HIGH', 'MEDIUM', 'LOW')),
    quality_score NUMERIC NOT NULL DEFAULT 0,
    first_hand_markers TEXT[] DEFAULT '{}',
    pain_quote TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. Extracted Problems Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_problems (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    problem_statement TEXT NOT NULL,
    target_user TEXT NOT NULL,
    user_context TEXT NOT NULL,
    job_workflow TEXT NOT NULL,
    pain_point TEXT NOT NULL,
    why_painful TEXT NOT NULL,
    current_workaround TEXT NOT NULL,
    frequency TEXT NOT NULL,
    evidence_quotes JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_ids TEXT[] NOT NULL DEFAULT '{}',
    signal_count INTEGER NOT NULL DEFAULT 1,
    source_links TEXT[] NOT NULL DEFAULT '{}',
    evidence_quality TEXT NOT NULL CHECK (evidence_quality IN ('HIGH', 'MEDIUM', 'LOW')),
    confidence NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 6. Problem Clusters Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_problem_clusters (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    cluster_name TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_ids TEXT[] NOT NULL DEFAULT '{}',
    signal_count INTEGER NOT NULL DEFAULT 0,
    source_diversity INTEGER NOT NULL DEFAULT 0,
    common_affected_users TEXT NOT NULL,
    common_workflow TEXT NOT NULL,
    overall_evidence_strength TEXT NOT NULL CHECK (overall_evidence_strength IN ('HIGH', 'MEDIUM', 'LOW')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 7. Existing Solutions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_existing_solutions (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    cluster_id TEXT REFERENCES public.productscout_problem_clusters(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    what_users_do TEXT NOT NULL,
    positive_aspects TEXT[] NOT NULL DEFAULT '{}',
    complaints TEXT[] NOT NULL DEFAULT '{}',
    missing_functionality TEXT[] NOT NULL DEFAULT '{}',
    pricing_info TEXT,
    integration_limitations TEXT[] NOT NULL DEFAULT '{}',
    complexity_friction TEXT,
    unserved_segments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 8. Market Gaps Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_gaps (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    cluster_id TEXT REFERENCES public.productscout_problem_clusters(id) ON DELETE SET NULL,
    gap_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    supporting_evidence_ids TEXT[] NOT NULL DEFAULT '{}',
    supporting_quotes TEXT[] NOT NULL DEFAULT '{}',
    is_ai_inference BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 9. Product Opportunities Table (20 standard fields + extended metadata)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_opportunities (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    cluster_id TEXT REFERENCES public.productscout_problem_clusters(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    one_line_description TEXT NOT NULL,
    target_customer TEXT NOT NULL,
    user_problem TEXT NOT NULL,
    evidence_summary TEXT NOT NULL,
    evidence_quotes JSONB NOT NULL DEFAULT '[]'::jsonb,
    existing_alternatives TEXT NOT NULL,
    gap TEXT NOT NULL,
    proposed_solution TEXT NOT NULL,
    core_workflow TEXT NOT NULL,
    why_useful TEXT NOT NULL,
    mvp_scope TEXT[] NOT NULL DEFAULT '{}',
    what_not_to_build_initially TEXT[] NOT NULL DEFAULT '{}',
    technical_complexity TEXT NOT NULL CHECK (technical_complexity IN ('Low', 'Medium', 'High')),
    estimated_mvp_build_time TEXT NOT NULL,
    key_dependencies TEXT[] NOT NULL DEFAULT '{}',
    major_risks TEXT[] NOT NULL DEFAULT '{}',
    monetization_possibilities TEXT[] NOT NULL DEFAULT '{}',
    distribution_difficulty TEXT NOT NULL CHECK (distribution_difficulty IN ('Low', 'Medium', 'High')),
    evidence_confidence NUMERIC NOT NULL DEFAULT 0,
    mvp_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_saved BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 10. Opportunity Evidence Junction Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_opportunity_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    opportunity_id TEXT NOT NULL REFERENCES public.productscout_opportunities(id) ON DELETE CASCADE,
    signal_id TEXT REFERENCES public.productscout_signals(id) ON DELETE SET NULL,
    quote TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL,
    author TEXT,
    is_direct_first_hand BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_productscout_opp_evidence UNIQUE (opportunity_id, quote)
);

-- ----------------------------------------------------------------------------
-- 11. Validation Experiments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_validation_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    opportunity_id TEXT NOT NULL UNIQUE REFERENCES public.productscout_opportunities(id) ON DELETE CASCADE,
    hypothesis TEXT NOT NULL,
    test TEXT NOT NULL,
    target_users TEXT NOT NULL,
    success_signal TEXT NOT NULL,
    invalidation_signal TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 12. Weak Signals Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_weak_signals (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL REFERENCES public.productscout_research_runs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    user_statement TEXT NOT NULL,
    platform TEXT NOT NULL,
    source_url TEXT NOT NULL,
    why_insufficient TEXT NOT NULL,
    potential_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 13. Saved Opportunities (Bookmarks & Notes) Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_saved_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    opportunity_id TEXT NOT NULL REFERENCES public.productscout_opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    notes TEXT,
    opportunity_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_productscout_saved_opp UNIQUE (opportunity_id)
);

-- ----------------------------------------------------------------------------
-- 14. System Settings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productscout_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    product_id TEXT NOT NULL DEFAULT 'productscout' REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    ai_provider TEXT NOT NULL DEFAULT 'heuristic',
    gemini_api_key TEXT,
    gemini_model TEXT DEFAULT 'gemini-1.5-flash',
    openai_api_key TEXT,
    openai_base_url TEXT DEFAULT 'https://api.openai.com/v1',
    openai_model TEXT DEFAULT 'gpt-4o-mini',
    default_max_sources INTEGER NOT NULL DEFAULT 30,
    default_timeframe TEXT NOT NULL DEFAULT '30d',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 15. Triggers for updated_at
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_productscout_runs_updated_at ON public.productscout_research_runs;
CREATE TRIGGER trg_productscout_runs_updated_at
    BEFORE UPDATE ON public.productscout_research_runs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_productscout_opps_updated_at ON public.productscout_opportunities;
CREATE TRIGGER trg_productscout_opps_updated_at
    BEFORE UPDATE ON public.productscout_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_productscout_validation_updated_at ON public.productscout_validation_experiments;
CREATE TRIGGER trg_productscout_validation_updated_at
    BEFORE UPDATE ON public.productscout_validation_experiments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_productscout_saved_opps_updated_at ON public.productscout_saved_opportunities;
CREATE TRIGGER trg_productscout_saved_opps_updated_at
    BEFORE UPDATE ON public.productscout_saved_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_productscout_settings_updated_at ON public.productscout_settings;
CREATE TRIGGER trg_productscout_settings_updated_at
    BEFORE UPDATE ON public.productscout_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 16. Indexes for High-Performance Queries
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_productscout_runs_product ON public.productscout_research_runs(product_id);
CREATE INDEX IF NOT EXISTS idx_productscout_runs_status_created ON public.productscout_research_runs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_productscout_runs_user ON public.productscout_research_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_productscout_runs_org ON public.productscout_research_runs(organization_id);

CREATE INDEX IF NOT EXISTS idx_productscout_sources_run ON public.productscout_sources(run_id);
CREATE INDEX IF NOT EXISTS idx_productscout_signals_run ON public.productscout_signals(run_id);
CREATE INDEX IF NOT EXISTS idx_productscout_signals_quality ON public.productscout_signals(quality);
CREATE INDEX IF NOT EXISTS idx_productscout_problems_run ON public.productscout_problems(run_id);
CREATE INDEX IF NOT EXISTS idx_productscout_clusters_run ON public.productscout_problem_clusters(run_id);
CREATE INDEX IF NOT EXISTS idx_productscout_solutions_run ON public.productscout_existing_solutions(run_id);
CREATE INDEX IF NOT EXISTS idx_productscout_gaps_run ON public.productscout_gaps(run_id);

CREATE INDEX IF NOT EXISTS idx_productscout_opps_run ON public.productscout_opportunities(run_id);
CREATE INDEX IF NOT EXISTS idx_productscout_opps_cluster ON public.productscout_opportunities(cluster_id);
CREATE INDEX IF NOT EXISTS idx_productscout_opps_saved ON public.productscout_opportunities(is_saved);

CREATE INDEX IF NOT EXISTS idx_productscout_opp_evidence_opp ON public.productscout_opportunity_evidence(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_productscout_weak_signals_run ON public.productscout_weak_signals(run_id);
CREATE INDEX IF NOT EXISTS idx_productscout_saved_opps_opp ON public.productscout_saved_opportunities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_productscout_saved_opps_user ON public.productscout_saved_opportunities(user_id);

-- ----------------------------------------------------------------------------
-- 17. Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.productscout_research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_problem_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_existing_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_opportunity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_validation_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_weak_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productscout_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 18. RLS Policies (InitPlan Cached Subqueries)
-- ----------------------------------------------------------------------------

-- Runs Policies
CREATE POLICY "productscout_runs_select_policy"
    ON public.productscout_research_runs FOR SELECT
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
        OR organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid())))
    );

CREATE POLICY "productscout_runs_insert_policy"
    ON public.productscout_research_runs FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "productscout_runs_update_policy"
    ON public.productscout_research_runs FOR UPDATE
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "productscout_runs_delete_policy"
    ON public.productscout_research_runs FOR DELETE
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );

-- Read policies for pipeline entities (sources, signals, problems, clusters, solutions, gaps, opportunities, evidence, experiments, weak signals)
CREATE POLICY "productscout_sources_select_policy"
    ON public.productscout_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_sources_insert_policy"
    ON public.productscout_sources FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "productscout_signals_select_policy"
    ON public.productscout_signals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_signals_insert_policy"
    ON public.productscout_signals FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "productscout_problems_select_policy"
    ON public.productscout_problems FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_problems_insert_policy"
    ON public.productscout_problems FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "productscout_clusters_select_policy"
    ON public.productscout_problem_clusters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_clusters_insert_policy"
    ON public.productscout_problem_clusters FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "productscout_solutions_select_policy"
    ON public.productscout_existing_solutions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_solutions_insert_policy"
    ON public.productscout_existing_solutions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "productscout_gaps_select_policy"
    ON public.productscout_gaps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_gaps_insert_policy"
    ON public.productscout_gaps FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "productscout_opportunities_select_policy"
    ON public.productscout_opportunities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_opportunities_insert_policy"
    ON public.productscout_opportunities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "productscout_opportunities_update_policy"
    ON public.productscout_opportunities FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "productscout_opp_evidence_select_policy"
    ON public.productscout_opportunity_evidence FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_opp_evidence_insert_policy"
    ON public.productscout_opportunity_evidence FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "productscout_validation_select_policy"
    ON public.productscout_validation_experiments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_validation_insert_policy"
    ON public.productscout_validation_experiments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "productscout_validation_update_policy"
    ON public.productscout_validation_experiments FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "productscout_weak_signals_select_policy"
    ON public.productscout_weak_signals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productscout_weak_signals_insert_policy"
    ON public.productscout_weak_signals FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Saved Opportunities Policies
CREATE POLICY "productscout_saved_opps_select_policy"
    ON public.productscout_saved_opportunities FOR SELECT
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
        OR organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid())))
    );

CREATE POLICY "productscout_saved_opps_insert_policy"
    ON public.productscout_saved_opportunities FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "productscout_saved_opps_update_policy"
    ON public.productscout_saved_opportunities FOR UPDATE
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "productscout_saved_opps_delete_policy"
    ON public.productscout_saved_opportunities FOR DELETE
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );

-- Settings Policies
CREATE POLICY "productscout_settings_select_policy"
    ON public.productscout_settings FOR SELECT
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
        OR organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid())))
    );

CREATE POLICY "productscout_settings_insert_policy"
    ON public.productscout_settings FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );

CREATE POLICY "productscout_settings_update_policy"
    ON public.productscout_settings FOR UPDATE
    TO anon, authenticated
    USING (
        user_id IS NULL
        OR user_id = (SELECT auth.uid())
    );
