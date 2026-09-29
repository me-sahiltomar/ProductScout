// ============================================================================
// ProductScout V2.0: General Opportunity Intelligence Platform Data Contracts
// ============================================================================

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

// ----------------------------------------------------------------------------
// 1. Research Objectives (Section 4)
// ----------------------------------------------------------------------------
export type ResearchObjective =
  | 'find_product_opportunities'
  | 'find_software_opportunities'
  | 'find_micro_saas_opportunities'
  | 'find_ai_opportunities'
  | 'find_automation_opportunities'
  | 'find_internal_tool_opportunities'
  | 'find_developer_tool_opportunities'
  | 'find_productized_service_opportunities'
  | 'find_customer_problems'
  | 'explore_market'
  | 'explore_industry'
  | 'explore_customer_segment'
  | 'analyze_competitor_gaps'
  | 'validate_existing_idea'
  | 'find_product_expansion_opportunities'
  | 'find_adjacent_opportunities'
  | 'research_workflow'
  | 'custom_research';

// ----------------------------------------------------------------------------
// 2. Target Definition (Section 5)
// ----------------------------------------------------------------------------
export type TargetUserType =
  | 'Founder'
  | 'Developer'
  | 'Designer'
  | 'Recruiter'
  | 'Accountant'
  | 'Salesperson'
  | 'Operations manager'
  | 'Marketing manager'
  | 'Agency owner'
  | 'Healthcare professional'
  | 'Student'
  | 'Consumer'
  | string;

export type TargetCompanyType =
  | 'Individual'
  | 'Freelancer'
  | 'Creator'
  | 'Startup'
  | 'SMB'
  | 'Mid-market'
  | 'Enterprise'
  | 'Agency'
  | 'Non-profit'
  | 'Any';

export type CompanySize =
  | '1'
  | '2–10'
  | '11–50'
  | '51–200'
  | '201–1000'
  | '1000+'
  | 'Any';

export interface TargetDefinition {
  primaryUser?: string;
  targetUser?: string;
  targetCompany?: TargetCompanyType;
  companySize?: CompanySize;
  industry?: string;
  geography?: string;
  workflow?: string;
}

// ----------------------------------------------------------------------------
// 3. Opportunity & Resource Profile (Section 6 & 7)
// ----------------------------------------------------------------------------
export type OpportunityType =
  | 'Micro-SaaS'
  | 'SaaS'
  | 'AI software'
  | 'Automation'
  | 'Internal tool'
  | 'Developer tool'
  | 'API'
  | 'Plugin'
  | 'Browser extension'
  | 'Data product'
  | 'Productized service'
  | 'Service + software'
  | 'Marketplace'
  | 'Infrastructure'
  | 'Consumer utility'
  | 'Enterprise software'
  | 'Custom'
  | 'Any';

export type TeamSize =
  | 'Solo'
  | '2–3'
  | '4–10'
  | '10+'
  | 'Existing engineering organization';

export type TechnicalCapability =
  | 'Non-technical'
  | 'General developer'
  | 'Full-stack developer'
  | 'AI / ML'
  | 'Data engineering'
  | 'Specialist team'
  | 'Existing engineering team';

export type BudgetLevel =
  | 'Minimal'
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Enterprise';

export type ExistingAdvantage =
  | 'Existing audience'
  | 'Existing customers'
  | 'Existing distribution'
  | 'Existing product'
  | 'Existing data'
  | 'Existing codebase'
  | 'Domain expertise'
  | 'Partnerships'
  | 'Community'
  | 'Sales organization'
  | 'None';

export type DistributionAccess =
  | 'None'
  | 'Audience'
  | 'Community'
  | 'Existing customers'
  | 'Sales team'
  | 'Partnerships'
  | 'Enterprise relationships'
  | 'Other';

