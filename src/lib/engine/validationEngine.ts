import { 
  OpportunityEvaluation, 
  ProductOpportunity, 
  ResearchBrief, 
  ValidationExperiment 
} from '@/types';

export class ValidationEngine {
  /**
   * Generates a context-adaptive validation experiment designed to answer:
   * "What is the cheapest experiment that can reduce the most important uncertainty?"
   */
  public generateExperiment(
    opportunity: ProductOpportunity,
    brief: ResearchBrief,
    evaluation: OpportunityEvaluation
  ): ValidationExperiment {
    const { opportunityProfile, target } = brief;
    const { teamSize, buildHorizon } = opportunityProfile;
    const primaryUncertainty = evaluation.criticalUncertainties[0] || 'Will customers switch from their current workaround?';

    const targetDescription = target.targetUser 
      ? `${target.targetUser} (${target.targetCompany || 'SMB / Operators'})` 
      : opportunity.targetCustomer;

    // 1. Solo developer / 7-day micro-SaaS
    if (buildHorizon === '7d' || teamSize === 'Solo') {
      return {
        hypothesis: `If target operators are presented with a focused 60-second Loom demonstration solving their exact problem, at least 15% will request beta access or commit to a discovery call.`,
        test: `Record a 60-second interactive prototype demo showing the core automated workflow. Publish to relevant Reddit/IndieHackers communities and direct-message 20 active complainers from the gathered evidence threads.`,
        targetUsers: `20 active practitioners and forum commenters experiencing the problem in ${targetDescription}.`,
        successSignal: `≥ 4 qualified discovery calls booked or pre-orders within 72 hours.`,
        invalidationSignal: `< 1 response or clear user feedback stating the existing manual workaround is acceptable.`,
        validationMethod: 'Loom Prototype Demo & Direct Community Outreach',
        estimatedTime: '48–72 hours',
        estimatedCost: '$0',
      };
    }

    // 2. Enterprise / Mid-market software
    if (target.targetCompany === 'Enterprise' || target.targetCompany === 'Mid-market' || buildHorizon === '6m' || buildHorizon === '12m') {
      return {
        hypothesis: `Enterprise operations leads will confirm that the current gap causes measurable financial or operational leakage and will agree to enter a sponsored 30-day pilot or provide a formal Letter of Intent (LOI).`,
        test: `Conduct 8 structured problem-discovery interviews with domain leaders. Present a clickable Figma architecture walkthrough addressing security, compliance, and integration with their current stack.`,
        targetUsers: `8–10 VP / Directors of Operations or IT decision makers in ${target.industry || targetDescription}.`,
        successSignal: `≥ 2 signed Letters of Intent (LOI) or agreements to participate in a subsidized proof-of-concept pilot.`,
        invalidationSignal: `Security/procurement pushback indicating third-party tools cannot be introduced into this workflow.`,
        validationMethod: 'Design-Partner Interviews & Letter of Intent (LOI)',
        estimatedTime: '2–3 weeks',
        estimatedCost: '$50–$150 (incentives for expert interviews)',
      };
    }

    // 3. Productized Service / Agency Workflow
    if (brief.objective === 'find_productized_service_opportunities' || target.targetCompany === 'Agency') {
      return {
        hypothesis: `Agency operators will immediately outsource or license this workflow if delivered with a guaranteed turnaround time at less than their internal billable rate.`,
        test: `Offer a manual 'Concierge MVP' service directly to 5 agencies: execute the workflow manually behind the scenes while testing turnaround expectations and pricing tolerance.`,
        targetUsers: `5 boutique agency owners or operations leads managing ${target.workflow || 'recurring client deliverables'}.`,
        successSignal: `≥ 2 paid client engagements at the target price point ($99–$299/run).`,
        invalidationSignal: `Agencies refuse to share client data or state that internal staff prefer handling it manually.`,
        validationMethod: 'Concierge MVP (Manual Back-office Execution)',
        estimatedTime: '1–2 weeks',
        estimatedCost: '$0',
      };
    }

    // 4. Internal Tool / Automation
    if (brief.objective === 'find_internal_tool_opportunities' || brief.objective === 'find_automation_opportunities') {
      return {
        hypothesis: `Automating this manual step will save operators at least 3 hours per week and eliminate human error in downstream handoffs.`,
        test: `Implement a lightweight script or webhook worker on live dummy data. Measure operator task completion time before and after automation across 5 consecutive runs.`,
        targetUsers: `Internal operators or team leads executing ${target.workflow || opportunity.coreWorkflow}.`,
        successSignal: `≥ 70% reduction in operator completion time with zero data validation errors.`,
        invalidationSignal: `Edge-case formatting requires frequent manual intervention, negating automation time savings.`,
        validationMethod: 'Pre/Post Operational Time Audit with Script Prototype',
        estimatedTime: '3–5 days',
        estimatedCost: '$0',
      };
    }

    // 5. Standard Focused B2B SaaS MVP (Default)
    return {
      hypothesis: `Target operators will sign up for early access and agree to a 20-minute workflow audit when promised a solution to: "${primaryUncertainty}".`,
      test: `Deploy a high-conversion single-page explainer illustrating the step-by-step workflow with realistic interface mockups. Drive 100 targeted visits via community participation and direct LinkedIn/X outreach.`,
      targetUsers: `100 targeted practitioners in ${targetDescription}.`,
      successSignal: `≥ 8% email conversion rate and ≥ 3 completed user discovery calls.`,
      invalidationSignal: `< 2% email conversion rate after 100 qualified visits.`,
      validationMethod: 'Interactive Explainer Landing Page & Discovery Calls',
      estimatedTime: '5–7 business days',
      estimatedCost: '$20–$50 (domain & hosting)',
    };
  }
}
