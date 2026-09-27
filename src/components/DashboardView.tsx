'use client';

import React from 'react';
import { 
  ArrowRight, 
  Layers, 
  Radio,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  Compass
} from 'lucide-react';
import { RunSummary } from '@/lib/api/client';
import { ResearchRunConfig } from '@/types';

interface DashboardViewProps {
  runs: RunSummary[];
  savedCount: number;
  onStartNew: (blueprint?: Partial<ResearchRunConfig>) => void;
  onOpenRun: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  runs,
  savedCount,
  onStartNew,
  onOpenRun,
}) => {
  const totalProblems = runs.reduce((acc, r) => acc + (r.problemsCount || 0), 0);
  const totalSources = runs.reduce((acc, r) => acc + (r.sourcesCount || 0), 0);

  const curatedBlueprints: Array<{
    title: string;
    topic: string;
    focus: string;
    targetUser: string;
    tag: string;
  }> = [
    {
      title: 'Small Business AI Automation',
      topic: 'AI automation for small businesses',
      focus: 'Find repetitive operational problems that small business owners complain about and that could potentially become simple SaaS products or automation services.',
      targetUser: 'Small business owners & boutique operators',
      tag: 'SMB Ops',
    },
    {
      title: 'B2B SaaS Onboarding Friction',
      topic: 'B2B SaaS user onboarding and activation churn',
      focus: 'Discover where new users get stuck, what onboarding steps cause complaints, and workarounds teams use to retain accounts.',
      targetUser: 'B2B Product Managers & Founders',
      tag: 'B2B SaaS',
    },
    {
      title: 'Client Billing & Retainer Chasing',
      topic: 'Freelance agency client billing and late invoice chasing',
      focus: 'Identify awkward and time-consuming invoicing hurdles, payment dispute friction, and manual bookkeeping spreadsheets.',
      targetUser: 'Creative agencies and solo freelancers',
      tag: 'FinOps',
    },
    {
      title: 'E-commerce Multi-channel Stockouts',
      topic: 'Shopify Amazon inventory sync and stockouts',
      focus: 'Extract complaints from DTC brands managing inventory across Shopify, Amazon, and physical stores with manual spreadsheets.',
      targetUser: 'eCommerce store operators',
      tag: 'Commerce',
    },
  ];

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Hero Section with Glass Specular Depth */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 md:p-10">
        <div className="relative z-10 max-w-3xl">
          <div className="badge-mono inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-300 mb-4">
            <Radio className="w-3 h-3 text-zinc-400" />
            <span>Problem-First Product Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.15]">
            <span className="silver-gradient-text block">
              Discover real problems.
            </span>
            <span className="text-zinc-400 block mt-1">
              Identify software products worth building.
            </span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
            ProductScout monitors authentic discussions across Reddit, Hacker News, GitHub, and operator communities. It discovers real user problems, inspects existing workarounds, detects market gaps, and formulates 20-field opportunity profiles with narrow MVP scopes.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartNew()}
              className="btn-primary inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Launch Discovery Scan</span>
            </button>
            <button
              onClick={() => onStartNew(curatedBlueprints[0])}
              className="btn-secondary inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs"
            >
              <span>Load Blueprint: SMB AI Automation</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Pipeline Progression Breadcrumb */}
        <div className="mt-8 pt-6 border-t border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-500 text-[10px] uppercase tracking-wider mr-1">Pipeline:</span>
            <span className="badge-mono px-2 py-0.5 rounded">Public Feeds</span>
            <span className="text-zinc-600">→</span>
            <span className="badge-mono px-2 py-0.5 rounded">User Signals</span>
            <span className="text-zinc-600">→</span>
            <span className="badge-mono px-2 py-0.5 rounded">Problems & Workarounds</span>
            <span className="text-zinc-600">→</span>
            <span className="badge-mono px-2 py-0.5 rounded">Clustering</span>
            <span className="text-zinc-600">→</span>
            <span className="badge-mono px-2 py-0.5 rounded">Gap Detection</span>
            <span className="text-zinc-600">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white font-medium">Product Opportunity</span>
            <span className="text-zinc-600">→</span>
            <span className="px-2 py-0.5 rounded bg-white text-black font-semibold shadow-sm">MVP & Experiments</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-xl">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Research Runs</span>
            <Compass className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{runs.length}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Intelligence scans stored</p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-xl">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Signals Scanned</span>
            <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{totalSources}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Public items evaluated</p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-xl">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Extracted Pain Points</span>
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{totalProblems}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Grounded in user complaints</p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-xl">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Saved Opportunities</span>
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{savedCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Bookmarked for build validation</p>
        </div>
      </div>

      {/* Quick Launch Blueprints */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Research Blueprints</h2>
            <p className="text-xs text-zinc-400">Curated starter queries targeting high-friction workflow categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {curatedBlueprints.map((t, idx) => (
            <div
              key={idx}
              onClick={() => onStartNew(t)}
              className="glass-card p-4 sm:p-5 rounded-xl cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded">
                    {t.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <h3 className="font-medium text-xs sm:text-sm text-zinc-200 group-hover:text-white transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {t.focus}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500">
                Target: <span className="text-zinc-400">{t.targetUser}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Research Runs */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Recent Scans</h2>
            <p className="text-xs text-zinc-400">Review historical intelligence runs and generated opportunities</p>
          </div>
        </div>

        {runs.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-xl text-zinc-400 text-xs">
            <Radio className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
            <p>No research scans run yet.</p>
            <button
              onClick={() => onStartNew()}
              className="btn-primary mt-3 px-3 py-1.5 rounded-md text-xs inline-flex items-center space-x-1"
            >
              <span>Launch First Scan</span>
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-xl overflow-hidden divide-y divide-white/[0.06]">
            {runs.slice(0, 5).map((run) => (
              <div
                key={run.id}
                onClick={() => onOpenRun(run.id)}
                className="p-4 hover:bg-white/[0.03] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs sm:text-sm font-medium text-white group-hover:text-zinc-200 transition-colors truncate">
                      {run.topic}
                    </h4>
                    <span className="badge-mono text-[10px] font-mono px-1.5 py-0.2 rounded">
                      {run.timeframe}
                    </span>
                  </div>
                  {run.focus && (
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {run.focus}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs text-zinc-400 font-mono shrink-0">
                  <span>{run.sourcesCount} signals</span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-zinc-200 font-medium">{run.opportunitiesCount} opportunities</span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(run.createdAt).toLocaleDateString()}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
