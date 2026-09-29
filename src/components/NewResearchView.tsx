'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Check, 
  Info, 
  ChevronRight, 
  Layers, 
  Sliders, 
  Target, 
  Clock, 
  ShieldAlert, 
  Zap, 
  X 
} from 'lucide-react';
import { 
  ResearchRunConfig, 
  SourcePlatform, 
  ResearchObjective, 
  BuildHorizon, 
  TeamSize, 
  TechnicalCapability, 
  BudgetLevel, 
  OpportunityType, 
  EvidenceWindow, 
  ResearchDepth, 
  RiskProfile, 
  ResearchBrief,
  TargetCompanyType
} from '@/types';

interface NewResearchViewProps {
  initialConfig?: Partial<ResearchRunConfig>;
  onSubmit: (config: ResearchRunConfig) => void;
  isLoading: boolean;
}

interface BlueprintPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  topic: string;
  objective: ResearchObjective;
  intent: string;
  targetUser: string;
  targetCompany: TargetCompanyType;
  industry: string;
  buildHorizon: BuildHorizon;
  productTypes: OpportunityType[];
  teamSize: TeamSize;
  technicalCapability: TechnicalCapability;
  budget: BudgetLevel;
  evidenceWindow: EvidenceWindow;
  depth: ResearchDepth;
  priorities: string[];
  exclusions: string[];
  riskProfile: RiskProfile;
}

