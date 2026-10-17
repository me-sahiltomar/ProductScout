import { 
  ExtractedProblem, 
  MarketGap, 
  ProblemCluster, 
  ProductOpportunity, 
  ResearchBrief, 
  ResearchRunConfig,
  ExistingSolution,
  CommercialSignal,
  VerifiedClaim
} from '@/types';

export function normalizeBrief(config: ResearchRunConfig): ResearchBrief {
  if (config.brief) return config.brief;
  return {
    objective: 'find_product_opportunities',
    subject: config.topic,
    intent: config.focus || `Investigate operational complaints in "${config.topic}".`,
    target: { primaryUser: config.targetUser || 'B2B Operators' },
    opportunityProfile: { 
      productTypes: ['SaaS'],
      buildHorizon: '1m',
      teamSize: 'Solo',
      technicalCapability: 'Full-stack developer',
      budget: 'Low',
      existingAdvantages: [],
      distributionAccess: 'Community'
    },
    researchConfiguration: { evidenceWindow: '30d', depth: 'standard', sources: ['web'], maxSources: 30 },
    constraints: { priorities: ['High pain'], exclusions: [], riskProfile: 'balanced' },
  };
}

export class OpportunityGenerator {
  public lastRejectedCandidates: Array<{
    id: string;
    title: string;
    problem: string;
    rejectionReason: string;
    evidenceCount: number;
    evidenceIds: string[];
  }> = [];

  public generateOpportunities(
    clusters: ProblemCluster[],
    problems: ExtractedProblem[],
    gaps: MarketGap[],
    solutions: ExistingSolution[],
    commercialSignals: CommercialSignal[],
    verifiedClaims: VerifiedClaim[],
    config: ResearchRunConfig
  ): ProductOpportunity[] {
    const brief = normalizeBrief(config);
    const opportunities: ProductOpportunity[] = [];
    this.lastRejectedCandidates = [];

    const probMap = new Map<string, ExtractedProblem>();
    problems.forEach(p => probMap.set(p.id, p));

    for (const cluster of clusters) {
      const clusterProbs = cluster.problemIds.map(id => probMap.get(id)).filter((p): p is ExtractedProblem => !!p);
      if (clusterProbs.length === 0) continue;

      const primaryProblem = clusterProbs[0];
      const relevantGap = gaps.find(g => g.id.includes(cluster.id)) || gaps[0];
      const relevantSignals = commercialSignals.filter(s => primaryProblem.evidenceIds.some(eid => s.evidenceIds.includes(eid)));
      
      const candidateTitle = `Automated ${cluster.clusterName}`;
      
      // 1. EVIDENCE GATES: Validate core pain, exclusions & non-announcement authenticity
      const gateResult = this.evaluateEvidenceGate(primaryProblem, relevantSignals, cluster, brief);
      if (!gateResult.passed) {
        this.lastRejectedCandidates.push({
          id: `rej_${cluster.id}`,
          title: candidateTitle,
          problem: primaryProblem.problemStatement,
          rejectionReason: gateResult.reason,
          evidenceCount: primaryProblem.evidenceIds.length,
          evidenceIds: primaryProblem.evidenceIds
        });
        continue;
      }

      const opp = this.buildOpportunityForCluster(cluster, primaryProblem, relevantGap, solutions, relevantSignals, verifiedClaims, brief);

      // 2. OPPORTUNITY COMPRESSION: Consolidate overlapping / near-duplicate candidates
      const overlappingOpp = this.findOverlappingOpportunity(opp, opportunities);
      if (overlappingOpp) {
        // Merge evidence and signals into existing opportunity to enrich it
        const oppEvidence = opp.supporting_evidence || [];
        const existingEvidence = overlappingOpp.supporting_evidence || [];
        const newEvidenceIds = oppEvidence.filter(id => !existingEvidence.includes(id));
        overlappingOpp.supporting_evidence = [...existingEvidence, ...newEvidenceIds];
        
        if (opp.commercial_signals) {
          overlappingOpp.commercial_signals = overlappingOpp.commercial_signals || [];
          opp.commercial_signals.forEach(sig => {
            if (!overlappingOpp.commercial_signals!.some(s => s.description === sig.description)) {
              overlappingOpp.commercial_signals!.push(sig);
            }
          });
        }

        this.lastRejectedCandidates.push({
          id: opp.id,
          title: opp.title || opp.name || 'Untitled Opportunity',
          problem: opp.problem || opp.userProblem || 'Operational friction',
          rejectionReason: `CONSOLIDATED_VARIANT: Merged into existing opportunity "${overlappingOpp.title || overlappingOpp.name}" addressing the same core workflow.`,
          evidenceCount: oppEvidence.length,
          evidenceIds: oppEvidence
        });
        continue;
      }

      opportunities.push(opp);
    }

    return opportunities;
  }

