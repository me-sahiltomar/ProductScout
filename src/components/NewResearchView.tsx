'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search,
  Check, 
  Info 
} from 'lucide-react';
import { ResearchRunConfig, SourcePlatform } from '@/types';

interface NewResearchViewProps {
  initialConfig?: Partial<ResearchRunConfig>;
  onSubmit: (config: ResearchRunConfig) => void;
  isLoading: boolean;
}

export const NewResearchView: React.FC<NewResearchViewProps> = ({
  initialConfig,
  onSubmit,
  isLoading,
}) => {
  const [topic, setTopic] = useState(initialConfig?.topic || '');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>(initialConfig?.timeframe || '30d');
  const [maxSources, setMaxSources] = useState<number>(initialConfig?.maxSources || 30);
  const [focus, setFocus] = useState(initialConfig?.focus || '');
  const [targetUser, setTargetUser] = useState(initialConfig?.targetUser || '');
  const [geography, setGeography] = useState(initialConfig?.geography || '');
  const [industry, setIndustry] = useState(initialConfig?.industry || '');

  const [enabledSources, setEnabledSources] = useState<SourcePlatform[]>(
    initialConfig?.enabledSources || ['reddit', 'hacker_news', 'github', 'devto', 'web']
  );

  const toggleSource = (platform: SourcePlatform) => {
    if (enabledSources.includes(platform)) {
      if (enabledSources.length === 1) return;
      setEnabledSources(enabledSources.filter(p => p !== platform));
    } else {
      setEnabledSources([...enabledSources, platform]);
    }
  };

  const handleLoadExample = () => {
    setTopic('AI automation for small businesses');
    setTimeframe('30d');
    setMaxSources(30);
    setFocus('Find repetitive operational problems that small business owners complain about and that could potentially become simple SaaS products or automation services.');
    setTargetUser('Small business owners & boutique service firms');
    setGeography('Global / North America');
    setIndustry('Services, Trade & Small Retail');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onSubmit({
      topic: topic.trim(),
      timeframe,
      maxSources,
      focus: focus.trim(),
      targetUser: targetUser.trim() || undefined,
      geography: geography.trim() || undefined,
      industry: industry.trim() || undefined,
      enabledSources,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Configure ProductScout Run
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Discover real problems, inspect makeshift workarounds, and identify software products worth building.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadExample}
          className="btn-secondary inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Apply Discovery Blueprint</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-panel p-5 sm:p-7 rounded-2xl space-y-5">
          {/* Research Topic */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Research Topic <span className="text-zinc-500">*</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g., "AI automation for small businesses" or "Customer churn in B2B onboarding"'
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/[0.08] text-white placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Core domain, product category, or operational workflow where you suspect recurring friction.
            </p>
          </div>

          {/* Timeframe & Max Sources */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/[0.08] text-zinc-200 text-xs focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="7d">Past 7 days (Emerging issues)</option>
                <option value="30d">Past 30 days (Recommended)</option>
                <option value="90d">Past 90 days (Quarterly trends)</option>
                <option value="1y">Past 1 year (Broad historical)</option>
                <option value="all">All time (Archive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Max Signal Limit</span>
                <span className="text-white font-mono font-medium">{maxSources} sources</span>
              </label>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={maxSources}
                onChange={(e) => setMaxSources(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white mt-2"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>10 (Fast)</span>
                <span>30 (Standard)</span>
                <span>50 (Deep scan)</span>
              </div>
            </div>
          </div>

          {/* Specific Focus */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Specific Problem Focus & Context
            </label>
            <textarea
              rows={3}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g., Find repetitive operational problems that small business owners complain about and that could potentially become simple SaaS products or automation services."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/[0.08] text-zinc-200 placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Directs the extraction engine to prioritize meaningful workflows and actual makeshift workarounds.
            </p>
          </div>

          {/* Optional Context Filters */}
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2.5">
              Optional Context Filters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Target User
                </label>
                <input
                  type="text"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="e.g., Agency owners, Devs"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Geography
                </label>
                <input
                  type="text"
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                  placeholder="e.g., US & Canada, Global"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Industry / Niche
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., E-commerce, B2B"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          {/* Public Sources */}
          <div className="pt-4 border-t border-white/[0.06]">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Public Discussion Channels
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'reddit' as const, label: 'Reddit', desc: 'Discussions & rants' },
                { id: 'hacker_news' as const, label: 'Hacker News', desc: 'Ask HN & tech comments' },
                { id: 'github' as const, label: 'GitHub Issues', desc: 'Friction & bug reports' },
                { id: 'devto' as const, label: 'Dev.to / Forums', desc: 'Operator workflows' },
                { id: 'web' as const, label: 'Web Reviews', desc: 'Public complaint feeds' },
              ].map((s) => {
                const active = enabledSources.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSource(s.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 ${
                      active
                        ? 'bg-white text-black border-white shadow-sm font-medium'
                        : 'bg-white/[0.02] border-white/[0.07] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{s.label}</span>
                      {active && <Check className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <div className={`text-[10px] mt-0.5 truncate ${active ? 'text-zinc-700' : 'text-zinc-500'}`}>
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="glass-panel flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>
              Real user signals are strictly prioritized over vendor marketing and generic AI summaries.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className={`btn-primary w-full sm:w-auto px-5 py-2 rounded-lg text-xs flex items-center justify-center space-x-2 ${
              isLoading || !topic.trim() ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Scouting Public Channels...' : 'Execute ProductScout Scan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