const BLUEPRINTS: BlueprintPreset[] = [
  {
    id: '7d_micro_saas',
    name: '7-Day Micro-SaaS',
    category: 'Rapid Builders',
    description: 'Ruthlessly scoped single-workflow tool for rapid weekend-to-week launch.',
    topic: 'Automated invoice discrepancy detection for freelancers',
    objective: 'find_micro_saas_opportunities',
    intent: 'Find tight, painful operational friction that can be solved with a single deterministic workflow shipped in under 7 days.',
    targetUser: 'Freelancers & Boutique Agency Owners',
    targetCompany: 'SMB',
    industry: 'Financial & Professional Services',
    buildHorizon: '7d',
    productTypes: ['Micro-SaaS', 'Browser extension'],
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Minimal',
    evidenceWindow: '30d',
    depth: 'standard',
    priorities: ['High pain', 'Fast validation', 'Technical simplicity'],
    exclusions: ['Hardware', 'Highly regulated workflows', 'Long enterprise sales cycles'],
    riskProfile: 'conservative',
  },
  {
    id: 'solo_technical_founder',
    name: 'Solo Technical Founder',
    category: 'Indie Hackers',
    description: 'Focused software tool designed for one builder with strong coding capability.',
    topic: 'Developer telemetry drift and configuration alerts',
    objective: 'find_software_opportunities',
    intent: 'Discover high-utility software opportunities where technical depth creates defensibility without requiring a sales team.',
    targetUser: 'DevOps Engineers & Technical Team Leads',
    targetCompany: 'Startup',
    industry: 'Developer Tools & Cloud Infrastructure',
    buildHorizon: '1m',
    productTypes: ['SaaS', 'Developer tool', 'API'],
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Low',
    evidenceWindow: '30d',
    depth: 'standard',
    priorities: ['High pain', 'Manual workflow', 'Commercial intent'],
    exclusions: ['Hardware', 'Long enterprise sales cycles', 'Mobile-first products'],
    riskProfile: 'balanced',
  },
  {
    id: 'dev_tool',
    name: 'Developer Tool Specialist',
    category: 'Technical',
    description: 'Friction solver targeting engineers, DevOps, and codebase maintenance.',
    topic: 'API contract breakage during microservice deployments',
    objective: 'find_developer_tool_opportunities',
    intent: 'Identify acute developer pain points, workflow blockers, and GitHub issue patterns.',
    targetUser: 'Backend & Platform Engineers',
    targetCompany: 'Startup',
    industry: 'Software Engineering & Cloud',
    buildHorizon: '2-3w',
    productTypes: ['Developer tool', 'API', 'Plugin'],
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Minimal',
    evidenceWindow: '90d',
    depth: 'deep',
    priorities: ['High pain', 'High frequency', 'Technical simplicity'],
    exclusions: ['Hardware', 'Mobile-first products'],
    riskProfile: 'balanced',
  },
  {
    id: 'b2b_vertical_saas',
    name: 'B2B Vertical SaaS',
    category: 'Commercial',
    description: 'Deep domain software solving industry-specific workflows.',
    topic: 'Subcontractor compliance and insurance tracking in commercial construction',
    objective: 'find_software_opportunities',
    intent: 'Uncover industry-specific operational workflows currently run on fragile spreadsheets and paper forms.',
    targetUser: 'General Contractors & Project Operations Managers',
    targetCompany: 'SMB',
    industry: 'Commercial Construction & Real Estate',
    buildHorizon: '3m',
    productTypes: ['SaaS'],
    teamSize: '2–3',
    technicalCapability: 'Full-stack developer',
    budget: 'Moderate',
    evidenceWindow: '90d',
    depth: 'deep',
    priorities: ['Existing spending', 'High ROI', 'Strong defensibility'],
    exclusions: ['Consumer utility', 'Marketplace models'],
    riskProfile: 'balanced',
  },
  {
    id: 'workflow_automation',
    name: 'Workflow Automation',
    category: 'Operational',
    description: 'Replacing manual data copy-pasting, multi-system synchronization, and human duct tape.',
    topic: 'E-commerce return processing and inventory reconciliation across Shopify and 3PL',
    objective: 'find_automation_opportunities',
    intent: 'Pinpoint manual repetitive human tasks that waste dozens of operator hours weekly.',
    targetUser: 'E-commerce Operations & Fulfillment Managers',
    targetCompany: 'SMB',
    industry: 'Retail & Supply Chain',
    buildHorizon: '2-3w',
    productTypes: ['Automation', 'Internal tool'],
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Minimal',
    evidenceWindow: '30d',
    depth: 'standard',
    priorities: ['Manual workflow', 'High time savings', 'Fast validation'],
    exclusions: ['Hardware', 'Sensitive personal data'],
    riskProfile: 'conservative',
  },
  {
    id: 'internal_tool_replacement',
    name: 'Internal Tool Replacement',
    category: 'Operational',
    description: 'Turn common bespoke custom scripts into standalone commercial utilities.',
    topic: 'Customer support dispute escalation and webhook replay tooling',
    objective: 'find_internal_tool_opportunities',
    intent: 'Identify internal tools that every company builds poorly in-house and would gladly pay to outsource.',
    targetUser: 'Support Engineers & Ops Managers',
    targetCompany: 'Startup',
    industry: 'Customer Operations',
    buildHorizon: '1m',
    productTypes: ['Internal tool', 'SaaS'],
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Moderate',
    evidenceWindow: '90d',
    depth: 'standard',
    priorities: ['Manual workflow', 'High pain', 'Short sales cycle'],
    exclusions: ['High acquisition cost'],
    riskProfile: 'balanced',
  },
  {
    id: 'productized_service',
    name: 'Productized Agency Service',
    category: 'Services',
    description: 'High-touch repeatable service packaged with proprietary software.',
    topic: 'B2B cold outreach email deliverability and mailbox warm-up auditing',
    objective: 'find_productized_service_opportunities',
    intent: 'Discover services that can start immediately with manual fulfillment and transition into software.',
    targetUser: 'Agency Founders & Growth Marketers',
    targetCompany: 'Agency',
    industry: 'Marketing & Sales Operations',
    buildHorizon: '7d',
    productTypes: ['Productized service', 'Service + software'],
    teamSize: '2–3',
    technicalCapability: 'General developer',
    budget: 'Low',
    evidenceWindow: '30d',
    depth: 'quick',
    priorities: ['Fast validation', 'High ROI', 'Short sales cycle'],
    exclusions: ['Heavy infrastructure', 'Long enterprise sales cycles'],
    riskProfile: 'conservative',
  },
  {
    id: 'market_exploration',
    name: 'Market Exploration & Landscape',
    category: 'Strategic',
    description: 'Broad exploratory scan across an entire sector to map friction clusters.',
    topic: 'Healthcare clinic patient intake and insurance pre-authorization friction',
    objective: 'explore_market',
    intent: 'Survey ecosystem friction without pre-committing to any single software solution or architecture.',
    targetUser: 'Clinic Administrators & Practice Managers',
    targetCompany: 'SMB',
    industry: 'Healthcare & Ambulatory Care',
    buildHorizon: '3m',
    productTypes: ['Any'],
    teamSize: '2–3',
    technicalCapability: 'Full-stack developer',
    budget: 'Moderate',
    evidenceWindow: '1y',
    depth: 'deep',
    priorities: ['Large market', 'Strong differentiation'],
    exclusions: [],
    riskProfile: 'balanced',
  },
  {
    id: 'competitive_gap',
    name: 'Competitive Gap Finder',
    category: 'Strategic',
    description: 'Analyze incumbent complaints, bloated pricing, and underserved customer segments.',
    topic: 'User churn and feature complaints about Jira for non-technical teams',
    objective: 'analyze_competitor_gaps',
    intent: 'Find concrete user complaints about incumbent solutions to identify wedge entry vectors.',
    targetUser: 'Marketing & Operations Teams',
    targetCompany: 'SMB',
    industry: 'Project & Work Management',
    buildHorizon: '1m',
    productTypes: ['SaaS', 'Micro-SaaS'],
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Low',
    evidenceWindow: '90d',
    depth: 'deep',
    priorities: ['Low competition', 'Strong differentiation', 'Existing workaround'],
    exclusions: [],
    riskProfile: 'balanced',
  },
  {
    id: 'idea_validation',
    name: 'Idea Validation Check',
    category: 'Validation',
    description: 'Confront an existing idea with real practitioner discussions and workarounds.',
    topic: 'Automated meeting action item tracking and CRM syncing',
    objective: 'validate_existing_idea',
    intent: 'Check whether real operators actually complain about this or if existing tools already solve it sufficiently.',
    targetUser: 'Account Executives & Sales Managers',
    targetCompany: 'SMB',
    industry: 'Sales Tech & Productivity',
    buildHorizon: '7d',
    productTypes: ['SaaS'],
    teamSize: 'Solo',
    technicalCapability: 'Full-stack developer',
    budget: 'Minimal',
    evidenceWindow: '90d',
    depth: 'exhaustive',
    priorities: ['Fast validation', 'Commercial intent', 'High pain'],
    exclusions: [],
    riskProfile: 'conservative',
  },
  {
    id: '90d_venture_startup',
    name: '90-Day Venture Startup',
    category: 'Venture',
    description: 'Commercial-grade platform opportunity with defensibility and expansion potential.',
    topic: 'Security compliance and access audit automation for SOC2 Type II in fintech startups',
    objective: 'find_software_opportunities',
    intent: 'Identify scalable software opportunities capable of raising capital and reaching $1M+ ARR.',
    targetUser: 'CTOs & Head of Security',
    targetCompany: 'Startup',
    industry: 'Cybersecurity & Governance',
    buildHorizon: '3m',
    productTypes: ['SaaS', 'AI software'],
    teamSize: '2–3',
    technicalCapability: 'AI / ML',
    budget: 'Moderate',
    evidenceWindow: '1y',
    depth: 'deep',
    priorities: ['Large market', 'Strong defensibility', 'High ROI'],
    exclusions: ['Hardware', 'Consumer utility'],
    riskProfile: 'aggressive',
  },
  {
    id: 'enterprise_software',
    name: 'Enterprise Software Opportunity',
    category: 'Enterprise',
    description: 'High-ACV software for large organizational friction and complex compliance.',
    topic: 'Multi-cloud egress cost anomaly detection and automated tiering',
    objective: 'find_software_opportunities',
    intent: 'Address high-budget enterprise challenges requiring deep integration, auditability, and security.',
    targetUser: 'Cloud Infrastructure Directors & FinOps Leads',
    targetCompany: 'Enterprise',
    industry: 'Enterprise Infrastructure & Cloud',
    buildHorizon: '6m',
    productTypes: ['Enterprise software', 'Infrastructure'],
    teamSize: '4–10',
    technicalCapability: 'Specialist team',
    budget: 'High',
    evidenceWindow: '1y',
    depth: 'exhaustive',
    priorities: ['Strong defensibility', 'High ROI', 'Large market'],
    exclusions: ['Consumer utility', 'Mobile-first products'],
    riskProfile: 'aggressive',
  },
];

