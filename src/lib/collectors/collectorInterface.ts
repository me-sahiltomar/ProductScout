import { RawEvidenceItem, ResearchRunConfig, SourcePlatform } from '@/types';

export interface CollectorResult {
  platform: SourcePlatform;
  succeeded: boolean;
  items: RawEvidenceItem[];
  error?: string;
  executionTimeMs: number;
}

export interface ICollector {
  platform: SourcePlatform;
  name: string;
  search(query: string, config: ResearchRunConfig): Promise<CollectorResult>;
}
