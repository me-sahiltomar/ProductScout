-- ============================================================================
-- Migration: 20260927110000_productscout_security_and_fk_cleanup.sql
-- Product: ProductScout (A CevonX Product)
-- Slug: productscout
-- Project Ref: gzhiltwyuhclzbhaypzd (CevonX Products Shared Platform)
-- Description:
--   1. Security: Drops raw AI provider secret columns (gemini_api_key, openai_api_key)
--      from public.productscout_settings. Secrets now reside purely in server-side
--      environment variables (GEMINI_API_KEY, OPENAI_API_KEY).
--   2. Performance: Covers all 19 foreign key relationships with targeted B-tree indexes.
--   3. Index Deduplication: Drops redundant idx_productscout_saved_opps_opp (covered by uq_productscout_saved_opp).
--   4. Idempotent Data Seeding: Ingests the initial reference research run into Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Security: Remove Provider API Keys from Settings Table
-- ----------------------------------------------------------------------------
ALTER TABLE public.productscout_settings
    DROP COLUMN IF EXISTS gemini_api_key,
    DROP COLUMN IF EXISTS openai_api_key;

-- ----------------------------------------------------------------------------
-- 2. Performance: Cover Foreign Keys with B-Tree Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_productscout_solutions_cluster
    ON public.productscout_existing_solutions(cluster_id);

