import { 
  ResearchRun, 
  ResearchBrief, 
  AdaptiveOutputType, 
  ProductOpportunity, 
  ExtractedProblem, 
  ProblemCluster, 
  MarketGap, 
  ExistingSolution 
} from '@/types';
import { normalizeBrief } from './opportunityGenerator';

export function resolveAdaptiveOutputType(brief?: ResearchBrief): AdaptiveOutputType {
  if (!brief) return 'product_plan_90d';
  
  const obj = brief.objective;
  const horizon = brief.opportunityProfile?.buildHorizon;
  const types = brief.opportunityProfile?.productTypes || [];

  if (obj === 'validate_existing_idea') {
    return 'validation_report';
  }
  if (
    obj === 'explore_market' || 
    obj === 'explore_industry' || 
    obj === 'explore_customer_segment' || 
    obj === 'analyze_competitor_gaps'
  ) {
    return 'market_landscape';
  }
  if (obj === 'find_automation_opportunities' || types.includes('Automation')) {
    return 'automation_brief';
  }

  // Horizon-based mapping
  if (horizon === '7d') return 'builder_brief_7d';
  if (horizon === '2-3w') return 'rapid_mvp_2_3w';
  if (horizon === '1m') return 'product_brief_30d';
  if (horizon === '3m') return 'product_plan_90d';
  if (horizon === '6m') return 'venture_plan_6m';
  if (horizon === '12m') return 'thesis_12m';

  return 'product_plan_90d';
}

export class ReportGenerator {
  /**
   * Generates the tailored, context-adaptive execution document based on the run's brief.
   */
  public generateAdaptiveBrief(run: ResearchRun, overrideType?: AdaptiveOutputType): string {
    const brief = run.brief || normalizeBrief(run.config);
    const outputType = overrideType || run.adaptiveOutputType || resolveAdaptiveOutputType(brief);

    switch (outputType) {
      case 'builder_brief_7d':
        return this.generate7DayBuilderBrief(run, brief);
      case 'rapid_mvp_2_3w':
        return this.generateRapidMvpBrief(run, brief);
      case 'product_brief_30d':
        return this.generate30DayProductBrief(run, brief);
      case 'product_plan_90d':
        return this.generate90DayProductPlan(run, brief);
      case 'venture_plan_6m':
        return this.generate6MonthVenturePlan(run, brief);
      case 'thesis_12m':
        return this.generate12MonthThesis(run, brief);
      case 'market_landscape':
        return this.generateMarketLandscape(run, brief);
      case 'validation_report':
        return this.generateValidationReport(run, brief);
      case 'automation_brief':
        return this.generateAutomationBrief(run, brief);
      default:
        return this.generate90DayProductPlan(run, brief);
    }
  }

