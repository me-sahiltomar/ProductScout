import { ResearchRunConfig } from '../../src/types';

export const benchmarkFixtures: ResearchRunConfig[] = [
  // B2B SaaS
  { focus: 'problems', brief: { id: 'b1', objective: 'explore_market', subject: 'B2B SaaS Churn Prediction', target: { primaryUser: 'Customer Success Managers' }, researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '3m', teamSize: 'Solo', technicalCapability: 'High' }, outputRequirements: { type: 'product_plan_90d' } } },
  { focus: 'problems', brief: { id: 'b2', objective: 'explore_industry', subject: 'Automated SOC2 Compliance', target: { primaryUser: 'CTOs', industry: 'Fintech' }, researchConfiguration: { evidenceWindow: '30d', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '6m', teamSize: 'Startup', technicalCapability: 'High' }, outputRequirements: { type: 'venture_plan_6m' } } },
  
  // Developer Tools
  { focus: 'problems', brief: { id: 'd1', objective: 'validate_existing_idea', subject: 'Local AI model orchestration for developers', target: { primaryUser: 'Backend Engineers' }, researchConfiguration: { evidenceWindow: '90d', maxSourcesPerQuery: 10, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['DevTool'], buildHorizon: '1m', teamSize: 'Solo', technicalCapability: 'High' }, outputRequirements: { type: 'product_brief_30d' } } },
  { focus: 'problems', brief: { id: 'd2', objective: 'find_automation_opportunities', subject: 'Database migration management', target: { primaryUser: 'DevOps' }, researchConfiguration: { evidenceWindow: '6m', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['Automation'], buildHorizon: '2-3w', teamSize: 'Solo', technicalCapability: 'Medium' }, outputRequirements: { type: 'rapid_mvp_2_3w' } } },
  
  // Internal Tools
  { focus: 'problems', brief: { id: 'i1', objective: 'explore_market', subject: 'Employee onboarding hardware provisioning', target: { primaryUser: 'IT Admins' }, researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['Internal Tool'], buildHorizon: '1m', teamSize: 'Solo', technicalCapability: 'Low' }, outputRequirements: { type: 'product_brief_30d' } } },
  { focus: 'problems', brief: { id: 'i2', objective: 'explore_customer_segment', subject: 'Sales commission reconciliation', target: { primaryUser: 'RevOps' }, researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['Internal Tool'], buildHorizon: '3m', teamSize: 'Solo', technicalCapability: 'Medium' }, outputRequirements: { type: 'product_plan_90d' } } },

  // Workflow Automation
  { focus: 'problems', brief: { id: 'w1', objective: 'find_automation_opportunities', subject: 'Invoice extraction and ERP sync', target: { primaryUser: 'Accountants' }, researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['Automation'], buildHorizon: '7d', teamSize: 'Solo', technicalCapability: 'Medium' }, outputRequirements: { type: 'builder_brief_7d' } } },
  { focus: 'problems', brief: { id: 'w2', objective: 'find_automation_opportunities', subject: 'Social media asset resizing and posting', target: { primaryUser: 'Marketing Managers' }, researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['Automation'], buildHorizon: '7d', teamSize: 'Solo', technicalCapability: 'Low' }, outputRequirements: { type: 'builder_brief_7d' } } },
  
  // Niche / Vertical
  { focus: 'problems', brief: { id: 'n1', objective: 'explore_market', subject: 'Dental clinic appointment reminder no-shows', target: { primaryUser: 'Clinic Managers', industry: 'Healthcare' }, researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '3m', teamSize: 'Solo', technicalCapability: 'Medium' }, outputRequirements: { type: 'product_plan_90d' } } },
  { focus: 'problems', brief: { id: 'n2', objective: 'explore_industry', subject: 'Construction equipment maintenance tracking', target: { primaryUser: 'Fleet Managers', industry: 'Construction' }, researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '6m', teamSize: 'Startup', technicalCapability: 'High' }, outputRequirements: { type: 'venture_plan_6m' } } },

];

// Add 10 more procedural variations to hit 20 total.
for(let i=1; i<=10; i++) {
  benchmarkFixtures.push({
    focus: 'problems',
    brief: { 
      id: `gen_${i}`, 
      objective: 'explore_market', 
      subject: `Generic Vertical Workflow ${i}`, 
      target: { primaryUser: `Operator ${i}` }, 
      researchConfiguration: { evidenceWindow: '1y', maxSourcesPerQuery: 5, allowedSourceTypes: ['web'] }, 
      opportunityProfile: { productTypes: ['SaaS'], buildHorizon: '1m', teamSize: 'Solo', technicalCapability: 'Medium' },
      outputRequirements: { type: 'product_brief_30d' }
    }
  });
}
