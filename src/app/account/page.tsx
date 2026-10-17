'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ArrowLeft,
  Bookmark, 
  Check, 
  Compass, 
  KeyRound,
  Loader2, 
  Lock,
  LogOut, 
  Radio, 
  ShieldCheck, 
  User as UserIcon 
} from 'lucide-react';
import { api } from '@/lib/api/client';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, signOut, updateProfile, updatePassword, displayName, firstName } = useAuth();

  const [inputName, setInputName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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
      <div className="min-h-screen bg-[#08080a] bg-spotlight text-zinc-300 flex flex-col font-sans">
        <Navbar isWorkspaceRoute={true} />
        <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-3" />
          <p className="text-xs text-zinc-500 font-mono">Loading your ProductScout account...</p>
        </main>
        <Footer isWorkspaceRoute={true} />
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#08080a] bg-spotlight text-zinc-300 flex flex-col font-sans">
      <Navbar isWorkspaceRoute={true} savedCount={savedCount} />

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 animate-fade-in text-zinc-300">
        <div className="max-w-5xl mx-auto">
          {/* Top Breadcrumb & Return to Dashboard */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/app"
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
              onClick={handleSignOut}
              className="btn-secondary self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium text-red-400 hover:text-red-300 hover:border-red-900/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card */}
            <div className="space-y-6">
              <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 p-6 flex flex-col items-center text-center shadow-xl">
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-xl font-bold text-white shadow-md mb-4">
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

            {/* Right Column: Profile & Password Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Details Form */}
              <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-semibold text-white">Profile Information</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3 py-2 rounded-md bg-white/[0.01] border border-white/[0.04] text-xs text-zinc-500 cursor-not-allowed select-none"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Managed through your authentication provider.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-md bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                      {errorMsg}
                    </div>
                  )}

                  {savedSuccess && (
                    <div className="p-2.5 rounded-md bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Profile updated successfully</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile || inputName === displayName}
                      className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all disabled:opacity-60"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Profile Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="rounded-xl border border-white/[0.08] bg-zinc-950/70 p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                  <KeyRound className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-semibold text-white">Change Password</h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-2.5 rounded-md bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-2.5 rounded-md bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Password updated successfully</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPassword || !newPassword || !confirmPassword}
                      className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all disabled:opacity-60"
                    >
                      {savingPassword ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Update password</span>
                        </>
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
                    href="/app"
                    className="btn-secondary inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Open Discovery Radar</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer isWorkspaceRoute={true} />
    </div>
  );
}
