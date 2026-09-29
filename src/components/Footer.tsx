'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#050507]/90 backdrop-blur-xl py-10 text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/10 text-white">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-white tracking-tight text-sm">ProductScout</span>
              <span className="badge-mono text-[9px] uppercase px-1.5 py-0.2 rounded font-mono">v2.0 Production</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              Discovers real problems and identifies software products worth building. ProductScout audits authentic operator complaints across public developer and business communities to formulate grounded B2B product opportunities.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500 pt-1">
              <Shield className="w-3 h-3 text-zinc-400" />
              <span>Evidence-Backed Opportunity Intelligence</span>
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-medium">
              Discovery Engine
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Discovery Radar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('new-research')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Configure Scan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Historical Intelligence
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('saved')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Saved Opportunity Vault
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('settings')}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Model & Ingestion Config
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Workspace */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-medium">
              Account & Access
            </div>
            <ul className="space-y-1.5 text-xs">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/account" className="text-zinc-400 hover:text-white transition-colors">
                      Account Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigate('saved')}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      Personal Vault
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="text-zinc-400 hover:text-white transition-colors">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className="text-zinc-400 hover:text-white transition-colors">
                      Create account
                    </Link>
                  </li>
                </>
              )}
              <li className="pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Standalone Cloud Workspace</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} ProductScout. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[10px]">Discovery Engine Operational</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-[10px]">A CevonX Product</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
