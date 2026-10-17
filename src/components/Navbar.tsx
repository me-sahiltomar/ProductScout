'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  History, 
  Bookmark, 
  Settings, 
  Plus, 
  Radio, 
  User as UserIcon, 
  LogOut, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  savedCount?: number;
  isRunning?: boolean;
  isWorkspaceRoute?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'landing',
  onNavigate = () => {},
  savedCount = 0,
  isRunning = false,
  isWorkspaceRoute = false,
}) => {
  const { user, profile, isAuthenticated, isLoading, signOut, displayName, firstName } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08080a]/90 backdrop-blur-xl">
      <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Ecosystem & Product Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          {!isWorkspaceRoute ? (
            <a
              href="https://productstudio.cevonx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white transition-colors hidden sm:inline-flex items-center space-x-1"
              title="CevonX Product Studio"
            >
              <span>← CevonX Product Studio</span>
            </a>
          ) : (
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center space-x-1"
              title="Return to Public Opportunity Explorer"
            >
              <span>← Public Explorer</span>
            </Link>
          )}

          <span className="text-zinc-600 hidden sm:inline select-none">|</span>

          <Link
            href={isWorkspaceRoute ? '/app' : '/'}
            className="flex items-center space-x-2 cursor-pointer group select-none"
          >
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-zinc-100 transition-colors">
              / ProductScout{isWorkspaceRoute ? ' Workspace' : ''}
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ACTIVE · v1.1</span>
            </span>
          </Link>

          {isRunning && (
            <span className="badge-mono hidden md:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-subtle-pulse"></span>
              <span className="text-zinc-300">Scanning</span>
            </span>
          )}
        </div>

        {/* Right Navigation Controls */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {!isWorkspaceRoute ? (
            /* Root Gateway Navigation */
            <>
              <a
                href="#explorer"
                className="hidden md:inline-flex items-center px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Explorer ↓
              </a>
              <a
                href="#schema"
                className="hidden md:inline-flex items-center px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                20-Field Schema ↓
              </a>
              <a
                href="#changelog"
                className="hidden lg:inline-flex items-center px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Feature Updates ↓
              </a>
              <a
                href="https://sahiltomar.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <span>Architect: Sahil Tomar</span>
                <span className="text-zinc-500">↗</span>
              </a>

              <div className="h-4 w-px bg-white/[0.08] mx-1 hidden sm:block"></div>

              {/* Prominent CTA to /app */}
              <Link
                href="/app"
                className="btn-primary inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium shadow-xs"
              >
                <span>Launch Full Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              {!isAuthenticated && !isLoading && (
                <Link
                  href="/auth/login"
                  className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-md transition-colors ml-1 hidden sm:inline-block"
                >
                  Sign in
                </Link>
              )}
            </>
          ) : (
            /* Inside /app Workspace Navigation */
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  currentView === 'dashboard'
                    ? 'bg-white/[0.08] text-white border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <button
                onClick={() => onNavigate('history')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  currentView === 'history'
                    ? 'bg-white/[0.08] text-white border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                onClick={() => onNavigate('saved')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 relative ${
                  currentView === 'saved'
                    ? 'bg-white/[0.08] text-white border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
                {savedCount > 0 && (
                  <span className="ml-1 badge-mono px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className={`p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-150 ${
                  currentView === 'settings' ? 'bg-white/[0.08] text-white border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]' : ''
                }`}
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('new-research')}
                className="btn-primary flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs active:scale-95 ml-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Research</span>
                <span className="sm:hidden">Scan</span>
              </button>
            </>
          )}

          {/* User Profile Dropdown */}
          {!isLoading && isAuthenticated && (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all select-none focus-visible:outline-none"
              >
                <span className="text-xs text-zinc-200 font-medium hidden md:inline">
                  Hi, <span className="text-white font-semibold">{firstName}</span>
                </span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-b from-white/25 to-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  {initials || 'PS'}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/[0.1] bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-2 animate-fade-in z-50">
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Account & Profile</span>
                  </Link>

                  <Link
                    href="/app"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Workspace Dashboard</span>
                  </Link>

                  <div className="my-1 border-t border-white/[0.06]" />

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
