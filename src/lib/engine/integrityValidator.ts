import { ResearchRun, ProductOpportunity, VerifiedClaim, ExistingSolution, ClassifiedEvidence } from '@/types';

export interface IntegrityValidationResult {
  valid: boolean;
  violations: string[];
}

/**
 * Validates the research run against core P0 data integrity invariants.
 * Prevents synthetic IDs, fabricated competitors, mock verified claims,
 * dropped provenance, and planned-as-executed falsehoods.
 */
export function validateResearchIntegrity(run: ResearchRun): IntegrityValidationResult {
  const violations: string[] = [];

  const evidenceMap = new Map<string, ClassifiedEvidence>();
  (run.classifiedEvidence || []).forEach(e => evidenceMap.set(e.id, e));

  // 1. Check for synthetic evidence and counter-evidence IDs
  const syntheticIdRegex = /^ce_\d+/;

  // 2. Validate ClassifiedEvidence
  for (const ev of run.classifiedEvidence || []) {
    if (syntheticIdRegex.test(ev.id)) {
      violations.push(`SYNTHETIC_EVIDENCE_ID: Classified evidence item has synthetic ID "${ev.id}".`);
    }
  }

  // 3. Validate Opportunities
  for (const opp of run.opportunities || []) {
    // Check counter-evidence IDs
    if (opp.counterEvidenceIds && opp.counterEvidenceIds.length > 0) {
      for (const ceId of opp.counterEvidenceIds) {
        if (syntheticIdRegex.test(ceId)) {
          violations.push(`SYNTHETIC_COUNTER_EVIDENCE: Opportunity "${opp.title || opp.name}" contains synthetic counter-evidence ID "${ceId}".`);
        }
        if (!evidenceMap.has(ceId)) {
          violations.push(`NONEXISTENT_COUNTER_EVIDENCE: Opportunity "${opp.title || opp.name}" references counter-evidence ID "${ceId}" which does not exist in classified evidence.`);
        }
      }
    }

    if (opp.counter_evidence && opp.counter_evidence.length > 0) {
      for (const ceId of opp.counter_evidence) {
        if (syntheticIdRegex.test(ceId)) {
          violations.push(`SYNTHETIC_COUNTER_EVIDENCE: Opportunity "${opp.title || opp.name}" contains synthetic counter-evidence ID "${ceId}" in counter_evidence.`);
        }
        if (!evidenceMap.has(ceId)) {
          violations.push(`NONEXISTENT_COUNTER_EVIDENCE: Opportunity "${opp.title || opp.name}" references non-existent ID "${ceId}" in counter_evidence.`);
        }
      }
    }

    // Check supporting evidence existence
    const suppIds = opp.supporting_evidence || [];
    for (const sId of suppIds) {
      if (!evidenceMap.has(sId)) {
        violations.push(`NONEXISTENT_SUPPORTING_EVIDENCE: Opportunity "${opp.title || opp.name}" references non-existent supporting evidence ID "${sId}".`);
      }
    }

    // Check Provenance Preservation (P0-004)
    // If opportunity claims supporting evidence, evidenceQuotes must not be empty
    if (suppIds.length > 0 && (!opp.evidenceQuotes || opp.evidenceQuotes.length === 0)) {
      violations.push(`PROVENANCE_DROPPED: Opportunity "${opp.title || opp.name}" has ${suppIds.length} supporting evidence IDs but evidenceQuotes is empty (provenance dropped during enrichment).`);
    }

    // Check Verified Claims
    if (opp.verified_claims && opp.verified_claims.length > 0) {
      for (const claim of opp.verified_claims) {
        if (claim.status === 'VERIFIED') {
          if (!claim.supportingEvidenceIds || claim.supportingEvidenceIds.length === 0) {
            violations.push(`UNSUPPORTED_VERIFIED_CLAIM: Claim "${claim.claimText}" in opportunity "${opp.title || opp.name}" is marked VERIFIED without supporting evidence.`);
          }
          for (const sId of claim.supportingEvidenceIds || []) {
            if (!evidenceMap.has(sId)) {
              violations.push(`NONEXISTENT_CLAIM_EVIDENCE: Claim "${claim.claimText}" references non-existent supporting evidence ID "${sId}".`);
            }
          }
        }
      }
    }

    // Check Commercial Signals
    if (opp.commercial_signals && opp.commercial_signals.length > 0) {
      for (const sig of opp.commercial_signals) {
        if (!sig.evidenceIds || sig.evidenceIds.length === 0) {
          violations.push(`FABRICATED_COMMERCIAL_SIGNAL: Commercial signal "${sig.description}" in opportunity "${opp.title || opp.name}" has no evidence IDs.`);
        }
        for (const sigEvId of sig.evidenceIds || []) {
          if (!evidenceMap.has(sigEvId)) {
            violations.push(`NONEXISTENT_SIGNAL_EVIDENCE: Commercial signal references non-existent evidence ID "${sigEvId}".`);
          }
        }
      }
    }
  }

  // 4. Validate Existing Solutions (P0-003)
  for (const sol of run.existingSolutions || []) {
    const isSpecialState = sol.name.includes('None identified') || 
                           sol.name.includes('Not investigated') || 
                           sol.type === 'manual_workaround' ||
                           sol.investigationStatus === 'NO_RELEVANT_SOLUTION_FOUND' ||
                           sol.investigationStatus === 'NOT_INVESTIGATED';

    if (!isSpecialState) {
      if (!sol.evidenceIds || sol.evidenceIds.length === 0) {
        violations.push(`FABRICATED_COMPETITOR: Existing solution "${sol.name}" has empty evidenceIds without provenance.`);
      } else {
        for (const solEvId of sol.evidenceIds) {
          if (!evidenceMap.has(solEvId)) {
            violations.push(`NONEXISTENT_SOLUTION_EVIDENCE: Solution "${sol.name}" references non-existent evidence ID "${solEvId}".`);
          }
        }
      }
    }
  }

  // 5. Validate Telemetry Truth
  if (run.telemetry) {
    const realCeCount = (run.opportunities || []).filter(o => 
      o.counter_evidence && o.counter_evidence.length > 0 && o.counter_evidence.every(id => evidenceMap.has(id))
    ).length;

    // If telemetry reports counterEvidenceRounds > 0, verify it is backed by real execution
    if (run.telemetry.counterEvidenceRounds > 0 && realCeCount === 0) {
      violations.push(`FALSE_TELEMETRY_COUNTER_EVIDENCE: Telemetry reports ${run.telemetry.counterEvidenceRounds} counter-evidence rounds, but 0 opportunities have real grounded counter-evidence.`);
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}
