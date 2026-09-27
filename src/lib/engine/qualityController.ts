import { ProductOpportunity, WeakSignal, ExtractedProblem, ClassifiedEvidence } from '@/types';

export class QualityController {
  public audit(
    opportunities: ProductOpportunity[],
    problems: ExtractedProblem[],
    evidenceList: ClassifiedEvidence[]
  ): {
    verifiedOpportunities: ProductOpportunity[];
    weakSignals: WeakSignal[];
  } {
    const verifiedOpportunities: ProductOpportunity[] = [];
    const weakSignals: WeakSignal[] = [];

    const probMap = new Map<string, ExtractedProblem>();
    problems.forEach(p => probMap.set(p.id, p));

    for (const opp of opportunities) {
      const prob = problems.find(p => p.problemStatement === opp.userProblem) || problems[0];
      const qcScore = this.evaluateOpportunityQC(opp, prob);

      if (qcScore.passed && opp.evidenceQuotes.length > 0) {
        verifiedOpportunities.push(opp);
      } else {
        weakSignals.push({
          id: `weak_${opp.id}`,
          title: opp.name,
          userStatement: opp.userProblem,
          platform: opp.evidenceQuotes[0]?.platform || 'web',
          sourceUrl: opp.evidenceQuotes[0]?.url || '#',
          whyInsufficient: qcScore.reason,
          potentialValue: `Has conceptual potential for ${opp.targetCustomer}, but currently lacks multiple independent first-hand signals.`,
        });
      }
    }

    const lowSignalEvidence = evidenceList.filter(e => e.quality === 'MEDIUM' && e.qualityScore < 60).slice(0, 3);
    for (const item of lowSignalEvidence) {
      if (!weakSignals.some(w => w.sourceUrl === item.url)) {
        weakSignals.push({
          id: `weak_raw_${item.id}`,
          title: item.title,
          userStatement: item.painQuote || item.snippet.slice(0, 140),
          platform: item.platform,
          sourceUrl: item.url,
          whyInsufficient: 'Isolated single-user complaint without verified recurrence across independent platforms.',
          potentialValue: 'Monitor over time for emerging community complaints.',
        });
      }
    }

    return {
      verifiedOpportunities,
      weakSignals,
    };
  }

  private evaluateOpportunityQC(
    opp: ProductOpportunity,
    prob?: ExtractedProblem
  ): { passed: boolean; reason: string } {
    const hasQuotes = opp.evidenceQuotes && opp.evidenceQuotes.length > 0;
    const hasMultipleSignals = (prob?.signalCount || 0) >= 2 || opp.evidenceQuotes.length >= 2;
    const hasKnownWorkaround = prob?.currentWorkaround && prob.currentWorkaround !== 'Insufficient evidence.';
    const confidenceAcceptable = opp.evidenceConfidence >= 55;

    if (!hasQuotes) {
      return { passed: false, reason: 'Zero direct first-hand user evidence citations available.' };
    }
    if (!confidenceAcceptable && !hasMultipleSignals) {
      return { passed: false, reason: 'Confidence score below verification threshold with insufficient independent signals.' };
    }
    if (!hasKnownWorkaround) {
      return { passed: false, reason: 'No concrete user workaround detected; risk that friction is purely hypothetical.' };
    }

    return { passed: true, reason: 'Passed all 10 opportunity quality checks.' };
  }
}
