import { ExistingSolution, MarketGap, ProblemCluster, ExtractedProblem, ClassifiedEvidence, CommercialSignal } from '@/types';

export class SolutionGapAnalyzer {
  public analyze(
    clusters: ProblemCluster[],
    problems: ExtractedProblem[],
    evidenceList: ClassifiedEvidence[]
  ): {
    solutions: ExistingSolution[];
    gaps: MarketGap[];
    commercialSignals: CommercialSignal[];
  } {
    const solutions: ExistingSolution[] = [];
    const gaps: MarketGap[] = [];
    const commercialSignals: CommercialSignal[] = [];

    const probMap = new Map<string, ExtractedProblem>();
    problems.forEach(p => probMap.set(p.id, p));

    const evidenceMap = new Map<string, ClassifiedEvidence>();
    evidenceList.forEach(e => evidenceMap.set(e.id, e));

    for (const cluster of clusters) {
      const clusterProbs = cluster.problemIds
        .map(id => probMap.get(id))
        .filter((p): p is ExtractedProblem => !!p);

      const clusterEvidenceIds = Array.from(new Set(clusterProbs.flatMap(p => p.evidenceIds)));
      const clusterEvidence = clusterEvidenceIds
        .map(id => evidenceMap.get(id))
        .filter((e): e is ClassifiedEvidence => !!e);

      // 1. Identify solutions grounded in actual evidence (NO HARDCODED HUBSPOT / ZAPIER)
      const clusterSolutions = this.identifySolutions(cluster, clusterProbs, clusterEvidence);
      solutions.push(...clusterSolutions);

      // 2. Detect gaps based on real solutions & evidence
      const clusterGaps = this.detectGapsForCluster(cluster, clusterProbs, clusterSolutions, clusterEvidence);
      gaps.push(...clusterGaps);

      // 3. Extract commercial signals grounded in matching evidence items only
      const signals = this.extractCommercialSignals(cluster.clusterName, clusterEvidence);
      commercialSignals.push(...signals);
    }

    const uniqueSolutions: ExistingSolution[] = [];
    const seenNames = new Set<string>();
    for (const sol of solutions) {
      if (!seenNames.has(sol.name)) {
        seenNames.add(sol.name);
        uniqueSolutions.push(sol);
      }
    }

    return {
      solutions: uniqueSolutions,
      gaps,
      commercialSignals
    };
  }

  private identifySolutions(
    cluster: ProblemCluster,
    probs: ExtractedProblem[],
    evidenceList: ClassifiedEvidence[]
  ): ExistingSolution[] {
    const solutions: ExistingSolution[] = [];
    const seenSolutionNames = new Set<string>();

    // 1. Grounded Workaround Solutions: extract from problems that observed real workarounds
    for (const p of probs) {
      if (p.workaroundType && p.workaroundType !== 'none' && p.currentWorkaround && p.currentWorkaround !== 'Unknown/Manual') {
        const workaroundName = p.currentWorkaround;
        if (!seenSolutionNames.has(workaroundName.toLowerCase())) {
          seenSolutionNames.add(workaroundName.toLowerCase());
          solutions.push({
            id: `sol_workaround_${cluster.id}_${p.id}`,
            name: workaroundName,
            type: 'manual_workaround',
            targetUser: p.targetUser,
            whatUsersDo: `Operators manually use ${workaroundName} to address ${p.problemStatement.slice(0, 80)}.`,
            positiveAspects: ['Immediate low-cost stopgap without new software procurement'],
            complaints: [p.whyPainful || 'Requires repetitive manual intervention'],
            missingFunctionality: ['Automated synchronization and self-healing error handling'],
            integrationLimitations: ['Limited to manual spreadsheet export/import boundaries.'],
            complexityFriction: 'Context-switching and fragile manual data entry.',
            unservedSegments: p.targetUser,
            switchingCosts: 'Low (Ad-hoc operational habits)',
            evidenceIds: p.evidenceIds.filter(id => evidenceList.some(e => e.id === id)),
            investigationStatus: 'RESEARCHED'
          });
        }
      }
    }

    // 2. Scan evidence for explicitly named tools/software
    const toolRegex = /\b(?:using|tried|tested|switched from|alternative to|look at|recommend)\s+([A-Z][a-zA-Z0-9_\-\.]+)\b/g;
    const invalidToolWords = new Set(['Google', 'Reddit', 'Hacker', 'GitHub', 'Dev', 'This', 'That', 'The', 'My', 'Our', 'Some', 'Any', 'What', 'How', 'Why']);

    for (const ev of evidenceList) {
      const text = `${ev.title} ${ev.snippet}`;
      let match: RegExpExecArray | null;
      while ((match = toolRegex.exec(text)) !== null) {
        const candidateTool = match[1].trim();
        if (candidateTool.length > 2 && !invalidToolWords.has(candidateTool) && !seenSolutionNames.has(candidateTool.toLowerCase())) {
          seenSolutionNames.add(candidateTool.toLowerCase());
          solutions.push({
            id: `sol_tool_${cluster.id}_${candidateTool.toLowerCase()}`,
            name: candidateTool,
            type: 'competitor',
            targetUser: probs[0]?.targetUser || 'Operators',
            whatUsersDo: `Referenced by practitioners in discussion: "${match[0]}"`,
            positiveAspects: ['Existing market recognition in this domain'],
            complaints: ['Users in evidence discussions seek alternatives or express friction with current setup'],
            missingFunctionality: ['Full automated alignment with practitioner workflow'],
            integrationLimitations: ['Integration limits and API rate restrictions cited in discussions.'],
            complexityFriction: 'Tool configuration or integration boundaries.',
            unservedSegments: probs[0]?.targetUser || 'Specialized operators',
            switchingCosts: 'High (Data migration, team retraining, and vendor lock-in)',
            evidenceIds: [ev.id],
            investigationStatus: 'RESEARCHED'
          });
        }
      }
    }

    // 3. If NO commercial software or workarounds found in source evidence:
    // STRICT P0 INVARIANT: Never insert fake HubSpot or Zapier!
    if (solutions.length === 0) {
      solutions.push({
        id: `sol_none_${cluster.id}`,
        name: 'No commercial solutions identified in source evidence',
        type: 'software_product',
        whatUsersDo: 'No commercial market leader or dedicated software was explicitly referenced in the investigated practitioner signals.',
        positiveAspects: [],
        complaints: [],
        missingFunctionality: [],
        integrationLimitations: [],
        complexityFriction: 'Unknown: Market lacks cited dedicated tooling in retrieved discussions.',
        unservedSegments: probs[0]?.targetUser || 'Operators in this workflow',
        evidenceIds: [],
        investigationStatus: 'NO_RELEVANT_SOLUTION_FOUND'
      });
    }

    return solutions;
  }

