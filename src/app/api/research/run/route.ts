import { NextRequest, NextResponse } from 'next/server';
import { ProductScoutRepository } from '@/lib/db/productScoutRepository';
import { ResearchPipeline } from '@/lib/engine/researchPipeline';
import { ResearchRunConfig } from '@/types';
import { getAuthContext } from '@/lib/auth/serverAuth';
import { apiRateLimiter } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow maximum timeout on Vercel Pro/serverless

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await getAuthContext(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required to initiate research runs. Please sign in.' },
        { status: 401 }
      );
    }

    // 2. Rate limiting check (5 runs per 10 minutes per tenant)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateLimitKey = `run:${auth.userId || ip}`;
    const rateCheck = apiRateLimiter.check(rateLimitKey, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can initiate up to 5 research runs every 10 minutes.',
          retryAfterMs: rateCheck.resetInMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.resetInMs / 1000)),
          },
        }
      );
    }

    // 3. Parse and validate input payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body.topic !== 'string') {
      return NextResponse.json({ error: 'Research topic is required' }, { status: 400 });
    }

    const trimmedTopic = body.topic.trim();
    if (trimmedTopic.length < 3 || trimmedTopic.length > 200) {
      return NextResponse.json(
        { error: 'Research topic must be between 3 and 200 characters in length.' },
        { status: 400 }
      );
    }

    const validTimeframes = ['7d', '30d', '90d', '1y', 'all'] as const;
    const timeframe = validTimeframes.includes(body.timeframe) ? body.timeframe : '30d';

    let maxSources = typeof body.maxSources === 'number' ? Math.floor(body.maxSources) : 30;
    if (maxSources < 5) maxSources = 5;
    if (maxSources > 60) maxSources = 60;

    const enabledSources = Array.isArray(body.enabledSources) && body.enabledSources.length > 0
      ? body.enabledSources.filter((s: any) => typeof s === 'string')
      : ['reddit', 'hackernews', 'github', 'devto', 'web'];

    const config: ResearchRunConfig = {
      topic: trimmedTopic,
      timeframe,
      maxSources,
      focus: typeof body.focus === 'string' && body.focus.trim() ? body.focus.trim() : 'Workflow inefficiencies and unmet tooling demands',
      targetUser: typeof body.targetUser === 'string' ? body.targetUser.trim() : undefined,
      geography: typeof body.geography === 'string' ? body.geography.trim() : undefined,
      industry: typeof body.industry === 'string' ? body.industry.trim() : undefined,
      enabledSources,
    };

    // 4. Execute pipeline within user/tenant scope
    const repo = ProductScoutRepository.getInstance();
    const pipeline = new ResearchPipeline(repo);

    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const run = await pipeline.execute(config, scope);
    return NextResponse.json(run);
  } catch (err: any) {
    console.error('Research execution error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to complete research run' },
      { status: 500 }
    );
  }
}
