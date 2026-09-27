import { ExistingSolution, MarketGap, ProblemCluster, ExtractedProblem, ClassifiedEvidence } from '@/types';

export class SolutionGapAnalyzer {
  public analyze(
    clusters: ProblemCluster[],
    problems: ExtractedProblem[],
    evidenceList: ClassifiedEvidence[]
  ): {
    solutions: ExistingSolution[];
    gaps: MarketGap[];
  } {
    const solutions: ExistingSolution[] = [];
    const gaps: MarketGap[] = [];

    const probMap = new Map<string, ExtractedProblem>();
    problems.forEach(p => probMap.set(p.id, p));

    for (const cluster of clusters) {
      const clusterProbs = cluster.problemIds.map(id => probMap.get(id)).filter((p): p is ExtractedProblem => !!p);
      const clusterText = clusterProbs.map(p => `${p.problemStatement} ${p.currentWorkaround} ${p.whyPainful}`).join(' ').toLowerCase();

      const clusterSolutions = this.identifySolutions(cluster.clusterName, clusterText);
      solutions.push(...clusterSolutions);

      const clusterGaps = this.detectGapsForCluster(cluster, clusterProbs, clusterSolutions);
      gaps.push(...clusterGaps);
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
    };
  }

  private identifySolutions(clusterName: string, text: string): ExistingSolution[] {
    const solutions: ExistingSolution[] = [];

    if (/lead|crm|sales/i.test(clusterName)) {
      solutions.push({
        name: 'HubSpot / Salesforce Essentials',
        type: 'software_product',
        whatUsersDo: 'Set up contact forms, manually import CSVs, and trigger canned email sequences.',
        positiveAspects: ['Robust database', 'Broad ecosystem of marketplace apps', 'Recognized brand'],
        complaints: ['Aggressive tier-based pricing lock-in', 'Overwhelming UI with hundreds of unused menus', 'Steep setup curve for solo operators'],
        missingFunctionality: ['Autonomous inbound lead qualification via natural conversation', 'Instant two-way WhatsApp/SMS synchronization without enterprise add-ons'],
        pricingInfo: 'Starts at $20/mo, quickly escalates to $500+/mo for automation workflows',
        integrationLimitations: ['Requires paid Zapier/Make tiers for custom webhooks and custom databases'],
        complexityFriction: 'Excessive configuration overhead requiring certified consultants or weeks of trial-and-error.',
        unservedSegments: 'Solo service providers, micro-agencies, and non-technical trade business owners.',
      });
      solutions.push({
        name: 'Manual Google Sheets & Email Sequences',
        type: 'spreadsheets',
        whatUsersDo: 'Operators copy-paste lead details from web forms into Google Sheets and manually send template emails.',
        positiveAspects: ['Zero software license cost', 'Completely customizable columns', 'Zero learning curve'],
        complaints: ['Prone to forgetting follow-ups', 'Zero real-time alerts', 'Leads go cold after 30 minutes'],
        missingFunctionality: ['Automated reminders', 'CRM pipeline status synchronization', 'Enrichment of lead company data'],
        pricingInfo: 'Free ($0)',
        integrationLimitations: ['Manual human copy-paste required for every new entry'],
        complexityFriction: 'High continuous manual toil consuming 5-10 hours weekly.',
        unservedSegments: 'Any operator receiving more than 10 leads per week.',
      });
    } else if (/invoice|billing|accounting/i.test(clusterName)) {
      solutions.push({
        name: 'QuickBooks Online / Xero',
        type: 'software_product',
        whatUsersDo: 'Create invoices, connect bank feeds, and categorize transactions monthly.',
        positiveAspects: ['Certified tax compliance', 'Accountant familiarity', 'Direct bank synchronization'],
        complaints: ['Slow, cluttered web UI', 'Hard to track whether clients actually opened invoice links', 'Strict reconciliation errors'],
        missingFunctionality: ['Automated smart payment chasing with escalating SMS/email nudges', 'Instant line-item dispute handling'],
        pricingInfo: '$30 - $90 per month per organization',
        integrationLimitations: ['Clunky APIs for custom order/fulfillment systems'],
        complexityFriction: 'Designed for accountants, not operators, creating cognitive friction.',
        unservedSegments: 'Freelancers and small agencies with simple milestone billing needs.',
      });
    } else if (/support|customer|inbox/i.test(clusterName)) {
      solutions.push({
        name: 'Zendesk / Intercom Helpdesk',
        type: 'software_product',
        whatUsersDo: 'Route inbound customer inquiries into shared ticketing inboxes with manual macros.',
        positiveAspects: ['Omnichannel support', 'Good audit trail and team assignment', 'Extensive analytics'],
        complaints: ['High per-seat pricing', 'Robotic-sounding native bot add-ons costing extra', 'Complex routing rules'],
        missingFunctionality: ['Instant context lookup in internal order systems without expensive custom engineering', 'Safe autonomous draft generation for non-technical teams'],
        pricingInfo: '$55 - $115 per seat per month',
        integrationLimitations: ['Custom database queries require expensive developer seats and webhook setups'],
        complexityFriction: 'Heavy configuration and rule management required.',
        unservedSegments: 'Small eCommerce stores and local service businesses with 1-5 support staff.',
      });
    } else if (/document|pdf|extraction/i.test(clusterName)) {
      solutions.push({
        name: 'Generic OCR / Manual Data Entry',
        type: 'manual_workaround',
        whatUsersDo: 'Staff open PDF invoices or contracts on one screen and re-type vendor names, amounts, and dates into software.',
        positiveAspects: ['100% human verification accuracy for simple layouts'],
        complaints: ['Extremely slow and monotonous', 'Prone to typographical errors when tired', 'Costly in wage hours'],
        missingFunctionality: ['Instant structured JSON output without manual correction', 'Direct push into accounting tools'],
        pricingInfo: '$15 - $25 per hour of employee time',
        integrationLimitations: ['Manual human bridge between tools'],
        complexityFriction: 'Mind-numbing repetitive labor leading to staff turnover.',
        unservedSegments: 'Businesses processing 20-200 documents weekly that cannot afford $10,000 enterprise document AI.',
      });
    } else {
      solutions.push({
        name: 'Multi-tool Zapier / Make Glue Workarounds',
        type: 'existing_tool',
        whatUsersDo: 'Stitch together 4-7 SaaS tools with webhooks and multi-step Zapier workflows.',
        positiveAspects: ['Enables inter-tool connection without custom code'],
        complaints: ['Silent automation failures when schemas change', 'Rapidly escalating task charges', 'Debugging failed runs is a nightmare'],
        missingFunctionality: ['Self-healing connectors', 'Domain-specific business logic out of the box'],
        pricingInfo: '$29 - $120+ per month depending on task volume',
        integrationLimitations: ['Rate limits and payload timeout errors'],
        complexityFriction: 'Operators fear touching existing working automations because they break easily.',
        unservedSegments: 'Non-technical business owners wanting a turnkey outcome, not a workflow builder.',
      });
    }

    return solutions;
  }

