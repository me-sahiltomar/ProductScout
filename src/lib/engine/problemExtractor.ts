import { ClassifiedEvidence, ExtractedProblem, ResearchRunConfig } from '@/types';

export class ProblemExtractor {
  public extractProblems(
    evidenceList: ClassifiedEvidence[],
    config: ResearchRunConfig
  ): ExtractedProblem[] {
    const validEvidence = evidenceList.filter(e => e.quality === 'HIGH' || e.quality === 'MEDIUM');

    if (validEvidence.length === 0) {
      return [];
    }

    const problemBuckets: Map<string, ClassifiedEvidence[]> = new Map();

    for (const ev of validEvidence) {
      const themeKey = this.determineThemeKey(ev.title, ev.snippet);
      if (!problemBuckets.has(themeKey)) {
        problemBuckets.set(themeKey, []);
      }
      problemBuckets.get(themeKey)!.push(ev);
    }

    const problems: ExtractedProblem[] = [];
    let problemIndex = 1;

    for (const [theme, bucket] of problemBuckets.entries()) {
      if (bucket.length === 0) continue;

      const primary = bucket[0];
      const distinctSources = new Set(bucket.map(b => b.url));
      const platforms = new Set(bucket.map(b => b.platform));
      const quotes = bucket.slice(0, 4).map(b => ({
        quote: b.painQuote || b.snippet.slice(0, 180),
        sourceUrl: b.url,
        sourceTitle: b.title,
        author: b.author,
        platform: b.platform,
      }));

      const fullText = bucket.map(b => `${b.title} ${b.snippet}`).join(' ');
      
      const { workaroundDesc, workaroundType } = this.detectWorkaround(fullText);
      const targetUser = this.detectTargetUser(fullText, config.targetUser);
      const workflow = this.detectWorkflow(fullText, config.topic);
      const trigger = this.detectTrigger(fullText);
      const frequency = this.detectFrequency(fullText);
      const cost = this.detectCost(fullText);

      const avgQualityScore = bucket.reduce((sum, b) => sum + b.qualityScore, 0) / bucket.length;
      const evidenceQuality = avgQualityScore >= 68 && bucket.length >= 2 ? 'HIGH' : 'MEDIUM';

      const confidence = Math.min(
        95,
        Math.round(40 + (distinctSources.size * 12) + (platforms.size * 10) + (avgQualityScore * 0.2))
      );

      problems.push({
        id: `prob_${problemIndex++}`,
        problemStatement: this.formulateProblemStatement(theme, primary.title, fullText),
        targetUser,
        userContext: `Operating in ${config.topic || 'daily operations'}.`,
        jobWorkflow: workflow,
        painPoint: `High operational drag and repetitive manual work.`,
        whyPainful: `Forces operators to shift context and slows down resolution.`,
        currentWorkaround: workaroundDesc,
        workaroundType,
        frequency,
        workflowTrigger: trigger,
        workflowFrequency: frequency,
        manualEffortLocations: ['Data entry', 'Cross-referencing'],
        costInTimeOrMoney: cost,
        problemOwner: targetUser,
        evidenceQuotes: quotes,
        evidenceIds: bucket.map(b => b.id),
        signalCount: distinctSources.size,
        sourceLinks: Array.from(distinctSources),
        evidenceQuality,
        confidence,
      });
    }

    return problems.sort((a, b) => b.signalCount - a.signalCount || b.confidence - a.confidence);
  }

