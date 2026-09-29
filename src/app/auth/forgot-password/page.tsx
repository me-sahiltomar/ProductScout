'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, Radio } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      }
      setIsSuccess(true);
      setSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password recovery email.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 sm:py-20 animate-fade-in">
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
          Reset your password
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 leading-normal max-w-xs mx-auto">
          Enter the email associated with your account to receive password reset instructions.
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {isSuccess ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">
              Recovery link dispatched
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto mb-6">
              If an account exists for <strong className="text-white">{email}</strong>, a secure password reset link has been sent.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

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

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send reset link</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
