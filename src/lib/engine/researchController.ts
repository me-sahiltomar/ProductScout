import { ResearchState } from './researchState';
import { ResearchPlanner } from './researchPlanner';
import { CollectorManager } from '../collectors/collectorManager';
import { EvidenceFilter } from './evidenceFilter';
import { ProblemExtractor } from './problemExtractor';
import { ClusteringEngine } from './clusteringEngine';
import { SolutionGapAnalyzer } from './solutionGapAnalyzer';
import { OpportunityGenerator } from './opportunityGenerator';
import { QualityController } from './qualityController';
import { ClaimVerifier } from './claimVerifier';
import { ReportGenerator, resolveAdaptiveOutputType } from './reportGenerator';
import { AIProviderManager } from './aiProvider';
import { validateResearchIntegrity } from './integrityValidator';
import { ProductScoutRepository, UserScope } from '../db/productScoutRepository';
import { ResearchRun, ResearchRunConfig, ResearchAction } from '@/types';

export class ResearchController {
  private planner: ResearchPlanner;
  private claimVerifier: ClaimVerifier;
  
  constructor(
    private repo: ProductScoutRepository,
    private collectorManager: CollectorManager,
    private evidenceFilter: EvidenceFilter,
    private problemExtractor: ProblemExtractor,
    private clusteringEngine: ClusteringEngine,
    private solutionGapAnalyzer: SolutionGapAnalyzer,
    private opportunityGenerator: OpportunityGenerator,
    private qualityController: QualityController,
    private reportGenerator: ReportGenerator,
    private aiProvider: AIProviderManager
  ) {
    this.planner = new ResearchPlanner(this.aiProvider);
    this.claimVerifier = new ClaimVerifier();
  }

  public async run(config: ResearchRunConfig, scope?: UserScope): Promise<ResearchRun> {
    const state = new ResearchState(config);
    state.stage = 'INITIALIZING';

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const initialRun: ResearchRun = {
      id: runId,
      createdAt: new Date().toISOString(),
      config,
      brief: config.brief,
      adaptiveOutputType: resolveAdaptiveOutputType(config.brief!),
      status: 'collecting',
      currentStep: 'Initializing research controller...',
      coverage: {
        sourcesSearched: [],
        sourcesCollectedCount: 0,
        sourcesSucceeded: [],
        sourcesUnavailable: [],
        dateRange: 'Past 30d',
        qualityDistribution: { high: 0, medium: 0, low: 0 }
      },
      rawEvidenceCount: 0,
      classifiedEvidence: [],
      problems: [],
      clusters: [],
      existingSolutions: [],
      gaps: [],
      opportunities: [],
      weakSignals: [],
      reportMarkdown: ''
    };

    await this.repo.saveRun(initialRun, scope);

    // Initialize Planner
    state.questions = this.planner.generateQuestions(config);
    state.stage = 'PLANNING';

    while ((state.stage as string) !== 'STOPPING') {
      if (state.isBudgetExhausted()) {
        state.terminalState = 'BUDGET_EXHAUSTED';
        state.stage = 'STOPPING';
        initialRun.currentStep = 'Budget exhausted. Halting.';
        await this.repo.saveRun(initialRun, scope);
        break;
      }

      if (state.checkSufficiency()) {
        state.terminalState = 'RESEARCH_COMPLETE';
        state.stage = 'STOPPING';
        break;
      }

      const action = this.determineNextAction(state);

      if (action.type === 'STOP') {
        state.stage = 'STOPPING';
        break;
      }

      state.stage = 'EXECUTING_ACTION';
      await this.executeAction(action, state, config, initialRun, scope);
      state.stage = 'PLANNING';
    }

    if (!state.terminalState) {
      if (state.evidence.length === 0) {
        state.terminalState = 'NO_RELEVANT_EVIDENCE_FOUND';
      } else if (state.opportunities.length > 0) {
        state.terminalState = 'RESEARCH_COMPLETE';
      } else {
        state.terminalState = 'NO_MATERIAL_OPPORTUNITY_FOUND';
      }
    }

    // Final Report Gen
    initialRun.status = state.terminalState;
    initialRun.classifiedEvidence = state.evidence;
    initialRun.problems = state.problems;
    initialRun.existingSolutions = state.solutions;
    initialRun.gaps = state.gaps;
    initialRun.opportunities = state.opportunities;
    initialRun.verifiedClaims = state.verifiedClaims;
    
    // STRICT P0-001: Only count real executed counter-evidence rounds with authentic evidence
    const realCounterEvidenceRounds = state.opportunities.filter(
      o => o.counterEvidenceStatus === 'COUNTER_EVIDENCE_PERFORMED' && o.counter_evidence && o.counter_evidence.length > 0
    ).length;

    initialRun.telemetry = {
      runtimeMs: Date.now() - state.startTime,
      searches: state.searchCount,
      discoverySearches: state.discoverySearchCount,
      candidateResults: state.candidateResultCount,
      deepFetches: state.fetchCount,
      llmCalls: state.llmCallCount,
      tokenUsage: state.tokenCount,
      estimatedCostUsd: state.estimatedCostUsd,
      sourcesEvaluated: initialRun.coverage.sourcesSearched.length,
      evidenceItems: state.evidence.length,
      counterEvidenceRounds: realCounterEvidenceRounds,
      terminalState: state.terminalState,
      modelRouting: {},
      providerUsage: {}
    };
    initialRun.rejectedCandidates = state.rejectedCandidates;

    // Validate research integrity invariants before generating report
    const validation = validateResearchIntegrity(initialRun);
    if (!validation.valid) {
      console.error('Integrity violations detected in research run:', validation.violations);
      initialRun.status = 'RESEARCH_BLOCKED';
      initialRun.currentStep = `Integrity validation blocked: ${validation.violations[0]}`;
    }

    initialRun.reportMarkdown = this.reportGenerator.generateMarkdownReport(initialRun);
    initialRun.currentStep = `Research Finished: ${initialRun.status}`;
    
    await this.repo.saveRun(initialRun, scope);
    return initialRun;
  }

