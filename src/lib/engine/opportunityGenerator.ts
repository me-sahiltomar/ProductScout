import { 
  ExtractedProblem, 
  MarketGap, 
  MvpBuildProfile, 
  OpportunityType,
  ProblemCluster, 
  ProductOpportunity, 
  ResearchBrief, 
  ResearchRunConfig, 
  ValidationExperiment 
} from '@/types';
import { AdaptiveEvaluator } from './adaptiveEvaluator';
import { ValidationEngine } from './validationEngine';

export function normalizeBrief(config: ResearchRunConfig): ResearchBrief {
  if (config.brief) return config.brief;
  return {
    objective: 'find_product_opportunities',
    subject: config.topic,
    intent: config.focus || `Investigate authentic operational complaints and workflow friction in "${config.topic}".`,
    target: {
      primaryUser: config.targetUser || 'B2B Operators & Practitioners',
      targetUser: config.targetUser || 'B2B Operators & Practitioners',
      targetCompany: 'SMB',
      companySize: '11–50',
      industry: config.industry || 'Software & Business Services',
      geography: config.geography || 'Global',
      workflow: config.focus || 'Core operational tasks',
    },
    opportunityProfile: {
      productTypes: ['SaaS', 'Micro-SaaS'],
      buildHorizon: config.timeframe === '7d' ? '7d' : '1m',
      teamSize: 'Solo',
      technicalCapability: 'Full-stack developer',
      budget: 'Moderate',
      existingAdvantages: ['Domain expertise'],
      distributionAccess: 'Community',
    },
    researchConfiguration: {
      evidenceWindow: (config.timeframe as any) || '30d',
      depth: 'standard',
      sources: config.enabledSources || ['reddit', 'hacker_news', 'github', 'devto', 'web'],
      maxSources: config.maxSources || 30,
    },
    constraints: {
      priorities: ['High pain', 'Manual workflow', 'Commercial intent'],
      exclusions: [],
      riskProfile: 'balanced',
    },
  };
}

export class OpportunityGenerator {
  private evaluator: AdaptiveEvaluator;
  private validationEngine: ValidationEngine;

  constructor() {
    this.evaluator = new AdaptiveEvaluator();
    this.validationEngine = new ValidationEngine();
  }

  public generateOpportunities(
    clusters: ProblemCluster[],
    problems: ExtractedProblem[],
    gaps: MarketGap[],
    config: ResearchRunConfig
  ): ProductOpportunity[] {
    const brief = normalizeBrief(config);
    const opportunities: ProductOpportunity[] = [];
    const probMap = new Map<string, ExtractedProblem>();
    problems.forEach(p => probMap.set(p.id, p));

    for (const cluster of clusters) {
      const clusterProbs = cluster.problemIds
        .map(id => probMap.get(id))
        .filter((p): p is ExtractedProblem => !!p);

      if (clusterProbs.length === 0) continue;

      const primaryProblem = clusterProbs[0];
      const relevantGap = gaps.find(g => g.id.includes(cluster.id)) || gaps[0];

      const opp = this.buildOpportunityForCluster(cluster, primaryProblem, relevantGap, brief);
      opportunities.push(opp);
    }

    return opportunities.sort((a, b) => {
      const fitA = a.evaluation?.contextualFitScore ?? a.evidenceConfidence;
      const fitB = b.evaluation?.contextualFitScore ?? b.evidenceConfidence;
      return fitB - fitA;
    });
  }

