import { ClassifiedEvidence, EvidenceQuality, EvidenceType, RawEvidenceItem, ResearchRunConfig } from '@/types';

export class EvidenceFilter {
  private firstHandPatterns = [
    /\b(?:i|we|our team|my team|my company|our agency|as a founder|as a small business owner)\b/i,
    /\b(?:i hate|i am tired of|struggling with|struggling to|painful to|nightmare to|frustrated by)\b/i,
    /\b(?:currently using|our workaround|my workaround|have to manually|spend hours|waste hours)\b/i,
    /\b(?:why is there no|wish there was|any tool that|looking for an alternative to|can someone recommend)\b/i,
    /\b(?:copy and paste|copying leads|spreadsheet|google sheets|csv export|excel sheet|doing this by hand)\b/i,
    /\b(?:unusable|clunky|expensive|broken|crashed|buggy|poor support|too complicated)\b/i,
  ];

  private vendorPatterns = [
    /\b(?:our product helps|leading provider of|discover our|request a demo|sign up today|all-in-one platform)\b/i,
    /\b(?:top 10 best|best tools for 2024|best tools for 2025|ultimate guide to|unlock the power of|boost your roi)\b/i,
    /\b(?:sponsored|affiliate link|press release|for immediate release|market research report predicts)\b/i,
  ];

  private solutionRequestPatterns = [
    /\b(?:is there a tool|any software that|how do you guys handle|does anyone know of|recommendation for)\b/i,
    /\b(?:what are you using for|how to automate|looking for a simple)\b/i,
  ];

  public classify(item: RawEvidenceItem, briefConfig?: ResearchRunConfig): ClassifiedEvidence {
    const text = `${item.title} ${item.content}`;
    const detectedMarkers: string[] = [];
    let score = 50;

    let firstHandCount = 0;
    for (const pattern of this.firstHandPatterns) {
      const match = text.match(pattern);
      if (match) {
        firstHandCount++;
        detectedMarkers.push(match[0].toLowerCase());
      }
    }

    let vendorCount = 0;
    for (const pattern of this.vendorPatterns) {
      if (pattern.test(text)) {
        vendorCount++;
      }
    }

    if (item.platform === 'reddit') score += 15;
    if (item.platform === 'hacker_news') score += 15;
    if (item.platform === 'github') score += 20;
    if (item.platform === 'review') score += 25;
    if (item.platform === 'devto') score += 5;
    if (item.platform === 'web') score -= 5;

    score += firstHandCount * 12;
    score -= vendorCount * 25;

    if ((item.score || 0) > 5) score += 5;
    if ((item.commentsCount || 0) > 3) score += 5;

    const qualityScore = Math.max(5, Math.min(98, score));

    let evidenceType: EvidenceType = 'EXPERT_DISCUSSION';

    if (item.platform === 'github') {
      evidenceType = 'GITHUB_ISSUE';
    } else if (vendorCount > 1 || /best \w+ tools|top \d+/i.test(item.title)) {
      evidenceType = vendorCount > 0 ? 'VENDOR_MARKETING' : 'GENERIC_ARTICLE';
    } else if (this.solutionRequestPatterns.some(p => p.test(text))) {
      evidenceType = 'SOLUTION_REQUEST';
    } else if (firstHandCount >= 2 && /\b(workaround|manually|spreadsheet|export|copy|paste|hours)\b/i.test(text)) {
      evidenceType = 'WORKFLOW_PROBLEM';
    } else if (firstHandCount >= 1 && /\b(hate|struggle|frustrated|broken|clunky|terrible|nightmare)\b/i.test(text)) {
      evidenceType = 'FIRST_HAND_USER_COMPLAINT';
    } else if (/\b(market|industry|trend|survey|percent|analyst)\b/i.test(text)) {
      evidenceType = 'INDUSTRY_ANALYSIS';
    }

    let quality: EvidenceQuality = 'LOW';
    if (qualityScore >= 70 && evidenceType !== 'VENDOR_MARKETING' && evidenceType !== 'GENERIC_ARTICLE') {
      quality = 'HIGH';
    } else if (qualityScore >= 40) {
      quality = 'MEDIUM';
    }

    // Domain & Geography Relevance Evaluation
    let relevance: 'RELEVANT' | 'PARTIALLY_RELEVANT' | 'IRRELEVANT' | 'UNCERTAIN' = 'UNCERTAIN';
    let relevanceScore = 50;

    if (briefConfig) {
      const topic = (briefConfig.topic || briefConfig.brief?.subject || '').toLowerCase();
      const targetUser = (briefConfig.targetUser || briefConfig.brief?.target?.primaryUser || '').toLowerCase();
      const industry = (briefConfig.industry || briefConfig.brief?.target?.industry || '').toLowerCase();
      const geography = (briefConfig.geography || briefConfig.brief?.target?.geography || '').toLowerCase();

      const stopWords = new Set([
        'what', 'when', 'where', 'which', 'with', 'from', 'tool', 'tools', 'software',
        'find', 'best', 'need', 'help', 'about', 'some', 'many', 'more', 'most'
      ]);
      const domainTerms = `${topic} ${targetUser} ${industry}`
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));