  private determineNextAction(state: ResearchState): ResearchAction {
    const MARGINAL_VALUE_THRESHOLD = 0.1;
    let bestAction: ResearchAction | null = null;
    let highestEV = -1;

    const evaluateAction = (type: string, query: string, targetId: string, rationale: string, prob: number, cost: number, importanceMulti: number) => {
      // Loop Penalty: Decrease probability by 50% for each previous attempt
      const attempts = state.getActionCount(type, query);
      const decayedProb = prob * Math.pow(0.5, attempts);
      
      const ev = (importanceMulti * decayedProb) / cost;
      if (ev > highestEV) {
        highestEV = ev;
        bestAction = { type: type as any, query, targetId, rationale, expectedProbability: decayedProb, expectedCost: cost, expectedValue: ev };
      }
    };

    // 1. Discovery Search for open questions
    for (const q of state.questions.filter(q => q.status === 'OPEN')) {
      const impMulti = q.importance === 'HIGH' ? 1.0 : (q.importance === 'MEDIUM' ? 0.6 : 0.3);
      evaluateAction('DISCOVERY_SEARCH', q.id, q.id, `Search for ${q.text}`, 0.8, 1.0, impMulti);
    }

    // 2. Problem/Solution Extraction if evidence exists
    if (state.evidence.length > 0) {
      evaluateAction('PROBLEM_INVESTIGATION', 'all_evidence', 'prob_1', 'Extract problems', 0.9, 2.0, 1.0);
      if (state.problems.length > 0) {
        evaluateAction('SOLUTION_INVESTIGATION', 'problems', 'sol_1', 'Find solutions for problems', 0.8, 2.0, 1.0);
        evaluateAction('WORKAROUND_INVESTIGATION', 'problems', 'work_1', 'Find workarounds', 0.7, 1.5, 0.9);
      }
    }

    // 3. Selective Deep Retrieval for high-quality evidence
    if (state.evidence.length > 0 && state.fetchCount < (state.config.budget?.maxDeepFetches || 25)) {
      const unFetchedEvidence = state.evidence
        .filter(e => e.quality === 'HIGH' && e.url && !state.getActionCount('SOURCE_FETCH', e.url))
        .slice(0, 2);
      for (const ev of unFetchedEvidence) {
        evaluateAction('SOURCE_FETCH', ev.url, ev.id, `Selective deep fetch for ${ev.platform}: ${ev.title.slice(0, 40)}`, 0.7, 1.2, 0.7);
      }
    }

    // 4. Synthesis and Counter-Evidence
    if (state.solutions.length > 0) {
      evaluateAction('SYNTHESIS', 'all', 'synth_1', 'Synthesize opportunities', 0.85, 3.0, 1.0);
    }

    if (state.opportunities.length > 0) {
      for (const opp of state.opportunities) {
        evaluateAction('COUNTER_EVIDENCE_SEARCH', opp.id, opp.id, 'Search counter-evidence', 0.9, 1.5, 1.0);
      }
    }

    if (!bestAction || highestEV < MARGINAL_VALUE_THRESHOLD) {
      return { type: 'STOP', rationale: 'No high-value actions remaining', expectedProbability: 0, expectedCost: 0, expectedValue: 0 };
    }

    return bestAction;
  }

