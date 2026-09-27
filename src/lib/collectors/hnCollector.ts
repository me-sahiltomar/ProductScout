import { ICollector, CollectorResult } from './collectorInterface';
import { RawEvidenceItem, ResearchRunConfig } from '@/types';

export class HackerNewsCollector implements ICollector {
  platform = 'hacker_news' as const;
  name = 'Hacker News';

  async search(query: string, config: ResearchRunConfig): Promise<CollectorResult> {
    const startTime = Date.now();
    const items: RawEvidenceItem[] = [];

    try {
      const cleanQuery = encodeURIComponent(query);
      const limit = Math.min(config.maxSources || 25, 30);

      const storyUrl = `https://hn.algolia.com/api/v1/search?query=${cleanQuery}&tags=(story,ask_hn)&hitsPerPage=${Math.ceil(limit / 2)}`;
      const commentUrl = `https://hn.algolia.com/api/v1/search?query=${cleanQuery}&tags=comment&hitsPerPage=${Math.ceil(limit / 2)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const [storyRes, commentRes] = await Promise.allSettled([
        fetch(storyUrl, { signal: controller.signal }),
        fetch(commentUrl, { signal: controller.signal }),
      ]);

      clearTimeout(timeoutId);

      if (storyRes.status === 'fulfilled' && storyRes.value.ok) {
        const storyData = await storyRes.value.json();
        const hits = storyData.hits || [];
        for (const hit of hits) {
          const title = hit.title || hit.story_title || 'HN Discussion';
          const text = hit.story_text || '';
          const fullContent = `${title}\n\n${text}`.trim();
          const itemUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;

          items.push({
            id: `hn_${hit.objectID}`,
            title,
            url: itemUrl,
            platform: 'hacker_news',
            author: hit.author || 'hn_user',
            date: hit.created_at,
            content: fullContent,
            score: hit.points || 0,
            commentsCount: hit.num_comments || 0,
          });
        }
      }

      if (commentRes.status === 'fulfilled' && commentRes.value.ok) {
        const commentData = await commentRes.value.json();
        const hits = commentData.hits || [];
        for (const hit of hits) {
          const rawText = (hit.comment_text || '').replace(/<[^>]*>?/gm, '');
          if (!rawText || rawText.length < 20) continue;

          const storyTitle = hit.story_title || 'HN Comment Discussion';
          const itemUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;

          items.push({
            id: `hn_c_${hit.objectID}`,
            title: `Comment on: ${storyTitle}`,
            url: itemUrl,
            platform: 'hacker_news',
            author: hit.author || 'hn_commenter',
            date: hit.created_at,
            content: rawText,
            score: hit.points || 1,
            commentsCount: 0,
          });
        }
      }

      return {
        platform: 'hacker_news',
        succeeded: items.length > 0,
        items,
        executionTimeMs: Date.now() - startTime,
        error: items.length === 0 ? 'No results returned from Hacker News' : undefined,
      };
    } catch (err: any) {
      return {
        platform: 'hacker_news',
        succeeded: false,
        items: [],
        error: err.name === 'AbortError' ? 'HN request timed out' : err.message || 'HN search failed',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
