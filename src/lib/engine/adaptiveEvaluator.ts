import { 
  ProductOpportunity, 
  ResearchBrief, 
  OpportunityEvaluation 
} from '@/types';

export class AdaptiveEvaluator {
  /**
   * Evaluates an opportunity against the user's specific Research Brief context.
   * Separates universal discovery factors from contextual feasibility and strategic fit.
   */
  public evaluate(opportunity: ProductOpportunity, brief: ResearchBrief): OpportunityEvaluation {
    const { opportunityProfile, constraints, target } = brief;
    const { buildHorizon, teamSize, technicalCapability, budget, existingAdvantages, distributionAccess } = opportunityProfile;
    const { priorities = [], exclusions = [], riskProfile = 'balanced' } = constraints;

    // ------------------------------------------------------------------------
    // 1. Feasibility Fit
    // ------------------------------------------------------------------------
    let feasibilityScore = 75;
    const feasibilityNotes: string[] = [];

    // Horizon match
    let horizonMatch = true;
    if (buildHorizon === '7d') {
      if (opportunity.technicalComplexity === 'High') {
        feasibilityScore -= 35;
        horizonMatch = false;
        feasibilityNotes.push('High technical complexity exceeds 7-day build horizon');
      } else if (opportunity.technicalComplexity === 'Medium') {
        feasibilityScore -= 15;
        feasibilityNotes.push('Medium complexity requires strict MVP scope pruning for 7-day delivery');
      } else {
        feasibilityScore += 10;
        feasibilityNotes.push('Low technical complexity aligns with 7-day rapid execution');
      }
    } else if (buildHorizon === '2-3w') {
      if (opportunity.technicalComplexity === 'High') {
        feasibilityScore -= 20;
        horizonMatch = false;
        feasibilityNotes.push('High complexity poses delivery risk for a 2-3 week sprint');
      } else {
        feasibilityScore += 10;
        feasibilityNotes.push('Feasible within a focused 2-3 week production sprint');
      }
    } else if (buildHorizon === '1m') {
      feasibilityScore += 10;
      feasibilityNotes.push('Comfortable build horizon for dedicated 30-day MVP');
    } else if (buildHorizon === '3m' || buildHorizon === '6m' || buildHorizon === '12m') {
      feasibilityScore += 15;
      feasibilityNotes.push(`Sufficient runway (${buildHorizon}) for deep integrations and team workflows`);
    }

    // Team & Technical Capability match
    let teamMatch = true;
    if (teamSize === 'Solo') {
      if (opportunity.keyDependencies.length > 3) {
        feasibilityScore -= 10;
        teamMatch = false;
        feasibilityNotes.push('Multiple third-party dependencies increase maintenance load for a solo builder');
      }
      if (technicalCapability === 'Non-technical') {
        if (opportunity.technicalComplexity !== 'Low') {
          feasibilityScore -= 30;
          teamMatch = false;
          feasibilityNotes.push('Requires coding expertise beyond non-technical profile; recommend no-code or agency collaboration');
        }
      }
    } else {
      feasibilityScore += 10;
      feasibilityNotes.push(`Team capacity (${teamSize}) provides resilience for multi-component delivery`);
    }

    // Budget match
    let budgetMatch = true;
    if (budget === 'Minimal' || budget === 'Low') {
      if (opportunity.majorRisks.some(r => /infrastructure|cost|expensive|compute/i.test(r))) {
        feasibilityScore -= 15;
        budgetMatch = false;
        feasibilityNotes.push('Elevated infrastructure or third-party API costs conflict with low-budget profile');
      } else {
        feasibilityNotes.push('Low capital intensity matches available budget');
      }
    } else {
      feasibilityScore += 5;
    }

    feasibilityScore = Math.max(10, Math.min(98, feasibilityScore));

    // ------------------------------------------------------------------------
    // 2. Strategic Fit
    // ------------------------------------------------------------------------
    let strategicScore = 70;
    const advantagesLeveraged: string[] = [];
    const strategicNotes: string[] = [];

    if (existingAdvantages && existingAdvantages.length > 0) {
      for (const adv of existingAdvantages) {
        if (adv === 'None') continue;
        if (/audience|community/i.test(adv) && (distributionAccess === 'Audience' || distributionAccess === 'Community')) {
          strategicScore += 12;
          advantagesLeveraged.push(adv);
          strategicNotes.push('Direct audience distribution accelerates initial user acquisition');
        } else if (/customers/i.test(adv)) {
          strategicScore += 15;
          advantagesLeveraged.push(adv);
          strategicNotes.push('Existing customer base provides immediate discovery interviews and pilot testers');
        } else if (/domain expertise/i.test(adv)) {
          strategicScore += 10;
          advantagesLeveraged.push(adv);
          strategicNotes.push('Domain expertise shortens workflow research and product definition');
        } else if (/codebase|data/i.test(adv)) {
          strategicScore += 8;
          advantagesLeveraged.push(adv);
          strategicNotes.push('Reusable assets lower engineering barrier');
        }
      }
    }

    if (distributionAccess === 'None') {
      strategicScore -= 10;
      strategicNotes.push('Lack of established distribution channels requires cold outbound or content discovery');
    }

    strategicScore = Math.max(15, Math.min(99, strategicScore));

    // ------------------------------------------------------------------------
    // 3. Commercial Viability
    // ------------------------------------------------------------------------
    let commercialScore = 72;
    let salesCycle: 'Short' | 'Medium' | 'Long' = 'Short';
    let estimatedPricePoint = '$29–$79 / month (B2B micro-tier)';
    const commercialNotes: string[] = [];

    const targetCo = target?.targetCompany || 'SMB';
    if (targetCo === 'Enterprise' || targetCo === 'Mid-market') {
      salesCycle = 'Long';
      estimatedPricePoint = '$500–$2,500+ / month (Enterprise agreement)';
      commercialScore += 8;
      commercialNotes.push('High willingness to pay; requires formal procurement, security reviews, and longer sales cycle');
    } else if (targetCo === 'Agency') {
      salesCycle = 'Short';
      estimatedPricePoint = '$99–$299 / month (Client-seat model)';
      commercialScore += 12;
      commercialNotes.push('Agencies act as high-velocity buyers if tool saves billable operator hours');
    } else if (targetCo === 'Freelancer' || targetCo === 'Individual') {
      salesCycle = 'Short';
      estimatedPricePoint = '$15–$39 / month (Self-serve)';
      commercialNotes.push('Price sensitive with higher churn risk; depends on rapid self-serve activation');
    } else {
      salesCycle = 'Medium';
      estimatedPricePoint = '$49–$149 / month (SMB standard)';
      commercialNotes.push('Standard B2B SaaS pricing model with self-serve or demo-assisted onboarding');
    }

    commercialScore = Math.max(20, Math.min(95, commercialScore));

    // ------------------------------------------------------------------------
    // 4. Priority Alignment
    // ------------------------------------------------------------------------
    const matchedPriorities: string[] = [];
    const missedPriorities: string[] = [];

    const oppFullText = [
      opportunity.name,
      opportunity.oneLineDescription,
      opportunity.userProblem,
      opportunity.proposedSolution,
      opportunity.coreWorkflow,
      opportunity.existingAlternatives,
      ...opportunity.mvpScope,
    ].join(' ').toLowerCase();

    for (const p of priorities) {
      let isMatched = false;
      if (p === 'High pain' && opportunity.evidenceConfidence >= 75) isMatched = true;
      if (p === 'Manual workflow' && /manual|spreadsheet|copy|paste|csv|repetitive/i.test(oppFullText)) isMatched = true;
      if (p === 'Technical simplicity' && opportunity.technicalComplexity === 'Low') isMatched = true;
      if (p === 'Fast validation' && (buildHorizon === '7d' || buildHorizon === '2-3w')) isMatched = true;
      if (p === 'Existing workaround' && opportunity.existingAlternatives && opportunity.existingAlternatives.length > 10) isMatched = true;
      if (p === 'Commercial intent' && opportunity.monetizationPossibilities.length > 0) isMatched = true;
      if (p === 'Low infrastructure cost' && !/gpu|cluster|petabyte|heavy/i.test(oppFullText)) isMatched = true;
      if (p === 'High time savings' && /hour|time|automate|instantly|delay/i.test(oppFullText)) isMatched = true;
      if (p === 'Integration simplicity' && opportunity.keyDependencies.length <= 2) isMatched = true;
      if (p === 'Short sales cycle' && salesCycle === 'Short') isMatched = true;
      if (p === 'Easy distribution' && opportunity.distributionDifficulty === 'Low') isMatched = true;

      if (isMatched) {
        matchedPriorities.push(p);
      } else {
        missedPriorities.push(p);
      }
    }

    const priorityScore = priorities.length > 0
      ? Math.round((matchedPriorities.length / priorities.length) * 100)
      : 80;

    // ------------------------------------------------------------------------
    // 5. Exclusion Compliance
    // ------------------------------------------------------------------------
    const flaggedExclusions: string[] = [];
    for (const exc of exclusions) {
      if (!exc) continue;
      const excLower = exc.toLowerCase();
      if (excLower.includes('hardware') && /hardware|device|iot|sensor|physical/i.test(oppFullText)) {
        flaggedExclusions.push(exc);
      }
      if (excLower.includes('medical') && /medical|patient|health|hipaa|clinical/i.test(oppFullText)) {
        flaggedExclusions.push(exc);
      }
      if (excLower.includes('payment-card') && /pci|credit card|cvv|cardholder/i.test(oppFullText)) {
        flaggedExclusions.push(exc);
      }
      if (excLower.includes('regulated') && /compliance|regulatory|fcc|sec|audit/i.test(oppFullText)) {
        flaggedExclusions.push(exc);
      }
      if (excLower.includes('mobile-first') && /ios app|android app|react native|mobile-first/i.test(oppFullText)) {
        flaggedExclusions.push(exc);
      }
      if (excLower.includes('marketplace') && /two-sided|marketplace|buyer and seller/i.test(oppFullText)) {
        flaggedExclusions.push(exc);
      }
    }

    const isCompliant = flaggedExclusions.length === 0;

    // ------------------------------------------------------------------------
    // 6. Critical Uncertainties
    // ------------------------------------------------------------------------
    const criticalUncertainties: string[] = [];
    if (!horizonMatch) {
      criticalUncertainties.push(`Can the scope be narrowed sufficiently to fit the requested ${buildHorizon} build horizon?`);
    }
    if (distributionAccess === 'None') {
      criticalUncertainties.push('Which low-friction outbound or community channel will yield the first 10 organic discovery conversations?');
    }
    if (opportunity.existingAlternatives.includes('Spreadsheets') || opportunity.existingAlternatives.includes('Manual')) {
      criticalUncertainties.push('Is the pain severe enough for operators to abandon their familiar manual workaround for paid software?');
    } else {
      criticalUncertainties.push('What specific capability or pricing flaw causes current users to churn from incumbent solutions?');
    }
    if (opportunity.keyDependencies.length > 2) {
      criticalUncertainties.push(`Are third-party API dependencies (${opportunity.keyDependencies.slice(0, 2).join(', ')}) stable and commercially viable?`);
    }

    // ------------------------------------------------------------------------
    // 7. Composite Contextual Fit Score & Recommended Action
    // ------------------------------------------------------------------------
    let contextualFitScore = Math.round(
      feasibilityScore * 0.35 +
      strategicScore * 0.25 +
      commercialScore * 0.20 +
      priorityScore * 0.20
    );

    // Apply risk profile adjustment
    if (riskProfile === 'conservative') {
      if (opportunity.technicalComplexity === 'High' || !horizonMatch) {
        contextualFitScore -= 15;
      }
    } else if (riskProfile === 'aggressive') {
      if (strategicScore > 85) {
        contextualFitScore += 8;
      }
    }

    // If an exclusion was violated, heavily penalize
    if (!isCompliant) {
      contextualFitScore = Math.min(30, contextualFitScore - 40);
    }

    contextualFitScore = Math.max(10, Math.min(99, contextualFitScore));

    let recommendedAction: 'Execute Immediately' | 'Validate First' | 'Deprioritize' | 'Avoid';
    if (!isCompliant) {
      recommendedAction = 'Avoid';
    } else if (contextualFitScore >= 82 && horizonMatch) {
      recommendedAction = 'Execute Immediately';
    } else if (contextualFitScore >= 62) {
      recommendedAction = 'Validate First';
    } else {
      recommendedAction = 'Deprioritize';
    }

    return {
      contextualFitScore,
      feasibilityFit: {
        score: feasibilityScore,
        rationale: feasibilityNotes.join('. '),
        horizonMatch,
        teamMatch,
        budgetMatch,
      },
      strategicFit: {
        score: strategicScore,
        rationale: strategicNotes.join('. ') || 'Standard market opportunity without dedicated preexisting distribution.',
        advantagesLeveraged,
      },
      commercialViability: {
        score: commercialScore,
        rationale: commercialNotes.join('. '),
        estimatedPricePoint,
        salesCycle,
      },
      priorityAlignment: {
        score: priorityScore,
        matchedPriorities,
        missedPriorities,
      },
      exclusionCompliance: {
        compliant: isCompliant,
        flaggedExclusions,
      },
      criticalUncertainties: criticalUncertainties.slice(0, 3),
      recommendedAction,
    };
  }
}
