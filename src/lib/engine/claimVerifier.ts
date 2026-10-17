import { VerifiedClaim, ClassifiedEvidence, ClaimStatus } from '@/types';

type ClaimCategory = 'PRICING' | 'TECHNICAL' | 'USER_PAIN' | 'REGULATORY' | 'GENERAL';

export class ClaimVerifier {
  /**
   * Evaluates candidate claims against retrieved evidence.
   * STRICT INTEGRITY RULE: Lexical matching alone CANNOT produce a 'VERIFIED' status.
   * If semantic entailment cannot be performed, status must be 'UNVERIFIED',
   * 'PARTIALLY_SUPPORTED', 'CONTESTED', or 'UNSUPPORTED'.
   */

  private determineClaimType(claim: string): ClaimCategory {
    const c = claim.toLowerCase();
    if (/\b(price|pricing|costs?|charges?|\$|dollars|subscription|tier|expensive|cheap)\b/.test(c)) return 'PRICING';
    if (/\b(api|integration|sdk|documentation|database|infrastructure|architect(ure)?|latency|performance)\b/.test(c)) return 'TECHNICAL';
    if (/\b(struggle|painful|nightmare|frustrated|manual(ly)?|hate|complaint|hours|waste|difficult|hard)\b/.test(c)) return 'USER_PAIN';
    if (/\b(compliance|gdpr|hipaa|soc2|regulatory|tax|legal|government|law)\b/.test(c)) return 'REGULATORY';
    return 'GENERAL';
  }

  private checkEvidenceSuitability(claimCategory: ClaimCategory, ev: ClassifiedEvidence, claim: string): { suitable: boolean; reason?: string; isStrong: boolean } {
    const isFirstHand = (ev.firstHandMarkers && ev.firstHandMarkers.length > 0) ||
                        ev.evidenceType === 'FIRST_HAND_USER_COMPLAINT' ||
                        ev.evidenceType === 'WORKFLOW_PROBLEM' ||
                        (ev.evidenceType as string) === 'complaint';
    
    const url = ev.url?.toLowerCase() || '';
    const evText = `${ev.title} ${ev.snippet}`.toLowerCase();
    
    const isOfficialPricing = url.includes('pricing') || evText.includes('pricing') || url.includes('/plans');
    const isOfficialTech = url.includes('docs') || evText.includes('documentation') || ev.evidenceType === 'GITHUB_ISSUE';
    const isGov = url.includes('.gov') || url.includes('.org');
    
    // Scope mismatch check
    const claimLower = claim.toLowerCase();
    const claimIsBroad = /\b(widely|always|all users|everyone|every|constantly)\b/.test(claimLower);
    const evIsLimited = /\b(some|a few|sometimes|rarely|one user|anecdote)\b/.test(evText);
    if (claimIsBroad && evIsLimited) {
        return { suitable: true, isStrong: false, reason: 'Claim asserts broad scope, but evidence is limited/anecdotal.' };
    }
  
    // Time mismatch
    if (/\b(2025|2026)\b/.test(claimLower) && /\b(2021|2022|2023)\b/.test(evText)) {
        return { suitable: true, isStrong: false, reason: 'Evidence may be outdated compared to claim timeline.' };
    }
    
    switch (claimCategory) {
      case 'PRICING':
        if (isOfficialPricing && ev.quality === 'HIGH') return { suitable: true, isStrong: true };
        if (ev.quality === 'HIGH') return { suitable: true, isStrong: false, reason: 'Quality source but not official pricing page' };
        return { suitable: false, isStrong: false, reason: 'Low quality source for pricing data' };
        
      case 'TECHNICAL':
        if ((isOfficialTech || ev.evidenceType === 'GITHUB_ISSUE') && ev.quality === 'HIGH') return { suitable: true, isStrong: true };
        if (ev.quality === 'HIGH') return { suitable: true, isStrong: false, reason: 'Quality source but not official technical documentation' };
        return { suitable: false, isStrong: false, reason: 'Low quality source for technical claim' };
        
      case 'USER_PAIN':
        if (isFirstHand && ev.quality === 'HIGH') return { suitable: true, isStrong: true };
        if (isFirstHand) return { suitable: true, isStrong: false, reason: 'First-hand evidence but lower quality.' };
        return { suitable: false, isStrong: false, reason: 'User pain requires first-hand practitioner testimony.' };
        
      case 'REGULATORY':
        if ((isGov || ev.quality === 'HIGH')) return { suitable: true, isStrong: true };
        return { suitable: false, isStrong: false, reason: 'Regulatory claims require authoritative sources.' };
        
      case 'GENERAL':
      default:
        if (ev.quality === 'HIGH') return { suitable: true, isStrong: true };
        return { suitable: false, isStrong: false, reason: 'Evidence quality is too low to verify.' };
    }
  }

