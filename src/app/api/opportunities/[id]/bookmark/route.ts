import { NextRequest, NextResponse } from 'next/server';
import { ProductScoutRepository } from '@/lib/db/productScoutRepository';
import { getAuthContext } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { isSaved: false, requiresAuth: true, error: 'Sign in to save opportunities to your account.' },
        { status: 200 }
      );
    }

    const { runId } = await req.json().catch(() => ({}));
    const repo = ProductScoutRepository.getInstance();
    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const result = await repo.toggleBookmark(params.id, runId, scope);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