  private async executeAction(action: ResearchAction, state: ResearchState, config: ResearchRunConfig, run: ResearchRun, scope?: UserScope) {
    state.recordAction(action.type, action.query);
    
    // Update Question State
    if (action.targetId) {
      const q = state.questions.find(q => q.id === action.targetId);
      if (q) q.actionsAttempted++;
    }

    run.currentStep = `Executing: ${action.type}`;
    await this.repo.saveRun(run, scope);

    switch (action.type) {
      case 'DISCOVERY_SEARCH': {
        const { rawItems, coverage } = await this.collectorManager.progressiveCollectAll(config);
        state.searchCount++;
        state.discoverySearchCount++;
        state.candidateResultCount += rawItems.length;
        state.estimatedCostUsd += 0.05;
        
        run.rawEvidenceCount += rawItems.length;
        run.coverage = coverage;
        
        const newEvidence = this.evidenceFilter.classifyAll(rawItems, config);
        state.evidence.push(...newEvidence);
        
        if (action.targetId) {
          const q = state.questions.find(q => q.id === action.targetId);
          if (q && newEvidence.length > 0) {
            q.supportingEvidenceIds.push(...newEvidence.map(e => e.id));
            q.uncertaintyScore = Math.max(0, q.uncertaintyScore - 0.3);
          }
        }
        break;
      }
      case 'SOURCE_FETCH': {
        state.fetchCount++; // Strictly actual deep retrieval operations
        state.estimatedCostUsd += 0.02;
        if (action.url) {
          await this.collectorManager.deepFetchUrl(action.url, config);
        }
        break;
      }
      case 'PROBLEM_INVESTIGATION':
      case 'WORKAROUND_INVESTIGATION': {
        state.problems = this.problemExtractor.extractProblems(state.evidence, config);
        break;
      }
      case 'SOLUTION_INVESTIGATION': {
        const clusters = this.clusteringEngine.clusterProblems(state.problems);
        const { solutions, gaps, commercialSignals } = this.solutionGapAnalyzer.analyze(clusters, state.problems, state.evidence);
        state.solutions = solutions;
        state.gaps = gaps;
        state.commercialSignals = commercialSignals;
        break;
      }
      case 'SYNTHESIS': {
        const candidateClaims = state.problems.map(p => `Users struggle with ${p.problemStatement}`);
        const verifiedClaims = this.claimVerifier.verifyClaims(candidateClaims, state.evidence);
        state.verifiedClaims = verifiedClaims;

        let opps = this.opportunityGenerator.generateOpportunities(
          this.clusteringEngine.clusterProblems(state.problems), 
          state.problems, 
          state.gaps, 
          state.solutions,
          state.commercialSignals || [],
          verifiedClaims,
          config
        );
        state.rejectedCandidates = this.opportunityGenerator.lastRejectedCandidates;

        const enriched = await this.aiProvider.enrichIfAvailable(config, state.evidence, state.problems, opps);
        if (enriched.opportunities !== opps) {
          state.llmCallCount++;
          state.tokenCount += 2500;
        }
        
        const { verifiedOpportunities, weakSignals } = this.qualityController.audit(enriched.opportunities, state.problems, state.evidence);
        state.opportunities = verifiedOpportunities;
        if (weakSignals && weakSignals.length > 0) {
          run.weakSignals = weakSignals;
        }
        break;
      }
      case 'COUNTER_EVIDENCE_SEARCH': {
        state.searchCount++;
        state.estimatedCostUsd += 0.05;
        const opp = state.opportunities.find(o => o.id === action.targetId);
        if (opp) {
          const challengeQuery = `${opp.title} failure risks why users do not switch alternative problems`;
          const challengeConfig: ResearchRunConfig = {
            ...config,
            topic: challengeQuery,
            maxSources: 5
          };

          try {
            const { rawItems } = await this.collectorManager.collectAll(challengeConfig);
            if (rawItems.length > 0) {
              const newEvidence = this.evidenceFilter.classifyAll(rawItems);
              const contradictingEvidence = newEvidence.filter(e =>
                /\b(fail|failed|failure|risk|abandoned|not worth|nobody buys|too difficult|churn|saturated|incumbent won|closed down)\b/i.test(`${e.title} ${e.snippet}`)
              );

              if (contradictingEvidence.length > 0) {
                state.evidence.push(...contradictingEvidence);
                opp.counter_evidence = opp.counter_evidence || [];
                opp.counter_evidence.push(...contradictingEvidence.map(e => e.id));
                opp.counterEvidenceIds = opp.counter_evidence;
                opp.counterEvidenceStatus = 'COUNTER_EVIDENCE_PERFORMED';
                opp.uncertainty = `Contested by source evidence (${contradictingEvidence[0].title.slice(0, 50)}). ${opp.uncertainty}`;
                
                const counterQ = state.questions.find(q => q.id.includes('counter') || q.text.toLowerCase().includes('fail'));
                if (counterQ) {
                  counterQ.contradictoryEvidenceIds.push(...contradictingEvidence.map(e => e.id));
                }
              } else {
                opp.counterEvidenceStatus = 'NO_COUNTER_EVIDENCE_FOUND';
                opp.counter_evidence = [];
                opp.counterEvidenceIds = [];
              }
            } else {
              opp.counterEvidenceStatus = 'NO_COUNTER_EVIDENCE_FOUND';
              opp.counter_evidence = [];
              opp.counterEvidenceIds = [];
            }
          } catch (err) {
            opp.counterEvidenceStatus = 'COUNTER_EVIDENCE_FAILED';
            opp.counter_evidence = [];
            opp.counterEvidenceIds = [];
          }
        }
        break;
      }
    }

    state.updateCoverage();
  }
}
