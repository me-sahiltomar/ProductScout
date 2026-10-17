import { ICollector, CollectorResult } from './collectorInterface';
import { RedditCollector } from './redditCollector';
import { HackerNewsCollector } from './hnCollector';
import { GitHubCollector } from './githubCollector';
import { DevToCollector } from './devtoCollector';
import { WebCollector } from './webCollector';
import { TavilyCollector } from './tavilyCollector';
import { RawEvidenceItem, ResearchCoverage, ResearchRunConfig, SourcePlatform } from '@/types';

export class CollectorManager {
  private collectors: Map<SourcePlatform, ICollector> = new Map();

  constructor() {
    this.registerCollector(new RedditCollector());
    this.registerCollector(new HackerNewsCollector());
    this.registerCollector(new GitHubCollector());
    this.registerCollector(new DevToCollector());
    
    if (process.env.TAVILY_API_KEY) {
      this.registerCollector(new TavilyCollector());
    } else {
      this.registerCollector(new WebCollector());
    }
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

  public async progressiveCollectAll(config: ResearchRunConfig): Promise<{
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
    const discoveryLimit = (config.maxSources || 30) * 2; // Fetch more for initial scoring

    // Pass 1: Discovery
    const discoveryPromises = targetCollectors.map(async (collector) => {
      if (collector.discover) {
        try {
          const results = await collector.discover(query, config, discoveryLimit);
          return { platform: collector.platform, results, useDeepFetch: !!collector.deepFetch };
        } catch (e) {
          return { platform: collector.platform, results: [], useDeepFetch: !!collector.deepFetch };
        }
      } else {
        // Fallback to legacy search
        const result = await collector.search(query, config);
        const mapped = result.items.map(item => ({
          url: item.url,
          title: item.title,
          snippet: item.content,
          publishedDate: item.date,
          score: item.score
        }));
        return { platform: collector.platform, results: mapped, useDeepFetch: false };
      }
    });

    const discoveryResults = await Promise.all(discoveryPromises);

    // Pass 2: Deduplicate & Score Candidates
    let allCandidates: any[] = [];
    discoveryResults.forEach(dr => {
      dr.results.forEach((r: any) => {
        allCandidates.push({ ...r, platform: dr.platform, useDeepFetch: dr.useDeepFetch });
      });
    });

    const seenUrls = new Set<string>();
    const deduplicatedCandidates = allCandidates.filter(c => {
      if (seenUrls.has(c.url)) return false;
      seenUrls.add(c.url);
      return true;
    });

    // Take top N candidates based on configured limits (budget)
    const maxDeepFetches = config.budget?.maxDeepFetches || config.maxSources || 15;
    const topCandidates = deduplicatedCandidates.slice(0, maxDeepFetches);

    // Pass 3: Deep Fetch selected candidates
    const rawItems: RawEvidenceItem[] = [];
    const fetchPromises = topCandidates.map(async (candidate, index) => {
      if (candidate.useDeepFetch) {
        const collector = this.collectors.get(candidate.platform);
        if (collector && collector.deepFetch) {
          const deepData = await collector.deepFetch(candidate.url, config);
          if (deepData) {
            rawItems.push({
              id: `ev_${candidate.platform}_${index}_${Date.now()}`,
              title: candidate.title,
              url: candidate.url,
              platform: candidate.platform as SourcePlatform,
              date: candidate.publishedDate,
              content: deepData.content || candidate.snippet,
              score: candidate.score || 1,
            });
            return;
          }
        }
      }
      
      // Fallback if no deep fetch or deep fetch fails
      rawItems.push({
        id: `ev_${candidate.platform}_${index}_${Date.now()}`,
        title: candidate.title,
        url: candidate.url,
        platform: candidate.platform as SourcePlatform,
        date: candidate.publishedDate,
        content: `${candidate.title}\n\n${candidate.snippet}`,
        score: candidate.score || 1,
      });
    });

    await Promise.all(fetchPromises);

    const coverage: ResearchCoverage = {
      sourcesSearched: targetCollectors.map(c => c.platform),
      sourcesCollectedCount: rawItems.length,
      sourcesSucceeded: targetCollectors.map(c => c.platform),
      sourcesUnavailable: [],
      dateRange: config.timeframe === 'all' ? 'All time' : `Past ${config.timeframe}`,
      qualityDistribution: { high: 0, medium: 0, low: 0 },
    };

    return { rawItems, coverage };
  }

  public async deepFetchUrl(url: string, config: ResearchRunConfig): Promise<string | null> {
    const webCollector = this.collectors.get('web');
    if (webCollector && webCollector.deepFetch) {
      const res = await webCollector.deepFetch(url, config);
      return res?.content || null;
    }
    return null;
  }
}