  private detectGapsForCluster(
    cluster: ProblemCluster,
    probs: ExtractedProblem[],
    solutions: ExistingSolution[],
    evidenceList: ClassifiedEvidence[]
  ): MarketGap[] {
    const gaps: MarketGap[] = [];
    const allEvidenceIds = probs.flatMap(p => p.evidenceIds).filter(id => evidenceList.some(e => e.id === id));
    const quotes = probs.flatMap(p => p.evidenceQuotes.map(q => q.quote)).slice(0, 3);

    const hasRealCompetitor = solutions.some(s => s.type === 'competitor' && s.investigationStatus === 'RESEARCHED');
    const hasWorkaround = solutions.some(s => s.type === 'manual_workaround');

    if (hasRealCompetitor) {
      const competitor = solutions.find(s => s.type === 'competitor')!;
      gaps.push({
        id: `gap_${cluster.id}_1`,
        gapType: 'excessive_complexity',
        title: `Existing tool (${competitor.name}) leaves practitioner workflow gaps`,
        description: `Discussions referencing ${competitor.name} highlight friction in full workflow automation, prompting users to seek dedicated alternatives.`,
        supportingEvidenceIds: competitor.evidenceIds || allEvidenceIds.slice(0, 2),
        supportingQuotes: quotes,
        isAiInference: true,
      });
    } else if (hasWorkaround) {
      gaps.push({
        id: `gap_${cluster.id}_1`,
        gapType: 'too_many_manual_steps',
        title: 'Manual workaround reliance without dedicated automation',
        description: `Operators are reliant on ad-hoc manual steps (${solutions[0].name}) because no dedicated automated product has captured this specific workflow.`,
        supportingEvidenceIds: allEvidenceIds.slice(0, 2),
        supportingQuotes: quotes,
        isAiInference: false,
      });
    } else {
      gaps.push({
        id: `gap_${cluster.id}_1`,
        gapType: 'lack_of_automation',
        title: 'Unserved workflow with no prominent tooling identified',
        description: 'Retrieved practitioner signals report friction with no established commercial software identified in source discussions.',
        supportingEvidenceIds: allEvidenceIds.slice(0, 2),
        supportingQuotes: quotes,
        isAiInference: true,
      });
    }

    return gaps;
  }

  private extractCommercialSignals(
    clusterName: string,
    evidenceList: ClassifiedEvidence[]
  ): CommercialSignal[] {
    const signals: CommercialSignal[] = [];
    
    // Find evidence items with authentic payment / spending markers
    const paidEvs: ClassifiedEvidence[] = [];
    const timeLossEvs: ClassifiedEvidence[] = [];
    const sentimentEvs: ClassifiedEvidence[] = [];

    for (const ev of evidenceList) {
      const text = `${ev.title} ${ev.snippet}`.toLowerCase();
      if (/\b(paid|paying|dollars|expensive|budget|contractor|hired|thousands|monthly fee|subscription cost)\b/i.test(text)) {
        paidEvs.push(ev);
      }
      if (/\b(takes hours|wasted days?|weekend|slows us down|lost time|lost money)\b/i.test(text)) {
        timeLossEvs.push(ev);
      }
      if (/\b(wish there was|someone should build|would love a tool|need a tool)\b/i.test(text)) {
        sentimentEvs.push(ev);
      }
    }

    if (paidEvs.length > 0) {
      signals.push({
        id: `sig_${Date.now()}_1`,
        description: 'Practitioners cite direct monetary spending on workarounds, contractors, or premium tiers.',
        strength: 'STRONG',
        type: 'PAID_WORKAROUND',
        evidenceIds: paidEvs.map(e => e.id)
      });
    }

    if (timeLossEvs.length > 0) {
      signals.push({
        id: `sig_${Date.now()}_2`,
        description: 'Practitioners report quantifiable operational time drag and productivity loss.',
        strength: 'STRONG',
        type: 'TIME_LOSS',
        evidenceIds: timeLossEvs.map(e => e.id)
      });
    }

    if (sentimentEvs.length > 0 && paidEvs.length === 0) {
      signals.push({
        id: `sig_${Date.now()}_3`,
        description: 'Users express feature requests or desires without verified willingness-to-pay signals.',
        strength: 'WEAK',
        type: 'GENERIC_SENTIMENT',
        evidenceIds: sentimentEvs.map(e => e.id)
      });
    }

    return signals;
  }
}
