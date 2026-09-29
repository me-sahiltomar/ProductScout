export const DEFAULT_SUPABASE_URL = 'https://gzhiltwyuhclzbhaypzd.supabase.co';
export const DEFAULT_SITE_URL = 'https://productscout.cevonx.com';

/**
 * Resolves the OAuth and auth verification callback URL for ProductScout.
 */
export function getProductCallbackUrl(origin?: string): string {
  if (origin && typeof origin === 'string' && origin.startsWith('http')) {
    return `${origin.replace(/\/$/, '')}/auth/callback`;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  return `${siteUrl.replace(/\/$/, '')}/auth/callback`;
}

/**
 * Validates a redirect target to prevent open redirect vulnerabilities.
 * Enforces strictly relative paths starting with a single forward slash.
 */
export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string = '/'
): string {
  if (!candidate || typeof candidate !== 'string') return fallback;

  const trimmed = candidate.trim();

  // Reject empty string or non-relative paths
  if (!trimmed.startsWith('/')) return fallback;

  // Reject protocol-relative URLs (e.g., //attacker.com)
  if (trimmed.startsWith('//')) return fallback;

  // Reject backslash tricks that browsers might normalize (e.g., /\attacker.com)
  if (trimmed.includes('\\')) return fallback;

  return trimmed;
}

/**
 * Checks if Supabase credentials are configured in the environment.
 */
export function isSupabaseAuthConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    '';
  return Boolean(url && key);
}
