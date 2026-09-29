import { DiscoveredModel } from '@/types';

export const FALLBACK_GEMINI_MODELS: DiscoveredModel[] = [
  {
    id: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    description: 'Latest high-efficiency agentic model with superior reasoning speed, low latency, and low cost.',
    isRecommended: true,
    badge: 'Recommended • Newest & Quickest',
    score: 43,
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Fast multimodal reasoning model optimized for high throughput.',
    badge: 'Fast & Efficient',
    score: 30,
  },
  {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Advanced reasoning and problem formulation for complex domains.',
    badge: 'Deep Frontier Reasoning',
    score: 27,
  },
  {
    id: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    description: 'Next-generation low-latency model.',
    badge: 'Fast & Efficient',
    score: 25,
  },
  {
    id: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    description: 'Standard lightweight model.',
    badge: 'Legacy Fast',
    score: 20,
  },
  {
    id: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    description: 'Standard reasoning model.',
    badge: 'Legacy Pro',
    score: 17,
  },
];

/**
 * Calculates a dynamic score for Gemini models to ensure the newest,
 * quickest, and most efficient model (e.g. gemini-3.8-flash) sits at the top.
 */
export function scoreGeminiModel(id: string): number {
  const cleanId = id.toLowerCase().replace(/^models\//, '');
  
  // Extract major.minor or major version (e.g. 3.8, 2.5, 2.0, 1.5)
  const match = cleanId.match(/gemini-(\d+(?:\.\d+)?)/i);
  const version = match ? parseFloat(match[1]) : 1.0;

  // Flash models are fastest and most efficient
  let speedScore = 1;
  if (cleanId.includes('flash')) {
    speedScore = 5;
  } else if (cleanId.includes('pro')) {
    speedScore = 2;
  }

  // Slight penalty for experimental / preview / nightly vs stable of the same generation
  const isExp = cleanId.includes('exp') || cleanId.includes('preview') || cleanId.includes('nightly');
  const expPenalty = isExp ? 0.2 : 0;

  // Tiny penalty for 8b or lite vs main flash
  const isLite = cleanId.includes('8b') || cleanId.includes('lite');
  const litePenalty = isLite ? 0.3 : 0;

  return (version * 10) + speedScore - expPenalty - litePenalty;
}

interface CacheEntry {
  models: DiscoveredModel[];
  recommendedModel: string;
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Dynamically queries Google's official ListModels API using the provided or server-side API key.
 * Discovered models are filtered for generateContent support, ranked so the newest/quickest/most-efficient
 * sits at the very top (index 0), and returned with informative badges.
 */
export async function fetchAvailableGeminiModels(
  providedKey?: string,
  forceRefresh = false
): Promise<{
  models: DiscoveredModel[];
  recommendedModel: string;
  source: 'live' | 'fallback';
}> {
  const apiKey = providedKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      models: FALLBACK_GEMINI_MODELS,
      recommendedModel: FALLBACK_GEMINI_MODELS[0].id,
      source: 'fallback',
    };
  }

  const now = Date.now();
  if (!forceRefresh && cache && now - cache.timestamp < CACHE_TTL_MS) {
    return {
      models: cache.models,
      recommendedModel: cache.recommendedModel,
      source: 'live',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Gemini ListModels returned HTTP ${res.status}: ${res.statusText}`);
      return {
        models: FALLBACK_GEMINI_MODELS,
        recommendedModel: FALLBACK_GEMINI_MODELS[0].id,
        source: 'fallback',
      };
    }

    const data = await res.json();
    const rawList: any[] = data.models || [];

    // Filter to generative Gemini models
    const validModels = rawList.filter((m) => {
      const name = (m.name || '').toLowerCase();
      const methods: string[] = m.supportedGenerationMethods || [];
      return (
        name.includes('gemini') &&
        methods.includes('generateContent') &&
        !name.includes('embedding') &&
        !name.includes('aqa')
      );
    });

    if (validModels.length === 0) {
      return {
        models: FALLBACK_GEMINI_MODELS,
        recommendedModel: FALLBACK_GEMINI_MODELS[0].id,
        source: 'fallback',
      };
    }

    // Map and score models
    const mapped: DiscoveredModel[] = validModels.map((m) => {
      const id = (m.name || '').replace(/^models\//, '');
      const score = scoreGeminiModel(id);
      return {
        id,
        displayName: m.displayName || id,
        description: m.description || '',
        score,
      };
    });

    // Deduplicate by ID
    const uniqueMap = new Map<string, DiscoveredModel>();
    for (const model of mapped) {
      if (!uniqueMap.has(model.id)) {
        uniqueMap.set(model.id, model);
      }
    }

    // Sort descending by score (newest + fastest at top)
    const sorted = Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);

    // Apply descriptive badges
    const modelsWithBadges: DiscoveredModel[] = sorted.map((m, idx) => {
      if (idx === 0) {
        return {
          ...m,
          isRecommended: true,
          badge: 'Recommended • Newest & Quickest',
        };
      }
      if (m.id.includes('flash')) {
        return {
          ...m,
          badge: 'Fast & Efficient',
        };
      }
      if (m.id.includes('pro')) {
        return {
          ...m,
          badge: 'Deep Frontier Reasoning',
        };
      }
      return m;
    });

    const recommendedModel = modelsWithBadges[0]?.id || 'gemini-3.8-flash';

    cache = {
      models: modelsWithBadges,
      recommendedModel,
      timestamp: now,
    };

    return {
      models: modelsWithBadges,
      recommendedModel,
      source: 'live',
    };
  } catch (err) {
    console.warn('Could not fetch live models from Google Gemini API, using presets:', err);
    return {
      models: FALLBACK_GEMINI_MODELS,
      recommendedModel: FALLBACK_GEMINI_MODELS[0].id,
      source: 'fallback',
    };
  }
}
