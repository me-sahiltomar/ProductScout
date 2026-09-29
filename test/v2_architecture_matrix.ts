// ProductScout V2.0 General Opportunity Intelligence - Architecture Matrix Verification Test
import { AdaptiveEvaluator } from '../src/lib/engine/adaptiveEvaluator';
import { ValidationEngine } from '../src/lib/engine/validationEngine';
import { OpportunityGenerator, normalizeBrief } from '../src/lib/engine/opportunityGenerator';
import { ReportGenerator, resolveAdaptiveOutputType } from '../src/lib/engine/reportGenerator';
import { 
  ResearchBrief, 
  ProductOpportunity, 
  ResearchRun, 
  ProblemCluster, 
  ExtractedProblem, 
  MarketGap 
} from '../src/types';

console.log('========================================================');
console.log('PRODUCTSCOUT V2.0 ARCHITECTURE & DECISION MATRIX TEST');
console.log('========================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string, details: string = '') {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message} - ${details}`);
    failed++;
  }
}

const evaluator = new AdaptiveEvaluator();
const validationEngine = new ValidationEngine();
const oppGenerator = new OpportunityGenerator();
const reportGen = new ReportGenerator();

// ----------------------------------------------------------------------------
// TEST A: Solo Developer, 7 Days, Minimal Budget
// ----------------------------------------------------------------------------
console.log('\n--- Scenario A: Solo Developer, 7-Day Micro-SaaS ---');
const briefA: ResearchBrief = {
  objective: 'find_micro_saas_opportunities',
  subject: 'Automated invoice discrepancy detection for freelancers',
  intent: 'Find tight 7-day micro-SaaS',
  target: {
    primaryUser: 'Freelancers',
    targetCompany: 'SMB',
    industry: 'Financial Services',
  },
  opportunityProfile: {
    productTypes: ['Micro-SaaS'],
    buildHorizon: '7d',
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Minimal',
    existingAdvantages: ['Domain expertise'],
    distributionAccess: 'Community',
  },
  researchConfiguration: {
    evidenceWindow: '30d',
    depth: 'standard',
    sources: ['reddit', 'hacker_news'],
  },
  constraints: {
    priorities: ['High pain', 'Fast validation', 'Technical simplicity'],
    exclusions: ['Hardware', 'Long enterprise sales cycles'],
    riskProfile: 'conservative',
  },
};

const outputTypeA = resolveAdaptiveOutputType(briefA);
assert(outputTypeA === 'builder_brief_7d', 'Scenario A resolves to builder_brief_7d', `Got: ${outputTypeA}`);

const testOppA: ProductOpportunity = {
  id: 'opp_test_a',
  name: 'InvoiceGuard Micro',
  oneLineDescription: 'Single workflow checking invoice totals against contracts',
  targetCustomer: 'Freelancers',
  userProblem: 'Clients underpay due to overlooked contract discrepancies',
  evidenceSummary: 'Freelancers lose hours cross-referencing invoice lines',
  evidenceQuotes: [],
  existingAlternatives: 'Manual spreadsheet checks',
  gap: 'No lightweight single-file validator',
  proposedSolution: 'Upload PDF invoice and contract, highlights line mismatch',
  coreWorkflow: 'Upload -> Parse -> Highlight diffs',
  whyUseful: 'Recovers billable dollars in 30 seconds',
  mvpScope: ['PDF text parser', 'Diff viewer', 'Stripe checkout link'],
  whatNotToBuildInitially: ['Team accounts', 'Recurring billing', 'Accounting sync'],
  technicalComplexity: 'Low',
  estimatedMvpBuildTime: '5 days',
  keyDependencies: ['PDF.js'],
  majorRisks: ['Unusual invoice formats'],
  monetizationPossibilities: ['$19/mo'],
  distributionDifficulty: 'Low',
  validationExperiment: {
    hypothesis: 'Freelancers will pay for automated invoice verification',
    test: 'Post in freelancer subreddit with interactive demo',
    targetUsers: 'Freelancers',
    successSignal: '5 paid signups',
    invalidationSignal: 'Zero conversions after 50 demo views',
  },
  evidenceConfidence: 90,
  opportunityType: 'Micro-SaaS',
  mvpProfile: {
    complexity: 'Low',
    estimatedBuildTime: '5 days',
    coreComponents: ['Parser', 'UI'],
    requiredIntegrations: [],
    aiRequirements: 'None',
    dataRequirements: 'Client-side only',
    mainTechnicalRisks: [],
    mainBusinessRisks: [],
    validationDifficulty: 'Low',
  },
};

