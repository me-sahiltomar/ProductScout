import { 
  ClassifiedEvidence, 
  ExtractedProblem, 
  ProductOpportunity, 
  ResearchRunConfig,
  SystemSettings 
} from '@/types';
import { normalizeBrief } from './opportunityGenerator';

export class AIProviderManager {
  private settings: SystemSettings;

  constructor(settings: SystemSettings) {
    this.settings = settings;
  }

  public updateSettings(settings: SystemSettings) {
    this.settings = settings;
  }

  public async enrichIfAvailable(
    config: ResearchRunConfig,
    evidence: ClassifiedEvidence[],
    problems: ExtractedProblem[],
    opportunities: ProductOpportunity[]
  ): Promise<{
    problems: ExtractedProblem[];
    opportunities: ProductOpportunity[];
  }> {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';

    if (this.settings.aiProvider === 'gemini' && geminiKey) {
      try {
        return await this.enrichWithGemini(config, evidence, problems, opportunities, geminiKey);
      } catch (err) {
        console.warn('Gemini enrichment failed, falling back to heuristic results:', err);
      }
    } else if (this.settings.aiProvider === 'openai' && openaiKey) {
      try {
        return await this.enrichWithOpenAI(config, evidence, problems, opportunities, openaiKey);
      } catch (err) {
        console.warn('OpenAI enrichment failed, falling back to heuristic results:', err);
      }
    }

    return { problems, opportunities };
  }

  private async enrichWithGemini(
    config: ResearchRunConfig,
    evidence: ClassifiedEvidence[],
    problems: ExtractedProblem[],
    opportunities: ProductOpportunity[],
    apiKey: string
  ): Promise<{ problems: ExtractedProblem[]; opportunities: ProductOpportunity[] }> {
    const model = this.settings.geminiModel || 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const brief = config.brief || normalizeBrief(config);

    const prompt = `You are ProductScout's Senior Opportunity Intelligence Architect.
Analyze these authentic practitioner signals and calibrate the product opportunities against the user's Research Brief.

CRITICAL RULES:
1. Ground everything strictly in the provided real-world practitioner evidence. Do not invent fake quotes or statistics.
2. Clearly distinguish direct evidence from strategic inference.
3. Calibrate MVP scope to the user's requested Build Horizon (${brief.opportunityProfile.buildHorizon}), Team Size (${brief.opportunityProfile.teamSize}), and Budget (${brief.opportunityProfile.budget}).
${brief.opportunityProfile.buildHorizon === '7d' ? 'IMPORTANT: Keep scope strictly to a 7-day single workflow MVP with ruthless anti-scope.' : ''}
${brief.constraints.exclusions.length > 0 ? `STRICT EXCLUSIONS (Do NOT suggest): ${brief.constraints.exclusions.join(', ')}` : ''}

USER RESEARCH BRIEF:
- Subject: ${brief.subject}
- Objective: ${brief.objective}
- Target User: ${brief.target.primaryUser || config.targetUser || 'Operators & Practitioners'}
- Target Industry: ${brief.target.industry || 'Technology & Business Services'}
- Build Horizon: ${brief.opportunityProfile.buildHorizon}
- Target Product Types: ${brief.opportunityProfile.productTypes.join(', ')}
- Priorities: ${brief.constraints.priorities.join(', ')}
- Risk Tolerance: ${brief.constraints.riskProfile}

Evidence Samples:
${evidence.slice(0, 8).map(e => `- [${e.platform}] ${e.title}: "${e.painQuote || e.snippet}"`).join('\n')}

Existing Formulated Opportunities:
${JSON.stringify(opportunities.map(o => ({ 
  name: o.name, 
  opportunityType: o.opportunityType,
  problem: o.userProblem, 
  solution: o.proposedSolution, 
  mvpScope: o.mvpScope,
  whatNotToBuildInitially: o.whatNotToBuildInitially
})), null, 2)}

Respond with refined JSON array of opportunities matching schema. If not possible, return [].`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mergedOpps = opportunities.map((opp, idx) => {
            const refined = parsed[idx];
            if (!refined) return opp;
            return {
              ...opp,
              name: refined.name || opp.name,
              oneLineDescription: refined.oneLineDescription || opp.oneLineDescription,
              opportunityType: refined.opportunityType || opp.opportunityType,
              proposedSolution: refined.proposedSolution || opp.proposedSolution,
              whyUseful: refined.whyUseful || opp.whyUseful,
              mvpScope: Array.isArray(refined.mvpScope) && refined.mvpScope.length > 0 ? refined.mvpScope : opp.mvpScope,
              whatNotToBuildInitially: Array.isArray(refined.whatNotToBuildInitially) && refined.whatNotToBuildInitially.length > 0 ? refined.whatNotToBuildInitially : opp.whatNotToBuildInitially,
            };
          });
          return { problems, opportunities: mergedOpps };
        }
      } catch (parseErr) {
        console.warn('Could not parse Gemini JSON response:', parseErr);
      }
    }

    return { problems, opportunities };
  }

  private async enrichWithOpenAI(
    config: ResearchRunConfig,
    evidence: ClassifiedEvidence[],
    problems: ExtractedProblem[],
    opportunities: ProductOpportunity[],
    apiKey: string
  ): Promise<{ problems: ExtractedProblem[]; opportunities: ProductOpportunity[] }> {
    const baseUrl = this.settings.openaiBaseUrl || 'https://api.openai.com/v1';
    const model = this.settings.openaiModel || 'gpt-4o-mini';
    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    const brief = config.brief || normalizeBrief(config);

    const prompt = `Refine and calibrate these product opportunities based on real user evidence and the research brief.
Subject: "${brief.subject}".
Build Horizon: "${brief.opportunityProfile.buildHorizon}".
Target: "${brief.target.primaryUser || config.targetUser || 'Operators'}".
Return JSON array with refined fields: name, oneLineDescription, opportunityType, proposedSolution, whyUseful, mvpScope, whatNotToBuildInitially.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are ProductScout Opportunity Intelligence. Always output valid JSON array.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`OpenAI API error ${res.status}`);
    }

    return { problems, opportunities };
  }
}
