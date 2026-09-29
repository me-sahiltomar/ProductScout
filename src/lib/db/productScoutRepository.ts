import {
  ResearchRun,
  SystemSettings,
  ProductOpportunity,
  ClassifiedEvidence,
  ExtractedProblem,
  ProblemCluster,
  ExistingSolution,
  MarketGap,
  WeakSignal,
  ValidationExperiment,
  ResearchRunConfig,
  ResearchCoverage,
} from '@/types';
import { getSupabaseAdminClient, isSupabaseConfigured } from './supabaseClient';
import { Database as LocalDatabase } from './database';
import { normalizeBrief } from '../engine/opportunityGenerator';
import { resolveAdaptiveOutputType } from '../engine/reportGenerator';

export interface RunSummary {
  id: string;
  createdAt: string;
  topic: string;
  timeframe: string;
  focus: string;
  status: 'pending' | 'collecting' | 'analyzing' | 'completed' | 'failed';
  is_reference?: boolean;
  sourcesCount: number;
  problemsCount: number;
  opportunitiesCount: number;
  weakSignalsCount: number;
}

export interface UserScope {
  userId?: string | null;
  organizationId?: string | null;
}

export class ProductScoutRepository {
  private localDb: LocalDatabase;

  constructor() {
    this.localDb = LocalDatabase.getInstance();
  }

  private get supabase() {
    return getSupabaseAdminClient();
  }

  // --------------------------------------------------------------------------
  // RESEARCH RUNS
  // --------------------------------------------------------------------------