  private evaluateEvidenceGate(
    problem: ExtractedProblem,
    signals: CommercialSignal[],
    cluster: ProblemCluster,
    brief?: ResearchBrief
  ): { passed: boolean; reason: string } {
    // 1. Problem evidence exists
    if (!problem.evidenceIds || problem.evidenceIds.length === 0) {
      return { passed: false, reason: 'ZERO_EVIDENCE: No authentic user evidence citations found.' };
    }

    // 2. Exclusions enforcement
    if (brief?.constraints?.exclusions && brief.constraints.exclusions.length > 0) {
      const fullText = `${problem.problemStatement} ${cluster.clusterName} ${problem.jobWorkflow}`.toLowerCase();
      for (const excl of brief.constraints.exclusions) {
        const cleanExcl = excl.toLowerCase().trim();
        if (cleanExcl.length > 1 && fullText.includes(cleanExcl)) {
          return { passed: false, reason: `EXCLUSION_VIOLATION: Matches user-excluded category "${excl}".` };
        }
      }
    }

    // 3. Filter non-pain announcement/marketing text
    const text = `${problem.problemStatement} ${cluster.clusterName}`.toLowerCase();
    const isAnnouncement = /hacktoberfest.*challenge|challenges.*prompt|submit your.*here|weekly.*theme/i.test(text);
    if (isAnnouncement && problem.signalCount < 3 && signals.length === 0) {
      return { passed: false, reason: 'NON_PAIN_SIGNAL: Signal describes a community challenge/announcement rather than verified operational drag.' };
    }

    // 4. Reject if overall evidence state is unverified and weak
    const hasStrongSignal = signals.some(s => s.strength === 'STRONG');
    const hasWorkaround = problem.workaroundType !== 'none';
    
    if (!hasWorkaround && !hasStrongSignal && problem.evidenceQuality === 'LOW' && problem.signalCount < 2) {
      return { passed: false, reason: 'INSUFFICIENT_EVIDENCE: Isolated signal lacking workaround behavior or commercial validation.' };
    }

    return { passed: true, reason: 'Passed' };
  }

  private findOverlappingOpportunity(
    candidate: ProductOpportunity,
    existingList: ProductOpportunity[]
  ): ProductOpportunity | null {
    const candidateTokens = this.tokenize(`${candidate.title} ${candidate.workflow} ${candidate.problem}`);

    for (const existing of existingList) {
      const existingTokens = this.tokenize(`${existing.title} ${existing.workflow} ${existing.problem}`);

      const intersection = candidateTokens.filter(t => existingTokens.includes(t));
      const union = new Set([...candidateTokens, ...existingTokens]).size;
      const jaccard = union > 0 ? intersection.length / union : 0;

      // Check if they target the same user + share significant workflow tokens
      const candidateUser = (candidate.target_user || candidate.targetCustomer || '').toLowerCase();
      const existingUser = (existing.target_user || existing.targetCustomer || '').toLowerCase();
      const sameTarget = candidateUser.length > 0 && candidateUser === existingUser;
      const sharedCoreAnchor = candidateTokens.length > 0 && existingTokens.length > 0 && candidateTokens[0] === existingTokens[0];

      if (jaccard >= 0.35 || (sameTarget && sharedCoreAnchor) || (sameTarget && intersection.length >= 3)) {
        return existing;
      }
    }

    return null;
  }

