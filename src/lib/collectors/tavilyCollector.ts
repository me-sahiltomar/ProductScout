import { ICollector, CollectorResult, DiscoveryResult, DeepFetchResult } from './collectorInterface';
import { RawEvidenceItem, ResearchRunConfig } from '@/types';

export class TavilyCollector implements ICollector {
  platform = 'web' as const;
  name = 'Tavily Deep Research';

  private searchCache: Map<string, DiscoveryResult[]> = new Map();
  private fetchCache: Map<string, DeepFetchResult | null> = new Map();

  async search(query: string, config: ResearchRunConfig): Promise<CollectorResult> {
    const startTime = Date.now();
    try {
      const results = await this.discover(query, config, config.maxSources || 15);
      const items: RawEvidenceItem[] = results.map((r, i) => ({
        id: `tavily_${i}_${Date.now()}`,
        title: r.title,
        url: r.url,
        platform: 'web',
        date: r.publishedDate,
        content: `${r.title}\n\n${r.snippet}`,
        score: r.score || 1,
      }));

      return {
        platform: 'web',
        succeeded: items.length > 0,
        items,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (e: any) {
      return {
        platform: 'web',
        succeeded: false,
        items: [],
        error: e.message || 'Tavily search failed',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  async discover(query: string, config: ResearchRunConfig, limit: number): Promise<DiscoveryResult[]> {
    const cacheKey = `${query}_${limit}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error('TAVILY_API_KEY is not configured');

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: 'advanced',
        include_answer: false,
        max_results: limit,
      }),
    });

    if (!res.ok) throw new Error(`Tavily API error: ${res.status}`);

    const data = await res.json();
    const results = data.results.map((r: any) => ({
      url: r.url,
      title: r.title,
      snippet: r.content,
      publishedDate: r.published_date,
      score: r.score,
    }));
    
    this.searchCache.set(cacheKey, results);
    return results;
  }

  async deepFetch(url: string, config: ResearchRunConfig): Promise<DeepFetchResult | null> {
    if (this.fetchCache.has(url)) {
      return this.fetchCache.get(url)!;
    }

    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return null;

    try {
      const res = await fetch('https://api.tavily.com/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          urls: [url],
        }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (!data.results || data.results.length === 0) return null;

      const extracted = data.results[0].raw_content || data.results[0].content;
      const resData: DeepFetchResult = {
        url: url,
        content: extracted,
        extractedEvidence: [],
      };
      this.fetchCache.set(url, resData);
      return resData;
    } catch (e) {
      this.fetchCache.set(url, null);
      return null;
    }
  }
}
