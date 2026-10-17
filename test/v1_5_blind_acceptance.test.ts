import { describe, it, expect } from 'vitest';
import { ResearchController } from '../src/lib/engine/researchController';
import { ResearchPlanner } from '../src/lib/engine/researchPlanner';
import { ClaimVerifier } from '../src/lib/engine/claimVerifier';
import { OpportunityGenerator } from '../src/lib/engine/opportunityGenerator';
import { SolutionGapAnalyzer } from '../src/lib/engine/solutionGapAnalyzer';
import { ProblemExtractor } from '../src/lib/engine/problemExtractor';
import { EvidenceFilter } from '../src/lib/engine/evidenceFilter';
import { ClusteringEngine } from '../src/lib/engine/clusteringEngine';
import { ReportGenerator } from '../src/lib/engine/reportGenerator';
import { MockAIProvider, MockSearchProvider, MockContentProvider } from './mocks/providers';

// End-to-end acceptance test driver
describe('BLIND PRODUCTION ACCEPTANCE TEST', () => {
  it('TEST 1: Normal User - Dental Clinics India', async () => {
    const planner = new ResearchPlanner();
    const config = {
      brief: {
        subject: 'Find software opportunities for independent dental clinics in India that a small technical team could test within 30 days. Exclude AI chatbots.',
        target: { primaryUser: 'dental clinic owners', geography: 'India' },
        timeframe: '30d'
      },
      mode: 'deep',
      budget: { maxSearches: 5, maxDeepFetches: 10, maxLlmCalls: 5, maxTokens: 10000, maxCostUsd: 1.0 }
    } as any;
    
    const questions = planner.generateQuestions(config);
    const qs = questions.map(q => q.text).join(' ');
    
    expect(qs).toContain('India');
    expect(qs).toContain('dental clinic');
    expect(qs).toContain('chatbots');
  });

  it('TEST 2: Developer Tool - ML Engineers Globally', async () => {
    const planner = new ResearchPlanner();
    const config = {
      brief: {
        subject: 'Find developer-tool opportunities for ML engineers globally. Enterprise buyer. Six-month build horizon.',
        target: { primaryUser: 'ML engineers', geography: 'Global' }
      }
    } as any;
    
    const questions = planner.generateQuestions(config);
    const qs = questions.map(q => q.text).join(' ');
    
    expect(qs).toContain('ML engineers');
    expect(qs).toContain('Enterprise');
  });

  it('TEST 4: Claim Verification Overcorrection Fix', async () => {
    const verifier = new ClaimVerifier();
    const claims = [
      'The API rate limit is 100 requests per minute.',
      'Pricing is $49/month.',
      'Users struggle with manual export.'
    ];
    
    const evidence = [
      { id: 'e1', platform: 'web', url: 'https://docs.api.com', title: 'Docs', snippet: 'The API rate limit is 100 requests per minute.', evidenceType: 'GENERIC_ARTICLE', quality: 'HIGH', relevance: 'RELEVANT' },
      { id: 'e2', platform: 'web', url: 'https://example.com/pricing', title: 'Pricing', snippet: 'Pricing is $49/month.', evidenceType: 'INDUSTRY_ANALYSIS', quality: 'HIGH', relevance: 'RELEVANT' },
      { id: 'e3', platform: 'reddit', title: 'Pain', snippet: 'I struggle with manual export.', evidenceType: 'FIRST_HAND_USER_COMPLAINT', quality: 'HIGH', relevance: 'RELEVANT', firstHandMarkers: ['I'] }
    ] as any;
    
    const verified = verifier.verifyClaims(claims, evidence);
    expect(verified[0].status).toBe('VERIFIED');
    expect(verified[1].status).toBe('VERIFIED');
    expect(verified[2].status).toBe('VERIFIED');
  });

  it('TEST 5: Domain Relevance Attack', () => {
    const filter = new EvidenceFilter();
    const config = { brief: { subject: 'Dental clinics in India' } } as any;
    
    const evidence = {
      id: 'dev_noise',
      url: 'https://github.com/react',
      title: 'React Hooks issue',
      snippet: 'I am struggling with useEffect dependency arrays.',
      content: 'I am struggling with useEffect dependency arrays.',
      platform: 'web'
    } as any;
    
    const classified = filter.classify(evidence, config);
    expect(classified.relevance).toBe('IRRELEVANT');
  });

  it('TEST 9: False Confidence Telemetry', () => {
    const reportGen = new ReportGenerator();
    const run = {
      status: 'RESEARCH_COMPLETE',
      createdAt: new Date().toISOString(),
      config: { brief: { subject: 'Test' } },
      brief: { subject: 'Test', target: { primaryUser: 'Users' } },
      telemetry: {
        runtimeMs: 4215,
        estimatedCostUsd: 0.1542,
        discoverySearches: 5,
        evidenceItems: 10,
        deepFetches: 2
      },
      opportunities: []
    } as any;
    
    const markdown = reportGen.generateMarkdownReport(run);
    expect(markdown).toContain('approximately 4s');
    expect(markdown).toContain('~15¢');
    expect(markdown).not.toContain('0.1542');
    expect(markdown).not.toContain('4.2s');
  });
});