  private detectGapsForCluster(
    cluster: ProblemCluster,
    probs: ExtractedProblem[],
    solutions: ExistingSolution[]
  ): MarketGap[] {
    const gaps: MarketGap[] = [];
    const allEvidenceIds = probs.flatMap(p => p.evidenceIds);
    const quotes = probs.flatMap(p => p.evidenceQuotes.map(q => q.quote)).slice(0, 3);

    gaps.push({
      id: `gap_${cluster.id}_1`,
      gapType: 'excessive_complexity',
      title: 'Incumbent solutions are over-engineered for enterprise teams and bloated for lean operators',
      description: `Existing market leaders like ${solutions[0]?.name || 'traditional software'} demand extensive onboarding, seat licenses, and complex configuration that small operators abandon in favor of spreadsheets.`,
      supportingEvidenceIds: allEvidenceIds.slice(0, 2),
      supportingQuotes: quotes,
      isAiInference: false,
    });

    gaps.push({
      id: `gap_${cluster.id}_2`,
      gapType: 'too_many_manual_steps',
      title: 'Persistent manual data bridging and lack of end-to-end task completion',
      description: `While tools store records, operators still spend hours manually transferring data between systems or manually monitoring statuses, creating operational lag.`,
      supportingEvidenceIds: allEvidenceIds.slice(0, 2),
      supportingQuotes: quotes.slice(1, 3),
      isAiInference: false,
    });

    gaps.push({
      id: `gap_${cluster.id}_3`,
      gapType: 'high_price',
      title: 'Prohibitive per-seat pricing penalizing collaborative lean teams',
      description: `Enterprise SaaS vendors restrict essential automation and API capabilities to top tiers ($100+/seat/mo), leaving budget-conscious founders locked out of productive automation.`,
      supportingEvidenceIds: [],
      supportingQuotes: [],
      isAiInference: true,
    });

    return gaps;
  }
}