const evalA = evaluator.evaluate(testOppA, briefA);
assert(evalA.contextualFitScore >= 75, 'Scenario A gives high Contextual Fit Score for low-complexity 7d tool', `Score: ${evalA.contextualFitScore}`);
assert(evalA.feasibilityFit.horizonMatch === true, 'Scenario A flags horizonMatch = true for low complexity', evalA.feasibilityFit.rationale);
assert(evalA.recommendedAction === 'Execute Immediately' || evalA.recommendedAction === 'Validate First', 'Scenario A recommends action', evalA.recommendedAction);

// ----------------------------------------------------------------------------
// TEST B: Solo Developer, 2–3 Weeks, Automation
// ----------------------------------------------------------------------------
console.log('\n--- Scenario B: Workflow Automation (2–3 Weeks) ---');
const briefB: ResearchBrief = {
  objective: 'find_automation_opportunities',
  subject: 'E-commerce return reconciliation across Shopify and 3PL',
  target: {
    primaryUser: 'E-commerce Ops Manager',
    targetCompany: 'SMB',
    industry: 'Retail',
  },
  opportunityProfile: {
    productTypes: ['Automation'],
    buildHorizon: '2-3w',
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Minimal',
    existingAdvantages: [],
    distributionAccess: 'Community',
  },
  researchConfiguration: {
    evidenceWindow: '30d',
    depth: 'standard',
    sources: ['reddit'],
  },
  constraints: {
    priorities: ['Manual workflow', 'High time savings'],
    exclusions: ['Sensitive personal data'],
    riskProfile: 'balanced',
  },
};

const outputTypeB = resolveAdaptiveOutputType(briefB);
assert(outputTypeB === 'automation_brief', 'Scenario B resolves to automation_brief', `Got: ${outputTypeB}`);

// ----------------------------------------------------------------------------
// TEST C: Small Team, 1 Month, B2B SaaS
// ----------------------------------------------------------------------------
console.log('\n--- Scenario C: Small Team, 1 Month B2B SaaS ---');
const briefC: ResearchBrief = {
  objective: 'find_software_opportunities',
  subject: 'Customer support dispute escalation and replay tooling',
  target: {
    primaryUser: 'Support Engineers',
    targetCompany: 'SMB',
    industry: 'B2B Software',
  },
  opportunityProfile: {
    productTypes: ['SaaS'],
    buildHorizon: '1m',
    teamSize: '2–3',
    technicalCapability: 'Full-stack developer',
    budget: 'Moderate',
    existingAdvantages: [],
    distributionAccess: 'None',
  },
  researchConfiguration: {
    evidenceWindow: '90d',
    depth: 'standard',
    sources: ['github', 'hacker_news'],
  },
  constraints: {
    priorities: ['High pain', 'Commercial intent'],
    exclusions: [],
    riskProfile: 'balanced',
  },
};

const outputTypeC = resolveAdaptiveOutputType(briefC);
assert(outputTypeC === 'product_brief_30d', 'Scenario C resolves to product_brief_30d', `Got: ${outputTypeC}`);

// ----------------------------------------------------------------------------
// TEST D: Internal Tool Replacement, 3 Months
// ----------------------------------------------------------------------------
console.log('\n--- Scenario D: Internal Tool Replacement (3 Months) ---');
const briefD: ResearchBrief = {
  objective: 'find_internal_tool_opportunities',
  subject: 'Custom reporting utility for recruitment agencies',
  target: {
    primaryUser: 'Recruitment Ops',
    targetCompany: 'SMB',
    industry: 'Recruiting',
  },
  opportunityProfile: {
    productTypes: ['Internal tool', 'SaaS'],
    buildHorizon: '3m',
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Moderate',
    existingAdvantages: [],
    distributionAccess: 'Direct sales',
  },
  researchConfiguration: {
    evidenceWindow: '90d',
    depth: 'standard',
    sources: ['web'],
  },
  constraints: {
    priorities: ['Manual workflow', 'High pain'],
    exclusions: [],
    riskProfile: 'balanced',
  },
};

const outputTypeD = resolveAdaptiveOutputType(briefD);
assert(outputTypeD === 'product_plan_90d', 'Scenario D resolves to product_plan_90d', `Got: ${outputTypeD}`);

