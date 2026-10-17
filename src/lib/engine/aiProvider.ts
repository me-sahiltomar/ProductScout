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
    // If no grounded opportunities exist, do not hallucinate opportunities without evidence
    if (opportunities.length === 0 || evidence.length === 0) {
      return { problems, opportunities };
    }

    const geminiKey = process.env.GEMINI_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';

    if (this.settings.aiProvider === 'gemini' && geminiKey) {
      try {
        return await this.enrichWithGemini(config, evidence, problems, opportunities, geminiKey);
      } catch (err) {
        console.warn('Gemini enrichment failed, falling back to grounded heuristic results:', err);
      }
    } else if (this.settings.aiProvider === 'openai' && openaiKey) {
      try {
        return await this.enrichWithOpenAI(config, evidence, problems, opportunities, openaiKey);
      } catch (err) {
        console.warn('OpenAI enrichment failed, falling back to grounded heuristic results:', err);
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
Refine and calibrate these ${opportunities.length} grounded candidate opportunities against the user's Research Brief.
Do not invent ungrounded facts or discard evidence.

RESEARCH BRIEF:
- Subject: ${brief.subject}
- Objective: ${brief.objective}
- Target User: ${brief.target.primaryUser || config.targetUser || 'Operators & Practitioners'}
- Build Horizon: ${brief.opportunityProfile.buildHorizon}
- Priorities: ${brief.constraints.priorities.join(', ')}
${brief.constraints.exclusions.length > 0 ? `STRICT EXCLUSIONS (Do NOT suggest): ${brief.constraints.exclusions.join(', ')}` : ''}

CANDIDATE OPPORTUNITIES TO REFINE:
${opportunities.map((o, i) => `${i + 1}. Title: "${o.title || o.name}" | Problem: "${o.problem || o.userProblem}" | Workflow: "${o.workflow || o.coreWorkflow}"`).join('\n')}

For each candidate opportunity above, return a refined JSON object in an array matching this schema:
{
  "index": number (1 to ${opportunities.length}),
  "name": "string (Short clear product name)",
  "oneLineDescription": "string",
  "proposedSolution": "string",
  "whyUseful": "string",
  "mvpScope": ["string"],
  "whatNotToBuildInitially": ["string"]
}
Return a JSON array of refined objects.`;

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
          // STRICT P0-004 PROVENANCE PRESERVATION:
          // Augment base opportunities, NEVER discard evidenceQuotes or supporting_evidence
          const enrichedOpps = opportunities.map((baseOpp, idx) => {
            const aiRefinement = parsed.find((p: any) => p.index === idx + 1) || parsed[idx];
            if (!aiRefinement) return baseOpp;

            return {
              ...baseOpp,
              name: aiRefinement.name || baseOpp.name,
              title: aiRefinement.name || baseOpp.title,
              oneLineDescription: aiRefinement.oneLineDescription || baseOpp.oneLineDescription,
              proposedSolution: aiRefinement.proposedSolution || baseOpp.proposedSolution,
              potential_solution: aiRefinement.proposedSolution || baseOpp.potential_solution,
              whyUseful: aiRefinement.whyUseful || baseOpp.whyUseful,
              mvpScope: Array.isArray(aiRefinement.mvpScope) && aiRefinement.mvpScope.length > 0
                ? aiRefinement.mvpScope
                : baseOpp.mvpScope,
              whatNotToBuildInitially: Array.isArray(aiRefinement.whatNotToBuildInitially) && aiRefinement.whatNotToBuildInitially.length > 0
                ? aiRefinement.whatNotToBuildInitially
                : baseOpp.whatNotToBuildInitially,
            };
          });

          return { problems, opportunities: enrichedOpps };
        }
      } catch (parseErr) {
        console.warn('Could not parse Gemini JSON response:', parseErr, rawText);
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

    const prompt = `Refine and calibrate these ${opportunities.length} grounded candidate opportunities against the research brief.
Subject: "${brief.subject}".
Build Horizon: "${brief.opportunityProfile.buildHorizon}".
Priorities: "${brief.constraints.priorities.join(', ')}".
${brief.constraints.exclusions.length > 0 ? `Exclusions: ${brief.constraints.exclusions.join(', ')}` : ''}

Opportunities:
${opportunities.map((o, i) => `${i + 1}. "${o.title || o.name}" for "${o.problem || o.userProblem}"`).join('\n')}

Return a JSON array of refined objects with: index (1 to ${opportunities.length}), name, oneLineDescription, proposedSolution, whyUseful, mvpScope (array), whatNotToBuildInitially (array).`;

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
          { role: 'system', content: 'You are ProductScout Opportunity Intelligence. Always output valid JSON array refining the given opportunities.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      try {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : (parsed.opportunities || parsed.items || []);
        if (Array.isArray(list) && list.length > 0) {
          // STRICT P0-004 PROVENANCE PRESERVATION:
          const enrichedOpps = opportunities.map((baseOpp, idx) => {
            const aiRefinement = list.find((p: any) => p.index === idx + 1) || list[idx];
            if (!aiRefinement) return baseOpp;

            return {
              ...baseOpp,
              name: aiRefinement.name || baseOpp.name,
              title: aiRefinement.name || baseOpp.title,
              oneLineDescription: aiRefinement.oneLineDescription || baseOpp.oneLineDescription,
              proposedSolution: aiRefinement.proposedSolution || baseOpp.proposedSolution,
              potential_solution: aiRefinement.proposedSolution || baseOpp.potential_solution,
              whyUseful: aiRefinement.whyUseful || baseOpp.whyUseful,
              mvpScope: Array.isArray(aiRefinement.mvpScope) && aiRefinement.mvpScope.length > 0
                ? aiRefinement.mvpScope
                : baseOpp.mvpScope,
              whatNotToBuildInitially: Array.isArray(aiRefinement.whatNotToBuildInitially) && aiRefinement.whatNotToBuildInitially.length > 0
                ? aiRefinement.whatNotToBuildInitially
                : baseOpp.whatNotToBuildInitially,
            };
          });

          return { problems, opportunities: enrichedOpps };
        }
      } catch (e) {
        console.warn('Could not parse OpenAI JSON response:', e, content);
      }
    }

    return { problems, opportunities };
  }
}
