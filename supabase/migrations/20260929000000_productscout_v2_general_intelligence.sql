-- Migration: ProductScout V2.0 General Opportunity Intelligence Platform
-- Adds structured Research Brief and Adaptive Evaluation columns

ALTER TABLE public.productscout_research_runs
ADD COLUMN IF NOT EXISTS brief JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS adaptive_output_type TEXT DEFAULT NULL;

ALTER TABLE public.productscout_opportunities
ADD COLUMN IF NOT EXISTS opportunity_type TEXT NOT NULL DEFAULT 'SaaS',
ADD COLUMN IF NOT EXISTS evaluation JSONB DEFAULT NULL;

-- Create index on opportunity_type for rapid category filtering
CREATE INDEX IF NOT EXISTS idx_productscout_opps_type 
ON public.productscout_opportunities(opportunity_type);
