'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Shield, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface FooterProps {
  onNavigate?: (view: string) => void;
  isWorkspaceRoute?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate = () => {}, 
  isWorkspaceRoute = false 
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#050507]/90 backdrop-blur-xl py-12 text-xs text-zinc-400">
      <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/10 text-white">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-white tracking-tight text-sm">ProductScout</span>
              <span className="badge-mono text-[9px] uppercase px-1.5 py-0.2 rounded font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                ACTIVE · v1.1
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
              Discovers real problems and identifies software products worth building. ProductScout audits authentic operator complaints across public developer and business communities to formulate grounded B2B product opportunities.
            </p>
            <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-500 pt-1">
              <span className="inline-flex items-center space-x-1.5">
                <Shield className="w-3 h-3 text-zinc-400" />
                <span>Evidence-Backed Opportunity Intelligence</span>
              </span>
              <span>•</span>
              <a
                href="https://sahiltomar.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center space-x-1"
              >
                <span>Architect: Sahil Tomar</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Public Explorer & Schema */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-medium">
              Public Explorer
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/#explorer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Opportunity Workbench
                </Link>
              </li>
              <li>
                <Link
                  href="/#schema"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  4-Stage Ingestion Flow
                </Link>
              </li>
              <li>
                <Link
                  href="/#changelog"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Living Changelog (v1.1)
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Workspace */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-medium">
              Operator Access
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                {isWorkspaceRoute ? (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="text-zinc-400 hover:text-white transition-colors text-left"
                  >
                    Operator Dashboard
                  </button>
                ) : (
                  <Link
                    href="/app"
                    className="text-zinc-400 hover:text-white transition-colors text-left font-medium"
                  >
                    Launch Full Workspace →
                  </Link>
                )}
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/account" className="text-zinc-400 hover:text-white transition-colors">
                      Account Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/app"
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      Personal Vault
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="text-zinc-400 hover:text-white transition-colors">
                      Sign in as Operator
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className="text-zinc-400 hover:text-white transition-colors">
                      Create Operator Account
                    </Link>
                  </li>
                </>
              )}
              <li className="pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>PostgreSQL 17.6 + RLS</span>
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} ProductScout · CevonX Products. All rights reserved.
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
