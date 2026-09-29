import { NextRequest, NextResponse } from 'next/server';
import { fetchAvailableGeminiModels } from '@/lib/engine/geminiModelDiscovery';
import { apiRateLimiter } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateCheck = apiRateLimiter.check(`models:gemini:${ip}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before querying models.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const clientKey = searchParams.get('key') || undefined;

    const result = await fetchAvailableGeminiModels(clientKey, forceRefresh);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
