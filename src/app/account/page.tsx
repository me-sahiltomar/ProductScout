'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { 
  ArrowLeft,
  Bookmark, 
  Check, 
  Compass, 
  Loader2, 
  LogOut, 
  Radio, 
  ShieldCheck, 
  User as UserIcon 
} from 'lucide-react';
import { api } from '@/lib/api/client';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, signOut, updateProfile, displayName, firstName } = useAuth();

  const [inputName, setInputName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedCount, setSavedCount] = useState<number>(0);
  const [runsCount, setRunsCount] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?redirectTo=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (displayName) {
      setInputName(displayName);
    }
  }, [displayName]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([api.getRuns(), api.getSavedOpportunities()])
        .then(([runs, saved]) => {
          setRunsCount(runs.length);
          setSavedCount(saved.length);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-3" />
        <p className="text-xs text-zinc-500 font-mono">Loading your ProductScout account...</p>
      </div>
    );
  }

  const email = user.email || 'No email attached';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const { error } = await updateProfile({ display_name: inputName.trim() });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-fade-in text-zinc-300">
      {/* Top Breadcrumb & Return to Dashboard */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ProductScout Radar</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 group select-none"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/10 text-white">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs text-white">ProductScout</span>
        </Link>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08] mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Hello, {firstName}!
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active Member
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Manage your personal profile, discovery preferences, and workspace account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 text-zinc-400" />
          <span>Sign out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/20 to-white/[0.05] border border-white/20 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                {initials || 'PS'}
              </div>
              <h2 className="font-semibold text-white text-base">
                {displayName}
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5 break-all">
                {email}
              </p>

              <div className="mt-5 w-full pt-5 border-t border-white/[0.06] text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Sign-in Provider</span>
                  <span className="capitalize font-medium text-zinc-300">
                    {user.app_metadata?.provider || 'Email'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Member Since</span>
                  <span className="text-zinc-300">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Activity Summary */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 p-5 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
              Workspace Radar Stats
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Scans</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{runsCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Saved</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{savedCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-1">
              Personal Information
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Update your display name across your ProductScout research dossiers.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              {savedSuccess && (
                <div className="flex items-center gap-1.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile updated successfully.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="displayName">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full max-w-sm px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full max-w-sm px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.01] text-xs text-zinc-500 cursor-not-allowed font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Managed securely via your sign-in provider.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
                >
                  {savingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Save changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Launch Cards */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-1">
              Your Product Discovery Workspace
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              All scans, signals, and opportunity formulations are saved to your personal workspace.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="btn-secondary inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Open Discovery Radar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
