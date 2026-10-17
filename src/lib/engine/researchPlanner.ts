import { AIProviderManager } from './aiProvider';
import { ResearchBrief, ResearchQuestion, ResearchRunConfig } from '@/types';
import { normalizeBrief } from './opportunityGenerator';

export class ResearchPlanner {
  constructor(private aiProvider: AIProviderManager) {}

  public generateQuestions(config: ResearchRunConfig): ResearchQuestion[] {
    const brief = config.brief || normalizeBrief(config);
    const questions: ResearchQuestion[] = [];
    const timestamp = Date.now();

    const subject = brief.subject || config.topic;
    const user = brief.target?.primaryUser || config.targetUser || 'Operators';
    const industry = brief.target?.industry || 'Technology & Business Services';
    const geography = brief.target?.geography || config.geography;
    const horizon = brief.opportunityProfile?.buildHorizon || '1m';
    const exclusions = brief.constraints?.exclusions || [];
    const buyer = brief.target?.targetBuyer;

    // 1. Core Domain Problem Question (HIGH)
    questions.push({
      id: `q_problem_${timestamp}_1`,
      text: `What operational bottlenecks and recurring manual drag exist in "${subject}" for ${user} in ${industry}?`,
      importance: 'HIGH',
      status: 'OPEN',
      uncertaintyScore: 1.0,
      supportingEvidenceIds: [],
      contradictoryEvidenceIds: [],
      actionsAttempted: 0
    });

    // 2. Workaround & Current Behavior Question (HIGH)
    questions.push({
      id: `q_workaround_${timestamp}_2`,
      text: `What specific manual workarounds, spreadsheets, or ad-hoc scripts are ${user} currently using to cope with ${subject}?`,
      importance: 'HIGH',
      status: 'OPEN',
      uncertaintyScore: 1.0,
      supportingEvidenceIds: [],
      contradictoryEvidenceIds: [],
      actionsAttempted: 0
    });

    // 3. Geography-Specific Question (Conditional HIGH/MEDIUM)
    if (geography && !['global', 'worldwide', 'any', 'all'].includes(geography.toLowerCase())) {
      questions.push({
        id: `q_geography_${timestamp}_3`,
        text: `What specific local regulatory, payment, language, or infrastructure constraints affect ${user} in ${geography}?`,
        importance: 'HIGH',
        status: 'OPEN',
        uncertaintyScore: 1.0,
        supportingEvidenceIds: [],
        contradictoryEvidenceIds: [],
        actionsAttempted: 0
      });
    }

    // 4. Build Horizon & Scope Calibration Question (MEDIUM)
    if (horizon === '7d') {
      questions.push({
        id: `q_horizon_${timestamp}_4`,
        text: `What narrow, single-workflow friction point in ${subject} can be solved with a 7-day zero-setup micro utility?`,
        importance: 'MEDIUM',
        status: 'OPEN',
        uncertaintyScore: 1.0,
        supportingEvidenceIds: [],
        contradictoryEvidenceIds: [],
        actionsAttempted: 0
      });
    } else if (horizon === '6m' || horizon === '12m') {
      questions.push({
        id: `q_horizon_${timestamp}_4`,
        text: `What architectural integration, multi-role permissions, or enterprise security requirements govern ${subject}?`,
        importance: 'HIGH',
        status: 'OPEN',
        uncertaintyScore: 1.0,
        supportingEvidenceIds: [],
        contradictoryEvidenceIds: [],
        actionsAttempted: 0
      });
    } else {
      questions.push({
        id: `q_solution_${timestamp}_4`,
        text: `What existing products currently serve this workflow for ${user} and where do they fail?`,
        importance: 'MEDIUM',
        status: 'OPEN',
        uncertaintyScore: 1.0,
        supportingEvidenceIds: [],
        contradictoryEvidenceIds: [],
        actionsAttempted: 0
      });
    }

    // 5. Exclusions Guardrail Question (Conditional MEDIUM)
    if (exclusions.length > 0) {
      questions.push({
        id: `q_exclusions_${timestamp}_5`,
        text: `How can ${user} resolve friction in ${subject} strictly avoiding: ${exclusions.join(', ')}?`,
        importance: 'MEDIUM',
        status: 'OPEN',
        uncertaintyScore: 1.0,
        supportingEvidenceIds: [],
        contradictoryEvidenceIds: [],
        actionsAttempted: 0
      });
    }

    // 6. Target Buyer / Commercial Viability Question (Conditional)
    if (buyer && buyer.toLowerCase() !== user.toLowerCase()) {
      questions.push({
        id: `q_buyer_${timestamp}_6`,
        text: `What budget authority and ROI justification does ${buyer} require before purchasing software for ${user}?`,
        importance: 'MEDIUM',
        status: 'OPEN',
        uncertaintyScore: 1.0,
        supportingEvidenceIds: [],
        contradictoryEvidenceIds: [],
        actionsAttempted: 0
      });
    }

    // 7. Counter-Evidence / Invalidation Question (HIGH)
    questions.push({
      id: `q_counter_${timestamp}_7`,
      text: `Why would ${user} resist adopting a dedicated software solution for ${subject}, and why might a new product fail?`,
      importance: 'HIGH',
      status: 'OPEN',
      uncertaintyScore: 1.0,
      supportingEvidenceIds: [],
      contradictoryEvidenceIds: [],
      actionsAttempted: 0
    });

    return questions;
  }
}
