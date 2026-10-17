import { ResearchPipeline } from '../src/lib/engine/researchPipeline';
import { ProductScoutRepository } from '../src/lib/db/productScoutRepository';
import { ResearchRunConfig } from '../src/types';

interface EvaluationRunResult {
  runId: string;
  briefName: string;
  category: string;
  mode: string;
  terminalState: string;
  searches: number;
  deepFetches: number;
  llmCalls: number;
  tokenUsage: number;
  estimatedCostUsd: number;
  runtimeMs: number;
  sourcesSearched: string[];
  sourcesSucceeded: string[];
  evidenceCount: number;
  counterEvidenceRounds: number;
  verifiedClaimsCount: number;
  opportunitiesCount: number;
  rejectedCandidatesCount: number;
  unresolvedQuestionsCount: number;
  opportunityNames: string[];
  topOpportunityProblem?: string;
  topOpportunityWorkaround?: string;
  topOpportunityUncertainty?: string;
}

const evaluationBriefs: Array<{ name: string; category: string; config: ResearchRunConfig }> = [
  {
    name: 'Docker Slimming for Node.js Microservices',
    category: 'Developer Tools',
    config: {
      topic: 'Docker image slimming and build optimization for Node.js',
      timeframe: '30d',
      maxSources: 10,
      focus: 'problems',
      targetUser: 'Backend Engineers & DevOps',
      budget: {
        maxSearches: 30,
        maxDeepFetches: 250,
        maxLlmCalls: 20,
        maxTokens: 80000,
        maxCostUsd: 5.0,
        maxRuntimeMs: 3 * 60 * 1000
      },
      brief: {
        id: 'eval_devtool_1',
        objective: 'find_automation_opportunities',
        subject: 'Docker image slimming and build optimization for Node.js',
        target: { primaryUser: 'Backend Engineers', industry: 'Cloud & Infrastructure' },
        researchConfiguration: { evidenceWindow: '30d', maxSourcesPerQuery: 5, allowedSourceTypes: ['web', 'github', 'hackernews'] },
        opportunityProfile: { productTypes: ['DevTool'], buildHorizon: '1m', teamSize: 'Solo', technicalCapability: 'High' },
        outputRequirements: { type: 'product_brief_30d' }
      }
    }
  },
  {
    name: 'Logistics Freight Invoice Discrepancy Reconciliation',
    category: 'B2B SaaS / FinTech',
    config: {
      topic: 'Freight audit and invoice discrepancy reconciliation for 3PL providers',
      timeframe: '90d',
      maxSources: 10,
      focus: 'problems',
      targetUser: 'Freight Forwarders & 3PL Finance Controllers',
      budget: {
        maxSearches: 30,
        maxDeepFetches: 250,
        maxLlmCalls: 20,
        maxTokens: 80000,
        maxCostUsd: 5.0,
        maxRuntimeMs: 3 * 60 * 1000
      },
      brief: {
        id: 'eval_b2b_saas_2',
        objective: 'explore_market',
        subject: 'Freight audit and invoice discrepancy reconciliation for 3PL providers',
        target: { primaryUser: 'Finance Controllers', industry: 'Logistics & Supply Chain' },
        researchConfiguration: { evidenceWindow: '90d', maxSourcesPerQuery: 5, allowedSourceTypes: ['web', 'reddit'] },
        opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '3m', teamSize: 'Startup', technicalCapability: 'High' },
        outputRequirements: { type: 'product_plan_90d' }
      }
    }
  },
  {
    name: 'Kubernetes Internal Certificate Expiry Watcher',
    category: 'Internal Tools / Infrastructure',
    config: {
      topic: 'Internal mTLS and ingress certificate rotation outage prevention in Kubernetes',
      timeframe: '6m',
      maxSources: 10,
      focus: 'problems',
      targetUser: 'Site Reliability Engineers',
      budget: {
        maxSearches: 10,
        maxDeepFetches: 100,
        maxLlmCalls: 10,
        maxTokens: 50000,
        maxCostUsd: 2.0,
        maxRuntimeMs: 3 * 60 * 1000
      },
      brief: {
        id: 'eval_internal_3',
        objective: 'find_automation_opportunities',
        subject: 'Internal mTLS and ingress certificate rotation outage prevention in Kubernetes',
        target: { primaryUser: 'Site Reliability Engineers', industry: 'Cloud Infrastructure' },
        researchConfiguration: { evidenceWindow: '6m', maxSourcesPerQuery: 5, allowedSourceTypes: ['web', 'github'] },
        opportunityProfile: { productTypes: ['Internal Tool', 'Automation'], buildHorizon: '2-3w', teamSize: 'Solo', technicalCapability: 'High' },
        outputRequirements: { type: 'rapid_mvp_2_3w' }
      }
    }
  },
  {
    name: 'Private Clinic Patient Intake Form Sync to Legacy EHR',
    category: 'Workflow Automation',
    config: {
      topic: 'Digital patient intake PDF and form extraction to legacy desktop EHRs',
      timeframe: '1y',
      maxSources: 10,
      focus: 'problems',
      targetUser: 'Medical Practice Managers',
      budget: {
        maxSearches: 10,
        maxDeepFetches: 100,
        maxLlmCalls: 10,
        maxTokens: 50000,
        maxCostUsd: 2.0,
        maxRuntimeMs: 3 * 60 * 1000
      },
      brief: {
        id: 'eval_workflow_4',
        objective: 'find_automation_opportunities',
        subject: 'Digital patient intake PDF and form extraction to legacy desktop EHRs',
        target: { primaryUser: 'Medical Practice Managers', industry: 'Healthcare' },
        researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web', 'reddit'] },
        opportunityProfile: { productTypes: ['Automation'], buildHorizon: '7d', teamSize: 'Solo', technicalCapability: 'Medium' },
        outputRequirements: { type: 'builder_brief_7d' }
      }
    }
  },
  {
    name: 'Subsea Optical Cable Splice Maintenance Tracking',
    category: 'Vertical Niche',
    config: {
      topic: 'Subsea fiber optic cable optical time-domain reflectometer splice tracking',
      timeframe: '1y',
      maxSources: 5,
      focus: 'problems',
      targetUser: 'Subsea Cable Operations Engineers',
      budget: {
        maxSearches: 6,
        maxDeepFetches: 30,
        maxLlmCalls: 6,
        maxTokens: 30000,
        maxCostUsd: 1.0,
        maxRuntimeMs: 2 * 60 * 1000
      },
      brief: {
        id: 'eval_vertical_5',
        objective: 'explore_industry',
        subject: 'Subsea fiber optic cable optical time-domain reflectometer splice tracking',
        target: { primaryUser: 'Subsea Cable Operations Engineers', industry: 'Telecommunications' },
        researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 3, allowedSourceTypes: ['web'] },
        opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '6m', teamSize: 'Startup', technicalCapability: 'High' },
        outputRequirements: { type: 'venture_plan_6m' }
      }
    }
  },
  {
    name: 'Underwater Basket Weaving Telemetry Analytics',
    category: 'Hard Negative / Absurd Non-Problem',
    config: {
      topic: 'Underwater basket weaving telemetry analytics and reed moisture sensor IoT',
      timeframe: '30d',
      maxSources: 3,
      focus: 'problems',
      targetUser: 'Amateur Basket Weavers',
      budget: {
        maxSearches: 4,
        maxDeepFetches: 15,
        maxLlmCalls: 4,
        maxTokens: 10000,
        maxCostUsd: 0.5,
        maxRuntimeMs: 1 * 60 * 1000
      },
      brief: {
        id: 'eval_negative_6',
        objective: 'validate_existing_idea',
        subject: 'Underwater basket weaving telemetry analytics and reed moisture sensor IoT',
        target: { primaryUser: 'Amateur Basket Weavers', industry: 'Crafts' },
        researchConfiguration: { evidenceWindow: '30d', maxSourcesPerQuery: 3, allowedSourceTypes: ['web'] },
        opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '7d', teamSize: 'Solo', technicalCapability: 'Low' },
        outputRequirements: { type: 'builder_brief_7d' }
      }
    }
  }
];

