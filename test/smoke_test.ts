import { ResearchPipeline } from '../src/lib/engine/researchPipeline';
import { ProductScoutRepository } from '../src/lib/db/productScoutRepository';
import { ResearchRunConfig } from '../src/types';

async function runSmokeTest() {
  console.log('Running V1.5 Production Smoke Test...');
  
  // Mock DB to avoid needing real Supabase credentials for the test script
  const mockRepo = {
    saveRun: async (run: any) => { console.log(`Run saved to DB with status: ${run.status}`); },
    getRun: async () => null,
    getSettings: async () => ({ aiProvider: 'heuristic' }),
  } as unknown as ProductScoutRepository;

  const pipeline = new ResearchPipeline(mockRepo);

  const config: ResearchRunConfig = {
    topic: 'Automated invoice processing for accountants',
    timeframe: '30d',
    maxSources: 3,
    focus: 'problems',
    targetUser: 'Accountants',
    brief: {
      id: 'smoke_1',
      objective: 'validate_existing_idea',
      subject: 'Automated invoice processing for accountants',
      target: { primaryUser: 'Accountants' },
      researchConfiguration: { evidenceWindow: '30d', maxSourcesPerQuery: 3, allowedSourceTypes: ['web'] },
      opportunityProfile: { productTypes: ['Automation'], buildHorizon: '1m', teamSize: 'Solo', technicalCapability: 'Medium' },
      outputRequirements: { type: 'product_brief_30d' }
    }
  };

  try {
    const run = await pipeline.execute(config);
    console.log('\n========================================');
    console.log('SMOKE TEST RESULT');
    console.log('========================================');
    console.log(`Status: ${run.status}`);
    console.log(`Raw Evidence Count: ${run.classifiedEvidence.length}`);
    console.log(`Opportunities Generated: ${run.opportunities.length}`);
    
    if (run.telemetry) {
      console.log(`Telemetry Cost: $${run.telemetry.estimatedCostUsd.toFixed(4)}`);
      console.log(`Telemetry Token Usage: ${run.telemetry.tokenUsage}`);
    } else {
      console.log('Telemetry object missing!');
    }
    
    console.log('Report Preview (first 500 chars):');
    console.log(run.reportMarkdown?.substring(0, 500));
    console.log('========================================');
  } catch (err: any) {
    console.error('Smoke test failed:', err);
  }
}

runSmokeTest();