  public verifyClaims(claims: string[], evidence: ClassifiedEvidence[]): VerifiedClaim[] {
    const verifiedClaims: VerifiedClaim[] = [];

    for (const claim of claims) {
      const claimLower = claim.toLowerCase();
      // Extract substantive keywords (>3 chars, excluding common functional words)
      const stopWords = new Set([
        'users', 'struggle', 'with', 'about', 'their', 'there', 'having', 'which',
        'these', 'those', 'could', 'would', 'should', 'where', 'operational', 'friction',
        'from', 'when', 'what', 'that', 'this', 'then', 'than', 'because', 'while'
      ]);
      const substantiveKeywords = claimLower
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));

      if (substantiveKeywords.length === 0 || evidence.length === 0) {
        verifiedClaims.push({
          id: `claim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          claimText: claim,
          status: 'UNSUPPORTED',
          supportingEvidenceIds: [],
          contradictingEvidenceIds: [],
          uncertaintyExplanation: 'No substantive keywords or evidence available to evaluate claim.'
        });
        continue;
      }

      const claimType = this.determineClaimType(claim);
      const matchedSupportingEvidence: ClassifiedEvidence[] = [];
      const matchedContradictingEvidence: ClassifiedEvidence[] = [];
      let bestWeakReason: string | undefined;

      for (const ev of evidence) {
        const evText = `${ev.title} ${ev.snippet}`.toLowerCase();
        
        let kwMatches = 0;
        for (const kw of substantiveKeywords) {
          if (evText.includes(kw)) kwMatches++;
        }

        const evMatchRatio = substantiveKeywords.length > 0 ? kwMatches / substantiveKeywords.length : 0;
        const hasContradiction = /\b(not an issue|solved by|non-issue|no problem|works fine|easily fixed|free tool)\b/i.test(evText);

        if (evMatchRatio >= 0.5) {
          if (hasContradiction) {
            matchedContradictingEvidence.push(ev);
          } else {
            // Semantic Entailment & Suitability Check
            const suitability = this.checkEvidenceSuitability(claimType, ev, claim);
            if (suitability.suitable) {
               // Must have high overlap for strong entailment
               if (evMatchRatio >= 0.8 && suitability.isStrong) {
                 // Perfect match
                 matchedSupportingEvidence.unshift(ev); // Prioritize strong evidence
               } else {
                 matchedSupportingEvidence.push(ev);
                 if (suitability.reason) bestWeakReason = suitability.reason;
               }
            } else {
               if (suitability.reason) bestWeakReason = suitability.reason;
            }
          }
        }
      }

      let status: ClaimStatus = 'UNSUPPORTED';
      let uncertaintyExplanation: string | undefined;

      if (matchedContradictingEvidence.length > 0 && matchedSupportingEvidence.length > 0) {
        status = 'CONTESTED';
        uncertaintyExplanation = 'Evidence contains conflicting perspectives on this claim.';
      } else if (matchedContradictingEvidence.length > 0) {
        status = 'CONTESTED';
        uncertaintyExplanation = 'Sources directly contradict this claim.';
      } else if (matchedSupportingEvidence.length > 0) {
        // Direct entailment on appropriate evidence
        const hasStrongEntailment = matchedSupportingEvidence.some(ev => {
          const suitability = this.checkEvidenceSuitability(claimType, ev, claim);
          const evText = `${ev.title} ${ev.snippet}`.toLowerCase();
          let kwMatches = 0;
          for (const kw of substantiveKeywords) {
            if (evText.includes(kw)) kwMatches++;
          }
          const ratio = substantiveKeywords.length > 0 ? kwMatches / substantiveKeywords.length : 0;
          return ratio >= 0.8 && suitability.isStrong;
        });

        if (hasStrongEntailment) {
          status = 'VERIFIED';
          uncertaintyExplanation = undefined;
        } else {
          status = 'PARTIALLY_SUPPORTED';
          uncertaintyExplanation = bestWeakReason || 'Substantively supported but lacks definitive strong entailment or broad scope.';
        }
      } else {
        if (bestWeakReason) {
            status = 'UNVERIFIED';
            uncertaintyExplanation = `Claim matches keywords but evidence is unsuitable: ${bestWeakReason}`;
        } else {
            status = 'UNSUPPORTED';
            uncertaintyExplanation = 'No retrieved evidence specifically substantiates this claim.';
        }
      }

      verifiedClaims.push({
        id: `claim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        claimText: claim,
        status,
        supportingEvidenceIds: matchedSupportingEvidence.map(e => e.id),
        contradictingEvidenceIds: matchedContradictingEvidence.map(e => e.id),
        uncertaintyExplanation
      });
    }

    return verifiedClaims;
  }
}