  /**
   * Generates the comprehensive full markdown report containing research coverage,
   * problem extractions, clusters, solution gaps, evaluated opportunities, and the adaptive brief.
   */
  public generateMarkdownReport(run: ResearchRun): string {
    const brief = run.brief || normalizeBrief(run.config);
    const outputType = run.adaptiveOutputType || resolveAdaptiveOutputType(brief);
    const { coverage, problems, clusters, existingSolutions, gaps, opportunities, weakSignals, classifiedEvidence } = run;

    const lines: string[] = [];

    lines.push(`# ProductScout: General Opportunity Intelligence Report`);
    lines.push(`**Tagline**: *Discovers real problems and identifies software products worth building.*`);
    lines.push(``);
    lines.push(`- **Research Subject**: "${brief.subject}"`);
    lines.push(`- **Objective**: \`${brief.objective}\``);
    lines.push(`- **Build Horizon**: **${brief.opportunityProfile.buildHorizon}** | **Evidence Window**: ${brief.researchConfiguration.evidenceWindow}`);
    lines.push(`- **Target Profile**: ${brief.target.primaryUser || run.config.targetUser || 'Operators'} (${brief.target.targetCompany || 'SMB/Mid-Market'}, ${brief.target.industry || 'Technology & Services'})`);
    lines.push(`- **Adaptive Output Document**: \`${this.getOutputDocumentTitle(outputType)}\``);
    lines.push(`- **Date Generated**: ${new Date(run.createdAt).toLocaleString()}`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // 1. Executive Summary
    lines.push(`## 1. Executive Summary`);
    lines.push(`ProductScout investigated authentic practitioner signals across public developer and operator communities to uncover verified problems and software opportunities in **"${brief.subject}"**.`);
    lines.push(`- **Evaluated Signals**: ${coverage.sourcesCollectedCount} raw posts & discussions across ${coverage.sourcesSucceeded.length} active platforms.`);
    lines.push(`- **Verified Core Problems**: ${problems.length} distinct recurring friction points.`);
    lines.push(`- **Workflow Clusters**: ${clusters.length} functional clusters identified.`);
    lines.push(`- **Identified Gaps**: ${gaps.length} market & operational gaps documented.`);
    lines.push(`- **Formulated Opportunities**: ${opportunities.length} opportunities evaluated against user constraints & resource profile.`);
    lines.push(`- **Weak / Unverified Signals**: ${weakSignals.length} routed to observation.`);
    lines.push(``);

    // 2. Adaptive Execution Document
    lines.push(`---`);
    lines.push(``);
    lines.push(`## 2. Adaptive Execution Document: ${this.getOutputDocumentTitle(outputType)}`);
    lines.push(this.generateAdaptiveBrief(run, outputType));
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // 3. Research Coverage & Evidence Quality
    lines.push(`## 3. Research Coverage & Signal Authenticity`);
    lines.push(`- **Platforms Searched**: ${coverage.sourcesSearched.join(', ') || 'Reddit, Hacker News, GitHub, Dev.to, Web'}`);
    lines.push(`- **Active Ingestion Sources**: ${coverage.sourcesSucceeded.join(', ')}`);
    if (coverage.sourcesUnavailable.length > 0) {
      lines.push(`- **Unavailable / Limited Sources**:`);
      coverage.sourcesUnavailable.forEach(u => lines.push(`  - *${u.platform}*: ${u.reason}`));
    }
    lines.push(`- **Evidence Quality Breakdown**:`);
    lines.push(`  - **High Quality** (Direct first-hand operator complaints): ${coverage.qualityDistribution.high}`);
    lines.push(`  - **Medium Quality** (Community discussions & inquiries): ${coverage.qualityDistribution.medium}`);
    lines.push(`  - **Low / Penalized** (Generic or vendor marketing): ${coverage.qualityDistribution.low}`);
    lines.push(``);

    // 4. Evidence Landscape
    lines.push(`## 4. Key Representative User Evidence`);
    classifiedEvidence.slice(0, 5).forEach((ev) => {
      lines.push(`> "${ev.painQuote || ev.snippet}"`);
      lines.push(`> — **${ev.author || 'Practitioner'}** on [${ev.platform.toUpperCase()}: ${ev.title}](${ev.url}) *(Quality: ${ev.quality}, Confidence: ${ev.qualityScore}/100)*`);
      lines.push(``);
    });

    // 5. Problems & Workflows
    lines.push(`## 5. Top Verified Recurring Problems`);
    problems.forEach((p, idx) => {
      lines.push(`### Problem ${idx + 1}: ${p.problemStatement}`);
      lines.push(`- **Target User**: ${p.targetUser}`);
      lines.push(`- **Workflow Context**: ${p.jobWorkflow}`);
      lines.push(`- **Why Painful**: ${p.whyPainful}`);
      lines.push(`- **Current Workaround**: ${p.currentWorkaround}`);
      lines.push(`- **Recurrence Frequency**: ${p.frequency}`);
      lines.push(`- **Signal Multiplicity**: ${p.signalCount} independent sources (Confidence: ${p.confidence}%)`);
      lines.push(`- **Direct User Evidence Quotes**:`);
      p.evidenceQuotes.forEach(q => {
        lines.push(`  - *"${q.quote}"* — [${q.platform.toUpperCase()}](${q.sourceUrl})`);
      });
      lines.push(``);
    });

    // 6. Problem Clusters
    lines.push(`## 6. Functional Problem Clusters`);
    clusters.forEach(c => {
      lines.push(`### Cluster: ${c.clusterName}`);
      lines.push(`- **Included Problems**: ${c.problemIds.length} sub-problems`);
      lines.push(`- **Signal Diversity**: ${c.signalCount} signals across ${c.sourceDiversity} platforms`);
      lines.push(`- **Affected Segment**: ${c.commonAffectedUsers}`);
      lines.push(`- **Common Workflow**: ${c.commonWorkflow}`);
      lines.push(`- **Overall Evidence Strength**: **${c.overallEvidenceStrength}**`);
      lines.push(``);
    });

    // 7. Existing Solutions & Workarounds
    lines.push(`## 7. Incumbent Solutions & Workarounds`);
    existingSolutions.forEach(sol => {
      lines.push(`### ${sol.name} (${sol.type.replace('_', ' ').toUpperCase()})`);
      lines.push(`- **What Users Currently Do**: ${sol.whatUsersDo}`);
      lines.push(`- **Praised Features**: ${sol.positiveAspects.join(', ') || 'Basic utility'}`);
      lines.push(`- **Reported Friction Points**: ${sol.complaints.join('; ')}`);
      lines.push(`- **Missing Functionality**: ${sol.missingFunctionality.join('; ')}`);
      if (sol.pricingInfo) lines.push(`- **Pricing Context**: ${sol.pricingInfo}`);
      lines.push(`- **Underserved Segments**: ${sol.unservedSegments}`);
      lines.push(``);
    });

    // 8. Market Gaps
    lines.push(`## 8. Evidence-Backed Market Gaps`);
    gaps.forEach((gap, idx) => {
      lines.push(`### Gap ${idx + 1}: ${gap.title}`);
      lines.push(`- **Gap Type**: \`${gap.gapType}\``);
      lines.push(`- **Classification**: ${gap.isAiInference ? '⚠️ **[AI Inference / Market Observation]**' : '✅ **[Direct Evidence-Backed]**'}`);
      lines.push(`- **Description**: ${gap.description}`);
      if (gap.supportingQuotes.length > 0) {
        lines.push(`- **Supporting Practitioner Quotes**:`);
        gap.supportingQuotes.forEach(q => lines.push(`  - *"${q}"*`));
      }
      lines.push(``);
    });

    // 9. Formulated Opportunities & Contextual Fit
    lines.push(`## 9. Formulated Product Opportunities`);
    opportunities.forEach((opp, idx) => {
      const evalData = opp.evaluation;
      lines.push(`### Opportunity ${idx + 1}: ${opp.name} [Type: ${opp.opportunityType}]`);
      lines.push(`*${opp.oneLineDescription}*`);
      lines.push(``);
      if (evalData) {
        lines.push(`**Contextual Fit Score**: **${evalData.contextualFitScore}/100** | **Recommended Action**: \`${evalData.recommendedAction}\``);
        lines.push(`- **Feasibility Fit**: ${evalData.feasibilityFit.score}/100 — ${evalData.feasibilityFit.rationale}`);
        lines.push(`- **Strategic Fit**: ${evalData.strategicFit.score}/100 — ${evalData.strategicFit.rationale}`);
        lines.push(`- **Commercial Viability**: ${evalData.commercialViability.score}/100 (Est. Price: ${evalData.commercialViability.estimatedPricePoint}, Cycle: ${evalData.commercialViability.salesCycle})`);
        lines.push(`- **Critical Uncertainties**: ${evalData.criticalUncertainties.join('; ') || 'None flagged'}`);
        lines.push(``);
      }
      lines.push(`- **Target Customer**: ${opp.targetCustomer}`);
      lines.push(`- **Problem Addressed**: ${opp.userProblem}`);
      lines.push(`- **Proposed Solution**: ${opp.proposedSolution}`);
      lines.push(`- **Core Workflow**: ${opp.coreWorkflow}`);
      lines.push(`- **Technical Complexity**: ${opp.technicalComplexity} | **Est. Build Time**: ${opp.estimatedMvpBuildTime}`);
      lines.push(`- **Monetization**: ${opp.monetizationPossibilities.join(', ')}`);
      lines.push(`- **Evidence Confidence**: **${opp.evidenceConfidence}%**`);
      lines.push(``);
    });

    // 10. Insufficient Evidence / Weak Signals
    lines.push(`## 10. Weak Signals & Unverified Trends`);
    if (weakSignals.length === 0) {
      lines.push(`All discovered signals met verification thresholds.`);
    } else {
      weakSignals.forEach(ws => {
        lines.push(`- **${ws.title}** ([${ws.platform}](${ws.sourceUrl}))`);
        lines.push(`  - User Statement: *"${ws.userStatement}"*`);
        lines.push(`  - Why Insufficient: ${ws.whyInsufficient}`);
        lines.push(`  - Potential Value: ${ws.potentialValue}`);
      });
    }
    lines.push(``);

    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // INDIVIDUAL ADAPTIVE DOCUMENT GENERATORS
  // --------------------------------------------------------------------------

  private generate7DayBuilderBrief(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities[0] || this.fallbackOpp(brief);
    const exp = opp.validationExperiment;
    const evalData = opp.evaluation;

    return `
### 7-Day Builder Brief: ${opp.name}
**Primary User**: ${opp.targetCustomer}  
**One Core Problem**: ${opp.userProblem}  
**Target Product Type**: ${opp.opportunityType} | **Contextual Fit**: ${evalData?.contextualFitScore ?? 85}/100

#### 1. Core Workflow to Solve
${opp.coreWorkflow}

#### 2. The 7-Day Scope (Strict Single-Workflow MVP)
- [x] Single input trigger (e.g. paste URL, upload single file, or one webhook)
- [x] Deterministic execution engine solving the central friction point
- [x] Immediate actionable output with copy/download capability
- [x] Static pricing/stripe checkout link (no dynamic self-serve billing tiers)
${opp.mvpScope.slice(0, 3).map(s => `- [x] ${s}`).join('\n')}

#### 3. Strict Anti-Scope (DO NOT BUILD IN WEEK 1)
- [ ] ⛔ Multi-user team permissions and organizations
- [ ] ⛔ Custom user settings dashboards
- [ ] ⛔ Native OAuth integrations (use manual tokens or file drops)
${opp.whatNotToBuildInitially.map(s => `- [ ] ⛔ ${s}`).join('\n')}

#### 4. 48-Hour Validation Experiment
- **Hypothesis**: ${exp.hypothesis}
- **Validation Test**: ${exp.test}
- **Target Reach**: Contact 10–15 ${exp.targetUsers} directly on public communities.
- **Go Signal**: ${exp.successSignal}
- **Kill Signal**: ${exp.invalidationSignal}
`;
  }

  private generateRapidMvpBrief(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities[0] || this.fallbackOpp(brief);
    const exp = opp.validationExperiment;

    return `
### Rapid MVP Brief (2–3 Weeks): ${opp.name}
**Target Segment**: ${opp.targetCustomer}  
**Core Problem**: ${opp.userProblem}  
**Architecture Profile**: ${opp.technicalComplexity} complexity | ${opp.mvpProfile.aiRequirements}

#### 1. Architecture & Core Integrations
- **Core Engine**: Next.js App Router + TypeScript + Supabase
- **Required Integrations**: ${opp.mvpProfile.requiredIntegrations.join(', ') || 'Stripe Checkout, Webhook Listeners'}
- **Data Persistence**: Single-tenant data isolation with RLS

#### 2. Phased 3-Week Delivery Roadmap
- **Week 1 (Core Pipeline & Data Model)**:
  - Implement primary problem-solving workflow logic.
  - Setup authentication and database schema.
- **Week 2 (UI Polish & Third-Party Connectors)**:
  - Build focused single-page operational workspace.
  - Connect integrations and error boundary handling.
- **Week 3 (Onboarding & Closed Beta Launch)**:
  - Seed onboarding flow and invite first 10 pilot users.
  - Instrument telemetry on core workflow completion.

#### 3. Early Adopter Acquisition Channel
- Direct outreach to practitioners active in evidence threads.
- Targeted showcase on developer and niche operator communities.
- Offer 30-day pilot in exchange for weekly feedback.

#### 4. Validation & De-Risking Gate
- **Success Gate**: ${exp.successSignal}
- **Pivoting Gate**: ${exp.invalidationSignal}
`;
  }

  private generate30DayProductBrief(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities[0] || this.fallbackOpp(brief);

    return `
### 30-Day Product Brief: ${opp.name}
**Target Customer**: ${opp.targetCustomer}  
**Value Proposition**: ${opp.whyUseful}

#### 1. Complete Workflow Definition & User Journey
1. **Trigger**: User experiences friction during "${opp.coreWorkflow.split('->')[0] || opp.coreWorkflow}".
2. **Action**: User inputs data into ${opp.name} workspace.
3. **Processing**: System executes validation, extraction, or transformation.
4. **Resolution**: Structured output delivered to user's existing tools.

#### 2. Baseline UX & Data Model
- Clean monochrome interface strictly adhering to functional utility.
- Persistent workspace saving project history and export presets.
- Team workspace sharing support.

#### 3. 30-Day Milestone Execution
- **Milestone 1 (Days 1–7)**: Interactive prototype & architecture proof.
- **Milestone 2 (Days 8–16)**: End-to-end operational pipeline with edge cases.
- **Milestone 3 (Days 17–23)**: Private alpha with 5 target design partners.
- **Milestone 4 (Days 24–30)**: Public launch, pricing activation & documentation.

#### 4. First 10 Customer Acquisition Strategy
- Direct outreach to authors of first-hand complaints identified in research.
- Launch on specialized directories, Product Hunt, and niche Reddit communities.
`;
  }

  private generate90DayProductPlan(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities[0] || this.fallbackOpp(brief);
    const evalData = opp.evaluation;

    return `
### 90-Day Product Plan: ${opp.name}
**Market Opportunity**: ${opp.oneLineDescription}  
**Strategic Positioning**: ${evalData?.strategicFit.rationale || 'High-utility workflow specialist'}

#### 1. Multi-Phase Roadmap
- **Phase 1: Validation MVP (Days 1–30)**
  - Deliver core single-player workflow solving: "${opp.userProblem}".
  - Acquire 15 paying or high-engagement beta accounts.
- **Phase 2: Retention & Workflow Integration (Days 31–60)**
  - Integrate key ecosystem tools: ${opp.keyDependencies.join(', ') || 'APIs, webhooks'}.
  - Introduce automated background processing and notification channels.
- **Phase 3: Commercial Expansion & Team Collaboration (Days 61–90)**
  - Roll out team role permissions, audit logging, and usage-based tiers.
  - Implement self-serve billing and upgrade funnels.

#### 2. Unit Economics & Pricing Model
- **Starter Tier**: $29/mo — Solo operators, single workspace, standard throughput.
- **Professional Tier**: $99/mo — Growing teams, priority processing, team members.
- **Custom / Scale**: $299+/mo — Custom integrations, SLA, dedicated support.

#### 3. Defensibility & Moat Strategy
- **Workflow Embeddedness**: High switching cost once upstream/downstream tools depend on this engine.
- **Proprietary Benchmark Data**: Historical operational telemetry creates domain-specific benchmarks.
`;
  }

  private generate6MonthVenturePlan(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities[0] || this.fallbackOpp(brief);

    return `
### 6-Month Product Opportunity Plan: ${opp.name}
**Product Category**: ${opp.opportunityType}  
**Strategic Horizon**: 6 Months | Team Scale: ${brief.opportunityProfile.teamSize}

#### 1. Strategic Market Positioning
Position ${opp.name} as the dedicated category specialist addressing the critical gap left by legacy software: "${opp.gap}".

#### 2. Architecture Scalability & Team Growth
- **Engineering Roadmap**: Scalable multi-tenant architecture, distributed job queues, zero-downtime migrations.
- **Required Team Capabilities**: Lead full-stack architect, backend integrations engineer, product-led growth designer.

#### 3. Capital Allocation & Runway
- 50% Engineering & Product Velocity
- 30% Go-To-Market & Targeted Account Outbound
- 20% Infrastructure, Compliance & Operational Reserves

#### 4. Compliance & Enterprise Readiness
- SOC2 Type I readiness roadmap.
- Comprehensive GDPR/CCPA data export and privacy controls.
- Role-Based Access Control (RBAC) and Single Sign-On (SSO).
`;
  }

  private generate12MonthThesis(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities[0] || this.fallbackOpp(brief);

    return `
### 12-Month Product / Venture Thesis: ${opp.name}
**Macro Category**: ${opp.opportunityType} Intelligence & Operational Infrastructure  
**Core Thesis**: Fragmented manual workflows in ${brief.subject} represent an unbundled platform opportunity.

#### 1. Macro Market Inflection
Operators are currently forced to bridge discontinuous point solutions using fragile custom scripts and spreadsheets. As workflow complexity increases, a verticalized operating system becomes inevitable.

#### 2. The Strategic Wedge
- **Initial Wedge**: Solve "${opp.userProblem}" with superior speed and zero onboarding friction.
- **Platform Expansion**: Expand into upstream data ingestion and downstream team analytics.

#### 3. 3-Year Moat Architecture
- System-of-record status for operational transactions.
- Developer API platform allowing third parties to build workflows on top.
- N-sided network effects across practitioner organizations.
`;
  }

  private generateMarketLandscape(run: ResearchRun, brief: ResearchBrief): string {
    return `
### Market Opportunity Landscape: "${brief.subject}"
**Target User Segment**: ${brief.target.primaryUser || 'Operators'} | **Industry**: ${brief.target.industry || 'Technology'}

#### 1. Ecosystem Mapping & Incumbent Solutions
${run.existingSolutions.map(s => `- **${s.name}** (${s.type}): ${s.whatUsersDo}. Complaints: ${s.complaints.slice(0, 2).join(', ')}`).join('\n')}

#### 2. Recurring Operational Clusters
${run.clusters.map(c => `- **${c.clusterName}**: ${c.description} (${c.signalCount} verified practitioner complaints across ${c.sourceDiversity} sources)`).join('\n')}

#### 3. White Space Analysis & Unaddressed Gaps
${run.gaps.map(g => `- **${g.title}** [\`${g.gapType}\`]: ${g.description}`).join('\n')}

#### 4. Strategic Entry Vectors
1. **Verticalized Point Solution**: Attack the most severe recurring cluster with a lightweight specialist product.
2. **Integration Bridge**: Provide clean middleware connecting existing incompatible incumbents.
`;
  }

  private generateValidationReport(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities[0] || this.fallbackOpp(brief);
    const exp = opp.validationExperiment;
    const evalData = opp.evaluation;

    return `
### Idea Validation Report: "${brief.subject}"
**Tested Hypothesis**: Real practitioners actively seek software solutions for ${brief.intent || brief.subject}.

#### 1. Hypothesis vs Discovered Evidence Matrix
- **Discovered Practitioner Signals**: ${run.rawEvidenceCount} authentic discussions collected.
- **Verified Friction Points**: ${run.problems.length} distinct problem statements verified.
- **Commercial Willingness Signal**: ${evalData?.commercialViability.rationale || 'Demonstrated willingness to adopt workarounds'}

#### 2. Signal Confrontation (Expected vs Reality)
- **What Was Expected**: General demand for tools in "${brief.subject}".
- **What Operators Actually Complain About**: "${opp.userProblem}".
- **Current Workarounds Used**: "${opp.existingAlternatives}".

#### 3. Critical Uncertainties to De-Risk
${evalData?.criticalUncertainties.map(u => `- ⚠️ ${u}`).join('\n') || '- None flagged'}

#### 4. Action Recommendation
- **Verdict**: **${evalData?.recommendedAction || 'Validate First'}**
- **Experiment to Run**: ${exp.test}
- **Validation Criteria**: ${exp.successSignal}
- **Invalidation Criteria**: ${exp.invalidationSignal}
`;
  }

  private generateAutomationBrief(run: ResearchRun, brief: ResearchBrief): string {
    const opp = run.opportunities.find(o => o.opportunityType === 'Automation') || run.opportunities[0] || this.fallbackOpp(brief);

    return `
### Workflow Automation Opportunity Brief: ${opp.name}
**Manual Process Being Replaced**: ${opp.userProblem}  
**Affected Roles**: ${opp.targetCustomer}

#### 1. Step-by-Step Manual Workflow Breakdown
1. **Ingestion**: Operator receives raw data or notification from external systems.
2. **Manual Processing**: Operator manually analyzes, reformats, or copies information across tools.
3. **Execution**: Manual entry into destination databases or communication channels.
4. **Error Friction**: Repetitive friction causing delays, data drift, and operator burnout.

#### 2. Automated Pipeline Architecture
- **Trigger**: Webhook or scheduled cron listening to upstream source.
- **Validation Step**: Schema check and boundary validation.
- **Transformation Engine**: Automated parsing, filtering, and synthesis.
- **Destination Delivery**: Webhook/API dispatch to target system.

#### 3. Time & Dollar Savings Calculation
- **Estimated Hours Wasted**: 10–15 operator hours/week per organization.
- **Annual Cost of Inefficiency**: ~$25,000–$40,000 in lost operator productivity.
- **Automation ROI**: >10x return at a $99–$299/mo SaaS price point.

#### 4. Human-In-The-Loop vs Autonomous Boundaries
- **Fully Autonomous**: Deterministic transformations and standard routing.
- **Human-In-The-Loop**: Anomalous inputs, edge cases exceeding confidence thresholds, and irreversible deletions.
`;
  }

  private getOutputDocumentTitle(type: AdaptiveOutputType): string {
    switch (type) {
      case 'builder_brief_7d': return '7-Day Builder Brief';
      case 'rapid_mvp_2_3w': return 'Rapid MVP Brief (2–3 Weeks)';
      case 'product_brief_30d': return '30-Day Product Brief';
      case 'product_plan_90d': return '90-Day Product Plan';
      case 'venture_plan_6m': return '6-Month Product Opportunity Plan';
      case 'thesis_12m': return '12-Month Product / Venture Thesis';
      case 'market_landscape': return 'Market Opportunity Landscape';
      case 'validation_report': return 'Idea Validation Report';
      case 'automation_brief': return 'Workflow Automation Opportunity Brief';
    }
  }

  private fallbackOpp(brief: ResearchBrief): ProductOpportunity {
    return {
      id: 'opp_fallback',
      name: `${brief.subject} Specialist`,
      oneLineDescription: `Automated solution for ${brief.subject}`,
      targetCustomer: brief.target.primaryUser || 'Operators',
      userProblem: `Repetitive operational friction in ${brief.subject}`,
      evidenceSummary: 'Derived from community discussions and practitioner complaints',
      evidenceQuotes: [],
      existingAlternatives: 'Spreadsheets and manual workarounds',
      gap: 'No dedicated lightweight utility exists',
      proposedSolution: 'Streamlined web application',
      coreWorkflow: 'Input -> Process -> Export',
      whyUseful: 'Saves hours of repetitive work',
      mvpScope: ['Single operational workflow', 'Export to CSV/JSON'],
      whatNotToBuildInitially: ['Team permissions', 'Custom billing tiers'],
      technicalComplexity: 'Low',
      estimatedMvpBuildTime: '1 week',
      keyDependencies: ['Database', 'Auth'],
      majorRisks: ['Distribution', 'Retention'],
      monetizationPossibilities: ['$29/month subscription'],
      distributionDifficulty: 'Medium',
      validationExperiment: {
        hypothesis: 'Operators will pay for an automated workflow',
        test: 'Post landing page and message 10 operators',
        targetUsers: brief.target.primaryUser || 'Operators',
        successSignal: '3 pre-orders or committed pilot accounts',
        invalidationSignal: 'Zero interest from 20 inquiries',
      },
      evidenceConfidence: 75,
      opportunityType: 'SaaS',
      mvpProfile: {
        complexity: 'Low',
        estimatedBuildTime: '1 week',
        coreComponents: ['Next.js UI', 'Supabase API'],
        requiredIntegrations: ['Stripe'],
        aiRequirements: 'None',
        dataRequirements: 'Lightweight PostgreSQL',
        mainTechnicalRisks: ['API limits'],
        mainBusinessRisks: ['Customer acquisition'],
        validationDifficulty: 'Low',
      },
    };
  }
}
