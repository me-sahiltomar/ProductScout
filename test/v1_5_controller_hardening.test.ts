import { describe, it } from 'vitest';
import { ResearchState } from '../src/lib/engine/researchState';
import { ResearchRunConfig, ResearchQuestion } from '../src/types';
import assert from 'assert';
import { ResearchController } from '../src/lib/engine/researchController';
import { CollectorManager } from '../src/lib/collectors/collectorManager';
import { EvidenceFilter } from '../src/lib/engine/evidenceFilter';
import { ProblemExtractor } from '../src/lib/engine/problemExtractor';
import { ClusteringEngine } from '../src/lib/engine/clusteringEngine';
import { SolutionGapAnalyzer } from '../src/lib/engine/solutionGapAnalyzer';
import { OpportunityGenerator } from '../src/lib/engine/opportunityGenerator';
import { QualityController } from '../src/lib/engine/qualityController';
import { ReportGenerator } from '../src/lib/engine/reportGenerator';
import { AIProviderManager } from '../src/lib/engine/aiProvider';
import { ProductScoutRepository } from '../src/lib/db/productScoutRepository';

function createMockConfig(): ResearchRunConfig {
  return {
    topic: 'test',
    timeframe: '30d',
    maxSources: 5,
    focus: 'problems',
    budget: {
      maxSearches: 5,
      maxDeepFetches: 10,
      maxLlmCalls: 5,
      maxTokens: 10000,
      maxCostUsd: 1.0,
      maxRuntimeMs: 10000
    },
    brief: {
        id: 'test',
        target: { primaryUser: 'Test User' },
        objective: 'Test',
        researchConfiguration: { evidenceWindow: '30d', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] },
        outputRequirements: { type: 'builder_brief_7d' }
    }
  } as unknown as ResearchRunConfig;
}

describe('V1.5 Adaptive Controller Hardening Tests', () => {
  it('should run properly', async () => {
  console.log('Running V1.5 Adaptive Controller Hardening Tests...');

  // 1. Budget Exhaustion (Tokens and USD)
  const state1 = new ResearchState(createMockConfig());
  state1.tokenCount = 10001;
  assert.strictEqual(state1.isBudgetExhausted(), true, 'Should detect token budget exhaustion');
  
  state1.tokenCount = 0;
  state1.estimatedCostUsd = 1.05;
  assert.strictEqual(state1.isBudgetExhausted(), true, 'Should detect USD budget exhaustion');

  // 2. Sufficiency (Missing open high-value questions)
  const state2 = new ResearchState(createMockConfig());
  state2.questions = [
    { id: 'q1', text: 'test?', importance: 'HIGH', status: 'OPEN', uncertaintyScore: 1.0, supportingEvidenceIds: [], contradictoryEvidenceIds: [], actionsAttempted: 0 }
  ];
  assert.strictEqual(state2.checkSufficiency(), false, 'Should fail sufficiency if high value question is OPEN');
  
  state2.questions[0].status = 'COVERED';
  assert.strictEqual(state2.checkSufficiency(), false, 'Should fail sufficiency if no opportunities generated');

  // 3. Loop Prevention via Expected Value calculation
  const controller = new ResearchController(
      new ProductScoutRepository(),
      new CollectorManager(),
      new EvidenceFilter(),
      new ProblemExtractor(),
      new ClusteringEngine(),
      new SolutionGapAnalyzer(),
      new OpportunityGenerator(),
      new QualityController(),
      new ReportGenerator(),
      new AIProviderManager({ aiProvider: 'heuristic', defaultMaxSources: 10, defaultTimeframe: '30d' })
  );

  const state3 = new ResearchState(createMockConfig());
  state3.questions = [
    { id: 'q1', text: 'test?', importance: 'HIGH', status: 'OPEN', uncertaintyScore: 1.0, supportingEvidenceIds: [], contradictoryEvidenceIds: [], actionsAttempted: 0 }
  ];

  // Access the private determineNextAction for testing purposes using any
  const firstAction = (controller as any).determineNextAction(state3);
  assert.strictEqual(firstAction.type, 'DISCOVERY_SEARCH');
  
  // Fake executing it 3 times to penalize it
  state3.recordAction('DISCOVERY_SEARCH', 'q1');
  state3.recordAction('DISCOVERY_SEARCH', 'q1');
  state3.recordAction('DISCOVERY_SEARCH', 'q1');
  state3.recordAction('DISCOVERY_SEARCH', 'q1');

  const penalizedAction = (controller as any).determineNextAction(state3);
  // EV should have dropped below 0.1 threshold, returning STOP
  assert.strictEqual(penalizedAction.type, 'STOP', 'Repeated actions should drop EV and trigger STOP');

  // 4. Update Coverage logic
  const state4 = new ResearchState(createMockConfig());
  state4.questions = [
      { id: 'q1', text: 'test?', importance: 'HIGH', status: 'OPEN', uncertaintyScore: 1.0, supportingEvidenceIds: ['ev1'], contradictoryEvidenceIds: [], actionsAttempted: 0 }
  ];
  state4.updateCoverage();
  assert.strictEqual(state4.questions[0].status, 'PARTIAL', 'Should be PARTIAL when supporting evidence exists but no contradictory');
  
  state4.questions[0].contradictoryEvidenceIds.push('ce1');
  state4.updateCoverage();
  assert.strictEqual(state4.questions[0].status, 'COVERED', 'Should be COVERED when both supporting and contradictory evidence exist');

  console.log('All V1.5 Controller Hardening tests passed successfully!');
  });
});
