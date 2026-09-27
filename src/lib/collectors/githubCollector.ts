import { ICollector, CollectorResult } from './collectorInterface';
import { RawEvidenceItem, ResearchRunConfig } from '@/types';

export class GitHubCollector implements ICollector {
  platform = 'github' as const;
  name = 'GitHub Issues & Discussions';

  async search(query: string, config: ResearchRunConfig): Promise<CollectorResult> {
    const startTime = Date.now();
    const items: RawEvidenceItem[] = [];

    try {
      const cleanQuery = encodeURIComponent(`${query} (problem OR workaround OR struggle OR "too hard" OR "pain point")`);
      const limit = Math.min(config.maxSources || 15, 20);
      const url = `https://api.github.com/search/issues?q=${cleanQuery}+is:issue&sort=comments&order=desc&per_page=${limit}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CevonOpportunityRadar-App/1.0',
          'Accept': 'application/vnd.github.v3+json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 403) {
        return {
          platform: 'github',
          succeeded: false,
          items: [],
          error: 'GitHub API rate limit exceeded for unauthenticated requests',
          executionTimeMs: Date.now() - startTime,
        };
      }

      if (!response.ok) {
        throw new Error(`GitHub returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const issueItems = data.items || [];

      for (const issue of issueItems) {
        const body = (issue.body || '').substring(0, 1500);
        const fullContent = `${issue.title}\n\n${body}`.trim();

        items.push({
          id: `gh_${issue.id}`,
          title: issue.title,
          url: issue.html_url,
          platform: 'github',
          author: issue.user?.login || 'gh_user',
          date: issue.created_at,
          content: fullContent,
          score: issue.reactions?.total_count || 0,
          commentsCount: issue.comments || 0,
        });
      }

      return {
        platform: 'github',
        succeeded: true,
        items,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        platform: 'github',
        succeeded: false,
        items: [],
        error: err.name === 'AbortError' ? 'GitHub request timed out' : err.message || 'GitHub search failed',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
