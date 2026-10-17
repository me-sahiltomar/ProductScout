import { describe, it, expect } from 'vitest';
import { ProblemExtractor } from '../src/lib/engine/problemExtractor';
import { SolutionGapAnalyzer } from '../src/lib/engine/solutionGapAnalyzer';
import { ClaimVerifier } from '../src/lib/engine/claimVerifier';
import { OpportunityGenerator } from '../src/lib/engine/opportunityGenerator';
import { ClassifiedEvidence, ProblemCluster, ExtractedProblem, MarketGap, ExistingSolution, CommercialSignal, ResearchRunConfig, ResearchState } from '../src/types';
import { ResearchController } from '../src/lib/engine/researchController';

function createMockEvidence(): ClassifiedEvidence[] {
  return [
    {
      id: 'e1', rawId: 'r1', title: 'I hate data entry', url: 'test.com', platform: 'reddit', 
      snippet: 'I spend 4 hours every day on billing. I hired a VA for this and pay them thousands, but they still make errors.',
      evidenceType: 'complaint', quality: 'HIGH', qualityScore: 90, firstHandMarkers: ['I']
    }
  ];
}

describe('V1.5 Phase 3 Deep Analysis', () => {
  const config = { targetUser: 'Founders', topic: 'billing' } as ResearchRunConfig;

  it('ProblemExtractor should extract workflow and workaround details', () => {
    const extractor = new ProblemExtractor();
    const problems = extractor.extractProblems(createMockEvidence(), config);
    expect(problems.length).toBeGreaterThan(0);
    
    const prob = problems[0];
    expect(prob.workaroundType).toBe('outsourcing');
    expect(prob.costInTimeOrMoney).toMatch(/loss/i);
    expect(prob.workflowTrigger).toBeTruthy();
  });

  it('SolutionGapAnalyzer should extract commercial signals and competitor details', () => {
    const analyzer = new SolutionGapAnalyzer();
    const problems = new ProblemExtractor().extractProblems(createMockEvidence(), config);
    const prob = problems[0];
    const clusters: ProblemCluster[] = [{
      id: 'c1', clusterName: 'billing_csv', description: '', problemIds: [prob.id], signalCount: 1, sourceDiversity: 1, commonAffectedUsers: '', commonWorkflow: '', overallEvidenceStrength: 'HIGH'
    }];
    
    const { solutions, gaps, commercialSignals } = analyzer.analyze(clusters, problems, createMockEvidence());
    
    const paidSignal = commercialSignals.find(s => s.type === 'PAID_WORKAROUND');
    expect(paidSignal).toBeDefined();
    expect(paidSignal?.strength).toBe('STRONG');
    expect(solutions.some(s => s.switchingCosts)).toBe(true);
  });

  it('ClaimVerifier should verify entailment correctly', () => {
    const verifier = new ClaimVerifier();
    const claims = ['Users spend hours every day on billing and pay thousands for a VA', 'Users love doing data entry manually'];
    const verified = verifier.verifyClaims(claims, createMockEvidence());
    
    expect(verified[0].status).toBe('VERIFIED');
    expect(verified[1].status).toBe('UNSUPPORTED');
  });

  describe('Evidence Gates & Negative Cases', () => {
    const generator = new OpportunityGenerator();
    const clusters: ProblemCluster[] = [{
      id: 'c1', clusterName: 'billing_csv', description: '', problemIds: ['p1'], signalCount: 1, sourceDiversity: 1, commonAffectedUsers: '', commonWorkflow: '', overallEvidenceStrength: 'HIGH'
    }];
    
    it('A: Strong problem, no workaround -> survives, High uncertainty', () => {
      const prob = { id: 'p1', workaroundType: 'none', currentWorkaround: 'Unknown', evidenceQuality: 'HIGH', signalCount: 3, evidenceIds: ['e1'], targetUser: 'Founder', evidenceQuotes: [] } as ExtractedProblem;
      const signals = [{ id: 's2', description: '', strength: 'WEAK', type: 'GENERIC_SENTIMENT', evidenceIds: ['e1'] }] as CommercialSignal[];
      
      const opps = generator.generateOpportunities(clusters, [prob], [], [], signals, [], config);
      expect(opps.length).toBe(1);
      expect(opps[0].uncertainty).toMatch(/High/i);
    });

    it('B: Strong problem, no commercial evidence -> survives, Medium uncertainty', () => {
      const prob = { id: 'p1', workaroundType: 'spreadsheet', currentWorkaround: 'Excel', evidenceQuality: 'HIGH', signalCount: 3, evidenceIds: ['e1'], targetUser: 'Founder', evidenceQuotes: [] } as ExtractedProblem;
      const signals = [] as CommercialSignal[];
      
      const opps = generator.generateOpportunities(clusters, [prob], [], [], signals, [], config);
      expect(opps.length).toBe(1);
      expect(opps[0].uncertainty).toMatch(/Medium \(Workaround exists, but willingness to pay is unproven\)/i);
    });

    it('C: Strong supporting & strong contradictory -> survives, Contested', () => {
      const prob = { id: 'p1', workaroundType: 'spreadsheet', currentWorkaround: 'Excel', evidenceQuality: 'HIGH', signalCount: 3, evidenceIds: ['e1'], targetUser: 'Founder', evidenceQuotes: [] } as ExtractedProblem;
      const signals = [{ id: 's1', description: 'paid', strength: 'STRONG', type: 'PAID_WORKAROUND', evidenceIds: ['e1'] }] as CommercialSignal[];
      const claims = [{ id: 'c1', claimText: 'Users pay for Zapier', status: 'CONTESTED', supportingEvidenceIds: ['e1'], contradictingEvidenceIds: ['e2'] }] as any;
      
      const opps = generator.generateOpportunities(clusters, [prob], [], [], signals, claims, config);
      expect(opps.length).toBe(1);
      expect(opps[0].uncertainty).toMatch(/Contested/i);
    });

    it('D: Critical evidence absent -> rejected', () => {
      const prob = { id: 'p1', workaroundType: 'none', currentWorkaround: 'Unknown', evidenceQuality: 'LOW', signalCount: 1, evidenceIds: ['e1'], targetUser: 'Founder', evidenceQuotes: [] } as ExtractedProblem;
      const signals = [] as CommercialSignal[];
      
      const opps = generator.generateOpportunities(clusters, [prob], [], [], signals, [], config);
      expect(opps.length).toBe(0);
    });

    it('E: Material claim is unsupported -> hypothesis', () => {
      const prob = { id: 'p1', workaroundType: 'spreadsheet', currentWorkaround: 'Excel', evidenceQuality: 'HIGH', signalCount: 3, evidenceIds: ['e1'], targetUser: 'Founder', evidenceQuotes: [] } as ExtractedProblem;
      const signals = [{ id: 's1', description: 'paid', strength: 'STRONG', type: 'PAID_WORKAROUND', evidenceIds: ['e1'] }] as CommercialSignal[];
      const claims = [{ id: 'c1', claimText: 'They use AWS', status: 'UNSUPPORTED', supportingEvidenceIds: [], contradictingEvidenceIds: [] }] as any;
      
      const opps = generator.generateOpportunities(clusters, [prob], [], [], signals, claims, config);
      expect(opps.length).toBe(1);
      expect(opps[0].validation_hypotheses?.some(h => h.includes('They use AWS'))).toBe(true);
    });
  });

  describe('End-To-End Pipeline Integrity (Mocked)', () => {
    it('should flow deterministic evidence through Controller to Report', async () => {
      // Create mocked controller dependencies
      const mockRepo = { saveRun: async () => {} } as any;
      const mockCollector = { search: async () => [], collect: async () => [] } as any;
      const mockFilter = { filter: async (ev: any) => ev } as any;
      
      // Override extractors to be deterministic
      const mockExtractor = new ProblemExtractor();
      mockExtractor.extractProblems = () => [{
        id: 'p1', problemStatement: 'Hate billing', targetUser: 'Founder', currentWorkaround: 'Hire VA', workaroundType: 'outsourcing',
        costInTimeOrMoney: 'thousands', workflowTrigger: 'end of month', whyPainful: 'slow', evidenceIds: ['e1'], evidenceQuality: 'HIGH', signalCount: 2, evidenceQuotes: []
      }];
      
      const mockClusterer = { clusterProblems: () => [{ id: 'c1', clusterName: 'billing', problemIds: ['p1'], description: '', signalCount: 1, sourceDiversity: 1, commonAffectedUsers: '', commonWorkflow: '', overallEvidenceStrength: 'HIGH' }] } as any;
      
      const mockGap = new SolutionGapAnalyzer();
      mockGap.analyze = () => ({
        solutions: [{ name: 'VA', type: 'manual_workaround', whatUsersDo: 'hire', positiveAspects: [], negativeAspects: [], targetUser: 'Founder', evidenceIds: ['e1'] }],
        gaps: [],
        commercialSignals: [{ id: 's1', description: 'pays VA', strength: 'STRONG', type: 'PAID_WORKAROUND', evidenceIds: ['e1'] }]
      });

      const mockOppGen = new OpportunityGenerator();
      const mockVerifier = new ClaimVerifier();
      mockVerifier.verifyClaims = () => [{ id: 'c1', claimText: 'test', status: 'VERIFIED', supportingEvidenceIds: ['e1'], contradictingEvidenceIds: [] }];
      
      const mockQuality = { audit: (opps: any) => ({ verifiedOpportunities: opps }) } as any;
      const mockReport = { generateMarkdownReport: () => '# Test Report' } as any;
      const mockAI = { enrichIfAvailable: async (c: any, e: any, p: any, opps: any) => ({ opportunities: opps }) } as any;
      
      const controller = new ResearchController(
        mockRepo, mockCollector, mockFilter, mockExtractor, mockClusterer, mockGap, mockOppGen, mockQuality, mockReport, mockAI
      );

      // Force evidence into the state so the pipeline starts extracting
      const testConfig = { targetUser: 'Founders', topic: 'billing', brief: { target: { primaryUser: 'Founders' } }, budget: { maxSearches: 10, maxDeepFetches: 10, maxLlmCalls: 50, maxTokens: 100000, maxCostUsd: 10, maxRuntimeMs: 10000 } } as any;
      
      // We'll mock determineNextAction to run sequentially
      (controller as any).determineNextAction = (state: ResearchState) => {
        if (state.evidence.length === 0) {
          state.evidence = createMockEvidence();
          return { type: 'PROBLEM_INVESTIGATION' } as any;
        }
        if (state.problems.length > 0 && state.solutions.length === 0) return { type: 'SOLUTION_INVESTIGATION' } as any;
        if (state.solutions.length > 0 && state.opportunities.length === 0) return { type: 'SYNTHESIS' } as any;
        return { type: 'STOP' } as any;
      };

      const result = await controller.run(testConfig);
      
      expect(result.status).toBe('RESEARCH_COMPLETE');
      expect(result.opportunities.length).toBe(1);
      expect(result.opportunities[0].title).toBe('Automated billing');
      expect(result.opportunities[0].commercial_signals?.length).toBe(1);
      expect(result.reportMarkdown).toBe('# Test Report');
    });
  });
});

