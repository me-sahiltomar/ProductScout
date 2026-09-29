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
  Radio,
  Sparkles,
  Target,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { ResearchRun, ProductOpportunity } from '@/types';
import { OpportunityCard } from './OpportunityCard';
import { ReportGenerator } from '@/lib/engine/reportGenerator';

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
    'adaptive_brief' | 'opportunities' | 'problems' | 'solutions_gaps' | 'evidence' | 'mvp_validation' | 'weak_signals' | 'coverage' | 'report'
  >('adaptive_brief');

  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  const reportGen = new ReportGenerator();
  const adaptiveBriefText = reportGen.generateAdaptiveBrief(run);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(run.reportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(adaptiveBriefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([run.reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productscout-report-${run.config.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBrief = () => {
    const blob = new Blob([adaptiveBriefText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productscout-brief-${(run.adaptiveOutputType || 'execution').replace(/_/g, '-')}.md`;
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

  const brief = run.brief;

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-zinc-100">
      {/* Top Banner / Summary Header */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium">
                {run.adaptiveOutputType ? run.adaptiveOutputType.replace(/_/g, ' ') : 'General Opportunity Intelligence'}
              </span>
              {brief && (
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Horizon: {brief.opportunityProfile.buildHorizon}
                </span>
              )}
              <span className="text-xs text-zinc-400 font-mono">
                {run.coverage.dateRange} • {new Date(run.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {brief?.subject || run.config.topic}
            </h1>
            {(brief?.intent || run.config.focus) && (
              <p className="text-xs text-zinc-400 mt-1 max-w-3xl truncate">
                "{brief?.intent || run.config.focus}"
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopyBrief}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-colors flex items-center space-x-1.5"
            >
              {copiedBrief ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copiedBrief ? 'Copied Brief' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-colors flex items-center space-x-1.5"
              title="Download full report in Markdown format"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export MD</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-colors flex items-center space-x-1.5"
              title="Download full intelligence run data in JSON format"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onStartNewWithSameConfig}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Re-Run</span>
            </button>
          </div>
        </div>

        {/* Quick Context Summary Chips */}
        {brief && (
          <div className="mt-4 pt-3.5 border-t border-zinc-900 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Context:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
              Target: {brief.target.primaryUser || 'Operators'} ({brief.target.targetCompany || 'SMB'})
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
              Team: {brief.opportunityProfile.teamSize} ({brief.opportunityProfile.technicalCapability})
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
              Budget: {brief.opportunityProfile.budget}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-300 text-[11px]">
              Risk Profile: {brief.constraints.riskProfile}
            </span>
          </div>
        )}

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-900">
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Sources Evaluated</span>
            <span className="text-lg font-semibold text-white">{run.coverage.sourcesCollectedCount}</span>
            <span className="text-[10px] text-zinc-500 ml-1">across {run.coverage.sourcesSucceeded.length} platforms</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Verified Problems</span>
            <span className="text-lg font-semibold text-white">{run.problems.length}</span>
            <span className="text-[10px] text-zinc-500 ml-1">in {run.clusters.length} clusters</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Product Opportunities</span>
            <span className="text-lg font-semibold text-white">{run.opportunities.length}</span>
            <span className="text-[10px] text-zinc-500 ml-1">evaluated & scored</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Weak Signals</span>
            <span className="text-lg font-semibold text-zinc-400">{run.weakSignals.length}</span>
            <span className="text-[10px] text-zinc-500 ml-1">segregated</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-zinc-800 overflow-x-auto">
        <nav className="flex space-x-1 sm:space-x-2 min-w-max pb-px">
          {[
            { id: 'adaptive_brief', label: 'Adaptive Execution Output', icon: Sparkles },
            { id: 'opportunities', label: `Opportunities (${run.opportunities.length})`, icon: TrendingUp },
            { id: 'problems', label: `Problems & Clusters (${run.problems.length})`, icon: AlertCircle },
            { id: 'solutions_gaps', label: `Solutions & Gaps (${run.gaps.length})`, icon: Layers },
            { id: 'evidence', label: `Evidence Feed (${run.classifiedEvidence.length})`, icon: ShieldCheck },
            { id: 'mvp_validation', label: 'MVP & Validation', icon: Clock },
            { id: 'weak_signals', label: `Weak Signals (${run.weakSignals.length})`, icon: HelpCircle },
            { id: 'coverage', label: 'Research Coverage', icon: Radio },
            { id: 'report', label: 'Full Markdown Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all duration-150 ${
                  active
                    ? 'border-white text-white font-semibold'
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

      {/* TAB 0: ADAPTIVE EXECUTION BRIEF */}
      {activeTab === 'adaptive_brief' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Context-Adaptive Execution Document
              </h2>
              <p className="text-xs text-zinc-400">
                Tailored execution plan synthesized strictly for your objective, horizon ({brief?.opportunityProfile.buildHorizon || 'N/A'}), and resource profile.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyBrief}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors flex items-center space-x-1"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedBrief ? 'Copied' : 'Copy Brief'}</span>
              </button>
              <button
                onClick={handleDownloadBrief}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Brief</span>
              </button>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[75vh] overflow-y-auto">
            {adaptiveBriefText}
          </div>
        </div>
      )}

      {/* TAB 1: PRODUCT OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Formulated & Evaluated Opportunities</h2>
              <p className="text-xs text-zinc-400">
                Grounded in bottom-up user evidence and evaluated against your research brief.
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
                <div key={cluster.id} className="border border-zinc-800 rounded-xl bg-zinc-950 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium">
                          Cluster
                        </span>
                        <h3 className="text-sm font-semibold text-white">{cluster.clusterName}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{cluster.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500 shrink-0">
                      <span>{cluster.signalCount} signals</span>
                      <span>•</span>
                      <span>{cluster.sourceDiversity} platforms</span>
                      <span>•</span>
                      <span className="text-zinc-300 font-medium">{cluster.overallEvidenceStrength}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {clusterProblems.map((prob) => (
                      <div key={prob.id} className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-white">{prob.problemStatement}</h4>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                            {prob.signalCount} signal(s)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
                          <div>
                            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Target User:</span>
                            <span>{prob.targetUser}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Job / Workflow:</span>
                            <span>{prob.jobWorkflow}</span>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-black/60 border border-zinc-850 text-xs text-zinc-300 space-y-1">
                          <div>
                            <span className="text-zinc-500 font-mono text-[10px] uppercase block">Makeshift Workaround:</span>
                            <span>{prob.currentWorkaround}</span>
                          </div>
                        </div>
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
        <div className="space-y-6">
          {/* Market Gaps */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Identified Market Gaps</h2>
              <p className="text-xs text-zinc-400">
                White spaces where current solutions fail or leave operators underserved.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {run.gaps.map((gap) => (
                <div key={gap.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-medium">
                      {gap.gapType}
                    </span>
                    <span className={`text-[10px] font-mono ${gap.isAiInference ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {gap.isAiInference ? 'Market Inference' : 'Evidence-Backed'}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-white">{gap.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{gap.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Incumbents */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Incumbent Solutions & Workarounds</h2>
              <p className="text-xs text-zinc-400">
                Tools currently used by operators and documented user complaints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {run.existingSolutions.map((sol, i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white">{sol.name}</h3>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                      {sol.type}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase block">What Users Currently Do:</span>
                    <span>{sol.whatUsersDo}</span>
                  </div>

                  {sol.complaints.length > 0 && (
                    <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-850 text-xs text-red-300/90 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase block">Reported Friction Points:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {sol.complaints.map((c, idx) => (
                          <li key={idx} className="line-clamp-2">{c}</li>
                        ))}
                      </ul>
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
              <h2 className="text-sm font-semibold text-white tracking-tight">Classified Public Evidence</h2>
              <p className="text-xs text-zinc-400">
                Ranked by first-hand authenticity and quality metrics.
              </p>
            </div>

            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-zinc-500 font-mono text-[11px] mr-1">Filter:</span>
              {['all', 'high', 'reddit', 'hacker_news', 'github'].map((f) => (
                <button
                  key={f}
                  onClick={() => setEvidenceFilter(f)}
                  className={`px-2 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                    evidenceFilter === f
                      ? 'bg-white text-black font-semibold'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredEvidence.map((ev) => (
              <div key={ev.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono uppercase font-semibold text-zinc-300">{ev.platform}</span>
                    <span className="text-zinc-600">•</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      ev.quality === 'HIGH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-900 text-zinc-400'
                    }`}>
                      {ev.quality} ({ev.qualityScore}/100)
                    </span>
                  </div>

                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>Original Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-black/60 p-3 rounded-lg border border-zinc-850 italic">
                  "{ev.painQuote || ev.snippet}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                  <span>Author: {ev.author || 'Anonymous'}</span>
                  <span>{ev.date || 'Recent'}</span>
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
            <h2 className="text-sm font-semibold text-white tracking-tight">MVP Profiles & Validation Experiments</h2>
            <p className="text-xs text-zinc-400">
              Calibrated build scopes and concrete experiments designed to test critical uncertainties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {run.opportunities.map((opp) => (
              <div key={opp.id} className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                  <h3 className="text-xs font-semibold text-white">{opp.name}</h3>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    {opp.estimatedMvpBuildTime}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Validation Test</span>
                  <p className="text-xs text-zinc-200">{opp.validationExperiment.test}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-0.5">Success Signal</span>
                    <span className="text-zinc-300 text-[11px]">{opp.validationExperiment.successSignal}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] font-mono text-red-400 uppercase block mb-0.5">Kill Signal</span>
                    <span className="text-zinc-400 text-[11px]">{opp.validationExperiment.invalidationSignal}</span>
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
              Discussions and complaints that lacked corroboration across multiple platforms or failed verification.
            </p>
          </div>

          {run.weakSignals.length === 0 ? (
            <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-400 text-xs">
              No weak signals segregated for this run; all discovered friction points met multi-source verification standards.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {run.weakSignals.map((ws) => (
                <div key={ws.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400 uppercase">{ws.platform}</span>
                    <a href={ws.sourceUrl} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white flex items-center space-x-1">
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h3 className="text-xs font-semibold text-white">{ws.title}</h3>
                  <p className="text-xs text-zinc-300 italic font-mono">"{ws.userStatement}"</p>
                  <div className="text-[11px] text-zinc-500 pt-1">
                    <span className="font-medium text-zinc-400">Why Insufficient:</span> {ws.whyInsufficient}
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
            <h2 className="text-sm font-semibold text-white tracking-tight">Research Coverage & Platform Telemetry</h2>
            <p className="text-xs text-zinc-400">
              Active endpoints, platform health, and quality tier breakdown.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-4 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Connected Platforms
              </h3>
              <div className="space-y-1.5">
                {run.coverage.sourcesSucceeded.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-900 border border-zinc-850">
                    <span className="font-medium text-zinc-200 uppercase font-mono">{p}</span>
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Operational</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-4 space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Quality Tier Breakdown
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-850">
                  <span className="text-zinc-300">High Quality (First-Hand Complaints)</span>
                  <span className="font-mono text-white font-medium">{run.coverage.qualityDistribution.high}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-850">
                  <span className="text-zinc-400">Medium Quality (Community Discussions)</span>
                  <span className="font-mono text-white font-medium">{run.coverage.qualityDistribution.medium}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-850">
                  <span className="text-zinc-500">Low Quality (Filtered / Promotional)</span>
                  <span className="font-mono text-white font-medium">{run.coverage.qualityDistribution.low}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FULL MARKDOWN REPORT */}
      {activeTab === 'report' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Executive Markdown Report</h2>
              <p className="text-xs text-zinc-400">
                Complete structured intelligence artifact containing research coverage, problem extractions, and opportunities.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyReport}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors flex items-center space-x-1"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedReport ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-6 font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[70vh] overflow-y-auto">
            {run.reportMarkdown}
          </div>
        </div>
      )}
    </div>
  );
};
