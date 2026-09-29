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
    if (!body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const rawTopic = typeof body.topic === 'string' && body.topic.trim()
      ? body.topic.trim()
      : (typeof body.brief?.subject === 'string' ? body.brief.subject.trim() : '');

    if (!rawTopic || rawTopic.length < 3 || rawTopic.length > 250) {
      return NextResponse.json(
        { error: 'Research topic / subject must be between 3 and 250 characters in length.' },
        { status: 400 }
      );
    }

    const validTimeframes = ['7d', '30d', '90d', '1y', 'all'] as const;
    const requestedTimeframe = body.timeframe || body.brief?.researchConfiguration?.evidenceWindow;
    const timeframe = validTimeframes.includes(requestedTimeframe) ? requestedTimeframe : '30d';

    let maxSources = typeof body.maxSources === 'number' 
      ? Math.floor(body.maxSources) 
      : (typeof body.brief?.researchConfiguration?.maxSources === 'number' ? Math.floor(body.brief.researchConfiguration.maxSources) : 30);
    if (maxSources < 5) maxSources = 5;
    if (maxSources > 60) maxSources = 60;

    const enabledSources = Array.isArray(body.enabledSources) && body.enabledSources.length > 0
      ? body.enabledSources.filter((s: any) => typeof s === 'string')
      : (Array.isArray(body.brief?.researchConfiguration?.sources) && body.brief.researchConfiguration.sources.length > 0
          ? body.brief.researchConfiguration.sources
          : ['reddit', 'hackernews', 'github', 'devto', 'web']);

    const config: ResearchRunConfig = {
      topic: rawTopic,
      timeframe,
      maxSources,
      focus: typeof body.focus === 'string' && body.focus.trim() 
        ? body.focus.trim() 
        : (body.brief?.intent || body.brief?.target?.workflow || 'Workflow inefficiencies and unmet tooling demands'),
      targetUser: typeof body.targetUser === 'string' ? body.targetUser.trim() : (body.brief?.target?.primaryUser || body.brief?.target?.targetUser),
      geography: typeof body.geography === 'string' ? body.geography.trim() : body.brief?.target?.geography,
      industry: typeof body.industry === 'string' ? body.industry.trim() : body.brief?.target?.industry,
      enabledSources,
      brief: body.brief || undefined,
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