async function runRealWorldEvaluation() {
  console.log(`Starting ProductScout V1.5 Real-World Research Evaluation (${evaluationBriefs.length} briefs)...`);
  
  const savedRuns: any[] = [];
  const mockRepo = {
    saveRun: async (run: any) => {
      const idx = savedRuns.findIndex(r => r.id === run.id);
      if (idx >= 0) savedRuns[idx] = run;
      else savedRuns.push(run);
    },
    getRun: async (id: string) => savedRuns.find(r => r.id === id) || null,
    getSettings: async () => ({ aiProvider: 'heuristic' }),
  } as unknown as ProductScoutRepository;

  const pipeline = new ResearchPipeline(mockRepo);
  const results: EvaluationRunResult[] = [];

  for (let i = 0; i < evaluationBriefs.length; i++) {
    const item = evaluationBriefs[i];
    console.log(`\n=============================================================`);
    console.log(`[Run ${i + 1}/${evaluationBriefs.length}] ${item.name} (${item.category})`);
    console.log(`=============================================================`);
    
    const startTime = Date.now();
    try {
      const run = await pipeline.execute(item.config);
      const elapsed = Date.now() - startTime;
      const t = run.telemetry;

      const topOpp = run.opportunities[0];
      const verifiedClaims = topOpp?.verified_claims || [];

      const result: EvaluationRunResult = {
        runId: run.id,
        briefName: item.name,
        category: item.category,
        mode: run.adaptiveOutputType || 'builder_brief_7d',
        terminalState: run.status,
        searches: t?.searches || 0,
        deepFetches: t?.deepFetches || 0,
        llmCalls: t?.llmCalls || 0,
        tokenUsage: t?.tokenUsage || 0,
        estimatedCostUsd: t?.estimatedCostUsd || 0,
        runtimeMs: elapsed,
        sourcesSearched: run.coverage?.sourcesSearched || [],
        sourcesSucceeded: run.coverage?.sourcesSucceeded || [],
        evidenceCount: run.classifiedEvidence?.length || 0,
        counterEvidenceRounds: t?.counterEvidenceRounds || 0,
        verifiedClaimsCount: verifiedClaims.length,
        opportunitiesCount: run.opportunities?.length || 0,
        rejectedCandidatesCount: run.weakSignals?.length || 0,
        unresolvedQuestionsCount: (run as any).unresolvedQuestionsCount || 0,
        opportunityNames: run.opportunities?.map(o => o.title || o.name) || [],
        topOpportunityProblem: topOpp?.problem || topOpp?.userProblem,
        topOpportunityWorkaround: topOpp?.current_workaround || topOpp?.existingAlternatives,
        topOpportunityUncertainty: topOpp?.uncertainty
      };

      results.push(result);

      console.log(`Terminal State: ${result.terminalState}`);
      console.log(`Runtime: ${(result.runtimeMs / 1000).toFixed(2)}s | Searches: ${result.searches} | Deep Fetches: ${result.deepFetches}`);
      console.log(`Evidence Items: ${result.evidenceCount} | Opportunities: ${result.opportunitiesCount}`);
      if (result.opportunitiesCount > 0) {
        console.log(`Top Opportunity: "${result.opportunityNames[0]}"`);
        console.log(`  Problem: ${result.topOpportunityProblem?.substring(0, 100)}...`);
        console.log(`  Workaround: ${result.topOpportunityWorkaround?.substring(0, 80)}...`);
        console.log(`  Uncertainty: ${result.topOpportunityUncertainty?.substring(0, 80)}...`);
      }
    } catch (err: any) {
      console.error(`Run failed: ${err.message}`);
    }
  }

  console.log('\n=============================================================');
  console.log('EVALUATION COMPLETE - SUMMARY JSON');
  console.log('=============================================================');
  console.log(JSON.stringify(results, null, 2));
}

runRealWorldEvaluation();