// ----------------------------------------------------------------------------
// TEST E: Enterprise Software, 6 Months, High Budget
// ----------------------------------------------------------------------------
console.log('\n--- Scenario E: Enterprise Software, 6 Months ---');
const briefE: ResearchBrief = {
  objective: 'find_software_opportunities',
  subject: 'Multi-cloud egress cost anomaly detection',
  target: {
    primaryUser: 'FinOps Director',
    targetCompany: 'Enterprise',
    industry: 'Cloud Infrastructure',
  },
  opportunityProfile: {
    productTypes: ['Enterprise software', 'Infrastructure'],
    buildHorizon: '6m',
    teamSize: '4–10',
    technicalCapability: 'Specialist team',
    budget: 'High',
    existingAdvantages: [],
    distributionAccess: 'Direct sales',
  },
  researchConfiguration: {
    evidenceWindow: '1y',
    depth: 'exhaustive',
    sources: ['hacker_news', 'github'],
  },
  constraints: {
    priorities: ['Strong defensibility', 'High ROI'],
    exclusions: ['Consumer utility', 'Mobile-first products'],
    riskProfile: 'aggressive',
  },
};

const outputTypeE = resolveAdaptiveOutputType(briefE);
assert(outputTypeE === 'venture_plan_6m', 'Scenario E resolves to venture_plan_6m', `Got: ${outputTypeE}`);

// ----------------------------------------------------------------------------
// TEST F: 12-Month Venture Platform
// ----------------------------------------------------------------------------
console.log('\n--- Scenario F: 12-Month Venture Thesis Platform ---');
const briefF: ResearchBrief = {
  objective: 'find_software_opportunities',
  subject: 'Verticalized ERP for commercial subcontractors',
  target: {
    primaryUser: 'General Contractors',
    targetCompany: 'Mid-market',
    industry: 'Commercial Construction',
  },
  opportunityProfile: {
    productTypes: ['SaaS'],
    buildHorizon: '12m',
    teamSize: '4–10',
    technicalCapability: 'Full-stack developer',
    budget: 'Enterprise',
    existingAdvantages: [],
    distributionAccess: 'Direct sales',
  },
  researchConfiguration: {
    evidenceWindow: '1y',
    depth: 'exhaustive',
    sources: ['reddit', 'web'],
  },
  constraints: {
    priorities: ['Large market', 'Strong defensibility'],
    exclusions: ['Consumer utility'],
    riskProfile: 'aggressive',
  },
};

const outputTypeF = resolveAdaptiveOutputType(briefF);
assert(outputTypeF === 'thesis_12m', 'Scenario F resolves to thesis_12m', `Got: ${outputTypeF}`);

// ----------------------------------------------------------------------------
// TEST G: Market Exploration & Landscape
// ----------------------------------------------------------------------------
console.log('\n--- Scenario G: Market Exploration & Landscape ---');
const briefG: ResearchBrief = {
  objective: 'explore_market',
  subject: 'Healthcare clinic patient intake friction',
  target: {
    primaryUser: 'Clinic Administrators',
    targetCompany: 'SMB',
    industry: 'Healthcare',
  },
  opportunityProfile: {
    productTypes: ['Any'],
    buildHorizon: '3m',
    teamSize: '2–3',
    technicalCapability: 'Full-stack developer',
    budget: 'Moderate',
    existingAdvantages: [],
    distributionAccess: 'Community',
  },
  researchConfiguration: {
    evidenceWindow: '1y',
    depth: 'deep',
    sources: ['reddit', 'web'],
  },
  constraints: {
    priorities: ['Large market'],
    exclusions: [],
    riskProfile: 'balanced',
  },
};

const outputTypeG = resolveAdaptiveOutputType(briefG);
assert(outputTypeG === 'market_landscape', 'Scenario G resolves to market_landscape', `Got: ${outputTypeG}`);

// ----------------------------------------------------------------------------
// TEST H: Idea Validation Check
// ----------------------------------------------------------------------------
console.log('\n--- Scenario H: Idea Validation Check ---');
const briefH: ResearchBrief = {
  objective: 'validate_existing_idea',
  subject: 'Automated meeting action item tracking and CRM syncing',
  target: {
    primaryUser: 'Account Executives',
    targetCompany: 'Startup',
    industry: 'Sales Tech',
  },
  opportunityProfile: {
    productTypes: ['SaaS'],
    buildHorizon: '7d',
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Minimal',
    existingAdvantages: [],
    distributionAccess: 'Community',
  },
  researchConfiguration: {
    evidenceWindow: '90d',
    depth: 'exhaustive',
    sources: ['reddit', 'hacker_news'],
  },
  constraints: {
    priorities: ['Fast validation', 'High pain'],
    exclusions: [],
    riskProfile: 'conservative',
  },
};

