import { describe, it, expect } from 'vitest';
import { ClaimVerifier } from '../src/lib/engine/claimVerifier';
import { ClassifiedEvidence, ResearchRunConfig, SystemSettings } from '../src/types';
import { ResearchPlanner } from '../src/lib/engine/researchPlanner';
import { EvidenceFilter } from '../src/lib/engine/evidenceFilter';
import { AIProviderManager } from '../src/lib/engine/aiProvider';

describe('Independent Re-Audit: Claim Verification (P0-002)', () => {
  it('should test if official commercial documentation can verify a commercial claim without first-hand complaints', () => {
    const verifier = new ClaimVerifier();
    const claims = ['Salesforce enterprise pricing costs over $150 per user per month.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'ev_1',
      platform: 'web',
      url: 'https://salesforce.com/pricing',
      title: 'Salesforce Enterprise Pricing Documentation',
      snippet: 'Our enterprise pricing tier starts at $150 per user per month. This cost includes full CRM features.',
      evidenceType: 'INDUSTRY_ANALYSIS',
      quality: 'HIGH',
      relevance: 'RELEVANT',
      firstHandMarkers: []
    }];

    const results = verifier.verifyClaims(claims, evidence);
    console.log("Claim Status for Official Pricing:", results[0].status, results[0].uncertaintyExplanation);
  });
});

describe('Independent Re-Audit: Brief Awareness', () => {
  const dummySettings: SystemSettings = { aiProvider: 'none', geminiModel: 'gemini-3.8-flash' };
  const aiProvider = new AIProviderManager(dummySettings);
  const planner = new ResearchPlanner(aiProvider);

  it('Brief A: Dental clinics in India', () => {
    const config: ResearchRunConfig = {
      brief: {
        subject: 'Patient onboarding and record management',
        target: { primaryUser: 'Dental clinics', industry: 'Healthcare', geography: 'India' },
        constraints: { buildHorizon: '1m', exclusions: ['AI chatbots'] },
        objective: 'Test',
        opportunityProfile: { expectedCommercialValue: 'B2B', idealProblemType: 'Workflow', buildHorizon: '1m' }
      }
    };
    const questions = planner.generateQuestions(config);
    console.log("Brief A Questions:");
    questions.forEach(q => console.log(`- ${q.text}`));
    expect(questions.some(q => q.text.includes('India'))).toBe(true);
    expect(questions.some(q => q.text.includes('chatbot'))).toBe(true);
  });

  it('Brief B: ML engineering globally', () => {
    const config: ResearchRunConfig = {
      brief: {
        subject: 'Model training cost tracking',
        target: { primaryUser: 'ML engineering teams', targetBuyer: 'Enterprise VP of Eng', geography: 'Global' },
        constraints: { buildHorizon: '6m', exclusions: [] },
        objective: 'Test',
        opportunityProfile: { expectedCommercialValue: 'B2B', idealProblemType: 'Workflow', buildHorizon: '6m' }
      }
    };
    const questions = planner.generateQuestions(config);
    console.log("Brief B Questions:");
    questions.forEach(q => console.log(`- ${q.text}`));
    expect(questions.some(q => q.text.toLowerCase().includes('enterprise') || q.text.toLowerCase().includes('vp of eng'))).toBe(true);
  });
});

describe('Independent Re-Audit: Domain Relevance', () => {
  it('Should mark developer noise as IRRELEVANT for dental clinics', () => {
    const filter = new EvidenceFilter();
    const config: ResearchRunConfig = {
      topic: 'patient records',
      targetUser: 'dental clinics',
      industry: 'healthcare',
      geography: 'india'
    };
    const evidence = filter.classify({
      title: 'React state management is a nightmare',
      content: 'I hate using Redux, I have to manually write so much boilerplate. It takes hours. Why is there no simpler alternative?',
      platform: 'reddit',
      url: 'https://reddit.com/r/reactjs'
    }, config);

    console.log("Relevance for developer noise:", evidence.relevance, "Score:", evidence.quality);
    expect(evidence.relevance).toBe('IRRELEVANT');
  });
});
