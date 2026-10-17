import { 
  ResearchRunConfig, 
  ResearchBudget, 
  TerminalState, 
  ResearchStage, 
  ResearchQuestion, 
  ClassifiedEvidence,
  ExtractedProblem,
  ExistingSolution,
  ProductOpportunity,
  MarketGap,
  CommercialSignal,
  VerifiedClaim
} from '@/types';

export class ResearchState {
  public stage: ResearchStage = 'INITIALIZING';
  public questions: ResearchQuestion[] = [];
  public evidence: ClassifiedEvidence[] = [];
  public problems: ExtractedProblem[] = [];
  public solutions: ExistingSolution[] = [];
  public gaps: MarketGap[] = [];
  public opportunities: ProductOpportunity[] = [];
  public commercialSignals: CommercialSignal[] = [];
  public verifiedClaims: VerifiedClaim[] = [];
  public terminalState: TerminalState | null = null;
  
  public searchCount = 0;
  public discoverySearchCount = 0;
  public candidateResultCount = 0;
  public fetchCount = 0; // Strictly selective deep document retrieval operations
  public llmCallCount = 0;
  public tokenCount = 0;
  public estimatedCostUsd = 0;
  public startTime = Date.now();
  public rejectedCandidates: Array<{
    id: string;
    title: string;
    problem: string;
    rejectionReason: string;
    evidenceCount: number;
    evidenceIds: string[];
  }> = [];
  
  private actionHistory = new Map<string, number>();

  constructor(public config: ResearchRunConfig) {
    if (!this.config.budget) {
      this.config.budget = {
        maxSearches: 12,
        maxDeepFetches: 25,
        maxLlmCalls: 8,
        maxTokens: 50000,
        maxCostUsd: 1.0,
        maxRuntimeMs: 10 * 60 * 1000, // 10 minutes
      };
    }
  }

  public recordAction(actionType: string, target?: string) {
    const key = `${actionType}:${target || 'none'}`;
    const count = this.actionHistory.get(key) || 0;
    this.actionHistory.set(key, count + 1);
  }

  public getActionCount(actionType: string, target?: string): number {
    const key = `${actionType}:${target || 'none'}`;
    return this.actionHistory.get(key) || 0;
  }

  public isBudgetExhausted(): boolean {
    const b = this.config.budget!;
    return (
      this.searchCount >= b.maxSearches ||
      this.fetchCount >= b.maxDeepFetches ||
      this.llmCallCount >= b.maxLlmCalls ||
      this.tokenCount >= b.maxTokens ||
      this.estimatedCostUsd >= b.maxCostUsd ||
      (Date.now() - this.startTime) >= b.maxRuntimeMs
    );
  }

  public updateCoverage() {
    for (const q of this.questions) {
      if (q.supportingEvidenceIds.length > 0) {
        q.status = q.contradictoryEvidenceIds.length > 0 ? 'COVERED' : 'PARTIAL';
      } else if (q.actionsAttempted >= 2) {
        q.status = 'PARTIAL';
      }
    }
  }

  public checkSufficiency(): boolean {
    if (this.questions.length === 0) return false;
    
    // Check if high importance questions have been attempted / investigated
    const highValueQuestions = this.questions.filter(q => q.importance === 'HIGH');
    const criticalUnanswered = highValueQuestions.filter(q => q.status === 'OPEN' && q.actionsAttempted === 0);
    if (criticalUnanswered.length > 0) return false;
    
    // Check if we have formed opportunities and evaluated counter-evidence honestly
    const hasOpportunities = this.opportunities.length > 0;
    const hasCounterEvidenceEvaluated = hasOpportunities && this.opportunities.every(o => 
      (o.counterEvidenceStatus !== undefined && o.counterEvidenceStatus !== 'COUNTER_EVIDENCE_NOT_PERFORMED') ||
      (o.counterEvidenceIds && o.counterEvidenceIds.length > 0)
    );

    return hasOpportunities && hasCounterEvidenceEvaluated;
  }
}