  private buildOpportunityForCluster(
    cluster: ProblemCluster,
    problem: ExtractedProblem,
    gap: MarketGap | undefined,
    brief: ResearchBrief
  ): ProductOpportunity {
    const clusterName = cluster.clusterName.toLowerCase();
    const { opportunityProfile, target, objective } = brief;
    const { buildHorizon, productTypes } = opportunityProfile;

    // 1. Determine dominant Opportunity Type
    let oppType: OpportunityType = 'SaaS';
    if (productTypes && productTypes.length > 0 && !productTypes.includes('Any')) {
      if (objective === 'find_developer_tool_opportunities' || productTypes.includes('Developer tool')) {
        oppType = 'Developer tool';
      } else if (objective === 'find_automation_opportunities' || productTypes.includes('Automation')) {
        oppType = 'Automation';
      } else if (objective === 'find_internal_tool_opportunities' || productTypes.includes('Internal tool')) {
        oppType = 'Internal tool';
      } else if (objective === 'find_productized_service_opportunities' || productTypes.includes('Productized service')) {
        oppType = 'Productized service';
      } else if (productTypes.includes('Micro-SaaS') || buildHorizon === '7d') {
        oppType = 'Micro-SaaS';
      } else {
        oppType = productTypes[0];
      }
    } else if (buildHorizon === '7d') {
      oppType = 'Micro-SaaS';
    }

    // 2. Derive build timeline & complexity scaling from Build Horizon
    let technicalComplexity: 'Low' | 'Medium' | 'High' = 'Medium';
    let estimatedMvpBuildTime = '3–4 weeks';
    let mvpScope: string[] = [];
    let whatNotToBuild: string[] = [];

    if (buildHorizon === '7d') {
      technicalComplexity = 'Low';
      estimatedMvpBuildTime = '3–7 business days';
      mvpScope = [
        'Single-purpose webhook receiver or CLI script automating core task',
        'Direct notification via email, Slack, or SMS on task completion',
        'Minimal single-page config UI without complex dashboard nesting',
      ];
      whatNotToBuild = [
        'Custom multi-tenant user authentication or team roles',
        'In-app billing portals or subscription management (use direct Stripe links)',
        'Drag-and-drop workflow builders or visual node editors',
        'Mobile applications or complex multi-step wizards',
      ];
    } else if (buildHorizon === '2-3w') {
      technicalComplexity = 'Low';
      estimatedMvpBuildTime = '2–3 weeks';
      mvpScope = [
        'Production webhook listener with retry queue and dead-letter handling',
        'Clean, responsive dashboard to view sync logs and trigger manual reruns',
        'One-click OAuth integration with 2 primary customer platforms',
        'Basic email alerts for failures and daily execution summaries',
      ];
      whatNotToBuild = [
        'Custom report builder with PDF/CSV chart exports',
        'Enterprise Single Sign-On (SAML/Okta)',
        'Granular role-based access control (RBAC)',
      ];
    } else if (buildHorizon === '1m') {
      technicalComplexity = 'Medium';
      estimatedMvpBuildTime = '3–4 weeks';
      mvpScope = [
        'Self-serve onboarding flow with automated credential validation',
        'Persistent database state with real-time sync status monitoring',
        'Stripe Checkout subscription billing and self-serve upgrade tier',
        'Detailed audit logs and historical execution inspection view',
      ];
      whatNotToBuild = [
        'Custom API SDK generation in multiple programming languages',
        'On-premise Docker deployment appliances',
        'White-label branding for agency resellers',
      ];
    } else if (buildHorizon === '3m') {
      technicalComplexity = 'Medium';
      estimatedMvpBuildTime = '8–12 weeks';
      mvpScope = [
        'Multi-seat workspace collaboration with team member invitations',
        'Deep bidirectional integrations across top 4 enterprise platforms in domain',
        'Customizable rule triggers, thresholds, and execution conditions',
        'Comprehensive telemetry and operational performance metrics',
      ];
      whatNotToBuild = [
        'Autonomous multi-agent orchestration beyond deterministic rules',
        'Full custom ERP/CRM replacement functionality',
      ];
    } else if (buildHorizon === '6m' || buildHorizon === '12m') {
      technicalComplexity = 'High';
      estimatedMvpBuildTime = buildHorizon === '6m' ? '18–24 weeks' : '9–12 months';
      mvpScope = [
        'Enterprise-grade multi-tenant platform with SOC2 / HIPAA audit controls',
        'Public REST/GraphQL API with rate limiting and developer documentation',
        'Enterprise Single Sign-On (SAML, Okta, Azure AD) and SCIM provisioning',
        'Custom workflow automation canvas and high-throughput background processing',
      ];
      whatNotToBuild = [
        'Attempting to rebuild incumbent platform core capabilities from scratch',
        'Unverified bespoke integrations requested by only a single client',
      ];
    }

    // 3. Domain Specific Logic (Lead, Invoice, Sync, Testing, Tooling)
    let name = `${oppType}: Automated ${cluster.clusterName}`;
    let oneLiner = `Evidence-backed ${oppType.toLowerCase()} solving repetitive operational friction in ${problem.jobWorkflow.toLowerCase()}.`;
    let proposedSolution = `A dedicated ${oppType.toLowerCase()} that eliminates manual workarounds by automating the handoff between existing systems.`;
    let coreWorkflow = problem.jobWorkflow;
    let keyDependencies = ['OAuth Integration', 'Webhook Gateway', 'State Storage'];
    let majorRisks = ['Platform API rate limits or policy shifts', 'User inertia sticking with spreadsheets'];
    let monetizationPossibilities = ['$49/month SMB Tier', '$149/month Team Tier'];
    let distributionDifficulty: 'Low' | 'Medium' | 'High' = 'Medium';
    let aiRequirements = 'Structured classification and entity extraction using lightweight prompt templates';
    let dataRequirements = 'Stateless or minimal operational state storage with customer webhook secrets';
    let mainTechnicalRisks = ['Handling edge case data formats and webhook timeouts'];
    let mainBusinessRisks = ['Customer acquisition cost exceeding monthly subscription revenue'];

    const targetLabel = target.targetUser || problem.targetUser || 'Operations Teams';

    if (/lead|crm|sales/i.test(clusterName)) {
      name = oppType === 'Developer tool' ? 'LeadStream SDK: Real-time Inbound Qualification' : 'LeadPulse: Instant Inbound Qualifier';
      oneLiner = `Instantly qualifies inbound customer inquiries within 60 seconds and updates CRM records for ${targetLabel}.`;
      proposedSolution = 'A lightweight listener capturing web form payloads, executing qualification rules, dispatching personalized follow-ups, and syncing status directly to existing team tables.';
      coreWorkflow = 'Inquiry received → Qualification rubric executed → Follow-up dispatched → CRM updated & operator alerted';
      keyDependencies = ['Twilio / Resend API', 'CRM Webhook Gateway'];
      majorRisks = ['Carrier deliverability filtering', 'Competitors offering bundled features'];
      monetizationPossibilities = ['$49/mo for up to 500 leads', '$149/mo for high-volume operators'];
      distributionDifficulty = 'Low';
    } else if (/invoice|billing|accounting|payment/i.test(clusterName)) {
      name = oppType === 'Productized service' ? 'ReconcileDesk: Managed Accounts Receivable' : 'RemindFlow: Automated AR Chaser';
      oneLiner = `Eliminates manual invoice chasing and reconciliation bottlenecks for ${targetLabel}.`;
      proposedSolution = 'Monitors unpaid invoices approaching due dates, sends courteous escalating reminders across Email and SMS, and provides instant one-click payment links.';
      coreWorkflow = 'Sync invoices → Evaluate payment schedule → Dispatch smart sequence → Reconcile paid status';
      keyDependencies = ['Stripe / QuickBooks OAuth API', 'Transactional Email Gateway'];
      majorRisks = ['Accounting platform API deprecations', 'Customer reluctance to automate financial touchpoints'];
      monetizationPossibilities = ['$79/mo flat SMB tier', '0.5% recovery fee on overdue collections'];
      distributionDifficulty = 'Medium';
    } else if (/sync|sheet|spreadsheet|csv|data/i.test(clusterName)) {
      name = oppType === 'Internal tool' ? 'Internal Ops Bridge: Automated Table Reconciler' : 'TableBridge: Two-Way System Synchronizer';
      oneLiner = `Guarantees bidirectional data parity between spreadsheets and primary business software without manual CSV exports.`;
      proposedSolution = 'A zero-maintenance data pipeline that detects changes in spreadsheets or database tables and mirrors updates across both environments with rollback history.';
      coreWorkflow = 'Record edited in source → Webhook trigger fired → Schema validated → Destination updated with audit trail';
      keyDependencies = ['Google Sheets / Excel API', 'PostgreSQL / Supabase Webhooks'];
      majorRisks = ['Handling concurrent edits and merge conflict resolution', 'Large spreadsheet cell volume limits'];
      monetizationPossibilities = ['$39/mo for 10 sync pairs', '$99/mo for unlimited team syncs'];
      distributionDifficulty = 'Low';
    } else if (/dev|test|api|code|git|debug/i.test(clusterName)) {
      name = oppType === 'Developer tool' ? 'ContractMock: Automated API Contract Testing' : 'DevFlow: Frictionless Testing Runner';
      oneLiner = `Catches breaking API payload changes before deployment with automated contract mock verification.`;
      proposedSolution = 'Inspects live API traffic or OpenAPI specifications to generate resilient regression test suites and automated mock servers in CI/CD.';
      coreWorkflow = 'OpenAPI spec imported → Mock endpoints provisioned → CI test suite executed → Breaking schema alert issued';
      keyDependencies = ['GitHub Actions API', 'OpenAPI Schema Parser'];
      majorRisks = ['Developer resistance to adopting new CLI tools', 'Rapidly evolving microservice topologies'];
      monetizationPossibilities = ['Free for public repos', '$20/developer/month for private repositories'];
      distributionDifficulty = 'Low';
    }

    const mvpProfile: MvpBuildProfile = {
      complexity: technicalComplexity,
      estimatedBuildTime: estimatedMvpBuildTime,
      coreComponents: mvpScope,
      requiredIntegrations: keyDependencies,
      aiRequirements,
      dataRequirements,
      mainTechnicalRisks,
      mainBusinessRisks,
      validationDifficulty: technicalComplexity,
    };

    const evidenceQuotes = (problem.evidenceQuotes || []).map(q => ({
      quote: q.quote,
      url: q.sourceUrl,
      platform: q.platform,
      author: q.author,
    }));

    // Baseline object
    const oppId = `opp_${cluster.id}_${Math.random().toString(36).substring(2, 7)}`;
    const partialOpp: ProductOpportunity = {
      id: oppId,
      name,
      oneLineDescription: oneLiner,
      targetCustomer: targetLabel,
      userProblem: problem.problemStatement,
      evidenceSummary: `${problem.signalCount} direct user complaint(s) corroborated across ${cluster.sourceDiversity} distinct source platform(s).`,
      evidenceQuotes,
      existingAlternatives: problem.currentWorkaround || 'Manual operator intervention and spreadsheets',
      gap: gap ? gap.description : 'Incumbent platforms lack focused automation for this specific workflow step.',
      proposedSolution,
      coreWorkflow,
      whyUseful: `Replaces ${problem.whyPainful.toLowerCase()} with a predictable automated outcome, saving hours of manual toil.`,
      mvpScope,
      whatNotToBuildInitially: whatNotToBuild,
      technicalComplexity,
      estimatedMvpBuildTime,
      keyDependencies,
      majorRisks,
      monetizationPossibilities,
      distributionDifficulty,
      validationExperiment: {
        hypothesis: '',
        test: '',
        targetUsers: '',
        successSignal: '',
        invalidationSignal: '',
      },
      evidenceConfidence: problem.confidence,
      opportunityType: oppType,
      clusterId: cluster.id,
      mvpProfile,
    };

    // 4. Run Context-Adaptive Evaluation
    const evaluation = this.evaluator.evaluate(partialOpp, brief);
    partialOpp.evaluation = evaluation;

    // 5. Generate Context-Adaptive Validation Experiment
    partialOpp.validationExperiment = this.validationEngine.generateExperiment(partialOpp, brief, evaluation);

    return partialOpp;
  }
}
