import { describe, it } from 'vitest';
import { ResearchState } from '../src/lib/engine/researchState';
import { ResearchRunConfig, ResearchQuestion } from '../src/types';
import assert from 'assert';

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
      maxRuntimeMs: 1000,
      maxTokens: 10000,
      maxCostUsd: 1.0
    }
  } as unknown as ResearchRunConfig;
}

describe('V1.5 Adaptive Controller Tests', () => {
  it('should pass all sub-tests', () => {
    // 1. Budget Exhaustion Test
    const state1 = new ResearchState(createMockConfig());
  state1.searchCount = 5; // equals maxSearches
  assert.strictEqual(state1.isBudgetExhausted(), true, 'Should detect max searches budget exhaustion');

  // 2. Sufficiency / Stopping Condition
  const state2 = new ResearchState(createMockConfig());
  state2.questions = [
    { id: 'q1', text: 'test?', importance: 'HIGH', status: 'COVERED', evidenceIds: ['1'] }
  ];
  state2.opportunities = [
    {
      id: 'opp1',
      title: 'Opp1',
      description: 'Test',
      targetCustomer: 'Test',
      evidenceSummary: 'Test',
      coreWorkflow: 'Test',
      distributionDifficulty: 'Low',
      validationExperiment: {
        hypothesis: '',
        testMethod: '',
        successMetric: '',
        estimatedCostTime: ''
      },
      evidenceConfidence: 0.9,
      counterEvidenceIds: ['ce1']
    }
  ];
  assert.strictEqual(state2.checkSufficiency(), true, 'Should be sufficient when questions are covered and counter-evidence exists');

  // 3. Repeated-action prevention (Loop detection in state)
  const state3 = new ResearchState(createMockConfig());
  assert.strictEqual(state3.getActionCount('DISCOVERY_SEARCH', 'test') > 0, false);
  state3.recordAction('DISCOVERY_SEARCH', 'test');
  assert.strictEqual(state3.getActionCount('DISCOVERY_SEARCH', 'test') > 0, true, 'Should record and detect repeated actions');

  // 4. Incomplete Sufficiency (Missing Counter Evidence)
  const state4 = new ResearchState(createMockConfig());
  state4.questions = [
    { id: 'q1', text: 'test?', importance: 'HIGH', status: 'COVERED', evidenceIds: ['1'] }
  ];
  state4.opportunities = [
    {
      id: 'opp1',
      title: 'Opp1',
      description: 'Test',
      targetCustomer: 'Test',
      evidenceSummary: 'Test',
      coreWorkflow: 'Test',
      distributionDifficulty: 'Low',
      validationExperiment: {
        hypothesis: '',
        testMethod: '',
        successMetric: '',
        estimatedCostTime: ''
      },
      evidenceConfidence: 0.9,
      counterEvidenceIds: [] // MISSING!
    }
  ];
  assert.strictEqual(state4.checkSufficiency(), false, 'Should fail sufficiency if counter-evidence is missing');
  });
});
