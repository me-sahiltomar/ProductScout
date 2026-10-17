'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Shield, 
  Quote, 
  User, 
  Clock, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Activity
} from 'lucide-react';
import { CURATED_OPPORTUNITIES, CuratedOpportunity } from '@/data/curatedOpportunities';
import { SourcePlatform } from '@/types';

type CategoryFilter = 'All Opportunities' | 'B2B FinOps' | 'DevTools' | 'AI Operations';

export const OpportunityExplorer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All Opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOppId, setSelectedOppId] = useState<string>(CURATED_OPPORTUNITIES[0].id);
  const [showSandboxModal, setShowSandboxModal] = useState(false);

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    return CURATED_OPPORTUNITIES.filter((opp) => {
      const matchesCategory =
        selectedCategory === 'All Opportunities' || opp.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        opp.name.toLowerCase().includes(q) ||
        opp.oneLineDescription.toLowerCase().includes(q) ||
        opp.targetPersona.toLowerCase().includes(q) ||
        opp.userProblem.toLowerCase().includes(q) ||
        opp.proposedSolution.toLowerCase().includes(q) ||
        opp.evidenceQuotes.some((eq) => eq.quote.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  // Selected opportunity object (fallback to first filtered or first overall)
  const selectedOpportunity: CuratedOpportunity = useMemo(() => {
    const found = CURATED_OPPORTUNITIES.find((o) => o.id === selectedOppId);
    if (found && filteredOpportunities.some((o) => o.id === found.id)) {
      return found;
    }
    return filteredOpportunities[0] || CURATED_OPPORTUNITIES[0];
  }, [selectedOppId, filteredOpportunities]);

  const getSourceIconDot = (platform: SourcePlatform) => {
    switch (platform) {
      case 'reddit':
        return 'bg-[#ff4500]';
      case 'hacker_news':
        return 'bg-[#ff6600]';
      case 'github':
        return 'bg-white';
      case 'forum':
        return 'bg-[#a855f7]';
      case 'web':
      default:
        return 'bg-[#3b82f6]';
    }
  };

  const getPlatformLabel = (platform: SourcePlatform) => {
    switch (platform) {
      case 'reddit':
        return 'REDDIT';
      case 'hacker_news':
        return 'HACKER NEWS';
      case 'github':
        return 'GITHUB ISSUE';
      case 'forum':
        return 'DEVELOPER FORUM';
      case 'web':
      default:
        return 'WEB VERBATIM';
    }
  };

  return (
    <section id="explorer" className="w-full scroll-mt-20">
      {/* Interactive Opportunity Explorer Workbench Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
        
        {/* Top Action Bar */}
        <div className="border-b border-white/[0.08] px-4 sm:px-6 py-3.5 bg-[#0a0a0c] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(['All Opportunities', 'B2B FinOps', 'DevTools', 'AI Operations'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.04]'
                }`}
              >
                {cat}
                {cat === 'All Opportunities' && (
                  <span className="ml-1.5 text-[10px] opacity-70 font-mono">
                    ({CURATED_OPPORTUNITIES.length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + Run Harvest Action */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search problems, personas, quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setShowSandboxModal(true)}
              className="btn-primary inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium active:scale-95 shrink-0"
              title="Run live signal harvesting across multi-source web pipelines"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Run New Signal Harvest</span>
            </button>
          </div>
        </div>

        {/* Master-Detail Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[720px] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          
          {/* Left List: Pre-Loaded High-Signal Opportunity Cards (5 Cols) */}
          <div className="lg:col-span-5 p-3 sm:p-4 space-y-2.5 overflow-y-auto max-h-[820px] bg-[#09090b]/40">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono text-zinc-400">
              <span className="uppercase tracking-wider">Grounded Opportunities</span>
              <span className="text-zinc-500">
                {filteredOpportunities.length} of {CURATED_OPPORTUNITIES.length} Loaded
              </span>
            </div>

            {filteredOpportunities.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/[0.08] rounded-lg">
                <p className="text-xs text-zinc-400">No opportunities match "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Opportunities');
                  }}
                  className="mt-2 text-xs text-zinc-300 underline hover:text-white"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredOpportunities.map((opp) => {
                const isSelected = opp.id === selectedOpportunity.id;
                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOppId(opp.id)}
                    className={`p-4 rounded-lg border transition-all duration-150 cursor-pointer text-left relative group ${
                      isSelected
                        ? 'border-white/30 bg-white/[0.05] shadow-md ring-1 ring-white/10'
                        : 'border-white/[0.06] bg-[#0c0c0e]/60 hover:border-white/15 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Active Accent Bar on Left */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r" />
                    )}

                    {/* Header Chips */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300 font-medium">
                        {opp.category}
                      </span>

                      <div className="flex items-center space-x-2 text-[10px] font-mono">
                        <span className="inline-flex items-center text-zinc-400">
                          <Activity className="w-3 h-3 text-zinc-400 mr-1" />
                          {opp.signalCount} Signals
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="inline-flex items-center text-emerald-400 font-semibold">
                          <Flame className="w-3 h-3 text-emerald-400 mr-0.5" />
                          {opp.urgencyScore}/100 Urgency
                        </span>
                      </div>
                    </div>

                    {/* Problem Title */}
                    <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight leading-snug group-hover:text-zinc-100">
                      {opp.name}
                    </h3>

                    {/* Target Persona */}
                    <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-zinc-400">
                      <User className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{opp.targetPersona}</span>
                    </div>

                    {/* Summary Excerpt */}
                    <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {opp.oneLineDescription}
                    </p>

                    {/* Mini Verbatim Preview */}
                    {opp.evidenceQuotes[0] && (
                      <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span className="truncate max-w-[80%] italic text-zinc-400">
                          "{opp.evidenceQuotes[0].quote.substring(0, 60)}..."
                        </span>
                        <span className="shrink-0 text-zinc-500 group-hover:text-white transition-colors">
                          Inspect →
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Inspector Panel: Full 20-Field Validation Model (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 lg:p-7 overflow-y-auto max-h-[820px] bg-[#0a0a0c]">
            {/* Inspector Top Meta */}
            <div className="border-b border-white/[0.08] pb-5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="badge-mono text-[10px] uppercase px-2 py-0.5 rounded font-mono bg-white/10 text-white border border-white/20">
                    {selectedOpportunity.category}
                  </span>
                  <span className="badge-mono text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                    Score: {selectedOpportunity.urgencyScore}/100
                  </span>
                  <span className="badge-mono text-[10px] font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.08] px-2 py-0.5 rounded">
                    {selectedOpportunity.evidenceConfidence}% Grounded Confidence
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Build: {selectedOpportunity.estimatedMvpBuildTime}</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {selectedOpportunity.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                {selectedOpportunity.oneLineDescription}
              </p>

              {/* Persona & Buyer Grid */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">
                    Target User / Practitioner
                  </span>
                  <span className="text-zinc-200 font-medium">
                    {selectedOpportunity.target_user || selectedOpportunity.targetPersona}
                  </span>
                </div>
                <div className="p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">
                    Economic Buyer / Approver
                  </span>
                  <span className="text-zinc-200 font-medium">
                    {selectedOpportunity.target_buyer || 'VP / Engineering Director'}
                  </span>
                </div>
              </div>
            </div>

            {/* SEPARATION OF CONCERNS: BOX A vs BOX B */}
            <div className="space-y-6">
              
              {/* ======================================================== */}
              {/* BOX A: DIRECT USER EVIDENCE (RAW SIGNALS)                  */}
              {/* ======================================================== */}
              <div className="rounded-xl border border-white/[0.12] bg-[#0c0c0f] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                      Box A — Direct User Evidence (Raw Signals)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                    {selectedOpportunity.signalCount} Verbatim Complaints
                  </span>
                </div>

                {/* Evidence Summary */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Signal Synthesis
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedOpportunity.evidenceSummary}
                  </p>
                </div>

                {/* Verbatim Quotes with Source Attribution */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                    Authentic Verbatim Quotes ({selectedOpportunity.evidenceQuotes.length} Sampled)
                  </span>
                  {selectedOpportunity.evidenceQuotes.map((eq, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg bg-black/40 border border-white/[0.06] border-l-2 border-l-zinc-400 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="inline-flex items-center gap-1.5 text-zinc-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${getSourceIconDot(eq.platform)}`} />
                          {getPlatformLabel(eq.platform)}
                        </span>
                        {eq.author && (
                          <span className="text-zinc-500">by {eq.author}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 italic leading-relaxed">
                        "{eq.quote}"
                      </p>
                      <div className="flex justify-end pt-1">
                        <a
                          href={eq.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
                        >
                          <span>Original Thread Provenance</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current Broken Workaround */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Incumbent Behavior & Broken Workarounds
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-2.5 rounded-md border border-white/[0.04]">
                    {selectedOpportunity.current_workaround}
                  </p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* BOX B: AI OPPORTUNITY SYNTHESIS (INFERENCE LAYER)        */}
              {/* ======================================================== */}
              <div className="rounded-xl border border-white/[0.12] bg-[#0c0c0f] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                      Box B — AI Opportunity Synthesis (Inference Layer)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    [AI INFERENCE]
                  </span>
                </div>

                {/* Proposed MVP Wedge */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    Proposed MVP Wedge & Core Value Proposition
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    {selectedOpportunity.proposedSolution}
                  </p>
                </div>

                {/* Scope vs Anti-Scope Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>MVP Scope (Build First)</span>
                    </div>
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedOpportunity.mvpScope.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-500 text-[10px] mt-0.5">•</span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-red-950/15 border border-red-900/30 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-red-400">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Anti-Scope (Do NOT Build)</span>
                    </div>
                    <ul className="space-y-1 text-xs text-zinc-400">
                      {selectedOpportunity.whatNotToBuildInitially.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-red-500 text-[10px] mt-0.5">✕</span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Commercial Signals & Willingness to Pay */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                    Willingness-to-Pay Indicators & Pricing Elasticity
                  </span>
                  <div className="p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 space-y-1.5">
                    <p className="font-mono text-emerald-400 text-[11px]">
                      {selectedOpportunity.pricingElasticity}
                    </p>
                    {selectedOpportunity.commercial_signals && selectedOpportunity.commercial_signals.length > 0 && (
                      <ul className="space-y-1 text-zinc-400 text-[11px] list-disc list-inside">
                        {selectedOpportunity.commercial_signals.map((cs) => (
                          <li key={cs.id}>{cs.description}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Validation Experiment & Kill-Criteria */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">
                      Validation Experiment & Invalidation Kill-Criteria
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      Timeframe: {selectedOpportunity.validationExperiment.estimatedTime || '2 Weeks'}
                    </span>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-zinc-900/70 border border-white/[0.06] text-xs space-y-2">
                    <div>
                      <span className="text-zinc-500 font-mono text-[10px] block">Hypothesis</span>
                      <p className="text-zinc-300">{selectedOpportunity.validationExperiment.hypothesis}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-emerald-500 font-mono text-[10px] block">Success Signal</span>
                        <p className="text-zinc-400 text-[11px]">{selectedOpportunity.validationExperiment.successSignal}</p>
                      </div>
                      <div>
                        <span className="text-red-400 font-mono text-[10px] block">Invalidation Signal</span>
                        <p className="text-zinc-400 text-[11px]">{selectedOpportunity.validationExperiment.invalidationSignal}</p>
                      </div>
                    </div>

                    {selectedOpportunity.killCriteria && (
                      <div className="pt-2 border-t border-white/[0.04]">
                        <span className="text-zinc-500 font-mono text-[10px] block mb-1">
                          Kill Criteria (Stop Project Immediately If):
                        </span>
                        <ul className="space-y-1 text-[11px] text-zinc-400 list-disc list-inside">
                          {selectedOpportunity.killCriteria.map((kc, i) => (
                            <li key={i}>{kc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Complexity & Next Action */}
                <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 font-mono text-[11px] text-zinc-400">
                    <span>Complexity:</span>
                    <span className="text-white font-medium">{selectedOpportunity.technicalComplexity}</span>
                    <span className="text-zinc-600">•</span>
                    <span>Distribution:</span>
                    <span className="text-white font-medium">{selectedOpportunity.distributionDifficulty}</span>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400">
                    Recommended: <span className="text-emerald-400 font-medium">{selectedOpportunity.recommended_next_action || 'Run Validation Canary'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Public Sandbox Modal (When clicking [+ Run New Signal Harvest]) */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-white/[0.12] bg-[#0c0c0e] p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Public Sandbox Mode
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">
                    • Read-Only Intelligence Enabled
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSandboxModal(false)}
                className="text-zinc-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Public Sandbox Mode: Live multi-source scraping is restricted to authenticated operator workspaces to protect API quotas. Explore the pre-harvested intelligence briefs below.
            </p>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operator Privileges Include:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-zinc-400 list-disc list-inside">
                <li>Custom brief dispatched across Reddit, HN, GitHub, & Web</li>
                <li>Live 20-field PostgreSQL persistence with Supabase RLS</li>
                <li>Exportable executive PDF & JSON validation specs</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowSandboxModal(false)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                Explore Sandbox Briefs
              </button>
              <Link
                href="/app"
                className="btn-primary inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-medium"
              >
                <span>Launch Operator Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
