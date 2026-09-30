import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getAppBaseUrl, getSafeRedirectPath } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

/**
 * ProductScout OAuth and Email Verification Callback Handler
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const safeNext = getSafeRedirectPath(rawNext, '/');

  // Derive guaranteed ProductScout base origin
  const requestUrl = new URL(request.url);
  const isLocal = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
  const forwardedHost = request.headers.get('x-forwarded-host');
  const baseOrigin = isLocal
    ? requestUrl.origin
    : forwardedHost && !forwardedHost.includes('products.cevonx.com')
      ? `https://${forwardedHost}`
      : getAppBaseUrl();

  if (error) {
    console.error('ProductScout auth callback provider error:', error, errorDescription);
    const redirectUrl = new URL('/auth/login', baseOrigin);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    try {
      const supabase = createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('ProductScout session exchange error:', exchangeError.message);
        const redirectUrl = new URL('/auth/login', baseOrigin);
        redirectUrl.searchParams.set('error', exchangeError.message);
        return NextResponse.redirect(redirectUrl);
      }

      return NextResponse.redirect(new URL(safeNext, baseOrigin));
    } catch (err: any) {
      console.error('ProductScout unexpected callback error:', err);
      const redirectUrl = new URL('/auth/login', baseOrigin);
      redirectUrl.searchParams.set('error', 'Authentication failed. Please try again.');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL('/auth/login', baseOrigin));
}
