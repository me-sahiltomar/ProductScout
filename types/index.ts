// Shared Data Contracts for Cevon Opportunity Radar

export type SourcePlatform =
  | 'reddit'
  | 'hacker_news'
  | 'github'
  | 'devto'
  | 'producthunt'
  | 'indiehackers'
  | 'forum'
  | 'review'
  | 'web';

export type EvidenceType =
  | 'FIRST_HAND_USER_COMPLAINT' // Highest
  | 'WORKFLOW_PROBLEM'          // Highest
  | 'SOLUTION_REQUEST'           // Highest
  | 'PRODUCT_REVIEW_COMPLAINT'   // Highest
  | 'GITHUB_ISSUE'               // Highest
  | 'EXPERT_DISCUSSION'          // Medium
  | 'INDUSTRY_ANALYSIS'          // Medium
  | 'VENDOR_MARKETING'           // Lower (demoted/penalized)
  | 'GENERIC_ARTICLE';           // Lower

export type EvidenceQuality = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ResearchRunConfig {
  topic: string;
  timeframe: '7d' | '30d' | '90d' | '1y' | 'all';
  maxSources: number;
  focus: string;
  targetUser?: string;
  geography?: string;
  industry?: string;
  enabledSources?: SourcePlatform[];
}

export interface RawEvidenceItem {
  id: string;
  title: string;
  url: string;
  platform: SourcePlatform;
  author?: string;
  date?: string;
  content: string;
  score?: number;
  commentsCount?: number;
}

export interface ClassifiedEvidence {
  id: string;
  rawId: string;
  title: string;
  url: string;
  platform: SourcePlatform;
  author?: string;
  date?: string;
  snippet: string;
  evidenceType: EvidenceType;
  quality: EvidenceQuality;
  qualityScore: number; // 0 - 100
  firstHandMarkers: string[];
  painQuote?: string;
}

export interface ExtractedProblem {
  id: string;
  problemStatement: string;
  targetUser: string;
  userContext: string;
  jobWorkflow: string;
  painPoint: string;
  whyPainful: string;
  currentWorkaround: string; // "What users currently do" (crucial evidence)
  frequency: string; // e.g. "Daily", "Multiple times a week", or "Insufficient evidence"
  evidenceQuotes: Array<{
    quote: string;
    sourceUrl: string;
    sourceTitle: string;
    author?: string;
    platform: SourcePlatform;
  }>;
  evidenceIds: string[];
  signalCount: number; // number of independent signals
  sourceLinks: string[];
  evidenceQuality: EvidenceQuality;
  confidence: number; // percentage 0 - 100
}

