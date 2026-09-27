'use client';

import React from 'react';
import { Radio, Database, Shield, ExternalLink, GitBranch, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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
              <span className="badge-mono text-[9px] uppercase px-1.5 py-0.2 rounded font-mono">v1.0 Production</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              Discovers real problems and identifies software products worth building. ProductScout audits authentic operator complaints across public developer and business communities to formulate grounded B2B product opportunities.
            </p>
            <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-500 pt-1">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-zinc-400" />
                <span>CevonX Products Shared DB</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-zinc-400" />
                <span>PostgreSQL 17 RLS</span>
              </span>
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-medium">
              Platform Directives
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

          {/* CevonX Architecture */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-medium">
              Ecosystem
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center space-x-1 text-zinc-400">
                <span>Product:</span>
                <span className="text-zinc-200 font-mono">productscout</span>
              </li>
              <li className="flex items-center space-x-1 text-zinc-400">
                <span>LedgerLens:</span>
                <span className="text-zinc-200 font-mono">cevondocs</span>
              </li>
              <li className="flex items-center space-x-1 text-zinc-400">
                <span>Infrastructure:</span>
                <span className="text-zinc-200 font-mono text-[11px]">Unified PostgreSQL 17</span>
              </li>
              <li className="flex items-center space-x-1 text-zinc-400">
                <span>Region:</span>
                <span className="text-zinc-200 font-mono">eu-central-1</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} CevonX Ecosystem. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[10px]">Unified Platform Operational</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-[10px]">CevonX Products Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
