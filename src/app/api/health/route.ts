import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    app: 'ProductScout (Next.js)',
    tagline: 'Discovers real problems and identifies software products worth building',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
