'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  Clock, 
  FileText, 
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  TrendingUp,
  Radio
} from 'lucide-react';
import { ResearchRun, ProductOpportunity } from '@/types';
import { OpportunityCard } from './OpportunityCard';

interface ResultsViewProps {
  run: ResearchRun;
  onOpenOpportunity: (opp: ProductOpportunity) => void;
  onToggleBookmark: (id: string) => void;
  onStartNewWithSameConfig: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  run,
  onOpenOpportunity,
  onToggleBookmark,
  onStartNewWithSameConfig,
}) => {
  const [activeTab, setActiveTab] = useState<
    'opportunities' | 'problems' | 'solutions_gaps' | 'evidence' | 'mvp_validation' | 'weak_signals' | 'coverage' | 'report'
  >('opportunities');

  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [copiedReport, setCopiedReport] = useState(false);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(run.reportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([run.reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productscout-${run.config.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(run, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productscout-${run.config.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredEvidence = run.classifiedEvidence.filter(ev => {
    if (evidenceFilter === 'all') return true;
    if (evidenceFilter === 'high') return ev.quality === 'HIGH';
    return ev.platform === evidenceFilter;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Top Banner / Summary Header */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                Scout Completed
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {run.coverage.dateRange} • {new Date(run.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight truncate">
              {run.config.topic}
            </h1>
            {run.config.focus && (
              <p className="text-xs text-zinc-400 mt-1 max-w-3xl truncate">
                "{run.config.focus}"
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopyReport}
              className="btn-secondary px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="btn-secondary px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5"
              title="Download report in Markdown format"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export MD</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="btn-secondary px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5"
              title="Download full intelligence run data in JSON format"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onStartNewWithSameConfig}
              className="btn-primary px-3.5 py-1.5 rounded-md text-xs flex items-center space-x-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Re-Run</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Sources Evaluated</span>
            <span className="text-lg font-semibold text-white">{run.coverage.sourcesCollectedCount}</span>
            <span className="text-[10px] text-zinc-500 ml-1">across {run.coverage.sourcesSucceeded.length} platforms</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Verified Problems</span>
            <span className="text-lg font-semibold text-white">{run.problems.length}</span>
            <span className="text-[10px] text-zinc-500 ml-1">in {run.clusters.length} clusters</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Product Opportunities</span>
            <span className="text-lg font-semibold text-white">{run.opportunities.length}</span>
            <span className="text-[10px] text-zinc-500 ml-1">passed 10-point QC</span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Weak Signals</span>
            <span className="text-lg font-semibold text-zinc-400">{run.weakSignals.length}</span>
            <span className="text-[10px] text-zinc-500 ml-1">segregated</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-white/[0.08] overflow-x-auto">
        <nav className="flex space-x-1 sm:space-x-2 min-w-max pb-px">
          {[
            { id: 'opportunities', label: `Opportunities (${run.opportunities.length})`, icon: TrendingUp },
            { id: 'problems', label: `Problems & Clusters (${run.problems.length})`, icon: AlertCircle },
            { id: 'solutions_gaps', label: `Solutions & Gaps (${run.gaps.length})`, icon: Layers },
            { id: 'evidence', label: `Evidence Feed (${run.classifiedEvidence.length})`, icon: ShieldCheck },
            { id: 'mvp_validation', label: 'MVP & Validation', icon: Clock },
            { id: 'weak_signals', label: `Weak Signals (${run.weakSignals.length})`, icon: HelpCircle },
            { id: 'coverage', label: 'Research Coverage', icon: Radio },
            { id: 'report', label: 'Executive Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all duration-150 ${
                  active
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: PRODUCT OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Synthesized Opportunities</h2>
              <p className="text-xs text-zinc-400">
                Audited against 10-point QC criteria and grounded in real operator pain points.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {run.opportunities.length} validated opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {run.opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onOpen={onOpenOpportunity}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROBLEMS & CLUSTERS */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Extracted Problems & Workflow Clusters</h2>
            <p className="text-xs text-zinc-400">
              Recurring operator complaints grouped by job-to-be-done without artificial inflation.
            </p>
          </div>

          <div className="space-y-4">
            {run.clusters.map((cluster) => {
              const clusterProblems = run.problems.filter(p => cluster.problemIds.includes(p.id));

              return (
                <div key={cluster.id} className="glass-panel rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="badge-mono text-[10px] font-mono uppercase px-2 py-0.5 rounded text-white font-medium">
                          {cluster.overallEvidenceStrength} Evidence
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold text-white">
                          {cluster.clusterName}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{cluster.description}</p>
                    </div>

                    <div className="flex items-center space-x-2.5 text-xs font-mono text-zinc-500">
                      <span>{cluster.signalCount} Signals</span>
                      <span>•</span>
                      <span>{cluster.sourceDiversity} Platform(s)</span>
                    </div>
                  </div>

                  {/* Child Problems */}
                  <div className="space-y-2.5 pt-1">
                    {clusterProblems.map((p, idx) => (
                      <div key={p.id} className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xs sm:text-sm font-medium text-zinc-200">
                            {idx + 1}. {p.problemStatement}
                          </h4>
                          <span className="badge-mono text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0">
                            {p.frequency}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Affected User</span>
                            <span className="text-zinc-300">{p.targetUser}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Workaround</span>
                            <span className="text-zinc-200 font-medium">{p.currentWorkaround}</span>
                          </div>
                        </div>

                        {p.evidenceQuotes[0] && (
                          <div className="p-2.5 rounded-lg bg-black/80 border border-white/[0.05] text-xs italic text-zinc-300 flex items-start space-x-2 font-mono">
                            <span className="truncate">"{p.evidenceQuotes[0].quote}"</span>
                            <a
                              href={p.evidenceQuotes[0].sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-400 hover:text-white shrink-0 ml-auto not-italic transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SOLUTIONS & GAPS */}
      {activeTab === 'solutions_gaps' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Existing Solutions & Gaps</h2>
            <p className="text-xs text-zinc-400">
              Investigation of incumbents and workarounds. Real evidence is strictly distinguished from AI inference.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Market Gaps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {run.gaps.map((gap) => (
                <div key={gap.id} className="glass-card p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge-mono text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                      {gap.gapType.replace(/_/g, ' ')}
                    </span>
                    <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded text-white font-medium">
                      {gap.isAiInference ? 'AI Inference' : 'Evidence-Backed'}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-medium text-white">{gap.title}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{gap.description}</p>

                  {gap.supportingQuotes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] italic text-zinc-400 font-mono">
                      "{gap.supportingQuotes[0]}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Incumbents & Workarounds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {run.existingSolutions.map((sol, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-medium text-white">{sol.name}</h4>
                    <span className="badge-mono text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                      {sol.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase block">Usage:</span>
                    {sol.whatUsersDo}
                  </p>

                  <div className="space-y-1 text-xs pt-1">
                    <div className="text-zinc-300">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase">Complaints:</span> {sol.complaints.join('; ')}
                    </div>
                    <div className="text-zinc-400">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase">Missing:</span> {sol.missingFunctionality.join('; ')}
                    </div>
                  </div>

                  {sol.pricingInfo && (
                    <div className="text-[11px] font-mono text-zinc-500 pt-1.5 border-t border-white/[0.06]">
                      Pricing: {sol.pricingInfo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EVIDENCE FEED */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Evidence Feed</h2>
              <p className="text-xs text-zinc-400">
                Direct operator quotes preserving platform, original URL, and authenticity scores.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-zinc-500 font-mono">Filter:</span>
              <select
                value={evidenceFilter}
                onChange={(e) => setEvidenceFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-black/70 border border-white/[0.08] text-zinc-200 text-xs focus:outline-none focus:border-white/30"
              >
                <option value="all">All Sources ({run.classifiedEvidence.length})</option>
                <option value="high">High Quality Only</option>
                <option value="reddit">Reddit</option>
                <option value="hacker_news">Hacker News</option>
                <option value="github">GitHub</option>
                <option value="devto">Dev.to</option>
                <option value="web">Web</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredEvidence.map((ev) => (
              <div
                key={ev.id}
                className="glass-card p-3.5 rounded-xl space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="badge-mono text-[10px] font-mono uppercase px-2 py-0.5 rounded text-white font-medium">
                      {ev.platform}
                    </span>
                    <span className="text-xs font-medium text-zinc-200">
                      {ev.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded">
                      Score: {ev.qualityScore}/100
                    </span>

                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      title="Open source URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 font-mono bg-black/80 p-2.5 rounded-lg border border-white/[0.05] leading-relaxed">
                  "{ev.painQuote || ev.snippet}"
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                  <span>Author: {ev.author || 'Anonymous'}</span>
                  {ev.firstHandMarkers.length > 0 && (
                    <span className="font-mono text-[10px] text-zinc-400">
                      Markers: {ev.firstHandMarkers.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MVP & VALIDATION */}
      {activeTab === 'mvp_validation' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Narrow MVP Profiles & Validation Experiments</h2>
            <p className="text-xs text-zinc-400">
              Smallest testable footprints to verify willingness-to-pay within 1–2 weeks.
            </p>
          </div>

          <div className="space-y-4">
            {run.opportunities.map((opp) => (
              <div key={opp.id} className="glass-panel p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{opp.name}</h3>
                    <p className="text-xs text-zinc-400">{opp.oneLineDescription}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="badge-mono px-2 py-0.5 rounded">
                      {opp.estimatedMvpBuildTime}
                    </span>
                    <span className="badge-mono px-2 py-0.5 rounded">
                      {opp.technicalComplexity} Complexity
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
                    <span className="text-xs font-medium text-white block">
                      Must-Have Scope
                    </span>
                    <ul className="text-xs space-y-1 text-zinc-300">
                      {opp.mvpScope.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
                    <span className="text-xs font-medium text-zinc-400 block">
                      Anti-Scope (Do Not Build Initially)
                    </span>
                    <ul className="text-xs space-y-1 text-zinc-400">
                      {opp.whatNotToBuildInitially.map((s, i) => (
                        <li key={i}>✕ {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] space-y-2">
                  <span className="text-xs font-medium text-zinc-300 block">Concrete Validation Experiment</span>
                  <div className="text-xs text-zinc-300">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase">Test:</span> {opp.validationExperiment.test}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="text-zinc-200">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase">Success Signal:</span> {opp.validationExperiment.successSignal}
                    </div>
                    <div className="text-zinc-400">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase">Kill Signal:</span> {opp.validationExperiment.invalidationSignal}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: WEAK SIGNALS */}
      {activeTab === 'weak_signals' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Weak / Insufficient Signals</h2>
            <p className="text-xs text-zinc-400">
              Unverified complaints and single-source issues that failed 10-point QC.
            </p>
          </div>

          {run.weakSignals.length === 0 ? (
            <div className="glass-panel p-6 rounded-xl text-center text-zinc-500 text-xs">
              No weak signals flagged. All problems satisfied verification thresholds.
            </div>
          ) : (
            <div className="space-y-2.5">
              {run.weakSignals.map((ws) => (
                <div key={ws.id} className="glass-card p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium text-zinc-200">{ws.title}</h4>
                    <span className="badge-mono text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                      {ws.platform}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 italic font-mono bg-black/70 p-2.5 rounded-lg border border-white/[0.05]">
                    "{ws.userStatement}"
                  </p>
                  <div className="text-xs text-zinc-400">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase">Why Insufficient:</span> {ws.whyInsufficient}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    <span className="text-zinc-600 font-mono text-[10px] uppercase">Potential Value:</span> {ws.potentialValue}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: RESEARCH COVERAGE */}
      {activeTab === 'coverage' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Research Coverage</h2>
            <p className="text-xs text-zinc-400">
              Connected endpoints, query distribution, and data pipeline integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-panel p-4 rounded-xl space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Connected Platforms
              </h3>
              <div className="space-y-1.5">
                {run.coverage.sourcesSucceeded.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/60 border border-white/[0.05]">
                    <span className="font-medium text-zinc-200 uppercase font-mono">{p}</span>
                    <span className="text-zinc-400 font-mono text-[11px] flex items-center space-x-1">
                      <Check className="w-3 h-3 text-zinc-400" />
                      <span>Operational</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Quality Tier Distribution
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-black/60 border border-white/[0.05]">
                  <span className="text-zinc-300">High Quality (First-Hand)</span>
                  <span className="font-mono text-white font-medium">{run.coverage.qualityDistribution.high}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-black/60 border border-white/[0.05]">
                  <span className="text-zinc-400">Medium Quality (Discussion)</span>
                  <span className="font-mono text-white font-medium">{run.coverage.qualityDistribution.medium}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-black/60 border border-white/[0.05]">
                  <span className="text-zinc-500">Low Quality (Promotional/Filtered)</span>
                  <span className="font-mono text-white font-medium">{run.coverage.qualityDistribution.low}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: EXECUTIVE REPORT */}
      {activeTab === 'report' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Executive Markdown Report</h2>
              <p className="text-xs text-zinc-400">
                Structured research document ready for sharing or exporting.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyReport}
                className="btn-secondary px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedReport ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="btn-primary px-3 py-1.5 rounded-md text-xs flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[70vh] overflow-y-auto">
            {run.reportMarkdown}
          </div>
        </div>
      )}
    </div>
  );
};
