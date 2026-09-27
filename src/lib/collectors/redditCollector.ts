import { ICollector, CollectorResult } from './collectorInterface';
import { RawEvidenceItem, ResearchRunConfig } from '@/types';

export class RedditCollector implements ICollector {
  platform = 'reddit' as const;
  name = 'Reddit Discussions';

  async search(query: string, config: ResearchRunConfig): Promise<CollectorResult> {
    const startTime = Date.now();
    const items: RawEvidenceItem[] = [];

    try {
      const timeframeMap: Record<string, string> = {
        '7d': 'week',
        '30d': 'month',
        '90d': 'year',
        '1y': 'year',
        'all': 'all',
      };
      const t = timeframeMap[config.timeframe] || 'month';
      const cleanQuery = encodeURIComponent(query);
      const limit = Math.min(config.maxSources || 25, 30);

      const url = `https://www.reddit.com/search.json?q=${cleanQuery}&sort=relevance&t=${t}&limit=${limit}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CevonOpportunityRadar/1.0 (ResearchTool; contact: research@cevon.local)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Reddit returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const children = data?.data?.children || [];

      for (const child of children) {
        const d = child.data;
        if (!d) continue;

        const title = d.title || '';
        const selftext = d.selftext || '';
        const fullContent = `${title}\n\n${selftext}`.trim();

        if (!fullContent || selftext === '[removed]' || selftext === '[deleted]') {
          if (!title) continue;
        }

        const permalink = d.permalink ? `https://reddit.com${d.permalink}` : d.url;
        const dateIso = d.created_utc ? new Date(d.created_utc * 1000).toISOString() : undefined;

        items.push({
          id: `reddit_${d.id || Math.random().toString(36).substring(2, 9)}`,
          title,
          url: permalink,
          platform: 'reddit',
          author: d.author || 'reddit_user',
          date: dateIso,
          content: fullContent,
          score: d.ups || 0,
          commentsCount: d.num_comments || 0,
        });
      }

      return {
        platform: 'reddit',
        succeeded: true,
        items,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        platform: 'reddit',
        succeeded: false,
        items: [],
        error: err.name === 'AbortError' ? 'Request timed out after 7s' : err.message || 'Failed to fetch Reddit posts',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
