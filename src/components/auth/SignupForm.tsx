'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getSafeRedirectPath } from '@/lib/auth/config';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Radio, ShieldCheck } from 'lucide-react';

interface SignupFormProps {
  initialRedirect?: string;
}

export function SignupForm({ initialRedirect }: SignupFormProps) {
  const router = useRouter();
  const redirectTarget = getSafeRedirectPath(initialRedirect, '/');

  const { signUpWithEmail, signInWithGoogle, isAuthenticated, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successConfirmation, setSuccessConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isLoading, isAuthenticated, router, redirectTarget]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const { error, needsEmailConfirmation } = await signUpWithEmail(
        email,
        password,
        displayName
      );

      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      }

      if (needsEmailConfirmation) {
        setSuccessConfirmation(true);
        setSubmitting(false);
        return;
      }

      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setOauthLoading(true);
    try {
      const { error } = await signInWithGoogle(redirectTarget);
      if (error) {
        setErrorMsg(error.message);
        setOauthLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in could not be initiated.');
      setOauthLoading(false);
    }
  };

  if (successConfirmation) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 sm:py-24 animate-fade-in">
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1.5">
            Check your inbox
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto mb-6">
            We sent a verification link to <strong className="text-white">{email}</strong>. Click the link to complete registration and access ProductScout.
          </p>
          <Link
            href="/auth/login"
            className="w-full btn-primary inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 sm:py-20 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 mb-4 group select-none focus-visible:outline-none"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-white/15 to-white/[0.02] border border-white/10 text-white shadow-xs group-hover:border-white/25 transition-all">
            <Radio className="w-4 h-4 text-zinc-200" />
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">ProductScout</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create your account
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 leading-normal max-w-xs mx-auto">
          Start scanning community complaints, validating market friction, and structuring software MVPs.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {errorMsg && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={oauthLoading || submitting}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-zinc-200 hover:bg-white/[0.08] hover:text-white hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 transition-all disabled:opacity-60"
        >
          {oauthLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Subtle Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <span className="relative bg-[#0b0b0e] px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            or email
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="displayName">
              Full Name <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Walker"
              className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="password">
              Password <span className="text-zinc-500 font-normal">(min 6 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || oauthLoading}
            className="w-full btn-primary flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Create ProductScout Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Login */}
      <p className="text-center text-xs text-zinc-400 mt-6">
        Already have an account?{' '}
        <Link
          href={`/auth/login${initialRedirect ? `?redirectTo=${encodeURIComponent(initialRedirect)}` : ''}`}
          className="font-medium text-white hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

      {/* Security Footer */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
        <span>Unified Security • Standalone Opportunity Intelligence</span>
      </div>
    </div>
  );
}
