import { describe, it, expect } from 'vitest';
import { ClaimVerifier } from '../src/lib/engine/claimVerifier';
import { ClassifiedEvidence } from '../src/types';

describe('V1.5 Claim Verification - Claim Type Aware', () => {
  const verifier = new ClaimVerifier();

  it('A. official pricing evidence -> VERIFIED pricing claim', () => {
    const claims = ['Stripe charges $49 per month for advanced features.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'e1',
      platform: 'web',
      url: 'https://stripe.com/pricing',
      title: 'Stripe Pricing',
      snippet: 'Stripe charges $49 per month for advanced features.',
      evidenceType: 'GENERIC_ARTICLE',
      quality: 'HIGH',
      relevance: 'RELEVANT'
    }];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).toBe('VERIFIED');
  });

  it('B. official technical documentation -> VERIFIED technical claim', () => {
    const claims = ['The API rate limit is 100 requests per minute.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'e2',
      platform: 'web',
      url: 'https://docs.api.com/limits',
      title: 'API Documentation',
      snippet: 'The API rate limit is 100 requests per minute for all users.',
      evidenceType: 'GENERIC_ARTICLE',
      quality: 'HIGH',
      relevance: 'RELEVANT'
    }];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).toBe('VERIFIED');
  });

  it('C. first-hand user reports -> VERIFIED user pain claim', () => {
    const claims = ['Users struggle with manual data entry wasting hours.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'e3',
      platform: 'reddit',
      url: 'https://reddit.com/r/accounting',
      title: 'Manual entry sucks',
      snippet: 'I hate how I struggle with manual data entry. It is wasting hours of my time.',
      evidenceType: 'FIRST_HAND_USER_COMPLAINT',
      quality: 'HIGH',
      relevance: 'RELEVANT',
      firstHandMarkers: ['I hate']
    }];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).toBe('VERIFIED');
  });

  it('D. weak generic blog -> PARTIALLY_SUPPORTED / UNVERIFIED (not VERIFIED)', () => {
    const claims = ['Users hate manual data entry.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'e4',
      platform: 'web',
      url: 'https://seospam.com',
      title: 'Top 10 tools',
      snippet: 'Users hate manual data entry, so use our tool.',
      evidenceType: 'VENDOR_MARKETING',
      quality: 'LOW',
      relevance: 'RELEVANT'
    }];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).not.toBe('VERIFIED');
  });

  it('E. broad scope mismatch -> not VERIFIED', () => {
    const claims = ['All users constantly struggle with this workflow.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'e5',
      platform: 'reddit',
      url: 'https://reddit.com/r/test',
      title: 'Anecdote',
      snippet: 'Sometimes one user might struggle with this workflow.',
      evidenceType: 'FIRST_HAND_USER_COMPLAINT',
      quality: 'HIGH',
      relevance: 'RELEVANT',
      firstHandMarkers: ['I']
    }];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).toBe('PARTIALLY_SUPPORTED');
    expect(results[0].uncertaintyExplanation).toContain('scope');
  });

  it('F. contradictory evidence -> CONTESTED', () => {
    const claims = ['Users struggle with API setup.'];
    const evidence: ClassifiedEvidence[] = [
      {
        id: 'e6a',
        platform: 'reddit',
        title: 'Pain',
        snippet: 'I struggle with API setup.',
        quality: 'HIGH',
        evidenceType: 'FIRST_HAND_USER_COMPLAINT',
        relevance: 'RELEVANT',
        firstHandMarkers: ['I']
      },
      {
        id: 'e6b',
        platform: 'reddit',
        title: 'No problem',
        snippet: 'API setup is solved by the new SDK. No problem at all.',
        quality: 'HIGH',
        evidenceType: 'FIRST_HAND_USER_COMPLAINT',
        relevance: 'RELEVANT',
        firstHandMarkers: ['I']
      }
    ];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).toBe('CONTESTED');
  });

  it('H. outdated evidence -> qualification', () => {
    const claims = ['In 2025, pricing costs $10.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'e7',
      platform: 'web',
      url: 'https://example.com',
      title: 'Pricing 2021',
      snippet: 'Pricing costs $10.',
      evidenceType: 'INDUSTRY_ANALYSIS',
      quality: 'HIGH',
      relevance: 'RELEVANT'
    }];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).toBe('PARTIALLY_SUPPORTED');
    expect(results[0].uncertaintyExplanation).toContain('outdated');
  });

  it('I. evidence unrelated -> UNSUPPORTED', () => {
    const claims = ['The sky is blue.'];
    const evidence: ClassifiedEvidence[] = [{
      id: 'e8',
      platform: 'web',
      title: 'Random',
      snippet: 'We ate apples today.',
      evidenceType: 'GENERIC_ARTICLE',
      quality: 'LOW',
      relevance: 'RELEVANT'
    }];
    const results = verifier.verifyClaims(claims, evidence);
    expect(results[0].status).toBe('UNSUPPORTED');
  });
});

describe('Mixed Evidence Regression Fixture', () => {
  const verifier = new ClaimVerifier();

  const fixture: ClassifiedEvidence[] = [
    {
      id: 'src_doc',
      platform: 'web',
      url: 'https://docs.aws.amazon.com/lambda',
      title: 'AWS Lambda Developer Guide',
      snippet: 'AWS Lambda execution time limit is 15 minutes.',
      evidenceType: 'INDUSTRY_ANALYSIS',
      quality: 'HIGH',
      relevance: 'RELEVANT'
    },
    {
      id: 'src_price',
      platform: 'web',
      url: 'https://aws.amazon.com/lambda/pricing',
      title: 'AWS Lambda Pricing',
      snippet: 'Lambda charges $0.20 per 1M requests.',
      evidenceType: 'INDUSTRY_ANALYSIS',
      quality: 'HIGH',
      relevance: 'RELEVANT'
    },
    {
      id: 'src_user',
      platform: 'hacker_news',
      url: 'https://news.ycombinator.com',
      title: 'Show HN',
      snippet: 'I hate the 15 minute limit, it makes long batch jobs a nightmare. I have to manually chunk them.',
      evidenceType: 'FIRST_HAND_USER_COMPLAINT',
      quality: 'HIGH',
      relevance: 'RELEVANT',
      firstHandMarkers: ['I hate']
    },
    {
      id: 'src_seo',
      platform: 'web',
      url: 'https://spam.com',
      title: 'Best serverless tools',
      snippet: 'Lambda is cheap and easy. Buy our course.',
      evidenceType: 'VENDOR_MARKETING',
      quality: 'LOW',
      relevance: 'RELEVANT'
    }
  ];

  it('should correctly verify diverse claims using appropriate evidence', () => {
    const claims = [
      'AWS Lambda execution time limit is 15 minutes.',
      'Lambda charges $0.20 per 1M requests.',
      'Users struggle with the 15 minute limit making batch jobs a nightmare.'
    ];
    const results = verifier.verifyClaims(claims, fixture);

    expect(results[0].status).toBe('VERIFIED');
    expect(results[0].supportingEvidenceIds).toContain('src_doc');
    
    expect(results[1].status).toBe('VERIFIED');
    expect(results[1].supportingEvidenceIds).toContain('src_price');

    expect(results[2].status).toBe('VERIFIED');
    expect(results[2].supportingEvidenceIds).toContain('src_user');
  });
});