      const evFullText = text.toLowerCase();
      let matchCount = 0;
      for (const term of domainTerms) {
        if (evFullText.includes(term)) matchCount++;
      }

      const matchRatio = domainTerms.length > 0 ? matchCount / domainTerms.length : 0;
      const isGeoConstrained = geography && !['global', 'worldwide', 'any', 'all'].includes(geography);
      const mentionsGeo = isGeoConstrained && evFullText.includes(geography);

      if (domainTerms.length > 0 && matchCount === 0) {
        relevance = 'IRRELEVANT';
        relevanceScore = 10;
      } else if (matchRatio >= 0.4 || matchCount >= 2) {
        relevance = 'RELEVANT';
        relevanceScore = Math.min(95, 60 + matchCount * 10 + (mentionsGeo ? 15 : 0));
      } else if (matchCount >= 1) {
        relevance = 'PARTIALLY_RELEVANT';
        relevanceScore = Math.min(75, 40 + matchCount * 15 + (mentionsGeo ? 15 : 0));
      } else {
        relevance = 'UNCERTAIN';
        relevanceScore = 40;
      }
    }

    const rawPainQuote = this.extractPainSnippet(item.content) || item.title;
    const cleanTitle = this.decodeHtml(item.title);
    const cleanSnippet = this.decodeHtml(item.content.slice(0, 320));
    const cleanPainQuote = this.decodeHtml(rawPainQuote.slice(0, 240));

    return {
      id: `ev_${item.id}`,
      rawId: item.id,
      title: cleanTitle,
      url: item.url,
      platform: item.platform,
      author: item.author,
      date: item.date,
      snippet: cleanSnippet,
      evidenceType,
      quality,
      qualityScore,
      relevance,
      relevanceScore,
      firstHandMarkers: Array.from(new Set(detectedMarkers)),
      painQuote: cleanPainQuote,
    };
  }

  private decodeHtml(text: string): string {
    return text
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  public classifyAll(items: RawEvidenceItem[], briefConfig?: ResearchRunConfig): ClassifiedEvidence[] {
    return items
      .map(item => this.classify(item, briefConfig))
      .filter(ev => {
        if (ev.evidenceType === 'VENDOR_MARKETING' && ev.qualityScore <= 45) return false;
        // Strictly filter out completely irrelevant items when a brief is configured
        if (briefConfig && ev.relevance === 'IRRELEVANT') return false;
        return true;
      })
      .sort((a, b) => {
        const scoreA = (a.relevanceScore || 50) * 0.4 + a.qualityScore * 0.6;
        const scoreB = (b.relevanceScore || 50) * 0.4 + b.qualityScore * 0.6;
        return scoreB - scoreA;
      });
  }

  private extractPainSnippet(content: string): string | undefined {
    const sentences = content.split(/[.\n!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    for (const sentence of sentences) {
      for (const pattern of this.firstHandPatterns) {
        if (pattern.test(sentence)) {
          return sentence;
        }
      }
    }
    return sentences[0];
  }
}