// ----------------------------------------------------------------------------
// 4. Build Horizon vs. Evidence Window (Section 8 & 9)
// ----------------------------------------------------------------------------
export type BuildHorizon =
  | '7d'     // 7 days (tiny utilities, micro-SaaS, lightweight POC)
  | '2-3w'   // 2–3 weeks (narrow production MVPs, clean UX)
  | '1m'     // 1 month (focused SaaS MVP, onboarding, auth/billing)
  | '3m'     // 3 months (substantial MVP, integrations, multi-role)
  | '6m'     // 6 months (category product, team workflows, infrastructure)
  | '12m'    // 12 months (large enterprise/platform venture thesis)
  | 'custom';

export type EvidenceWindow =
  | '7d'
  | '30d'
  | '90d'
  | '6m'
  | '1y'
  | '12m'
  | '2y'
  | 'all';

export type ResearchDepth =
  | 'quick'
  | 'standard'
  | 'deep'
  | 'exhaustive';

// ----------------------------------------------------------------------------
// 5. Priorities, Exclusions & Risk Profile (Section 12, 13, 14)
// ----------------------------------------------------------------------------
export type UserPriority =
  | 'High pain'
  | 'High frequency'
  | 'Manual workflow'
  | 'Existing workaround'
  | 'Existing spending'
  | 'Commercial intent'
  | 'Fast validation'
  | 'Easy distribution'
  | 'Large market'
  | 'Low competition'
  | 'Strong differentiation'
  | 'Technical simplicity'
  | 'Strong defensibility'
  | 'Short sales cycle'
  | 'Integration simplicity'
  | 'Low infrastructure cost'
  | 'High time savings'
  | 'High ROI';

export type UserExclusion =
  | 'Hardware'
  | 'Highly regulated workflows'
  | 'Sensitive personal data'
  | 'Medical data'
  | 'Payment-card data'
  | 'Heavy infrastructure'
  | 'Long enterprise sales cycles'
  | 'High acquisition cost'
  | 'Proprietary datasets'
  | 'Mobile-first products'
  | 'Marketplace models'
  | string;

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive';

// ----------------------------------------------------------------------------
// 6. Top-Level Research Brief (Section 4)
// ----------------------------------------------------------------------------
export interface ResearchBrief {
  objective: ResearchObjective;
  subject: string;                     // Core problem/workflow/market being explored
  intent?: string;                      // Natural language explanation of what user seeks
  target: TargetDefinition;
  opportunityProfile: {
    productTypes: OpportunityType[];
    buildHorizon: BuildHorizon;
    customBuildHorizon?: string;
    teamSize: TeamSize;
    technicalCapability: TechnicalCapability;
    budget: BudgetLevel;
    existingAdvantages: string[];
    distributionAccess: DistributionAccess;
  };
  researchConfiguration: {
    evidenceWindow: EvidenceWindow;
    depth: ResearchDepth;
    sources: SourcePlatform[];
    maxSources?: number;
  };
  constraints: {
    priorities: string[];
    exclusions: string[];
    riskProfile: RiskProfile;
    customConstraints?: string;
  };
}

// Backward-compatible config bridge
export interface ResearchRunConfig {
  topic: string;
  timeframe: '7d' | '30d' | '90d' | '1y' | 'all';
  maxSources: number;
  focus: string;
  targetUser?: string;
  geography?: string;
  industry?: string;
  enabledSources?: SourcePlatform[];
  brief?: ResearchBrief; // V2.0 Full Structured Research Brief
}

// ----------------------------------------------------------------------------
// 7. Evidence & Signal Contracts
// ----------------------------------------------------------------------------
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
  currentWorkaround: string; // Crucial evidence
  frequency: string;
  evidenceQuotes: Array<{
    quote: string;
    sourceUrl: string;
    sourceTitle: string;
    author?: string;
    platform: SourcePlatform;
  }>;
  evidenceIds: string[];
  signalCount: number;
  sourceLinks: string[];
  evidenceQuality: EvidenceQuality;
  confidence: number; // 0 - 100
}

export interface ProblemCluster {
  id: string;
  clusterName: string;
  description: string;
  problemIds: string[];
  signalCount: number;
  sourceDiversity: number;
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
  isAiInference: boolean;
}