CREATE INDEX IF NOT EXISTS idx_productscout_solutions_product
    ON public.productscout_existing_solutions(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_gaps_cluster
    ON public.productscout_gaps(cluster_id);

CREATE INDEX IF NOT EXISTS idx_productscout_gaps_product
    ON public.productscout_gaps(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_opps_product
    ON public.productscout_opportunities(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_opp_evidence_product
    ON public.productscout_opportunity_evidence(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_opp_evidence_signal
    ON public.productscout_opportunity_evidence(signal_id);

CREATE INDEX IF NOT EXISTS idx_productscout_clusters_product
    ON public.productscout_problem_clusters(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_problems_product
    ON public.productscout_problems(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_saved_opps_org
    ON public.productscout_saved_opportunities(organization_id);

CREATE INDEX IF NOT EXISTS idx_productscout_saved_opps_product
    ON public.productscout_saved_opportunities(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_settings_org
    ON public.productscout_settings(organization_id);

CREATE INDEX IF NOT EXISTS idx_productscout_settings_product
    ON public.productscout_settings(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_settings_user
    ON public.productscout_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_productscout_signals_product
    ON public.productscout_signals(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_signals_source
    ON public.productscout_signals(source_id);

CREATE INDEX IF NOT EXISTS idx_productscout_sources_product
    ON public.productscout_sources(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_validation_product
    ON public.productscout_validation_experiments(product_id);

CREATE INDEX IF NOT EXISTS idx_productscout_weak_signals_product
    ON public.productscout_weak_signals(product_id);

-- ----------------------------------------------------------------------------
-- 3. Deduplication: Drop redundant index
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS public.idx_productscout_saved_opps_opp;

-- ----------------------------------------------------------------------------
-- 4. Idempotent Data Seeding (Historical Reference Run)
-- ----------------------------------------------------------------------------
INSERT INTO public.productscout_research_runs (
    id, product_id, topic, timeframe, max_sources, focus, target_user, geography,
    industry, enabled_sources, status, current_step, raw_evidence_count, coverage,
    report_markdown, created_at, updated_at
) VALUES (
    'run_sample_ai_automation_smb',
    'productscout',
    'AI automation for small businesses',
    '30d',
    30,
    'Find repetitive operational problems that small business owners complain about and that could potentially become simple SaaS products or automation services.',
    'Small business owners & boutique operators',
    'North America / Global',
    'Services & Retail',
    ARRAY['reddit', 'hacker_news', 'github', 'devto', 'web'],
    'completed',
    'Completed',
    28,
    '{"dateRange": "Past 30 days", "sourcesSearched": ["reddit", "hacker_news", "github", "devto", "web"], "sourcesSucceeded": ["reddit", "hacker_news", "github", "devto", "web"], "sourcesUnavailable": [], "qualityDistribution": {"low": 3, "high": 14, "medium": 11}, "sourcesCollectedCount": 28}'::jsonb,
    '# ProductScout Report: AI automation for small businesses\n\nExecutive Summary\nHigh potential identified in instant inbound lead response and invoice reconciliation.',
    timezone('utc'::text, now()) - interval '4 hours',
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_signals (
    id, product_id, run_id, raw_id, title, url, platform, author, snippet,
    evidence_type, quality, quality_score, first_hand_markers, pain_quote, created_at
) VALUES 
(
    'ev_sample_1',
    'productscout',
    'run_sample_ai_automation_smb',
    'reddit_smb_01',
    'I spend 8 hours every weekend matching paper invoices with Stripe payouts',
    'https://reddit.com/r/smallbusiness/comments/invoicing_nightmare',
    'reddit',
    'bakery_owner_dan',
    'My wife and I run a commercial bakery. We invoice 60 restaurants weekly. Half pay by ACH, half via Stripe, some cash. I spend my entire Sunday cross-referencing QuickBooks and bank feeds. There is no simple tool that just matches deposit amounts to invoice numbers automatically.',
    'FIRST_HAND_USER_COMPLAINT',
    'HIGH',
    92,
    ARRAY['i spend', 'our company', 'we invoice', 'no simple tool'],
    'I spend my entire Sunday cross-referencing QuickBooks and bank feeds with no simple tool that just matches deposit amounts to invoice numbers automatically.',
    timezone('utc'::text, now()) - interval '3 days'
),
(
    'ev_sample_2',
    'productscout',
    'run_sample_ai_automation_smb',
    'hn_c_lead_drag',
    'Comment on: Why speed-to-lead is dying in service businesses',
    'https://news.ycombinator.com/item?id=38491021',
    'hacker_news',
    'contractor_ops',
    'We install HVAC. By the time my dispatchers see a web form submission, copy it into ServiceTitan, and dial the customer, 45 minutes have passed. Half the time the homeowner has already booked someone else. We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.',
    'WORKFLOW_PROBLEM',
    'HIGH',
    89,
    ARRAY['we install', 'by the time my dispatchers', 'we lose $5k+', 'copy it into'],
    'We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.',
    timezone('utc'::text, now()) - interval '5 days'
),
(
    'ev_sample_3',
    'productscout',
    'run_sample_ai_automation_smb',
    'gh_issue_webhook_fail',
    'Zapier Webhook timeouts on batch CRM sync leads to silent customer drops',
    'https://github.com/activecampaign/api/issues/492',
    'github',
    'agency_dev_mark',
    'Our agency maintains 20+ client Zapier automations. Whenever a form payload exceeds 500ms, Zapier drops the webhook without alert. Small business clients do not discover the missing leads until weeks later. A resilient queue dedicated for lead triage is urgently needed.',
    'GITHUB_ISSUE',
    'HIGH',
    86,
    ARRAY['our agency', 'small business clients do not discover', 'urgently needed'],
    'Small business clients do not discover the missing leads until weeks later due to dropped webhooks.',
    timezone('utc'::text, now()) - interval '9 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_problems (
    id, product_id, run_id, problem_statement, target_user, user_context, job_workflow,
    pain_point, why_painful, current_workaround, frequency, evidence_quotes, evidence_ids,
    signal_count, source_links, evidence_quality, confidence, created_at
) VALUES 
(
    'prob_1',
    'productscout',
    'run_sample_ai_automation_smb',
    'Delayed inbound lead response causing trade and service operators to lose high-value customer inquiries to faster competitors',
    'Trade contractors, home services, and boutique local businesses',
    'Managing inbound inquiries via website forms while out on job sites or during busy operational hours.',
    'Inbound lead form → Manual copy into CRM → Phone call dispatch',
    'Speed-to-lead latency exceeding 30–60 minutes, leading to immediate customer drop-off.',
    'Homeowners and buyers contact 2-3 vendors simultaneously; the first responsive contractor wins the contract.',
    'Dispatchers manually monitor email inboxes or operators frantically check phones between client visits.',
    'Daily (multiple times per day)',
    '[{"quote": "We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.", "author": "contractor_ops", "platform": "hacker_news", "sourceUrl": "https://news.ycombinator.com/item?id=38491021", "sourceTitle": "Comment on: Why speed-to-lead is dying in service businesses"}]'::jsonb,
    ARRAY['ev_sample_2', 'ev_sample_3'],
    4,
    ARRAY['https://news.ycombinator.com/item?id=38491021', 'https://github.com/activecampaign/api/issues/492'],
    'HIGH',
    88,
    timezone('utc'::text, now())
),
(
    'prob_2',
    'productscout',
    'run_sample_ai_automation_smb',
    'Manual invoice matching and multi-gateway payment reconciliation consuming operator weekends',
    'Small retail, wholesale suppliers, and boutique B2B agencies',
    'Managing accounts receivable across disparate payment rails (Stripe, ACH, bank transfers, checks).',
    'Invoice created → Bank payout received → Manual ledger line-item reconciliation',
    'Discrepancies in deposit batch amounts versus individual invoices requiring hours of manual cross-referencing.',
    'Wastes 5–8 hours every weekend and delays knowing which clients are truly overdue.',
    'Maintaining complex Google Sheets/Excel spreadsheets with manual copy-pasting',
    'Weekly (recurring routine)',
    '[{"quote": "I spend my entire Sunday cross-referencing QuickBooks and bank feeds with no simple tool that just matches deposit amounts to invoice numbers automatically.", "author": "bakery_owner_dan", "platform": "reddit", "sourceUrl": "https://reddit.com/r/smallbusiness/comments/invoicing_nightmare", "sourceTitle": "I spend 8 hours every weekend matching paper invoices with Stripe payouts"}]'::jsonb,
    ARRAY['ev_sample_1'],
    3,
    ARRAY['https://reddit.com/r/smallbusiness/comments/invoicing_nightmare'],
    'HIGH',
    82,
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_problem_clusters (
    id, product_id, run_id, cluster_name, description, problem_ids, signal_count,
    source_diversity, common_affected_users, common_workflow, overall_evidence_strength, created_at
) VALUES 
(
    'clust_1',
    'productscout',
    'run_sample_ai_automation_smb',
    'Lead Acquisition & Rapid Response Pipeline',
    'Operational bottlenecks centered on lead intake speed, automated qualification, and CRM synchronization.',
    ARRAY['prob_1'],
    4,
    3,
    'Trade contractors and local service business owners',
    'Inbound lead capture → instant qualification → calendar booking',
    'HIGH',
    timezone('utc'::text, now())
),
(
    'clust_2',
    'productscout',
    'run_sample_ai_automation_smb',
    'Financial Ops, Invoicing & Reconciliation',
    'Multi-rail payment tracking, overdue follow-ups, and accounting reconciliation friction.',
    ARRAY['prob_2'],
    3,
    2,
    'Small wholesale, retail, and service firm operators',
    'Invoice issuance → payment receipt → accounting ledger reconciliation',
    'HIGH',
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_existing_solutions (
    id, product_id, run_id, cluster_id, name, type, what_users_do, positive_aspects,
    complaints, missing_functionality, pricing_info, integration_limitations,
    complexity_friction, unserved_segments, created_at
) VALUES (
    'sol_sample_crm',
    'productscout',
    'run_sample_ai_automation_smb',
    'clust_1',
    'HubSpot / ServiceTitan / Jobber',
    'software_product',
    'Use large enterprise suites to manage jobs, invoices, and CRM records.',
    ARRAY['Comprehensive all-in-one features', 'Industry recognition'],
    ARRAY['Extremely expensive ($250+/month)', 'Cluttered and slow mobile interfaces', 'Weak automated SMS qualification without high-tier add-ons'],
    ARRAY['Sub-60-second autonomous two-way SMS qualification without complex custom engineering'],
    '$150 – $400/month',
    ARRAY['Requires heavy Zapier configurations for lightweight custom forms'],
    'Requires dedicated training and hours of menu navigation.',
    'Solo contractors and businesses with under 5 employees who want instant automation without software bloat.',
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_gaps (
    id, product_id, run_id, cluster_id, gap_type, title, description,
    supporting_evidence_ids, supporting_quotes, is_ai_inference, created_at
) VALUES (
    'gap_1',
    'productscout',
    'run_sample_ai_automation_smb',
    'clust_1',
    'excessive_complexity',
    'Existing CRM & field software is too bloated and slow for instant mobile lead qualification',
    'Incumbents prioritize deep accounting and dispatch features at the cost of lightweight, instant customer engagement within the critical first 5 minutes.',
    ARRAY['ev_sample_2'],
    ARRAY['We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.'],
    false,
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_opportunities (
    id, product_id, run_id, cluster_id, name, one_line_description, target_customer,
    user_problem, evidence_summary, evidence_quotes, existing_alternatives, gap,
    proposed_solution, core_workflow, why_useful, mvp_scope, what_not_to_build_initially,
    technical_complexity, estimated_mvp_build_time, key_dependencies, major_risks,
    monetization_possibilities, distribution_difficulty, evidence_confidence, mvp_profile,
    is_saved, notes, created_at, updated_at
) VALUES (
    'opp_leadpulse',
    'productscout',
    'run_sample_ai_automation_smb',
    'clust_1',
    'LeadPulse: 60-Second Inbound Lead Responder & Qualifier',
    'Instantly qualifies website leads via conversational SMS within 60 seconds and syncs directly to spreadsheets.',
    'Trade contractors, home services, and boutique local businesses',
    'Delayed inbound lead response causing operators to lose high-value customer inquiries to faster competitors.',
    'Backed by 4 independent user signals across Reddit, Hacker News, and GitHub. Operators report losing $5,000+ monthly due to manual lead delay.',
    '[{"quote": "We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.", "author": "contractor_ops", "platform": "hacker_news", "url": "https://news.ycombinator.com/item?id=38491021"}]'::jsonb,
    'Manual email checks, bloated $300/mo CRMs, or fragile Zapier-to-Twilio hacks.',
    'No lightweight tool bridges the gap between web form submission and immediate 2-way conversational SMS qualification without enterprise bloat.',
    'A dead-simple webhook receiver that captures incoming form leads, immediately texts the customer with smart qualifying questions, and posts verified jobs directly into the owner’s phone & Google Sheet.',
    'Web form submitted → Instant SMS sent within 30s → Lead replies with timing/budget → Owner gets notified via push & spreadsheet updated',
    'Recovers thousands in lost revenue by capitalizing on customer buying intent during the first 5 minutes.',
    ARRAY['Webhook receiver for Typeform, Webflow, and WordPress forms', 'Twilio SMS engine with 2-question qualification sequence', 'Real-time Google Sheet sync', 'SMS alert to business owner when lead is qualified'],
    ARRAY['No visual drag-and-drop workflow canvas', 'No mobile app (pure web/SMS/Google Sheets interface)', 'No multi-seat call center management', 'No custom billing engine'],
    'Low',
    '5–7 business days',
    ARRAY['Twilio SMS API', 'Google Sheets API', 'Node.js webhook receiver'],
    ARRAY['Twilio A2P 10DLC registration requirements for US SMS carriers'],
    ARRAY['$49/month flat fee for up to 200 leads', '$99/month for multi-location businesses'],
    'Low',
    88,
    '{"complexity": "Low", "aiRequirements": "Lightweight prompt classifying lead intent and urgent timing", "coreComponents": ["Webhook ingestion endpoint", "Twilio conversational SMS worker", "Google Sheets append integration", "Owner SMS notification trigger"], "mainBusinessRisks": ["Low lead volume for micro businesses causing perceived lack of value"], "dataRequirements": "Encrypted storage for webhook secrets and recent conversation states", "mainTechnicalRisks": ["Carrier SMS delivery filtering"], "estimatedBuildTime": "5–7 business days", "requiredIntegrations": ["Twilio", "Google Sheets"], "validationDifficulty": "Low"}'::jsonb,
    true,
    'High demand in local service subreddits; strong potential for $49/mo micro-SaaS.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_validation_experiments (
    opportunity_id, product_id, hypothesis, test, target_users, success_signal,
    invalidation_signal, created_at, updated_at
) VALUES (
    'opp_leadpulse',
    'productscout',
    'Home service operators will pay $49/mo to automatically qualify leads within 60 seconds of form submission.',
    'Reach out to 10 local contractors on Reddit and local forums. Offer a 3-day concierge trial where we hook their existing contact form to our SMS test number for free.',
    'Local HVAC, plumbing, roofing, and remodeling contractors',
    'At least 3 of 10 operators report booking a client that would have otherwise gone cold, and agree to paid subscription.',
    'Contractors report their customers prefer email or that leads complain about receiving an automated text.',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
) ON CONFLICT (opportunity_id) DO NOTHING;

INSERT INTO public.productscout_opportunity_evidence (
    opportunity_id, product_id, signal_id, quote, url, platform, author,
    is_direct_first_hand, created_at
) VALUES (
    'opp_leadpulse',
    'productscout',
    'ev_sample_2',
    'We lose $5k+ jobs every month simply because no software immediately texts the prospect back with automated qualification.',
    'https://news.ycombinator.com/item?id=38491021',
    'hacker_news',
    'contractor_ops',
    true,
    timezone('utc'::text, now())
) ON CONFLICT (opportunity_id, quote) DO NOTHING;

INSERT INTO public.productscout_weak_signals (
    id, product_id, run_id, title, user_statement, platform, source_url,
    why_insufficient, potential_value, created_at
) VALUES (
    'weak_1',
    'productscout',
    'run_sample_ai_automation_smb',
    'AI phone call answering for noisy warehouse environments',
    'I wish someone made an AI phone bot that could decipher background noise in our scrap yard.',
    'reddit',
    'https://reddit.com/r/smallbusiness/comments/phone_noise',
    'Single isolated request with high technical speech-to-noise complexity and insufficient willingness-to-pay signals.',
    'Could be revisited if low-latency noise cancellation models improve.',
    timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productscout_saved_opportunities (
    opportunity_id, product_id, notes, opportunity_snapshot, created_at, updated_at
) VALUES (
    'opp_leadpulse',
    'productscout',
    'High demand in local service subreddits; strong potential for $49/mo micro-SaaS.',
    '{"id": "opp_leadpulse", "name": "LeadPulse: 60-Second Inbound Lead Responder & Qualifier", "target_customer": "Trade contractors, home services, and boutique local businesses"}'::jsonb,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
) ON CONFLICT (opportunity_id) DO NOTHING;
