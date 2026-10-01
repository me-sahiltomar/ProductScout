import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient, User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_KEY } from '@/lib/db/supabaseClient';
import { DEFAULT_SUPABASE_URL } from './config';

export interface AuthContext {
  user: User | null;
  userId: string | null;
  organizationId: string | null;
  isAuthenticated: boolean;
}

/**
 * Extracts and verifies the Supabase user from the request.
 * Checks:
 * 1. Authorization: Bearer <token>
 * 2. @supabase/ssr chunked cookies via request
 * 3. Fallback raw cookie inspection
 *
 * If valid, fetches or provisions their default organization context.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      user: null,
      userId: null,
      organizationId: null,
      isAuthenticated: false,
    };
  }

  try {
    let user: User | null = null;

    // 1. Check Authorization header: Bearer <token>
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        try {
          const adminClient = createSupabaseClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data, error } = await adminClient.auth.getUser(token);
          if (!error && data?.user) {
            user = data.user;
          }
        } catch (e) {
          console.warn('Bearer token verification failed:', e);
        }
      }
    }

    // 2. If no user yet, check cookies via @supabase/ssr
    if (!user) {
      try {
        const ssrClient = createServerClient(url, key, {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll() {},
          },
        });
        const { data, error } = await ssrClient.auth.getUser();
        if (!error && data?.user) {
          user = data.user;
        }
      } catch (e) {
        console.warn('SSR cookies verification failed:', e);
      }
    }

    // 3. Fallback: Check raw cookie header if needed
    if (!user) {
      const cookieHeader = req.headers.get('cookie') || '';
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(';').map(c => {
            const [k, ...v] = c.trim().split('=');
            return [k, decodeURIComponent(v.join('='))];
          })
        );

        let fallbackToken = cookies['sb-access-token'] || null;
        if (!fallbackToken) {
          for (const [k, v] of Object.entries(cookies)) {
            if (k.startsWith('sb-') && k.includes('-auth-token')) {
              try {
                const parsed = JSON.parse(v);
                if (Array.isArray(parsed) && parsed[0]) {
                  fallbackToken = parsed[0];
                } else if (parsed.access_token) {
                  fallbackToken = parsed.access_token;
                }
              } catch {
                fallbackToken = v;
              }
              if (fallbackToken) break;
            }
          }
        }

        if (fallbackToken) {
          const adminClient = createSupabaseClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data } = await adminClient.auth.getUser(fallbackToken);
          if (data?.user) {
            user = data.user;
          }
        }
      }
    }

    if (!user) {
      return {
        user: null,
        userId: null,
        organizationId: null,
        isAuthenticated: false,
      };
    }

    const supabaseAdmin = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Fetch user's organization membership
    let organizationId: string | null = null;
    const { data: memberRows } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    if (memberRows && memberRows.length > 0) {
      organizationId = memberRows[0].organization_id;
    } else {
      // Provision default personal organization if none exists
      try {
        const orgSlug = `org-${user.id.substring(0, 8)}`;
        const orgName = user.email ? `${user.email.split('@')[0]}'s Workspace` : 'Personal Workspace';

        const { data: newOrg, error: orgErr } = await supabaseAdmin
          .from('organizations')
          .insert({
            name: orgName,
            slug: orgSlug,
          })
          .select('id')
          .single();

        if (newOrg && !orgErr) {
          organizationId = newOrg.id;
          await supabaseAdmin.from('organization_members').insert({
            organization_id: newOrg.id,
            user_id: user.id,
            role: 'owner',
          });
        }
      } catch (e) {
        console.warn('Could not auto-provision organization:', e);
      }
    }

    return {
      user,
      userId: user.id,
      organizationId,
      isAuthenticated: true,
    };
  } catch (err) {
    console.error('getAuthContext error:', err);
    return {
      user: null,
      userId: null,
      organizationId: null,
      isAuthenticated: false,
    };
  }
}
