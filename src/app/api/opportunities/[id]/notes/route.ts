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
        { error: 'Authentication required to update opportunity notes.' },
        { status: 401 }
      );
    }

    const { notes } = await req.json().catch(() => ({ notes: '' }));
    const repo = ProductScoutRepository.getInstance();
    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const success = await repo.updateOpportunityNotes(params.id, notes || '', scope);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
