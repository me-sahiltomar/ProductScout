-- ============================================================================
-- Migration: 20260927120000_productscout_multi_tenant_isolation.sql
-- Description: Implement strict multi-tenant data isolation and RLS policies
-- Product: ProductScout (A CevonX Product)
-- Project: CevonX Products (gzhiltwyuhclzbhaypzd)
-- ============================================================================

-- 1. Add is_reference flag to distinguish public benchmark runs from private tenant runs
ALTER TABLE public.productscout_research_runs
ADD COLUMN IF NOT EXISTS is_reference BOOLEAN NOT NULL DEFAULT false;

-- Create index for is_reference scan optimization
CREATE INDEX IF NOT EXISTS idx_productscout_runs_is_ref 
ON public.productscout_research_runs (is_reference) 
WHERE is_reference = true;

-- Mark reference run as public benchmark
UPDATE public.productscout_research_runs
SET is_reference = true
WHERE id = 'run_sample_ai_automation_smb';

-- 2. Drop existing overly-permissive RLS policies on all ProductScout tables
DROP POLICY IF EXISTS productscout_runs_select_policy ON public.productscout_research_runs;
DROP POLICY IF EXISTS productscout_runs_insert_policy ON public.productscout_research_runs;
DROP POLICY IF EXISTS productscout_runs_update_policy ON public.productscout_research_runs;
DROP POLICY IF EXISTS productscout_runs_delete_policy ON public.productscout_research_runs;

DROP POLICY IF EXISTS productscout_sources_select_policy ON public.productscout_sources;
DROP POLICY IF EXISTS productscout_sources_insert_policy ON public.productscout_sources;

DROP POLICY IF EXISTS productscout_signals_select_policy ON public.productscout_signals;
DROP POLICY IF EXISTS productscout_signals_insert_policy ON public.productscout_signals;

DROP POLICY IF EXISTS productscout_problems_select_policy ON public.productscout_problems;
DROP POLICY IF EXISTS productscout_problems_insert_policy ON public.productscout_problems;

DROP POLICY IF EXISTS productscout_clusters_select_policy ON public.productscout_problem_clusters;
DROP POLICY IF EXISTS productscout_clusters_insert_policy ON public.productscout_problem_clusters;

DROP POLICY IF EXISTS productscout_solutions_select_policy ON public.productscout_existing_solutions;
DROP POLICY IF EXISTS productscout_solutions_insert_policy ON public.productscout_existing_solutions;

DROP POLICY IF EXISTS productscout_gaps_select_policy ON public.productscout_gaps;
DROP POLICY IF EXISTS productscout_gaps_insert_policy ON public.productscout_gaps;

DROP POLICY IF EXISTS productscout_opportunities_select_policy ON public.productscout_opportunities;
DROP POLICY IF EXISTS productscout_opportunities_insert_policy ON public.productscout_opportunities;
DROP POLICY IF EXISTS productscout_opportunities_update_policy ON public.productscout_opportunities;

DROP POLICY IF EXISTS productscout_opp_evidence_select_policy ON public.productscout_opportunity_evidence;
DROP POLICY IF EXISTS productscout_opp_evidence_insert_policy ON public.productscout_opportunity_evidence;

DROP POLICY IF EXISTS productscout_validation_select_policy ON public.productscout_validation_experiments;
DROP POLICY IF EXISTS productscout_validation_insert_policy ON public.productscout_validation_experiments;
DROP POLICY IF EXISTS productscout_validation_update_policy ON public.productscout_validation_experiments;

DROP POLICY IF EXISTS productscout_weak_signals_select_policy ON public.productscout_weak_signals;
DROP POLICY IF EXISTS productscout_weak_signals_insert_policy ON public.productscout_weak_signals;

DROP POLICY IF EXISTS productscout_saved_opps_select_policy ON public.productscout_saved_opportunities;
DROP POLICY IF EXISTS productscout_saved_opps_insert_policy ON public.productscout_saved_opportunities;
DROP POLICY IF EXISTS productscout_saved_opps_update_policy ON public.productscout_saved_opportunities;
DROP POLICY IF EXISTS productscout_saved_opps_delete_policy ON public.productscout_saved_opportunities;

DROP POLICY IF EXISTS productscout_settings_select_policy ON public.productscout_settings;
DROP POLICY IF EXISTS productscout_settings_insert_policy ON public.productscout_settings;
DROP POLICY IF EXISTS productscout_settings_update_policy ON public.productscout_settings;

-- 3. Create hardened RLS policies on productscout_research_runs
-- Public can read benchmark reference runs; authenticated users can read their own or organization runs
CREATE POLICY productscout_runs_select_policy ON public.productscout_research_runs
FOR SELECT TO anon, authenticated
USING (
    is_reference = true
    OR (
        (SELECT auth.uid()) IS NOT NULL 
        AND (
            user_id = (SELECT auth.uid())
            OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
        )
    )
);

CREATE POLICY productscout_runs_insert_policy ON public.productscout_research_runs
FOR INSERT TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);