const OBJECTIVES: Array<{ id: ResearchObjective; title: string; category: string }> = [
  { id: 'find_product_opportunities', title: 'Find Product Opportunities (General)', category: 'General' },
  { id: 'find_software_opportunities', title: 'Find Software Opportunities', category: 'Software' },
  { id: 'find_micro_saas_opportunities', title: 'Find Micro-SaaS Opportunities', category: 'Software' },
  { id: 'find_ai_opportunities', title: 'Find AI Software Opportunities', category: 'AI & Data' },
  { id: 'find_automation_opportunities', title: 'Find Workflow Automations', category: 'Automation' },
  { id: 'find_internal_tool_opportunities', title: 'Find Internal Tool Opportunities', category: 'Internal' },
  { id: 'find_developer_tool_opportunities', title: 'Find Developer Tools', category: 'Developer' },
  { id: 'find_productized_service_opportunities', title: 'Find Productized Services', category: 'Services' },
  { id: 'find_customer_problems', title: 'Find Customer Problems & Complaints', category: 'Discovery' },
  { id: 'explore_market', title: 'Explore Market Domain', category: 'Exploration' },
  { id: 'explore_industry', title: 'Explore Industry Sector', category: 'Exploration' },
  { id: 'explore_customer_segment', title: 'Explore Customer Segment', category: 'Exploration' },
  { id: 'analyze_competitor_gaps', title: 'Analyze Competitor Gaps & Weaknesses', category: 'Competitive' },
  { id: 'validate_existing_idea', title: 'Validate Existing Product Idea', category: 'Validation' },
  { id: 'find_product_expansion_opportunities', title: 'Find Product Expansion Opportunities', category: 'Expansion' },
  { id: 'find_adjacent_opportunities', title: 'Find Adjacent Market Opportunities', category: 'Expansion' },
  { id: 'research_workflow', title: 'Deep Workflow Research', category: 'Workflow' },
];

