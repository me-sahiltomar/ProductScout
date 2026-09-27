'use client';

import React from 'react';
import { Compass, History, Bookmark, Settings, Plus, Radio } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  savedCount: number;
  isRunning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  savedCount,
  isRunning = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08080a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group select-none"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] text-white group-hover:border-white/20 transition-all duration-200">
            <Radio className="w-3.5 h-3.5 text-zinc-200" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-tight text-white group-hover:text-zinc-100 transition-colors">
              ProductScout
            </span>
            <span className="badge-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
              v1.0
            </span>
          </div>
          {isRunning && (
            <span className="badge-mono inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-subtle-pulse"></span>
              <span className="text-zinc-300">Scanning</span>
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
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

          <div className="h-4 w-px bg-white/[0.08] mx-1 hidden sm:block"></div>

          {/* Primary High-Contrast Button */}
          <button
            onClick={() => onNavigate('new-research')}
            className="btn-primary flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Research</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
