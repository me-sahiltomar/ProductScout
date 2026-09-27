import { NextRequest, NextResponse } from 'next/server';
import { ProductScoutRepository } from '@/lib/db/productScoutRepository';
import { getAuthContext } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth.isAuthenticated) {
      // Unauthenticated visitors have no saved bookmarks
      return NextResponse.json([]);
    }

    const repo = ProductScoutRepository.getInstance();
    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const saved = await repo.getSavedOpportunities(scope);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
