import { NextRequest, NextResponse } from 'next/server';
import { ProductScoutRepository } from '@/lib/db/productScoutRepository';
import { getAuthContext } from '@/lib/auth/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(req);
    const repo = ProductScoutRepository.getInstance();

    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const run = await repo.getRunById(params.id, scope);
    if (!run) {
      return NextResponse.json({ error: 'Research run not found' }, { status: 404 });
    }
    return NextResponse.json(run);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required to delete research runs.' },
        { status: 401 }
      );
    }

    const repo = ProductScoutRepository.getInstance();
    const scope = {
      userId: auth.userId,
      organizationId: auth.organizationId,
    };

    const success = await repo.deleteRun(params.id, scope);
    if (!success) {
      return NextResponse.json(
        { error: 'Research run not found or you are not authorized to delete it' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Research run deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
