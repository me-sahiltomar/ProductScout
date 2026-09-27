import { ICollector, CollectorResult } from './collectorInterface';
import { RawEvidenceItem, ResearchRunConfig } from '@/types';

export class DevToCollector implements ICollector {
  platform = 'devto' as const;
  name = 'Dev.to & Tech Communities';

  async search(query: string, config: ResearchRunConfig): Promise<CollectorResult> {
    const startTime = Date.now();
    const items: RawEvidenceItem[] = [];

    try {
      const cleanQuery = encodeURIComponent(query);
      const limit = Math.min(config.maxSources || 15, 20);
      const url = `https://dev.to/api/articles?q=${cleanQuery}&per_page=${limit}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CevonOpportunityRadar-App/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Dev.to returned HTTP ${response.status}`);
      }

      const articles = await response.json();
      if (Array.isArray(articles)) {
        for (const art of articles) {
          const content = `${art.title}\n\n${art.description || ''}`.trim();
          items.push({
            id: `devto_${art.id}`,
            title: art.title,
            url: art.url,
            platform: 'devto',
            author: art.user?.name || art.user?.username || 'community_author',
            date: art.published_at,
            content,
            score: art.positive_reactions_count || 0,
            commentsCount: art.comments_count || 0,
          });
        }
      }

      return {
        platform: 'devto',
        succeeded: true,
        items,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        platform: 'devto',
        succeeded: false,
        items: [],
        error: err.name === 'AbortError' ? 'Dev.to request timed out' : err.message || 'Dev.to search failed',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