export interface MvpBuildProfile {
  complexity: 'Low' | 'Medium' | 'High';
  estimatedBuildTime: string;
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
  validationMethod?: string; // e.g. "Landing Page & Outreach", "Workflow Audit", "Employee Pilot"
  estimatedTime?: string;
  estimatedCost?: string;
}

// ----------------------------------------------------------------------------
// 8. Adaptive Opportunity Evaluation (Section 15)
// ----------------------------------------------------------------------------
export interface OpportunityEvaluation {
  contextualFitScore: number; // 0 - 100 relative to user brief
  feasibilityFit: {
    score: number; // 0 - 100
    rationale: string;
    horizonMatch: boolean;
    teamMatch: boolean;
    budgetMatch: boolean;
  };
  strategicFit: {
    score: number; // 0 - 100
    rationale: string;
    advantagesLeveraged: string[];
  };
  commercialViability: {
    score: number; // 0 - 100
    rationale: string;
    estimatedPricePoint: string;
    salesCycle: 'Short' | 'Medium' | 'Long';
  };
  priorityAlignment: {
    score: number; // 0 - 100
    matchedPriorities: string[];
    missedPriorities: string[];
  };
  exclusionCompliance: {
    compliant: boolean;
    flaggedExclusions: string[];
  };
  criticalUncertainties: string[];
  recommendedAction: 'Execute Immediately' | 'Validate First' | 'Deprioritize' | 'Avoid';
}

// ----------------------------------------------------------------------------
// 9. Full Product Opportunity Contract (Section 9 & 17)
// ----------------------------------------------------------------------------
export interface ProductOpportunity {
  id: string;
  name: string;
  oneLineDescription: string;
  targetCustomer: string;
  userProblem: string;
  evidenceSummary: string;
  evidenceQuotes: Array<{
    quote: string;
    url: string;
    platform: SourcePlatform;
    author?: string;
  }>;
  existingAlternatives: string;
  gap: string;
  proposedSolution: string;
  coreWorkflow: string;
  whyUseful: string;
  mvpScope: string[];
  whatNotToBuildInitially: string[];
  technicalComplexity: 'Low' | 'Medium' | 'High';
  estimatedMvpBuildTime: string;
  keyDependencies: string[];
  majorRisks: string[];
  monetizationPossibilities: string[];
  distributionDifficulty: 'Low' | 'Medium' | 'High';
  validationExperiment: ValidationExperiment;
  evidenceConfidence: number;

  // V2.0 Contextual & Adaptive Extensions
  opportunityType?: OpportunityType;
  evaluation?: OpportunityEvaluation;
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
  whyInsufficient: string;
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

// ----------------------------------------------------------------------------
// 10. Adaptive Output Types (Section 19)
// ----------------------------------------------------------------------------
export type AdaptiveOutputType =
  | 'builder_brief_7d'
  | 'rapid_mvp_2_3w'
  | 'product_brief_30d'
  | 'product_plan_90d'
  | 'venture_plan_6m'
  | 'thesis_12m'
  | 'market_landscape'
  | 'validation_report'
  | 'automation_brief';

export interface ResearchRun {
  id: string;
  createdAt: string;
  config: ResearchRunConfig;
  brief?: ResearchBrief;
  adaptiveOutputType?: AdaptiveOutputType;
  status: 'pending' | 'collecting' | 'analyzing' | 'completed' | 'failed';
  currentStep?: string;
  is_reference?: boolean;
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

export interface DiscoveredModel {
  id: string;
  displayName: string;
  description: string;
  isRecommended?: boolean;
  badge?: string;
  score: number;
}

export interface SystemSettings {
  aiProvider: 'heuristic' | 'gemini' | 'openai';
  geminiModel?: string;
  openaiBaseUrl?: string;
  openaiModel?: string;
  defaultMaxSources: number;
  defaultTimeframe: '7d' | '30d' | '90d' | '1y' | 'all';
  hasServerGeminiKey?: boolean;
  hasServerOpenaiKey?: boolean;
  availableGeminiModels?: DiscoveredModel[];
  recommendedGeminiModel?: string;
}

