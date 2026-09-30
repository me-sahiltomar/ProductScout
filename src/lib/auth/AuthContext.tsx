'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from './client';
import { getProductCallbackUrl, getProductResetPasswordUrl, isSupabaseAuthConfigured, setPostAuthDestination } from './config';
import type { AuthContextValue, UserProfile } from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Fetch or build the profile for the given user, self-healing via upsert if absent
  const fetchProfile = async (currentUser: User): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data) {
        return data as UserProfile;
      }

      // If missing from public.profiles, self-heal by upserting
      const fallbackName =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.email?.split('@')[0] ||
        'Explorer';

      const initialProfile = {
        id: currentUser.id,
        display_name: fallbackName,
        avatar_url: currentUser.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data: upserted } = await supabase
        .from('profiles')
        .upsert(initialProfile)
        .select('*')
        .maybeSingle();

      if (upserted) {
        return upserted as UserProfile;
      }

      return {
        id: currentUser.id,
        display_name: fallbackName,
        avatar_url: currentUser.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Error fetching/upserting profile from public.profiles:', err);
      return {
        id: currentUser.id,
        display_name: currentUser.email?.split('@')[0] || 'Explorer',
        avatar_url: null,
      };
    }
  };


  useEffect(() => {
    let mounted = true;

    if (!isSupabaseAuthConfigured()) {
      setIsLoading(false);
      return;
    }

    async function initializeAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const userProf = await fetchProfile(initialSession.user);
          if (mounted) setProfile(userProf);
        }
      } catch (err) {
        console.error('Failed to initialize ProductScout auth:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    // Subscribe to ongoing auth state transitions (Sign-in, Sign-out, Token refreshed)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: unknown, newSession: Session | null) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const userProf = await fetchProfile(newSession.user);
        if (mounted) setProfile(userProf);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const refreshProfile = async () => {
    if (!user) return;
    const updated = await fetchProfile(user);
    setProfile(updated);
  };

  // Google OAuth sign-in with ProductScout callback
  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      if (redirectTo) {
        setPostAuthDestination(redirectTo);
      }
      const callbackUrl = getProductCallbackUrl();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };


  // Email & Password sign-in
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { error };

      if (data.user) {
        setUser(data.user);
        const prof = await fetchProfile(data.user);
        setProfile(prof);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Email & Password sign-up
  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      const emailRedirectTo = getProductCallbackUrl();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: displayName?.trim() || email.split('@')[0],
          },
        },
      });

      if (error) return { error };

      const needsEmailConfirmation = !data.session;

      if (data.user && data.session) {
        setUser(data.user);
        const prof = await fetchProfile(data.user);
        setProfile(prof);
      }

      return { error: null, needsEmailConfirmation };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Password Reset Email Request
  const resetPasswordForEmail = async (email: string) => {
    try {
      const redirectTo = getProductResetPasswordUrl();

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Password Update for authenticated session
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  // Profile update
  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) return { error };

      // Synchronize display name into auth user_metadata
      if (updates.display_name) {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.display_name.trim(),
            name: updates.display_name.trim(),
          },
        });
      }

      await refreshProfile();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };


  // Helper names
  const effectiveDisplayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Explorer';

  const effectiveFirstName = effectiveDisplayName.split(' ')[0] || effectiveDisplayName;

  const value: AuthContextValue = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: Boolean(user),
    displayName: effectiveDisplayName,
    firstName: effectiveFirstName,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
    updatePassword,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