  public async getRuns(scope?: UserScope): Promise<RunSummary[]> {
    const client = this.supabase;
    if (!client) {
      console.warn('[ProductScout] Supabase credentials not detected; using offline local storage.');
      const allRuns = this.localDb.getRuns();
      const filtered = scope?.userId
        ? allRuns
        : allRuns.filter(r => r.id === 'run_sample_ai_automation_smb' || r.is_reference);

      return filtered.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        topic: r.config.topic,
        timeframe: r.config.timeframe,
        focus: r.config.focus,
        status: r.status,
        is_reference: r.id === 'run_sample_ai_automation_smb' || Boolean(r.is_reference),
        sourcesCount: r.coverage?.sourcesCollectedCount || r.rawEvidenceCount || 0,
        problemsCount: r.problems?.length || 0,
        opportunitiesCount: r.opportunities?.length || 0,
        weakSignalsCount: r.weakSignals?.length || 0,
      }));
    }

    try {
      let query = client
        .from('productscout_research_runs')
        .select(`
          id,
          created_at,
          topic,
          timeframe,
          focus,
          status,
          raw_evidence_count,
          coverage,
          is_reference,
          user_id,
          organization_id
        `)
        .order('created_at', { ascending: false });

      if (scope?.userId || scope?.organizationId) {
        const filters = ['is_reference.eq.true'];
        if (scope.userId) filters.push(`user_id.eq.${scope.userId}`);
        if (scope.organizationId) filters.push(`organization_id.eq.${scope.organizationId}`);
        query = query.or(filters.join(','));
      } else {
        query = query.eq('is_reference', true);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to load research runs from Supabase: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch child counts for each run
      const [probCounts, oppCounts, weakCounts] = await Promise.all([
        client.from('productscout_problems').select('run_id'),
        client.from('productscout_opportunities').select('run_id'),
        client.from('productscout_weak_signals').select('run_id'),
      ]);

      const probMap = new Map<string, number>();
      for (const p of probCounts.data || []) {
        probMap.set(p.run_id, (probMap.get(p.run_id) || 0) + 1);
      }

      const oppMap = new Map<string, number>();
      for (const o of oppCounts.data || []) {
        oppMap.set(o.run_id, (oppMap.get(o.run_id) || 0) + 1);
      }

      const weakMap = new Map<string, number>();
      for (const w of weakCounts.data || []) {
        weakMap.set(w.run_id, (weakMap.get(w.run_id) || 0) + 1);
      }

      return data.map(r => {
        const cov = (r.coverage as any) || {};
        return {
          id: r.id,
          createdAt: r.created_at,
          topic: r.topic,
          timeframe: r.timeframe,
          focus: r.focus || '',
          status: r.status as any,
          is_reference: r.is_reference ?? false,
          sourcesCount: cov.sourcesCollectedCount || r.raw_evidence_count || 0,
          problemsCount: probMap.get(r.id) || 0,
          opportunitiesCount: oppMap.get(r.id) || 0,
          weakSignalsCount: weakMap.get(r.id) || 0,
        };
      });
    } catch (err: any) {
      console.error('Supabase getRuns error:', err);
      throw err;
    }
  }

  public async getRunById(id: string, scope?: UserScope): Promise<ResearchRun | null> {
    const client = this.supabase;
    if (!client) {
      const run = this.localDb.getRunById(id) || null;
      if (run) {
        run.is_reference = run.id === 'run_sample_ai_automation_smb' || Boolean(run.is_reference);
        if (!run.brief) {
          run.brief = run.config.brief || normalizeBrief(run.config);
        }
        if (!run.adaptiveOutputType) {
          run.adaptiveOutputType = resolveAdaptiveOutputType(run.brief);
        }
        run.opportunities = (run.opportunities || []).map(o => ({
          ...o,
          opportunityType: o.opportunityType || 'SaaS',
        }));
      }
      return run;
    }

    try {
      const { data: runRow, error: runErr } = await client
        .from('productscout_research_runs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (runErr) {
        throw new Error(`Failed to load research run ${id} from Supabase: ${runErr.message}`);
      }

      if (!runRow) {
        return null;
      }

      // Access enforcement: reference benchmark runs are public; private runs require matching userId or organizationId
      if (!runRow.is_reference) {
        const hasAccess =
          (scope?.userId && runRow.user_id === scope.userId) ||
          (scope?.organizationId && runRow.organization_id === scope.organizationId);

        if (!hasAccess) {
          throw new Error('Access denied: You do not have permission to view this research run');
        }
      }

      // Fetch all child entities concurrently
      const [
        signalsRes,
        problemsRes,
        clustersRes,
        solutionsRes,
        gapsRes,
        oppsRes,
        weakRes,
        savedRes,
      ] = await Promise.all([
        client.from('productscout_signals').select('*').eq('run_id', id),
        client.from('productscout_problems').select('*').eq('run_id', id),
        client.from('productscout_problem_clusters').select('*').eq('run_id', id),
        client.from('productscout_existing_solutions').select('*').eq('run_id', id),
        client.from('productscout_gaps').select('*').eq('run_id', id),
        client.from('productscout_opportunities').select('*').eq('run_id', id),
        client.from('productscout_weak_signals').select('*').eq('run_id', id),
        client.from('productscout_saved_opportunities').select('*'),
      ]);

      const oppIds = (oppsRes.data || []).map(o => o.id);
      let experimentsMap = new Map<string, ValidationExperiment>();
      if (oppIds.length > 0) {
        const { data: expRows } = await client
          .from('productscout_validation_experiments')
          .select('*')
          .in('opportunity_id', oppIds);

        for (const exp of expRows || []) {
          experimentsMap.set(exp.opportunity_id, {
            hypothesis: exp.hypothesis,
            test: exp.test,
            targetUsers: exp.target_users,
            successSignal: exp.success_signal,
            invalidationSignal: exp.invalidation_signal,
          });
        }
      }

      const savedMap = new Map<string, { isSaved: boolean; notes?: string }>();
      for (const s of savedRes.data || []) {
        savedMap.set(s.opportunity_id, { isSaved: true, notes: s.notes || undefined });
      }

      const classifiedEvidence: ClassifiedEvidence[] = (signalsRes.data || []).map(s => ({
        id: s.id,
        rawId: s.raw_id || s.id,
        title: s.title,
        url: s.url,
        platform: s.platform as any,
        author: s.author || undefined,
        date: s.published_date || undefined,
        snippet: s.snippet,
        evidenceType: s.evidence_type as any,
        quality: s.quality as any,
        qualityScore: Number(s.quality_score) || 0,
        firstHandMarkers: s.first_hand_markers || [],
        painQuote: s.pain_quote || undefined,
      }));

      const problems: ExtractedProblem[] = (problemsRes.data || []).map(p => ({
        id: p.id,
        problemStatement: p.problem_statement,
        targetUser: p.target_user,
        userContext: p.user_context,
        jobWorkflow: p.job_workflow,
        painPoint: p.pain_point,
        whyPainful: p.why_painful,
        currentWorkaround: p.current_workaround,
        frequency: p.frequency,
        evidenceQuotes: (p.evidence_quotes as any) || [],
        evidenceIds: p.evidence_ids || [],
        signalCount: p.signal_count,
        sourceLinks: p.source_links || [],
        evidenceQuality: p.evidence_quality as any,
        confidence: Number(p.confidence) || 0,
      }));

      const clusters: ProblemCluster[] = (clustersRes.data || []).map(c => ({
        id: c.id,
        clusterName: c.cluster_name,
        description: c.description,
        problemIds: c.problem_ids || [],
        signalCount: c.signal_count,
        sourceDiversity: c.source_diversity,
        commonAffectedUsers: c.common_affected_users,
        commonWorkflow: c.common_workflow,
        overallEvidenceStrength: c.overall_evidence_strength as any,
      }));

      const existingSolutions: ExistingSolution[] = (solutionsRes.data || []).map(sol => ({
        name: sol.name,
        type: sol.type as any,
        whatUsersDo: sol.what_users_do,
        positiveAspects: sol.positive_aspects || [],
        complaints: sol.complaints || [],
        missingFunctionality: sol.missing_functionality || [],
        pricingInfo: sol.pricing_info || undefined,
        integrationLimitations: sol.integration_limitations || [],
        complexityFriction: sol.complexity_friction || '',
        unservedSegments: sol.unserved_segments || '',
      }));

      const gaps: MarketGap[] = (gapsRes.data || []).map(g => ({
        id: g.id,
        gapType: g.gap_type as any,
        title: g.title,
        description: g.description,
        supportingEvidenceIds: g.supporting_evidence_ids || [],
        supportingQuotes: g.supporting_quotes || [],
        isAiInference: Boolean(g.is_ai_inference),
      }));

      const opportunities: ProductOpportunity[] = (oppsRes.data || []).map(o => {
        const savedMeta = savedMap.get(o.id);
        const exp = experimentsMap.get(o.id) || {
          hypothesis: '',
          test: '',
          targetUsers: o.target_customer,
          successSignal: '',
          invalidationSignal: '',
        };

        return {
          id: o.id,
          name: o.name,
          oneLineDescription: o.one_line_description,
          targetCustomer: o.target_customer,
          userProblem: o.user_problem,
          evidenceSummary: o.evidence_summary,
          evidenceQuotes: (o.evidence_quotes as any) || [],
          existingAlternatives: o.existing_alternatives,
          gap: o.gap,
          proposedSolution: o.proposed_solution,
          coreWorkflow: o.core_workflow,
          whyUseful: o.why_useful,
          mvpScope: o.mvp_scope || [],
          whatNotToBuildInitially: o.what_not_to_build_initially || [],
          technicalComplexity: o.technical_complexity as any,
          estimatedMvpBuildTime: o.estimated_mvp_build_time,
          keyDependencies: o.key_dependencies || [],
          majorRisks: o.major_risks || [],
          monetizationPossibilities: o.monetization_possibilities || [],
          distributionDifficulty: o.distribution_difficulty as any,
          validationExperiment: exp,
          evidenceConfidence: Number(o.evidence_confidence) || 0,
          clusterId: o.cluster_id || undefined,
          mvpProfile: (o.mvp_profile as any) || {},
          opportunityType: (o.opportunity_type as any) || 'SaaS',
          evaluation: (o.evaluation as any) || undefined,
          isSaved: savedMeta ? savedMeta.isSaved : Boolean(o.is_saved),
          notes: savedMeta?.notes ?? o.notes ?? undefined,
        };
      });

      const weakSignals: WeakSignal[] = (weakRes.data || []).map(w => ({
        id: w.id,
        title: w.title,
        userStatement: w.user_statement,
        platform: w.platform as any,
        sourceUrl: w.source_url,
        whyInsufficient: w.why_insufficient,
        potentialValue: w.potential_value,
      }));

      const config: ResearchRunConfig = {
        topic: runRow.topic,
        timeframe: runRow.timeframe as any,
        maxSources: runRow.max_sources,
        focus: runRow.focus || '',
        targetUser: runRow.target_user || undefined,
        geography: runRow.geography || undefined,
        industry: runRow.industry || undefined,
        enabledSources: (runRow.enabled_sources as any) || [],
      };

      const coverage: ResearchCoverage = (runRow.coverage as any) || {
        sourcesSearched: [],
        sourcesCollectedCount: runRow.raw_evidence_count || 0,
        sourcesSucceeded: [],
        sourcesUnavailable: [],
        dateRange: runRow.timeframe,
        qualityDistribution: { high: 0, medium: 0, low: 0 },
      };

      const brief = (runRow.brief as any) || (config.brief) || normalizeBrief(config);
      const adaptiveOutputType = (runRow.adaptive_output_type as any) || resolveAdaptiveOutputType(brief);

      return {
        id: runRow.id,
        createdAt: runRow.created_at,
        config,
        brief,
        adaptiveOutputType,
        status: runRow.status as any,
        is_reference: runRow.is_reference ?? false,
        currentStep: runRow.current_step || undefined,
        coverage,
        rawEvidenceCount: runRow.raw_evidence_count,
        classifiedEvidence,
        problems,
        clusters,
        existingSolutions,
        gaps,
        opportunities,
        weakSignals,
        reportMarkdown: runRow.report_markdown || '',
        error: runRow.error || undefined,
      };
    } catch (err: any) {
      console.error(`Supabase getRunById(${id}) error:`, err);
      throw err;
    }
  }

  public async saveRun(run: ResearchRun, scope?: UserScope): Promise<void> {
    const client = this.supabase;
    if (!client) {
      console.warn('[ProductScout] Supabase credentials not detected; persisting locally.');
      this.localDb.saveRun(run);
      return;
    }

    try {
      // 1. Persist Run Header
      const { error: runErr } = await client.from('productscout_research_runs').upsert({
        id: run.id,
        product_id: 'productscout',
        user_id: scope?.userId || null,
        organization_id: scope?.organizationId || null,
        is_reference: (run as any).isReference || false,
        topic: run.config.topic,
        timeframe: run.config.timeframe,
        max_sources: run.config.maxSources,
        focus: run.config.focus || null,
        target_user: run.config.targetUser || null,
        geography: run.config.geography || null,
        industry: run.config.industry || null,
        enabled_sources: run.config.enabledSources || [],
        status: run.status,
        current_step: run.currentStep || null,
        raw_evidence_count: run.rawEvidenceCount || 0,
        coverage: (run.coverage as any) || {},
        report_markdown: run.reportMarkdown || null,
        error: run.error || null,
        brief: (run.brief || run.config.brief) ? JSON.parse(JSON.stringify(run.brief || run.config.brief)) : null,
        adaptive_output_type: run.adaptiveOutputType || null,
        created_at: run.createdAt,
        updated_at: new Date().toISOString(),
      });

      if (runErr) {
        throw new Error(`Failed to persist research run to Supabase: ${runErr.message}`);
      }

      // 2. Persist Classified Evidence (Signals) if present
      if (run.classifiedEvidence && run.classifiedEvidence.length > 0) {
        const signalRows = run.classifiedEvidence.map(s => ({
          id: s.id,
          product_id: 'productscout',
          run_id: run.id,
          raw_id: s.rawId || s.id,
          title: s.title,
          url: s.url,
          platform: s.platform,
          author: s.author || null,
          published_date: s.date || null,
          snippet: s.snippet,
          evidence_type: s.evidenceType,
          quality: s.quality,
          quality_score: s.qualityScore,
          first_hand_markers: s.firstHandMarkers || [],
          pain_quote: s.painQuote || null,
        }));
        const { error: sigErr } = await client.from('productscout_signals').upsert(signalRows);
        if (sigErr) {
          throw new Error(`Failed to persist signals to Supabase: ${sigErr.message}`);
        }
      }

      // 3. Persist Extracted Problems if present
      if (run.problems && run.problems.length > 0) {
        const problemRows = run.problems.map(p => ({
          id: p.id,
          product_id: 'productscout',
          run_id: run.id,
          problem_statement: p.problemStatement,
          target_user: p.targetUser,
          user_context: p.userContext,
          job_workflow: p.jobWorkflow,
          pain_point: p.painPoint,
          why_painful: p.whyPainful,
          current_workaround: p.currentWorkaround,
          frequency: p.frequency,
          evidence_quotes: p.evidenceQuotes as any,
          evidence_ids: p.evidenceIds || [],
          signal_count: p.signalCount,
          source_links: p.sourceLinks || [],
          evidence_quality: p.evidenceQuality,
          confidence: p.confidence,
        }));
        const { error: probErr } = await client.from('productscout_problems').upsert(problemRows);
        if (probErr) {
          throw new Error(`Failed to persist problems to Supabase: ${probErr.message}`);
        }
      }

      // 4. Persist Problem Clusters if present
      if (run.clusters && run.clusters.length > 0) {
        const clusterRows = run.clusters.map(c => ({
          id: c.id,
          product_id: 'productscout',
          run_id: run.id,
          cluster_name: c.clusterName,
          description: c.description,
          problem_ids: c.problemIds || [],
          signal_count: c.signalCount,
          source_diversity: c.sourceDiversity,
          common_affected_users: c.commonAffectedUsers,
          common_workflow: c.commonWorkflow,
          overall_evidence_strength: c.overallEvidenceStrength,
        }));
        const { error: clusErr } = await client.from('productscout_problem_clusters').upsert(clusterRows);
        if (clusErr) {
          throw new Error(`Failed to persist clusters to Supabase: ${clusErr.message}`);
        }
      }

      // 5. Persist Existing Solutions if present
      if (run.existingSolutions && run.existingSolutions.length > 0) {
        const solRows = run.existingSolutions.map((sol, idx) => ({
          id: `sol_${run.id}_${idx}`,
          product_id: 'productscout',
          run_id: run.id,
          name: sol.name,
          type: sol.type,
          what_users_do: sol.whatUsersDo,
          positive_aspects: sol.positiveAspects || [],
          complaints: sol.complaints || [],
          missing_functionality: sol.missingFunctionality || [],
          pricing_info: sol.pricingInfo || null,
          integration_limitations: sol.integrationLimitations || [],
          complexity_friction: sol.complexityFriction || null,
          unserved_segments: sol.unservedSegments || null,
        }));
        const { error: solErr } = await client.from('productscout_existing_solutions').upsert(solRows);
        if (solErr) {
          throw new Error(`Failed to persist solutions to Supabase: ${solErr.message}`);
        }
      }

      // 6. Persist Market Gaps if present
      if (run.gaps && run.gaps.length > 0) {
        const gapRows = run.gaps.map(g => ({
          id: g.id,
          product_id: 'productscout',
          run_id: run.id,
          gap_type: g.gapType,
          title: g.title,
          description: g.description,
          supporting_evidence_ids: g.supportingEvidenceIds || [],
          supporting_quotes: g.supportingQuotes || [],
          is_ai_inference: g.isAiInference ?? false,
        }));
        const { error: gapErr } = await client.from('productscout_gaps').upsert(gapRows);
        if (gapErr) {
          throw new Error(`Failed to persist market gaps to Supabase: ${gapErr.message}`);
        }
      }

      // 7. Persist Product Opportunities & Experiments & Junction Evidence
      if (run.opportunities && run.opportunities.length > 0) {
        const oppRows = run.opportunities.map(o => ({
          id: o.id,
          product_id: 'productscout',
          run_id: run.id,
          cluster_id: o.clusterId || null,
          name: o.name,
          one_line_description: o.oneLineDescription,
          target_customer: o.targetCustomer,
          user_problem: o.userProblem,
          evidence_summary: o.evidenceSummary,
          evidence_quotes: o.evidenceQuotes as any,
          existing_alternatives: o.existingAlternatives,
          gap: o.gap,
          proposed_solution: o.proposedSolution,
          core_workflow: o.coreWorkflow,
          why_useful: o.whyUseful,
          mvp_scope: o.mvpScope || [],
          what_not_to_build_initially: o.whatNotToBuildInitially || [],
          technical_complexity: o.technicalComplexity,
          estimated_mvp_build_time: o.estimatedMvpBuildTime,
          key_dependencies: o.keyDependencies || [],
          major_risks: o.majorRisks || [],
          monetization_possibilities: o.monetizationPossibilities || [],
          distribution_difficulty: o.distributionDifficulty,
          evidence_confidence: o.evidenceConfidence,
          mvp_profile: (o.mvpProfile as any) || {},
          opportunity_type: o.opportunityType || 'SaaS',
          evaluation: o.evaluation ? JSON.parse(JSON.stringify(o.evaluation)) : null,
          is_saved: Boolean(o.isSaved),
          notes: o.notes || null,
          updated_at: new Date().toISOString(),
        }));
        const { error: oppErr } = await client.from('productscout_opportunities').upsert(oppRows);
        if (oppErr) {
          throw new Error(`Failed to persist opportunities to Supabase: ${oppErr.message}`);
        }

        // Validation Experiments
        const expRows = run.opportunities
          .filter(o => o.validationExperiment)
          .map(o => ({
            product_id: 'productscout',
            opportunity_id: o.id,
            hypothesis: o.validationExperiment.hypothesis,
            test: o.validationExperiment.test,
            target_users: o.validationExperiment.targetUsers || o.targetCustomer,
            success_signal: o.validationExperiment.successSignal,
            invalidation_signal: o.validationExperiment.invalidationSignal,
            updated_at: new Date().toISOString(),
          }));
        if (expRows.length > 0) {
          const { error: expErr } = await client.from('productscout_validation_experiments').upsert(expRows, {
            onConflict: 'opportunity_id',
          });
          if (expErr) {
            throw new Error(`Failed to persist validation experiments to Supabase: ${expErr.message}`);
          }
        }

        // Evidence Junction rows
        const junctionRows: Array<{
          product_id: string;
          opportunity_id: string;
          quote: string;
          url: string;
          platform: string;
          author: string | null;
          is_direct_first_hand: boolean;
        }> = [];

        for (const opp of run.opportunities) {
          for (const ev of opp.evidenceQuotes || []) {
            junctionRows.push({
              product_id: 'productscout',
              opportunity_id: opp.id,
              quote: ev.quote,
              url: ev.url,
              platform: ev.platform,
              author: ev.author || null,
              is_direct_first_hand: true,
            });
          }
        }

        if (junctionRows.length > 0) {
          const { error: juncErr } = await client.from('productscout_opportunity_evidence').upsert(junctionRows, {
            onConflict: 'opportunity_id,quote',
          });
          if (juncErr) {
            throw new Error(`Failed to persist opportunity evidence junction to Supabase: ${juncErr.message}`);
          }
        }
      }

      // 8. Persist Weak Signals if present
      if (run.weakSignals && run.weakSignals.length > 0) {
        const weakRows = run.weakSignals.map(w => ({
          id: w.id,
          product_id: 'productscout',
          run_id: run.id,
          title: w.title,
          user_statement: w.userStatement,
          platform: w.platform,
          source_url: w.sourceUrl,
          why_insufficient: w.whyInsufficient,
          potential_value: w.potentialValue,
        }));
        const { error: weakErr } = await client.from('productscout_weak_signals').upsert(weakRows);
        if (weakErr) {
          throw new Error(`Failed to persist weak signals to Supabase: ${weakErr.message}`);
        }
      }

      // Mirror into local cache for instantaneous UX continuity
      this.localDb.saveRun(run);
    } catch (err: any) {
      console.error('Error persisting run to Supabase:', err);
      throw err;
    }
  }

  public async deleteRun(id: string, scope?: UserScope): Promise<boolean> {
    const client = this.supabase;
    if (!client) {
      return this.localDb.deleteRun(id);
    }

    try {
      const { data: runRow, error: findErr } = await client
        .from('productscout_research_runs')
        .select('id, is_reference, user_id, organization_id')
        .eq('id', id)
        .maybeSingle();

      if (findErr) throw new Error(findErr.message);
      if (!runRow) return false;

      if (runRow.is_reference) {
        throw new Error('Protected system run: Reference benchmark runs cannot be deleted');
      }

      const hasAccess =
        (scope?.userId && runRow.user_id === scope.userId) ||
        (scope?.organizationId && runRow.organization_id === scope.organizationId);

      if (!hasAccess) {
        throw new Error('Access denied: You do not have permission to delete this research run');
      }

      const { error } = await client
        .from('productscout_research_runs')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete research run ${id} from Supabase: ${error.message}`);
      }
      this.localDb.deleteRun(id);
      return true;
    } catch (err: any) {
      console.error(`Error deleting run ${id} from Supabase:`, err);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // SAVED OPPORTUNITIES & BOOKMARKS
  // --------------------------------------------------------------------------

  public async toggleBookmark(
    opportunityId: string,
    runId?: string,
    scope?: UserScope
  ): Promise<{ isSaved: boolean }> {
    const client = this.supabase;
    if (!client) {
      return this.localDb.toggleBookmark(opportunityId, runId);
    }

    if (!scope?.userId) {
      throw new Error('Authentication required: Sign in to save opportunities to your workspace');
    }

    try {
      // Check if already in saved table for this user
      const { data: existing, error: checkErr } = await client
        .from('productscout_saved_opportunities')
        .select('id')
        .eq('opportunity_id', opportunityId)
        .eq('user_id', scope.userId)
        .maybeSingle();

      if (checkErr) {
        throw new Error(`Failed to check bookmark in Supabase: ${checkErr.message}`);
      }

      let isNowSaved = false;

      if (existing) {
        // Remove from saved table
        const { error: delErr } = await client
          .from('productscout_saved_opportunities')
          .delete()
          .eq('id', existing.id);
        if (delErr) {
          throw new Error(`Failed to remove bookmark in Supabase: ${delErr.message}`);
        }
        isNowSaved = false;
      } else {
        // Fetch opportunity snapshot to store
        const { data: oppRow, error: oppErr } = await client
          .from('productscout_opportunities')
          .select('*')
          .eq('id', opportunityId)
          .single();

        if (oppErr) {
          throw new Error(`Failed to load opportunity snapshot for bookmark: ${oppErr.message}`);
        }

        const { error: insErr } = await client.from('productscout_saved_opportunities').insert({
          product_id: 'productscout',
          opportunity_id: opportunityId,
          opportunity_snapshot: oppRow as any,
          user_id: scope.userId,
          organization_id: scope.organizationId || null,
          notes: oppRow?.notes || null,
        });
        if (insErr) {
          throw new Error(`Failed to persist bookmark to Supabase: ${insErr.message}`);
        }
        isNowSaved = true;
      }

      // Update is_saved flag on opportunity table
      const { error: updErr } = await client
        .from('productscout_opportunities')
        .update({ is_saved: isNowSaved, updated_at: new Date().toISOString() })
        .eq('id', opportunityId);
      if (updErr) {
        console.warn('Warning: Could not update is_saved on opportunity record:', updErr);
      }

      this.localDb.toggleBookmark(opportunityId, runId);
      return { isSaved: isNowSaved };
    } catch (err: any) {
      console.error('Supabase toggleBookmark error:', err);
      throw err;
    }
  }

  public async getSavedOpportunities(scope?: UserScope): Promise<ProductOpportunity[]> {
    const client = this.supabase;
    if (!client) {
      return this.localDb.getSavedOpportunities();
    }

    if (!scope?.userId && !scope?.organizationId) {
      return []; // Unauthenticated callers do not have private saved opportunities
    }

    try {
      let query = client
        .from('productscout_saved_opportunities')
        .select(`
          opportunity_id,
          notes,
          opportunity_snapshot,
          user_id,
          organization_id
        `)
        .order('created_at', { ascending: false });

      const filters: string[] = [];
      if (scope.userId) filters.push(`user_id.eq.${scope.userId}`);
      if (scope.organizationId) filters.push(`organization_id.eq.${scope.organizationId}`);
      query = query.or(filters.join(','));

      const { data: savedRows, error } = await query;

      if (error) {
        throw new Error(`Failed to load saved opportunities from Supabase: ${error.message}`);
      }

      if (!savedRows || savedRows.length === 0) {
        return [];
      }

      const oppIds = savedRows.map(s => s.opportunity_id);

      // Fetch actual opportunities from opportunities table
      const { data: oppRows, error: oppErr } = await client
        .from('productscout_opportunities')
        .select('*')
        .in('id', oppIds);

      if (oppErr) {
        throw new Error(`Failed to load opportunity details for bookmarks: ${oppErr.message}`);
      }

      const { data: expRows } = await client
        .from('productscout_validation_experiments')
        .select('*')
        .in('opportunity_id', oppIds);

      const expMap = new Map<string, ValidationExperiment>();
      for (const e of expRows || []) {
        expMap.set(e.opportunity_id, {
          hypothesis: e.hypothesis,
          test: e.test,
          targetUsers: e.target_users,
          successSignal: e.success_signal,
          invalidationSignal: e.invalidation_signal,
        });
      }

      const savedMap = new Map(savedRows.map(s => [s.opportunity_id, s]));

      return (oppRows || []).map(o => {
        const savedMeta = savedMap.get(o.id);
        const exp = expMap.get(o.id) || {
          hypothesis: '',
          test: '',
          targetUsers: o.target_customer,
          successSignal: '',
          invalidationSignal: '',
        };

        return {
          id: o.id,
          name: o.name,
          oneLineDescription: o.one_line_description,
          targetCustomer: o.target_customer,
          userProblem: o.user_problem,
          evidenceSummary: o.evidence_summary,
          evidenceQuotes: (o.evidence_quotes as any) || [],
          existingAlternatives: o.existing_alternatives,
          gap: o.gap,
          proposedSolution: o.proposed_solution,
          coreWorkflow: o.core_workflow,
          whyUseful: o.why_useful,
          mvpScope: o.mvp_scope || [],
          whatNotToBuildInitially: o.what_not_to_build_initially || [],
          technicalComplexity: (o.technical_complexity || 'Medium') as any,
          estimatedMvpBuildTime: o.estimated_mvp_build_time || '1-2 weeks',
          keyDependencies: o.key_dependencies || [],
          majorRisks: o.major_risks || [],
          monetizationPossibilities: o.monetization_possibilities || [],
          distributionDifficulty: (o.distribution_difficulty || 'Medium') as any,
          validationExperiment: exp,
          evidenceConfidence: Number(o.evidence_confidence) || 0,
          clusterId: o.cluster_id || undefined,
          mvpProfile: (o.mvp_profile as any) || {},
          opportunityType: (o.opportunity_type as any) || 'SaaS',
          evaluation: (o.evaluation as any) || undefined,
          isSaved: true,
          notes: savedMeta?.notes || o.notes || undefined,
        };
      });
    } catch (err: any) {
      console.error('Supabase getSavedOpportunities error:', err);
      throw err;
    }
  }

  public async updateOpportunityNotes(
    opportunityId: string, 
    notes: string, 
    scope?: UserScope
  ): Promise<boolean> {
    const client = this.supabase;
    if (!client) {
      return this.localDb.updateOpportunityNotes(opportunityId, notes);
    }

    if (!scope?.userId) {
      throw new Error('Authentication required: Sign in to record private founder notes');
    }

    try {
      const [oppRes, savedRes] = await Promise.all([
        client
          .from('productscout_opportunities')
          .update({ notes, updated_at: new Date().toISOString() })
          .eq('id', opportunityId),
        client
          .from('productscout_saved_opportunities')
          .update({ notes, updated_at: new Date().toISOString() })
          .eq('opportunity_id', opportunityId)
          .eq('user_id', scope.userId),
      ]);

      if (oppRes.error && savedRes.error) {
        throw new Error(`Failed to update notes in Supabase: ${oppRes.error.message || savedRes.error.message}`);
      }

      this.localDb.updateOpportunityNotes(opportunityId, notes);
      return true;
    } catch (err: any) {
      console.error(`Error updating notes for opp ${opportunityId} in Supabase:`, err);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------

  public async getSettings(scope?: UserScope): Promise<SystemSettings> {
    const client = this.supabase;
    if (!client) {
      return this.localDb.getSettings();
    }

    try {
      let query = client.from('productscout_settings').select('*');
      if (scope?.organizationId) {
        query = query.eq('organization_id', scope.organizationId);
      } else if (scope?.userId) {
        query = query.eq('user_id', scope.userId);
      } else {
        query = query.eq('id', 'default');
      }

      const { data, error } = await query.maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not load settings from Supabase:', error.message);
      }

      if (!data) {
        return this.localDb.getSettings();
      }

      return {
        aiProvider: (data.ai_provider as any) || 'heuristic',
        geminiModel: data.gemini_model || 'gemini-3.8-flash',
        openaiBaseUrl: data.openai_base_url || 'https://api.openai.com/v1',
        openaiModel: data.openai_model || 'gpt-4o-mini',
        defaultMaxSources: data.default_max_sources || 30,
        defaultTimeframe: (data.default_timeframe as any) || '30d',
      };
    } catch (err: any) {
      console.error('Error reading settings from Supabase:', err);
      return this.localDb.getSettings();
    }
  }

  public async updateSettings(
    settings: Partial<SystemSettings>, 
    scope?: UserScope
  ): Promise<SystemSettings> {
    const client = this.supabase;
    if (!client) {
      return this.localDb.updateSettings(settings);
    }

    if (!scope?.userId && !scope?.organizationId) {
      throw new Error('Authentication required: Sign in to customize system parameters');
    }

    try {
      const settingsId = scope.organizationId ? `org_${scope.organizationId}` : `user_${scope.userId}`;
      const payload: any = {
        id: settingsId,
        product_id: 'productscout',
        user_id: scope.userId || null,
        organization_id: scope.organizationId || null,
        updated_at: new Date().toISOString(),
      };
      if (settings.aiProvider !== undefined) payload.ai_provider = settings.aiProvider;
      if (settings.geminiModel !== undefined) payload.gemini_model = settings.geminiModel;
      if (settings.openaiBaseUrl !== undefined) payload.openai_base_url = settings.openaiBaseUrl;
      if (settings.openaiModel !== undefined) payload.openai_model = settings.openaiModel;
      if (settings.defaultMaxSources !== undefined) payload.default_max_sources = settings.defaultMaxSources;
      if (settings.defaultTimeframe !== undefined) payload.default_timeframe = settings.defaultTimeframe;

      const { error } = await client.from('productscout_settings').upsert(payload);
      if (error) {
        throw new Error(`Failed to update settings in Supabase: ${error.message}`);
      }

      return this.localDb.updateSettings(settings);
    } catch (err: any) {
      console.error('Error updating settings in Supabase:', err);
      throw err;
    }
  }

  private static instance: ProductScoutRepository | null = null;
  public static getInstance(): ProductScoutRepository {
    if (!ProductScoutRepository.instance) {
      ProductScoutRepository.instance = new ProductScoutRepository();
    }
    return ProductScoutRepository.instance;
  }
}
