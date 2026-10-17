import { describe, it, expect } from 'vitest';
import { ClaimVerifier } from '../src/lib/engine/claimVerifier';
import { ResearchPlanner } from '../src/lib/engine/researchPlanner';
import { ClassifiedEvidence } from '../src/types';

describe('FINAL AUDIT: Claim Verification Adversarial Traps', () => {
  const verifier = new ClaimVerifier();

  it('A. PRICING -> Official pricing page', () => {
    const results = verifier.verifyClaims(
      ['The enterprise tier costs $99/month.'],
      [{ id: 'e1', platform: 'web', url: 'https://example.com/pricing', title: 'Pricing', snippet: 'The enterprise tier costs $99/month.', evidenceType: 'INDUSTRY_ANALYSIS', quality: 'HIGH', relevance: 'RELEVANT' }]
    );
    expect(results[0].status).toBe('VERIFIED');
  });

  it('B. TECHNICAL -> Official documentation', () => {
    const results = verifier.verifyClaims(
      ['The API latency is under 50ms.'],
      [{ id: 'e2', platform: 'web', url: 'https://docs.example.com', title: 'API Documentation', snippet: 'The API latency is under 50ms for all endpoints.', evidenceType: 'GENERIC_ARTICLE', quality: 'HIGH', relevance: 'RELEVANT' }]
    );
    expect(results[0].status).toBe('VERIFIED');
  });

  it('C. USER PAIN -> First-hand practitioner report', () => {
    const results = verifier.verifyClaims(
      ['Users struggle with the manual export process.'],
      [{ id: 'e3', platform: 'reddit', title: 'I hate exporting', snippet: 'I struggle with the manual export process, it wastes hours.', evidenceType: 'FIRST_HAND_USER_COMPLAINT', quality: 'HIGH', relevance: 'RELEVANT', firstHandMarkers: ['I hate', 'I struggle'] }]
    );
    expect(results[0].status).toBe('VERIFIED');
  });

  it('D. REGULATORY -> Official/government source', () => {
    const results = verifier.verifyClaims(
      ['SOC2 compliance requires annual audits.'],
      [{ id: 'e4', platform: 'web', url: 'https://compliance.gov', title: 'SOC2 Guidelines', snippet: 'SOC2 compliance requires annual audits.', evidenceType: 'INDUSTRY_ANALYSIS', quality: 'HIGH', relevance: 'RELEVANT' }]
    );
    expect(results[0].status).toBe('VERIFIED');
  });

  it('E. COMPETITOR EXISTENCE -> Official product source', () => {
    const results = verifier.verifyClaims(
      ['Product X exists as a competitor in this space.'],
      [{ id: 'e5', platform: 'web', url: 'https://productx.com', title: 'Product X', snippet: 'Product X exists as a competitor in this space providing automation.', evidenceType: 'INDUSTRY_ANALYSIS', quality: 'HIGH', relevance: 'RELEVANT' }]
    );
    expect(results[0].status).toBe('VERIFIED');
  });

  it('G. WEAK BLOG -> Attempt to get VERIFIED', () => {
    const results = verifier.verifyClaims(
      ['Users struggle with the manual export process.'],
      [{ id: 'e7', platform: 'web', url: 'https://seospam.com', title: 'Top 10 tools', snippet: 'Users struggle with the manual export process. Buy our tool.', evidenceType: 'VENDOR_MARKETING', quality: 'LOW', relevance: 'RELEVANT' }]
    );
    expect(results[0].status).not.toBe('VERIFIED');
    expect(['UNVERIFIED', 'PARTIALLY_SUPPORTED', 'UNSUPPORTED']).toContain(results[0].status);
  });

  it('H. LEXICAL TRAP -> High word overlap but no semantic support', () => {
    // We are testing whether lexical overlap alone bypasses the quality/suitability checks.
    // Given the current heuristic, if suitability is met (e.g. high quality), lexical overlap might verify it.
    // But if suitability is weak, it shouldn't.
    const results = verifier.verifyClaims(
      ['Users hate manual data entry.'],
      [{ id: 'e8', platform: 'web', url: 'https://docs.com', title: 'Docs', snippet: 'Users can perform manual data entry without any hate or problems.', evidenceType: 'GENERIC_ARTICLE', quality: 'HIGH', relevance: 'RELEVANT' }]
    );
    // Since it contains contradiction keywords "without any hate or problems" or similar, or doesn't have firsthand markers for user pain:
    expect(results[0].status).not.toBe('VERIFIED');
  });

  it('I. SCOPE TRAP -> Evidence says "some" but claim says "always"', () => {
    const results = verifier.verifyClaims(
      ['Users always struggle with onboarding.'],
      [{ id: 'e9', platform: 'reddit', title: 'Some struggle', snippet: 'Some users sometimes struggle with onboarding.', evidenceType: 'FIRST_HAND_USER_COMPLAINT', quality: 'HIGH', relevance: 'RELEVANT', firstHandMarkers: ['users'] }]
    );
    expect(results[0].status).toBe('PARTIALLY_SUPPORTED');
    expect(results[0].uncertaintyExplanation).toContain('scope');
  });

  it('J. TIME TRAP -> Outdated evidence', () => {
    const results = verifier.verifyClaims(
      ['In 2026, the pricing is $50.'],
      [{ id: 'e10', platform: 'web', url: 'https://example.com/pricing', title: 'Pricing 2021', snippet: 'In 2021, the pricing is $50.', evidenceType: 'INDUSTRY_ANALYSIS', quality: 'HIGH', relevance: 'RELEVANT' }]
    );
    expect(results[0].status).toBe('PARTIALLY_SUPPORTED');
    expect(results[0].uncertaintyExplanation).toContain('outdated');
  });

  it('L. CONTRADICTION -> Conflicting sources', () => {
    const results = verifier.verifyClaims(
      ['Users struggle with onboarding.'],
      [
        { id: 'e12a', platform: 'reddit', title: 'Pain', snippet: 'I struggle with onboarding.', evidenceType: 'FIRST_HAND_USER_COMPLAINT', quality: 'HIGH', relevance: 'RELEVANT', firstHandMarkers: ['I'] },
        { id: 'e12b', platform: 'reddit', title: 'Easy', snippet: 'Onboarding is not an issue anymore.', evidenceType: 'FIRST_HAND_USER_COMPLAINT', quality: 'HIGH', relevance: 'RELEVANT', firstHandMarkers: ['I'] }
      ]
    );
    expect(results[0].status).toBe('CONTESTED');
  });

  it('M. MIXED EVIDENCE -> Verifier selects appropriate source for claim', () => {
    const results = verifier.verifyClaims(
      ['SOC2 compliance requires annual audits.', 'The enterprise tier costs $99/month.'],
      [
        { id: 'e_price', platform: 'web', url: 'https://example.com/pricing', title: 'Pricing', snippet: 'The enterprise tier costs $99/month.', evidenceType: 'INDUSTRY_ANALYSIS', quality: 'HIGH', relevance: 'RELEVANT' },
        { id: 'e_soc2', platform: 'web', url: 'https://compliance.gov', title: 'SOC2 Guidelines', snippet: 'SOC2 compliance requires annual audits.', evidenceType: 'INDUSTRY_ANALYSIS', quality: 'HIGH', relevance: 'RELEVANT' }
      ]
    );
    expect(results[0].status).toBe('VERIFIED');
    expect(results[0].supportingEvidenceIds).toContain('e_soc2');
    expect(results[1].status).toBe('VERIFIED');
    expect(results[1].supportingEvidenceIds).toContain('e_price');
  });
});

describe('FINAL AUDIT: Brief Awareness', () => {
  const planner = new ResearchPlanner();
  
  it('Should generate distinctly different questions for Freight vs ML Engineering', () => {
    const q1 = planner.generateQuestions({
      brief: {
        subject: 'Freight invoice reconciliation',
        target: { primaryUser: 'operations team', industry: 'Logistics', geography: 'Germany' },
      }
    } as any);
    
    const q2 = planner.generateQuestions({
      brief: {
        subject: 'Model training cost tracking',
        target: { primaryUser: 'ML engineering teams', industry: 'Tech', geography: 'global' },
      }
    } as any);
    
    const text1 = q1.map(q => q.text).join(' ');
    const text2 = q2.map(q => q.text).join(' ');
    
    expect(text1).toContain('Germany');
    expect(text2).toContain('ML engineering');
    expect(text1).not.toBe(text2);
  });
});
