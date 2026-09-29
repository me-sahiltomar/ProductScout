'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Radio } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in both fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMsg(error.message);
        setSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
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
          Set new password
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 leading-normal max-w-xs mx-auto">
          Choose a secure password for your ProductScout account.
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {isSuccess ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">
              Password updated successfully
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto mb-4">
              Your password has been changed. Returning to ProductScout...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
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
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="password">
                New password <span className="text-zinc-500 font-normal">(min 6 characters)</span>
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

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="confirmPassword">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update password</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