const ALL_PRODUCT_TYPES: OpportunityType[] = [
  'Micro-SaaS',
  'SaaS',
  'AI software',
  'Automation',
  'Internal tool',
  'Developer tool',
  'API',
  'Plugin',
  'Browser extension',
  'Data product',
  'Productized service',
  'Enterprise software',
];

const ALL_PRIORITIES = [
  'High pain',
  'High frequency',
  'Manual workflow',
  'Existing workaround',
  'Existing spending',
  'Commercial intent',
  'Fast validation',
  'Easy distribution',
  'Large market',
  'Low competition',
  'Strong differentiation',
  'Technical simplicity',
  'Strong defensibility',
  'High time savings',
  'High ROI',
];

const ALL_EXCLUSIONS = [
  'Hardware',
  'Highly regulated workflows',
  'Sensitive personal data',
  'Medical data',
  'Payment-card data',
  'Heavy infrastructure',
  'Long enterprise sales cycles',
  'High acquisition cost',
  'Mobile-first products',
  'Marketplace models',
];

export const NewResearchView: React.FC<NewResearchViewProps> = ({
  initialConfig,
  onSubmit,
  isLoading,
}) => {
  // Preset Modal
  const [showBlueprints, setShowBlueprints] = useState(false);

  // Section 01: Objective & Subject
  const [objective, setObjective] = useState<ResearchObjective>(
    initialConfig?.brief?.objective || 'find_product_opportunities'
  );
  const [topic, setTopic] = useState(initialConfig?.topic || initialConfig?.brief?.subject || '');
  const [intent, setIntent] = useState(initialConfig?.brief?.intent || initialConfig?.focus || '');

  // Section 02: Target Definition
  const [targetUser, setTargetUser] = useState(
    initialConfig?.brief?.target.primaryUser || initialConfig?.targetUser || ''
  );
  const [targetCompany, setTargetCompany] = useState<TargetCompanyType>(
    initialConfig?.brief?.target.targetCompany || 'SMB'
  );
  const [industry, setIndustry] = useState(
    initialConfig?.brief?.target.industry || initialConfig?.industry || ''
  );
  const [geography, setGeography] = useState(
    initialConfig?.brief?.target.geography || initialConfig?.geography || 'Global'
  );
  const [workflow, setWorkflow] = useState(
    initialConfig?.brief?.target.workflow || ''
  );

  // Section 03: Opportunity & Resource Profile
  const [productTypes, setProductTypes] = useState<OpportunityType[]>(
    initialConfig?.brief?.opportunityProfile.productTypes || ['SaaS', 'Micro-SaaS']
  );
  const [buildHorizon, setBuildHorizon] = useState<BuildHorizon>(
    initialConfig?.brief?.opportunityProfile.buildHorizon || '1m'
  );
  const [teamSize, setTeamSize] = useState<TeamSize>(
    initialConfig?.brief?.opportunityProfile.teamSize || 'Solo'
  );
  const [technicalCapability, setTechnicalCapability] = useState<TechnicalCapability>(
    initialConfig?.brief?.opportunityProfile.technicalCapability || 'Full-stack developer'
  );
  const [budget, setBudget] = useState<BudgetLevel>(
    initialConfig?.brief?.opportunityProfile.budget || 'Moderate'
  );
  const [existingAdvantages, setExistingAdvantages] = useState<string[]>(
    initialConfig?.brief?.opportunityProfile.existingAdvantages || ['Domain expertise']
  );

  // Section 04: Research Configuration (Evidence Window != Build Horizon)
  const [evidenceWindow, setEvidenceWindow] = useState<EvidenceWindow>(
    (initialConfig?.brief?.researchConfiguration.evidenceWindow as any) || initialConfig?.timeframe || '30d'
  );
  const [depth, setDepth] = useState<ResearchDepth>(
    initialConfig?.brief?.researchConfiguration.depth || 'standard'
  );
  const [maxSources, setMaxSources] = useState<number>(
    initialConfig?.brief?.researchConfiguration.maxSources || initialConfig?.maxSources || 30
  );
  const [enabledSources, setEnabledSources] = useState<SourcePlatform[]>(
    initialConfig?.brief?.researchConfiguration.sources ||
    initialConfig?.enabledSources || ['reddit', 'hacker_news', 'github', 'devto', 'web']
  );

  // Section 05: Priorities & Constraints
  const [priorities, setPriorities] = useState<string[]>(
    initialConfig?.brief?.constraints.priorities || ['High pain', 'Manual workflow', 'Commercial intent']
  );
  const [exclusions, setExclusions] = useState<string[]>(
    initialConfig?.brief?.constraints.exclusions || []
  );
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(
    initialConfig?.brief?.constraints.riskProfile || 'balanced'
  );

  const applyBlueprint = (bp: BlueprintPreset) => {
    setObjective(bp.objective);
    setTopic(bp.topic);
    setIntent(bp.intent);
    setTargetUser(bp.targetUser);
    setTargetCompany(bp.targetCompany);
    setIndustry(bp.industry);
    setBuildHorizon(bp.buildHorizon);
    setProductTypes(bp.productTypes);
    setTeamSize(bp.teamSize);
    setTechnicalCapability(bp.technicalCapability);
    setBudget(bp.budget);
    setEvidenceWindow(bp.evidenceWindow);
    setDepth(bp.depth);
    setPriorities(bp.priorities);
    setExclusions(bp.exclusions);
    setRiskProfile(bp.riskProfile);
    setShowBlueprints(false);
  };

  const toggleSource = (platform: SourcePlatform) => {
    if (enabledSources.includes(platform)) {
      if (enabledSources.length === 1) return;
      setEnabledSources(enabledSources.filter(p => p !== platform));
    } else {
      setEnabledSources([...enabledSources, platform]);
    }
  };

  const toggleProductType = (t: OpportunityType) => {
    if (productTypes.includes(t)) {
      if (productTypes.length === 1) return;
      setProductTypes(productTypes.filter(x => x !== t));
    } else {
      setProductTypes([...productTypes, t]);
    }
  };

  const togglePriority = (p: string) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter(x => x !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const toggleExclusion = (e: string) => {
    if (exclusions.includes(e)) {
      setExclusions(exclusions.filter(x => x !== e));
    } else {
      setExclusions([...exclusions, e]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const brief: ResearchBrief = {
      objective,
      subject: topic.trim(),
      intent: intent.trim() || undefined,
      target: {
        primaryUser: targetUser.trim() || undefined,
        targetCompany,
        companySize: '11–50',
        industry: industry.trim() || undefined,
        geography: geography.trim() || undefined,
        workflow: workflow.trim() || undefined,
      },
      opportunityProfile: {
        productTypes,
        buildHorizon,
        teamSize,
        technicalCapability,
        budget,
        existingAdvantages,
        distributionAccess: 'Community',
      },
      researchConfiguration: {
        evidenceWindow,
        depth,
        sources: enabledSources,
        maxSources,
      },
      constraints: {
        priorities,
        exclusions,
        riskProfile,
      },
    };

    onSubmit({
      topic: topic.trim(),
      timeframe: (evidenceWindow === 'all' ? 'all' : (evidenceWindow === '1y' || evidenceWindow === '2y' ? '1y' : evidenceWindow)) as any,
      maxSources,
      focus: intent.trim() || workflow.trim() || `Workflow inefficiencies in ${topic.trim()}`,
      targetUser: targetUser.trim() || undefined,
      geography: geography.trim() || undefined,
      industry: industry.trim() || undefined,
      enabledSources,
      brief,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in text-zinc-100">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-md">
              General Opportunity Intelligence v2.0
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
            Configure Research Brief
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            ProductScout separates universal evidence discovery from your contextual decision parameters. Configure your objective, target, resources, and horizon below.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBlueprints(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span>Apply Discovery Blueprint</span>
        </button>
      </div>

      {/* Blueprint Selector Modal */}
      {showBlueprints && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Select a Discovery Blueprint</h3>
                <p className="text-xs text-zinc-400">12 curated starting archetypes matching real-world builder profiles.</p>
              </div>
              <button 
                onClick={() => setShowBlueprints(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-zinc-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {BLUEPRINTS.map((bp) => (
                  <div
                    key={bp.id}
                    onClick={() => applyBlueprint(bp)}
                    className="p-3.5 rounded-lg border border-zinc-800 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900 cursor-pointer transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white group-hover:text-zinc-200">
                        {bp.name}
                      </span>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                        {bp.buildHorizon}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                      {bp.description}
                    </p>
                    <div className="mt-2.5 flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500">
                      <span>{bp.teamSize}</span>
                      <span>•</span>
                      <span>{bp.productTypes[0]}</span>
                      <span>•</span>
                      <span>{bp.depth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 01: OBJECTIVE & INTENT */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px]">
              01
            </span>
            <span className="font-semibold text-zinc-200">Research Objective & Subject</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Research Objective <span className="text-zinc-500">*</span>
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
              >
                {OBJECTIVES.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    [{obj.category}] {obj.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Research Subject / Domain <span className="text-zinc-500">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder='e.g., "AI invoice discrepancy detection for freelancers"'
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Specific User Intent & Investigation Context
            </label>
            <textarea
              rows={2}
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="e.g., Discover recurring operational complaints about manual reconciliations that could form a tight 7-day micro-SaaS or browser extension."
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        {/* SECTION 02: TARGET DEFINITION */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px]">
              02
            </span>
            <span className="font-semibold text-zinc-200">Target Customer & Operational Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Primary User Role
              </label>
              <input
                type="text"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                placeholder="e.g., Agency owners, Devs"
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Target Company Type
              </label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="Individual">Individual / Solo</option>
                <option value="Freelancer">Freelancer / Creator</option>
                <option value="Startup">Early-Stage Startup</option>
                <option value="SMB">Small & Medium Business (SMB)</option>
                <option value="Mid-market">Mid-market Organization</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Agency">Agency / Service Firm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Industry / Vertical
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Fintech, Healthcare, Dev Tools"
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Geography
              </label>
              <input
                type="text"
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                placeholder="e.g., Global, North America, EU"
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Friction Workflow / Job-To-Be-Done
              </label>
              <input
                type="text"
                value={workflow}
                onChange={(e) => setWorkflow(e.target.value)}
                placeholder="e.g., Invoice reconciliation, onboarding approval"
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 03: OPPORTUNITY & RESOURCE PROFILE */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 sm:p-6 space-y-5">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px]">
              03
            </span>
            <span className="font-semibold text-zinc-200">Opportunity & Resource Profile</span>
          </div>

          {/* Build Horizon Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Target Build Horizon</span>
              <span className="text-[11px] font-mono text-zinc-400">
                Calibrates opportunity feasibility & scope pruning
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {[
                { id: '7d' as const, label: '7 Days', desc: 'Weekend / Micro' },
                { id: '2-3w' as const, label: '2–3 Weeks', desc: 'Rapid MVP' },
                { id: '1m' as const, label: '1 Month', desc: 'Dedicated MVP' },
                { id: '3m' as const, label: '3 Months', desc: '90-Day Startup' },
                { id: '6m' as const, label: '6 Months', desc: 'Venture Plan' },
                { id: '12m' as const, label: '12 Months', desc: 'Thesis Platform' },
              ].map((h) => {
                const active = buildHorizon === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setBuildHorizon(h.id)}
                    className={`p-2.5 rounded-md border text-center transition-all ${
                      active
                        ? 'bg-white text-black border-white font-semibold shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-xs">{h.label}</div>
                    <div className={`text-[10px] ${active ? 'text-zinc-700' : 'text-zinc-500'}`}>
                      {h.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Opportunity Types */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Candidate Product Types (Multi-Select)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PRODUCT_TYPES.map((t) => {
                const active = productTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleProductType(t)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 border-white font-medium'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Builder Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-900">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Team Size
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="Solo">Solo Founder / Builder</option>
                <option value="2–3">Small Team (2–3)</option>
                <option value="4–10">Core Team (4–10)</option>
                <option value="10+">Scaleup (10+)</option>
                <option value="Existing engineering organization">Enterprise Org</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Technical Capability
              </label>
              <select
                value={technicalCapability}
                onChange={(e) => setTechnicalCapability(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="Full-stack developer">Full-Stack Engineer</option>
                <option value="AI / ML">AI / Machine Learning Specialist</option>
                <option value="General developer">General Developer</option>
                <option value="Non-technical">Non-Technical / Operator</option>
                <option value="Data engineering">Data Engineer</option>
                <option value="Specialist team">Specialist Multi-Disciplinary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Available Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="Minimal">Minimal (&lt; $500)</option>
                <option value="Low">Low ($500 – $2,500)</option>
                <option value="Moderate">Moderate ($2,500 – $15,000)</option>
                <option value="High">High ($15,000 – $50,000)</option>
                <option value="Enterprise">Enterprise ($50,000+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 04: RESEARCH CONFIGURATION */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px]">
              04
            </span>
            <span className="font-semibold text-zinc-200">Universal Evidence Discovery Setup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span>Evidence Window</span>
                <span className="text-[10px] text-zinc-500 font-mono">Search range</span>
              </label>
              <select
                value={evidenceWindow}
                onChange={(e) => setEvidenceWindow(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="7d">Past 7 days (Breaking discussions)</option>
                <option value="30d">Past 30 days (Recommended)</option>
                <option value="90d">Past 90 days (Quarterly patterns)</option>
                <option value="6m">Past 6 months</option>
                <option value="1y">Past 1 year</option>
                <option value="all">All time (Archive scan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span>Investigation Depth</span>
                <span className="text-[10px] text-zinc-500 font-mono">Rigor</span>
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="quick">Quick (Rapid signal pulse)</option>
                <option value="standard">Standard (Balanced coverage)</option>
                <option value="deep">Deep (Comprehensive clustering)</option>
                <option value="exhaustive">Exhaustive (Full verification)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span>Max Signal Limit</span>
                <span className="text-white font-mono text-xs">{maxSources} sources</span>
              </label>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={maxSources}
                onChange={(e) => setMaxSources(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white mt-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Public Discussion Channels
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'reddit' as const, label: 'Reddit', desc: 'Operator rants & threads' },
                { id: 'hacker_news' as const, label: 'Hacker News', desc: 'Ask HN & discussions' },
                { id: 'github' as const, label: 'GitHub Issues', desc: 'Technical blockers' },
                { id: 'devto' as const, label: 'Dev.to / Forums', desc: 'Workflow complaints' },
                { id: 'web' as const, label: 'Web Reviews', desc: 'G2 / Capterra feedback' },
              ].map((s) => {
                const active = enabledSources.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSource(s.id)}
                    className={`p-2.5 rounded-md border text-left transition-all ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 border-white font-medium'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{s.label}</span>
                      {active && <Check className="w-3.5 h-3.5 text-zinc-950" />}
                    </div>
                    <div className={`text-[10px] mt-0.5 truncate ${active ? 'text-zinc-700' : 'text-zinc-500'}`}>
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 05: PRIORITIES & CONSTRAINTS */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px]">
              05
            </span>
            <span className="font-semibold text-zinc-200">Priorities, Exclusions & Risk Profile</span>
          </div>

          {/* User Priorities */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Strategic Priorities (What makes an opportunity attractive to you)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PRIORITIES.map((p) => {
                const active = priorities.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePriority(p)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all ${
                      active
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-700 font-medium'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strict Exclusions */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Strict Exclusions (Disqualify opportunities with these traits)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_EXCLUSIONS.map((ex) => {
                const active = exclusions.includes(ex);
                return (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => toggleExclusion(ex)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-all ${
                      active
                        ? 'bg-red-950 text-red-200 border-red-800 font-medium'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    ⛔ {ex}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk Profile */}
          <div className="pt-2 border-t border-zinc-900">
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Risk Tolerance Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'conservative' as const, label: 'Conservative', desc: 'Proven demand, low technical risk' },
                { id: 'balanced' as const, label: 'Balanced', desc: 'Calculated innovation with validation' },
                { id: 'aggressive' as const, label: 'Aggressive', desc: 'High upside, venture scale, novel space' },
              ].map((r) => {
                const active = riskProfile === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRiskProfile(r.id)}
                    className={`p-2.5 rounded-md border text-center transition-all ${
                      active
                        ? 'bg-white text-black border-white font-medium shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs">{r.label}</div>
                    <div className={`text-[10px] mt-0.5 ${active ? 'text-zinc-700' : 'text-zinc-500'}`}>
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Info className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>
              Real user signals are collected bottom-up and evaluated strictly against your brief.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-md text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 shadow-md ${
              isLoading || !topic.trim() ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Executing Discovery Engine...' : 'Run Opportunity Intelligence'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
