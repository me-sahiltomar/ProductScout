import { 
  ClassifiedEvidence, 
  ExtractedProblem, 
  ProblemCluster, 
  ProductOpportunity, 
  ResearchRunConfig,
  SystemSettings 
} from '@/types';

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
    const model = this.settings.geminiModel || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `You are Cevon Opportunity Radar's Senior Product Analyst.
Analyze these user problems and refine the product opportunities.
CRITICAL RULES:
1. Ground everything strictly in the provided user evidence. Do not invent facts or market sizes.
2. Clearly distinguish evidence from inference.
3. Keep MVP narrow (1-2 weeks build).

Topic: ${config.topic}
Focus: ${config.focus}
Evidence Samples:
${evidence.slice(0, 8).map(e => `- [${e.platform}] ${e.title}: "${e.snippet}"`).join('\n')}

Existing Formulated Opportunities:
${JSON.stringify(opportunities.map(o => ({ name: o.name, problem: o.userProblem, solution: o.proposedSolution, mvpScope: o.mvpScope })), null, 2)}

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
              proposedSolution: refined.proposedSolution || opp.proposedSolution,
              whyUseful: refined.whyUseful || opp.whyUseful,
              mvpScope: Array.isArray(refined.mvpScope) && refined.mvpScope.length > 0 ? refined.mvpScope : opp.mvpScope,
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
    _evidence: ClassifiedEvidence[],
    problems: ExtractedProblem[],
    opportunities: ProductOpportunity[],
    apiKey: string
  ): Promise<{ problems: ExtractedProblem[]; opportunities: ProductOpportunity[] }> {
    const baseUrl = this.settings.openaiBaseUrl || 'https://api.openai.com/v1';
    const model = this.settings.openaiModel || 'gpt-4o-mini';

    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    const prompt = `Refine these product opportunities based on real user evidence for topic: "${config.topic}". Return JSON array.`;

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
          { role: 'system', content: 'You are Cevon Opportunity Radar. Always output valid JSON.' },
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