  private tokenize(text: string): string[] {
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'to', 'in', 'of', 'for', 'with',
      'it', 'this', 'that', 'as', 'are', 'be', 'by', 'was', 'or', 'from', 'but', 'not',
      'automated', 'operations', 'workflow', 'system', 'tool', 'service', 'platform'
    ]);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !stopwords.has(w));
  }

  private buildOpportunityForCluster(
    cluster: ProblemCluster,
    problem: ExtractedProblem,
    gap: MarketGap | undefined,
    solutions: ExistingSolution[],
    signals: CommercialSignal[],
    verifiedClaims: VerifiedClaim[],
    brief: ResearchBrief
  ): ProductOpportunity {
    const oppId = `opp_${cluster.id}_${Math.random().toString(36).substring(2, 7)}`;
    
    const strongSignals = signals.filter(s => s.strength === 'STRONG').map(s => s.description);
    const hasWorkaround = problem.workaroundType !== 'none';
    
    let uncertainty = 'Low';
    if (!hasWorkaround && strongSignals.length === 0) {
      uncertainty = 'High (No workaround or paid signal proven)';
    } else if (!hasWorkaround) {
      uncertainty = 'Medium (Commercial signal exists, but no clear workaround)';
    } else if (strongSignals.length === 0) {
      uncertainty = 'Medium (Workaround exists, but willingness to pay is unproven)';
    }

    const contradictingEvidence = verifiedClaims.flatMap(c => c.contradictingEvidenceIds || []);
    if (contradictingEvidence.length > 0) {
      uncertainty = `Contested (Contradictory evidence exists). ${uncertainty}`;
    }

    const unsupportedClaims = verifiedClaims.filter(c => c.status === 'UNSUPPORTED');
    const hypotheses = [
      `If we build a landing page targeting ${problem.targetUser} for this, they will join a waitlist.`,
      `If we manually execute this workflow for them, they will pay a monthly fee.`
    ];
    // Map unsupported claims into hypotheses
    unsupportedClaims.forEach(c => hypotheses.push(`Hypothesis: ${c.claimText}`));

    const researchedSolutions = solutions.filter(s => s.investigationStatus === 'RESEARCHED');
    const solutionNames = researchedSolutions.length > 0 
      ? researchedSolutions.map(s => s.name)
      : ['None identified in source evidence'];

    return {
      id: oppId,
      title: `Automated ${cluster.clusterName}`,
      target_user: problem.targetUser,
      target_buyer: problem.problemOwner || problem.targetUser,
      problem: problem.problemStatement,
      workflow: problem.jobWorkflow,
      trigger: problem.workflowTrigger || 'Unknown Trigger',
      current_workaround: problem.currentWorkaround,
      existing_solutions: solutionNames,
      solutionInvestigationStatus: researchedSolutions.length > 0 ? 'RESEARCHED' : 'NO_RELEVANT_SOLUTION_FOUND',
      solution_gap: gap ? gap.description : 'Missing focused automation workflow.',
      commercial_signals: signals,
      supporting_evidence: problem.evidenceIds,
      counter_evidence: contradictingEvidence,
      counterEvidenceIds: contradictingEvidence,
      counterEvidenceStatus: 'COUNTER_EVIDENCE_NOT_PERFORMED',
      constraints_fit: `Fits ${brief.opportunityProfile?.teamSize || 'solo'} build horizon (${brief.opportunityProfile?.buildHorizon || 'standard'}).`,
      assumptions: [
        `Target users (${problem.targetUser}) are open to adopting software over ${problem.currentWorkaround || 'current practices'}.`,
        strongSignals.length > 0 ? 'Observed spending signals indicate viable willingness to pay.' : 'Commercial willingness to pay requires formal verification.'
      ],
      uncertainty,
      potential_solution: `A dedicated tool replacing the ${problem.workaroundType} workaround with a one-click automated integration.`,
      validation_hypotheses: hypotheses,
      verified_claims: verifiedClaims,
      recommended_next_action: strongSignals.length > 0 ? 'Proceed to validation' : 'Conduct deeper commercial investigation',
      
      // Legacy fields
      name: `Automated ${cluster.clusterName}`,
      oneLineDescription: `Fixing ${problem.problemStatement} for ${problem.targetUser}`,
      targetCustomer: problem.targetUser,
      userProblem: problem.problemStatement,
      evidenceSummary: `Based on ${problem.signalCount} direct user complaints.`,
      evidenceQuotes: problem.evidenceQuotes.length > 0
        ? problem.evidenceQuotes.map(q => ({ quote: q.quote, url: q.sourceUrl, platform: q.platform, author: q.author }))
        : problem.evidenceIds.map(id => ({
            quote: problem.painPoint || problem.problemStatement,
            url: 'evidence://' + id,
            platform: 'web' as const
          })),
      existingAlternatives: problem.currentWorkaround,
      gap: gap ? gap.description : '',
      proposedSolution: 'A dedicated automation tool.',
      coreWorkflow: problem.jobWorkflow,
      whyUseful: problem.whyPainful,
      mvpScope: ['Core automation logic'],
      whatNotToBuildInitially: ['Enterprise SSO'],
      technicalComplexity: 'Medium',
      estimatedMvpBuildTime: '3-4 weeks',
      keyDependencies: ['APIs'],
      majorRisks: ['Distribution'],
      monetizationPossibilities: ['$49/mo'],
      distributionDifficulty: 'Medium',
      validationExperiment: { hypothesis: '', test: '', targetUsers: '', successSignal: '', invalidationSignal: '' },
      evidenceConfidence: problem.confidence,
    };
  }
}