  private determineThemeKey(title: string, snippet: string): string {
    const text = `${title} ${snippet}`.toLowerCase();
    const words = text.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const stopwords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'to', 'in', 'of', 'for', 'with', 'it', 'this', 'that', 'as', 'are', 'be', 'by', 'was', 'or', 'from', 'but', 'not', 'have', 'has', 'we', 'they', 'you', 'i', 'my', 'our', 'their', 'can', 'will', 'would', 'should', 'what', 'how', 'why', 'who', 'when', 'where', 'do', 'does', 'did', 'if', 'then', 'than', 'so', 'about', 'more', 'some', 'any', 'all', 'one', 'out', 'up', 'down', 'like', 'just', 'get', 'got', 'make', 'made', 'use', 'using', 'need', 'needs', 'want', 'wants', 'know', 'think', 'see', 'look', 'good', 'bad', 'much', 'many', 'very', 'really', 'too', 'also', 'only', 'even', 'still', 'now', 'well', 'way', 'time', 'day', 'year', 'work', 'new', 'first', 'last', 'same', 'different', 'other', 'another', 'own', 'such', 'these', 'those', 'there', 'here', 'being', 'been', 'doing', 'done', 'having', 'had', 'could', 'might', 'must']);
    
    const filtered = words.filter(w => w.length > 3 && !stopwords.has(w));
    if (filtered.length === 0) return 'general_friction';

    return filtered.slice(0, 2).join('_');
  }

  private formulateProblemStatement(theme: string, title: string, text: string): string {
    const cleanTitle = title.replace(/^(how to|why is|anyone else|help with|looking for|struggling with)\s+/i, '');
    if (cleanTitle.length > 15) {
      return cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1).slice(0, 110);
    }
    const words = theme.split('_');
    return `Operational friction regarding ${words.join(' ')}`;
  }

  private detectWorkaround(text: string): { workaroundDesc: string, workaroundType: 'spreadsheet' | 'zapier' | 'manual' | 'internal_tool' | 'outsourcing' | 'none' } {
    if (/\b(google sheets|spreadsheet|excel|csv)\b/i.test(text)) {
      return { workaroundDesc: 'Google Sheets / Excel with copy-pasting', workaroundType: 'spreadsheet' };
    }
    if (/\b(zapier|make\.com|integromat)\b/i.test(text)) {
      return { workaroundDesc: 'Multi-step Zapier/Make automations', workaroundType: 'zapier' };
    }
    if (/\b(virtual assistant|va|hire|contractor|intern|agency)\b/i.test(text)) {
      return { workaroundDesc: 'Hiring contractors/VAs to manually perform tasks', workaroundType: 'outsourcing' };
    }
    if (/\b(custom script|python|internal tool)\b/i.test(text)) {
      return { workaroundDesc: 'Custom internal script', workaroundType: 'internal_tool' };
    }
    if (/\b(email|inbox|manual|by hand)\b/i.test(text)) {
      return { workaroundDesc: 'Manual checks via email inbox', workaroundType: 'manual' };
    }
    return { workaroundDesc: 'Unknown/Manual', workaroundType: 'none' };
  }

  private detectTargetUser(text: string, override?: string): string {
    if (override && override.trim().length > 0) return override.trim();
    if (/\b(founder|agency owner|freelancer)\b/i.test(text)) return 'Agency owners and solo entrepreneurs';
    if (/\b(small business|smb|local business|store owner)\b/i.test(text)) return 'Small business operators and boutique service firms';
    if (/\b(developer|engineer|devops)\b/i.test(text)) return 'Software developers and technical project leads';
    if (/\b(sales|account executive|bdr|sdr)\b/i.test(text)) return 'B2B sales representatives and revenue managers';
    return 'Knowledge workers';
  }

  private detectWorkflow(text: string, topic: string): string {
    if (/\b(lead|crm|prospect|sales)\b/i.test(text)) return 'Inbound lead capture → CRM assignment → outreach follow-up';
    if (/\b(invoice|payment|accounting)\b/i.test(text)) return 'Invoice generation → payment tracking → accounting ledger reconciliation';
    if (/\b(support|ticket|inquiry|customer)\b/i.test(text)) return 'Customer question triage → internal resolution → response dispatch';
    if (/\b(schedule|calendar|booking)\b/i.test(text)) return 'Availability check → appointment slot negotiation → reminder confirmation';
    if (/\b(document|pdf|form)\b/i.test(text)) return 'Document intake → field extraction → CRM ingestion';
    return `${topic} operational workflow`;
  }

  private detectTrigger(text: string): string {
    if (/\b(new email|receive email|inbox)\b/i.test(text)) return 'Receiving an external email';
    if (/\b(new customer|signup|onboarding)\b/i.test(text)) return 'A new user signing up';
    if (/\b(end of month|monthly closing|invoice)\b/i.test(text)) return 'End of month billing cycle';
    return 'An external request or data state change';
  }

  private detectFrequency(text: string): string {
    if (/\b(daily|every day|multiple times a day|constantly)\b/i.test(text)) return 'Daily (multiple times per day)';
    if (/\b(weekly|every week|each week|regularly)\b/i.test(text)) return 'Weekly (recurring routine)';
    if (/\b(monthly|end of month|monthly closing)\b/i.test(text)) return 'Monthly (periodic batch)';
    return 'Unknown';
  }

  private detectCost(text: string): string {
    if (/\b(hours|takes forever|all day|weekend)\b/i.test(text)) return 'Significant loss of productive hours';
    if (/\b(pay|dollars|expensive|thousands)\b/i.test(text)) return 'Direct monetary cost via labor or errors';
    return 'Unquantified friction';
  }
}

