import { ICollector, CollectorResult } from './collectorInterface';
import { RedditCollector } from './redditCollector';
import { HackerNewsCollector } from './hnCollector';
import { GitHubCollector } from './githubCollector';
import { DevToCollector } from './devtoCollector';
import { WebCollector } from './webCollector';
import { RawEvidenceItem, ResearchCoverage, ResearchRunConfig, SourcePlatform } from '@/types';

export class CollectorManager {
  private collectors: Map<SourcePlatform, ICollector> = new Map();

  constructor() {
    this.registerCollector(new RedditCollector());
    this.registerCollector(new HackerNewsCollector());
    this.registerCollector(new GitHubCollector());
    this.registerCollector(new DevToCollector());
    this.registerCollector(new WebCollector());
  }

  public registerCollector(collector: ICollector) {
    this.collectors.set(collector.platform, collector);
  }

  public async collectAll(config: ResearchRunConfig): Promise<{
    rawItems: RawEvidenceItem[];
    coverage: ResearchCoverage;
  }> {
    const enabledPlatforms: SourcePlatform[] = config.enabledSources && config.enabledSources.length > 0
      ? config.enabledSources
      : ['reddit', 'hacker_news', 'github', 'devto', 'web'];

    const targetCollectors = enabledPlatforms
      .map(p => this.collectors.get(p))
      .filter((c): c is ICollector => !!c);

    const query = config.topic.trim();

    const results = await Promise.allSettled(
      targetCollectors.map(collector => collector.search(query, config))
    );

    const rawItems: RawEvidenceItem[] = [];
    const sourcesSearched: SourcePlatform[] = [];
    const sourcesSucceeded: SourcePlatform[] = [];
    const sourcesUnavailable: Array<{ platform: SourcePlatform; reason: string }> = [];

    results.forEach((res, index) => {
      const collector = targetCollectors[index];
      sourcesSearched.push(collector.platform);

      if (res.status === 'fulfilled') {
        const result: CollectorResult = res.value;
        if (result.succeeded && result.items.length > 0) {
          sourcesSucceeded.push(collector.platform);
          rawItems.push(...result.items);
        } else {
          sourcesUnavailable.push({
            platform: collector.platform,
            reason: result.error || 'No relevant signals retrieved',
          });
        }
      } else {
        sourcesUnavailable.push({
          platform: collector.platform,
          reason: res.reason?.message || 'Source request rejected or timed out',
        });
      }
    });

    const seenUrls = new Set<string>();
    const deduplicatedItems: RawEvidenceItem[] = [];

    for (const item of rawItems) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        deduplicatedItems.push(item);
      }
    }

    const finalItems = deduplicatedItems.slice(0, config.maxSources || 30);

    const coverage: ResearchCoverage = {
      sourcesSearched,
      sourcesCollectedCount: finalItems.length,
      sourcesSucceeded,
      sourcesUnavailable,
      dateRange: config.timeframe === 'all' ? 'All time' : `Past ${config.timeframe}`,
      qualityDistribution: {
        high: 0,
        medium: 0,
        low: 0,
      },
    };

    return {
      rawItems: finalItems,
      coverage,
    };
  }
}
