import { NextRequest } from 'next/server';
import { createClient, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '@/lib/db/supabaseClient';

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
 * 2. Cookie: sb-access-token or sb-<project>-auth-token
 *
 * If valid, fetches or provisions their default organization context.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext> {
  // If Supabase is not configured, return unauthenticated context
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      user: null,
      userId: null,
      organizationId: null,
      isAuthenticated: false,
    };
  }

  try {
    let token: string | null = null;

    // 1. Check Authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Check cookies if header absent
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [k, ...v] = c.trim().split('=');
          return [k, decodeURIComponent(v.join('='))];
        })
      );

      token = cookies['sb-access-token'] || null;

      // Also inspect Supabase Auth v2 chunked cookie structure
      if (!token) {
        for (const [k, v] of Object.entries(cookies)) {
          if (k.startsWith('sb-') && k.endsWith('-auth-token')) {
            try {
              const parsed = JSON.parse(v);
              if (Array.isArray(parsed) && parsed[0]) {
                token = parsed[0];
              } else if (parsed.access_token) {
                token = parsed.access_token;
              }
            } catch {
              token = v;
            }
            break;
          }
        }
      }
    }

    if (!token) {
      return {
        user: null,
        userId: null,
        organizationId: null,
        isAuthenticated: false,
      };
    }

    // Verify token with Supabase Auth
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return {
        user: null,
        userId: null,
        organizationId: null,
        isAuthenticated: false,
      };
    }

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
