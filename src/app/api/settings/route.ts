import { NextRequest, NextResponse } from 'next/server';
import { ProductScoutRepository } from '@/lib/db/productScoutRepository';
import { SystemSettings } from '@/types';
import { getAuthContext } from '@/lib/auth/serverAuth';
import { apiRateLimiter } from '@/lib/security/rateLimiter';
import { fetchAvailableGeminiModels } from '@/lib/engine/geminiModelDiscovery';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const repo = ProductScoutRepository.getInstance();

    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const [settings, modelDiscovery] = await Promise.all([
      repo.getSettings(scope),
      fetchAvailableGeminiModels(),
    ]);

    const responseData: SystemSettings = {
      ...settings,
      hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasServerOpenaiKey: Boolean(process.env.OPENAI_API_KEY),
      availableGeminiModels: modelDiscovery.models,
      recommendedGeminiModel: modelDiscovery.recommendedModel,
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required to modify settings.' },
        { status: 401 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateCheck = apiRateLimiter.check(`settings:${auth.userId || ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before modifying settings again.' },
        { status: 429 }
      );
    }

    const rawUpdates = await req.json();

    // Whitelist only safe non-secret configuration parameters
    const safeUpdates: Partial<SystemSettings> = {};
    if (rawUpdates.aiProvider) safeUpdates.aiProvider = rawUpdates.aiProvider;
    if (rawUpdates.geminiModel) safeUpdates.geminiModel = rawUpdates.geminiModel;
    if (rawUpdates.openaiBaseUrl) safeUpdates.openaiBaseUrl = rawUpdates.openaiBaseUrl;
    if (rawUpdates.openaiModel) safeUpdates.openaiModel = rawUpdates.openaiModel;
    if (typeof rawUpdates.defaultMaxSources === 'number') {
      safeUpdates.defaultMaxSources = rawUpdates.defaultMaxSources;
    }
    if (rawUpdates.defaultTimeframe) safeUpdates.defaultTimeframe = rawUpdates.defaultTimeframe;

    const repo = ProductScoutRepository.getInstance();
    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const [updated, modelDiscovery] = await Promise.all([
      repo.updateSettings(safeUpdates, scope),
      fetchAvailableGeminiModels(),
    ]);

    return NextResponse.json({
      success: true,
      settings: {
        ...updated,
        hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        hasServerOpenaiKey: Boolean(process.env.OPENAI_API_KEY),
        availableGeminiModels: modelDiscovery.models,
        recommendedGeminiModel: modelDiscovery.recommendedModel,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
