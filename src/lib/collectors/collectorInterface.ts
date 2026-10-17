import { RawEvidenceItem, ResearchRunConfig, SourcePlatform } from '@/types';

export interface CollectorResult {
  platform: SourcePlatform;
  succeeded: boolean;
  items: RawEvidenceItem[];
  error?: string;
  executionTimeMs: number;
}

export interface DiscoveryResult {
  url: string;
  title: string;
  snippet: string;
  publishedDate?: string;
  score?: number;
  metadata?: any;
}

export interface DeepFetchResult {
  url: string;
  content: string;
  extractedEvidence: string[];
}

export interface ICollector {
  platform: SourcePlatform;
  name: string;
  search(query: string, config: ResearchRunConfig): Promise<CollectorResult>;
  discover?(query: string, config: ResearchRunConfig, limit: number): Promise<DiscoveryResult[]>;
  deepFetch?(url: string, config: ResearchRunConfig): Promise<DeepFetchResult | null>;
}