const outputTypeH = resolveAdaptiveOutputType(briefH);
assert(outputTypeH === 'validation_report', 'Scenario H resolves to validation_report', `Got: ${outputTypeH}`);

// ----------------------------------------------------------------------------
// TEST: Exclusion Violation Penalty Check
// ----------------------------------------------------------------------------
console.log('\n--- Exclusion Violation Penalty Verification ---');
const briefExcl: ResearchBrief = {
  ...briefA,
  constraints: {
    priorities: ['High pain'],
    exclusions: ['Medical data', 'Highly regulated workflows'],
    riskProfile: 'conservative',
  },
};

const oppViolating: ProductOpportunity = {
  ...testOppA,
  id: 'opp_violating',
  name: 'HIPAA Medical Record Exporter',
  userProblem: 'Medical data exchange between doctors is slow and regulated',
  proposedSolution: 'Automated medical records sync handling patient medical data',
};

const evalViolating = evaluator.evaluate(oppViolating, briefExcl);
assert(evalViolating.exclusionCompliance.compliant === false, 'Flags violation when opportunity involves excluded domain', JSON.stringify(evalViolating.exclusionCompliance.flaggedExclusions));
assert(evalViolating.contextualFitScore <= 35, 'Severe score penalty applied for exclusion violation', `Score: ${evalViolating.contextualFitScore}`);
assert(evalViolating.recommendedAction === 'Avoid', 'Recommends Avoid for violating opportunity', evalViolating.recommendedAction);

// ----------------------------------------------------------------------------
// TEST: Backward Compatibility - normalizeBrief
// ----------------------------------------------------------------------------
console.log('\n--- Backward Compatibility Verification ---');
const legacyConfig = {
  topic: 'Developer tool observability',
  timeframe: '30d' as const,
  maxSources: 25,
  focus: 'Slow debug cycles',
  targetUser: 'Site Reliability Engineers',
};

const normalized = normalizeBrief(legacyConfig);
assert(normalized.subject === 'Developer tool observability', 'Normalized brief preserves legacy topic', normalized.subject);
assert(normalized.target.primaryUser === 'Site Reliability Engineers', 'Normalized brief maps legacy targetUser', normalized.target.primaryUser || '');
assert(normalized.opportunityProfile.buildHorizon === '1m', 'Normalized brief defaults to 1m horizon for 30d timeframe', normalized.opportunityProfile.buildHorizon);

// ----------------------------------------------------------------------------
// TEST: Report Generation across all 9 Adaptive Output Types
// ----------------------------------------------------------------------------
console.log('\n--- Report Generation of all 9 Adaptive Types ---');
const mockRun: ResearchRun = {
  id: 'run_test_matrix',
  createdAt: new Date().toISOString(),
  config: legacyConfig,
  brief: briefA,
  adaptiveOutputType: 'builder_brief_7d',
  status: 'completed',
  coverage: {
    sourcesSearched: ['reddit', 'hacker_news'],
    sourcesCollectedCount: 15,
    sourcesSucceeded: ['reddit', 'hacker_news'],
    sourcesUnavailable: [],
    dateRange: 'Past 30 days',
    qualityDistribution: { high: 10, medium: 5, low: 0 },
  },
  rawEvidenceCount: 15,
  classifiedEvidence: [],
  problems: [],
  clusters: [],
  existingSolutions: [],
  gaps: [],
  opportunities: [testOppA],
  weakSignals: [],
  reportMarkdown: '',
};

const typesToTest = [
  'builder_brief_7d',
  'rapid_mvp_2_3w',
  'product_brief_30d',
  'product_plan_90d',
  'venture_plan_6m',
  'thesis_12m',
  'market_landscape',
  'validation_report',
  'automation_brief',
] as const;

for (const t of typesToTest) {
  const briefDoc = reportGen.generateAdaptiveBrief(mockRun, t);
  assert(briefDoc.length > 100, `Generated non-empty document for ${t}`, `Length: ${briefDoc.length}`);
}

console.log('\n========================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ ALL V2.0 ARCHITECTURE MATRIX TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}