CREATE POLICY productscout_runs_update_policy ON public.productscout_research_runs
FOR UPDATE TO authenticated
USING (
    (user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid())))))
    AND NOT is_reference
);

CREATE POLICY productscout_runs_delete_policy ON public.productscout_research_runs
FOR DELETE TO authenticated
USING (
    (user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid())))))
    AND NOT is_reference
);

-- 4. Create child table RLS policies tied to parent research run access
-- Macro for sources, signals, problems, clusters, solutions, gaps, opportunities, weak signals

-- SOURCES
CREATE POLICY productscout_sources_select_policy ON public.productscout_sources
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_sources.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_sources_insert_policy ON public.productscout_sources
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_sources.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- SIGNALS
CREATE POLICY productscout_signals_select_policy ON public.productscout_signals
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_signals.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_signals_insert_policy ON public.productscout_signals
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_signals.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- PROBLEMS
CREATE POLICY productscout_problems_select_policy ON public.productscout_problems
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_problems.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_problems_insert_policy ON public.productscout_problems
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_problems.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- CLUSTERS
CREATE POLICY productscout_clusters_select_policy ON public.productscout_problem_clusters
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_problem_clusters.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_clusters_insert_policy ON public.productscout_problem_clusters
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_problem_clusters.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- SOLUTIONS
CREATE POLICY productscout_solutions_select_policy ON public.productscout_existing_solutions
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_existing_solutions.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_solutions_insert_policy ON public.productscout_existing_solutions
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_existing_solutions.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- GAPS
CREATE POLICY productscout_gaps_select_policy ON public.productscout_gaps
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_gaps.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_gaps_insert_policy ON public.productscout_gaps
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_gaps.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- OPPORTUNITIES
CREATE POLICY productscout_opportunities_select_policy ON public.productscout_opportunities
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_opportunities.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_opportunities_insert_policy ON public.productscout_opportunities
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_opportunities.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

CREATE POLICY productscout_opportunities_update_policy ON public.productscout_opportunities
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_opportunities.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- WEAK SIGNALS
CREATE POLICY productscout_weak_signals_select_policy ON public.productscout_weak_signals
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_weak_signals.run_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_weak_signals_insert_policy ON public.productscout_weak_signals
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_research_runs r
        WHERE r.id = productscout_weak_signals.run_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- OPPORTUNITY EVIDENCE
CREATE POLICY productscout_opp_evidence_select_policy ON public.productscout_opportunity_evidence
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_opportunities o
        JOIN public.productscout_research_runs r ON r.id = o.run_id
        WHERE o.id = productscout_opportunity_evidence.opportunity_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_opp_evidence_insert_policy ON public.productscout_opportunity_evidence
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_opportunities o
        JOIN public.productscout_research_runs r ON r.id = o.run_id
        WHERE o.id = productscout_opportunity_evidence.opportunity_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- VALIDATION EXPERIMENTS
CREATE POLICY productscout_validation_select_policy ON public.productscout_validation_experiments
FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_opportunities o
        JOIN public.productscout_research_runs r ON r.id = o.run_id
        WHERE o.id = productscout_validation_experiments.opportunity_id
          AND (
              r.is_reference = true
              OR ((SELECT auth.uid()) IS NOT NULL AND (
                  r.user_id = (SELECT auth.uid())
                  OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
              ))
          )
    )
);

CREATE POLICY productscout_validation_insert_policy ON public.productscout_validation_experiments
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.productscout_opportunities o
        JOIN public.productscout_research_runs r ON r.id = o.run_id
        WHERE o.id = productscout_validation_experiments.opportunity_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

CREATE POLICY productscout_validation_update_policy ON public.productscout_validation_experiments
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.productscout_opportunities o
        JOIN public.productscout_research_runs r ON r.id = o.run_id
        WHERE o.id = productscout_validation_experiments.opportunity_id
          AND (
              r.user_id = (SELECT auth.uid())
              OR (r.organization_id IS NOT NULL AND r.organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
          )
    )
);

-- 5. SAVED OPPORTUNITIES (Bookmarks & Founder Notes)
CREATE POLICY productscout_saved_opps_select_policy ON public.productscout_saved_opportunities
FOR SELECT TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);

CREATE POLICY productscout_saved_opps_insert_policy ON public.productscout_saved_opportunities
FOR INSERT TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);

CREATE POLICY productscout_saved_opps_update_policy ON public.productscout_saved_opportunities
FOR UPDATE TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);

CREATE POLICY productscout_saved_opps_delete_policy ON public.productscout_saved_opportunities
FOR DELETE TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);

-- 6. SETTINGS
CREATE POLICY productscout_settings_select_policy ON public.productscout_settings
FOR SELECT TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);

CREATE POLICY productscout_settings_insert_policy ON public.productscout_settings
FOR INSERT TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);

CREATE POLICY productscout_settings_update_policy ON public.productscout_settings
FOR UPDATE TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND organization_id IN (SELECT private.get_user_org_ids((SELECT auth.uid()))))
);