export interface ProblemCluster {
  id: string;
  clusterName: string;
  description: string;
  problemIds: string[];
  signalCount: number;
  sourceDiversity: number; // number of distinct platforms
  commonAffectedUsers: string;
  commonWorkflow: string;
  overallEvidenceStrength: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ExistingSolution {
  name: string;
  type: 'software_product' | 'competitor' | 'manual_workaround' | 'spreadsheets' | 'existing_tool';
  whatUsersDo: string;
  positiveAspects: string[];
  complaints: string[];
  missingFunctionality: string[];
  pricingInfo?: string;
  integrationLimitations: string[];
  complexityFriction: string;
  unservedSegments: string;
}

export type GapType =
  | 'poor_usability'
  | 'excessive_complexity'
  | 'high_price'
  | 'missing_integration'
  | 'poor_workflow_fit'
  | 'too_many_manual_steps'
  | 'lack_of_automation'
  | 'poor_reliability'
  | 'underserved_customer_segment'
  | 'geographic_regulatory_limitation'
  | 'poor_onboarding'
  | 'missing_feature'
  | 'weak_user_experience';

export interface MarketGap {
  id: string;
  gapType: GapType;
  title: string;
  description: string;
  supportingEvidenceIds: string[];
  supportingQuotes: string[];
  isAiInference: boolean; // Must be true if inferred, false if directly backed by user quotes
}

export interface MvpBuildProfile {
  complexity: 'Low' | 'Medium' | 'High';
  estimatedBuildTime: string; // e.g. "1-2 weeks"
  coreComponents: string[];
  requiredIntegrations: string[];
  aiRequirements: string;
  dataRequirements: string;
  mainTechnicalRisks: string[];
  mainBusinessRisks: string[];
  validationDifficulty: 'Low' | 'Medium' | 'High';
}

export interface ValidationExperiment {
  hypothesis: string;
  test: string;
  targetUsers: string;
  successSignal: string;
  invalidationSignal: string;
}

// Full 20 fields required by Section 8
export interface ProductOpportunity {
  id: string;
  name: string;                         // 1. Opportunity name
  oneLineDescription: string;           // 2. One-line description
  targetCustomer: string;               // 3. Target customer
  userProblem: string;                  // 4. User problem
  evidenceSummary: string;              // 5. Evidence summary
  evidenceQuotes: Array<{               // Supporting evidence citations
    quote: string;
    url: string;
    platform: SourcePlatform;
    author?: string;
  }>;
  existingAlternatives: string;         // 6. Existing alternatives
  gap: string;                          // 7. Gap
  proposedSolution: string;             // 8. Proposed solution
  coreWorkflow: string;                 // 9. Core workflow
  whyUseful: string;                    // 10. Why the solution could be useful
  mvpScope: string[];                   // 11. MVP scope
  whatNotToBuildInitially: string[];    // 12. What NOT to build initially
  technicalComplexity: 'Low' | 'Medium' | 'High'; // 13. Technical complexity
  estimatedMvpBuildTime: string;        // 14. Estimated MVP build time
  keyDependencies: string[];            // 15. Key dependencies
  majorRisks: string[];                 // 16. Major risks
  monetizationPossibilities: string[];  // 17. Monetization possibilities
  distributionDifficulty: 'Low' | 'Medium' | 'High'; // 18. Distribution difficulty
  validationExperiment: ValidationExperiment; // 19. Validation experiment
  evidenceConfidence: number;           // 20. Evidence confidence (0 - 100)
  
  // Extended metadata
  clusterId?: string;
  mvpProfile: MvpBuildProfile;
  isSaved?: boolean;
  notes?: string;
}

export interface WeakSignal {
  id: string;
  title: string;
  userStatement: string;
  platform: SourcePlatform;
  sourceUrl: string;
  whyInsufficient: string; // Reason it failed 10-point QC (e.g. single unverified signal, no clear workaround, vendor pitch)
  potentialValue: string;
}

export interface ResearchCoverage {
  sourcesSearched: SourcePlatform[];
  sourcesCollectedCount: number;
  sourcesSucceeded: SourcePlatform[];
  sourcesUnavailable: Array<{
    platform: SourcePlatform;
    reason: string;
  }>;
  dateRange: string;
  qualityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ResearchRun {
  id: string;
  createdAt: string;
  config: ResearchRunConfig;
  status: 'pending' | 'collecting' | 'analyzing' | 'completed' | 'failed';
  currentStep?: string;
  coverage: ResearchCoverage;
  rawEvidenceCount: number;
  classifiedEvidence: ClassifiedEvidence[];
  problems: ExtractedProblem[];
  clusters: ProblemCluster[];
  existingSolutions: ExistingSolution[];
  gaps: MarketGap[];
  opportunities: ProductOpportunity[];
  weakSignals: WeakSignal[];
  reportMarkdown: string;
  error?: string;
}

export interface SystemSettings {
  aiProvider: 'heuristic' | 'gemini' | 'openai';
  geminiApiKey?: string;
  geminiModel?: string;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  openaiModel?: string;
  defaultMaxSources: number;
  defaultTimeframe: '7d' | '30d' | '90d' | '1y' | 'all';
}

// Re-export CevonX Products Platform Database Types
export * from './database.types';

