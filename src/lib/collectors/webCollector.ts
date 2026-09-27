import { ICollector, CollectorResult } from './collectorInterface';
import { RawEvidenceItem, ResearchRunConfig } from '@/types';

export class WebCollector implements ICollector {
  platform = 'web' as const;
  name = 'Web Discussions & Reviews';

  async search(query: string, config: ResearchRunConfig): Promise<CollectorResult> {
    const startTime = Date.now();
    const items: RawEvidenceItem[] = [];

    try {
      const searchQuery = `${query} ("frustrating" OR "workaround" OR "terrible experience" OR "hate using" OR "alternative to")`;
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Web search returned HTTP ${response.status}`);
      }

      const html = await response.text();

      const resultBlocks = html.split(/class="result\s+results_links/g).slice(1);
      const limit = Math.min(config.maxSources || 15, 20);

      for (let i = 0; i < Math.min(resultBlocks.length, limit); i++) {
        const block = resultBlocks[i];
        
        const linkMatch = block.match(/href="([^"]+)" class="result__url/);
        const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)<\/a>/);
        const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

        if (titleMatch && linkMatch) {
          const rawUrl = linkMatch[1];
          let targetUrl = rawUrl;
          if (rawUrl.includes('uddg=')) {
            try {
              const urlParams = new URL(`https://html.duckduckgo.com${rawUrl}`).searchParams;
              targetUrl = decodeURIComponent(urlParams.get('uddg') || rawUrl);
            } catch {
              targetUrl = rawUrl;
            }
          }

          const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim();
          const snippet = snippetMatch 
            ? snippetMatch[1].replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").trim()
            : '';

          if (title && snippet) {
            items.push({
              id: `web_${i}_${Math.random().toString(36).substring(2, 7)}`,
              title,
              url: targetUrl,
              platform: 'web',
              author: 'web_contributor',
              date: new Date().toISOString().split('T')[0],
              content: `${title}\n\n${snippet}`,
              score: 1,
              commentsCount: 0,
            });
          }
        }
      }

      return {
        platform: 'web',
        succeeded: items.length > 0,
        items,
        executionTimeMs: Date.now() - startTime,
        error: items.length === 0 ? 'No web discussion snippets found' : undefined,
      };
    } catch (err: any) {
      return {
        platform: 'web',
        succeeded: false,
        items: [],
        error: err.name === 'AbortError' ? 'Web search timed out' : err.message || 'Web search failed',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
