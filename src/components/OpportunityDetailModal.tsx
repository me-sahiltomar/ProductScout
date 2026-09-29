'use client';

import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Bookmark, 
  Copy, 
  Check, 
  Save,
  ShieldAlert,
  Sparkles,
  Target,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ProductOpportunity } from '@/types';

interface OpportunityDetailModalProps {
  opportunity: ProductOpportunity;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onToggleBookmark,
  onSaveNotes,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [notes, setNotes] = useState(opportunity.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const evalData = opportunity.evaluation;
  const exp = opportunity.validationExperiment;

  const handleCopySpec = () => {
    const spec = `# Opportunity Blueprint: ${opportunity.name}
Opportunity Type: ${opportunity.opportunityType || 'SaaS'}
One-Line: ${opportunity.oneLineDescription}
Target Customer: ${opportunity.targetCustomer}
User Problem: ${opportunity.userProblem}
Evidence: ${opportunity.evidenceSummary}
Proposed Solution: ${opportunity.proposedSolution}
Core Workflow: ${opportunity.coreWorkflow}

${evalData ? `Contextual Fit Score: ${evalData.contextualFitScore}/100
Recommended Action: ${evalData.recommendedAction}
Feasibility Fit: ${evalData.feasibilityFit.score}/100 (${evalData.feasibilityFit.rationale})
Strategic Fit: ${evalData.strategicFit.score}/100
Commercial Viability: ${evalData.commercialViability.score}/100 (Est Price: ${evalData.commercialViability.estimatedPricePoint}, Cycle: ${evalData.commercialViability.salesCycle})
Critical Uncertainties:
${evalData.criticalUncertainties.map(u => `- ${u}`).join('\n')}
` : ''}
MVP Scope:
${opportunity.mvpScope.map(s => `- ${s}`).join('\n')}

Anti-Scope (What NOT to build):
${opportunity.whatNotToBuildInitially.map(s => `- ⛔ ${s}`).join('\n')}

Estimated Build Time: ${opportunity.estimatedMvpBuildTime}
Complexity: ${opportunity.technicalComplexity}
Monetization: ${opportunity.monetizationPossibilities.join(', ')}

Validation Experiment:
- Hypothesis: ${exp.hypothesis}
- Test: ${exp.test}
- Success Signal: ${exp.successSignal}
- Invalidation Signal: ${exp.invalidationSignal}
`;
    navigator.clipboard.writeText(spec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(opportunity, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleNotesSubmit = async () => {
    setSavingNotes(true);
    try {
      await onSaveNotes(opportunity.id, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-start justify-between gap-4 sticky top-0 z-20">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium">
                {opportunity.opportunityType || 'SaaS'}
              </span>

              {evalData && (
                <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                  evalData.contextualFitScore >= 80 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : evalData.contextualFitScore >= 60 
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}>
                  Fit: {evalData.contextualFitScore}/100
                </span>
              )}

              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                {opportunity.evidenceConfidence}% Confidence
              </span>

              <span className="text-xs text-zinc-500 font-mono">
                {opportunity.estimatedMvpBuildTime} build
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {opportunity.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {opportunity.oneLineDescription}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleCopySpec}
              className="px-2.5 py-1.5 rounded-md text-xs font-mono inline-flex items-center space-x-1 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              title="Copy markdown specification"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-300" />}
              <span>{copied ? 'Copied' : 'MD Spec'}</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="px-2.5 py-1.5 rounded-md text-xs font-mono inline-flex items-center space-x-1 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              title="Copy JSON data"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-300" />}
              <span>{copiedJson ? 'Copied' : 'JSON'}</span>
            </button>

            <button
              onClick={() => onToggleBookmark(opportunity.id)}
              className={`p-1.5 rounded-md border transition-all duration-150 ${
                opportunity.isSaved
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
              title={opportunity.isSaved ? 'Saved to Bookmarks' : 'Bookmark opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${opportunity.isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">
          
          {/* Contextual Adaptive Evaluation (if available) */}
          {evalData && (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Adaptive Contextual Evaluation</span>
                </span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                  evalData.recommendedAction === 'Execute Immediately'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : evalData.recommendedAction === 'Validate First'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}>
                  Action: {evalData.recommendedAction}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Feasibility Fit</div>
                  <div className="text-sm font-bold text-white mt-0.5">{evalData.feasibilityFit.score}/100</div>
                  <div className="text-[11px] text-zinc-400 mt-1 leading-snug">{evalData.feasibilityFit.rationale}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Strategic Fit</div>
                  <div className="text-sm font-bold text-white mt-0.5">{evalData.strategicFit.score}/100</div>
                  <div className="text-[11px] text-zinc-400 mt-1 leading-snug">{evalData.strategicFit.rationale}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Commercial Viability</div>
                  <div className="text-sm font-bold text-white mt-0.5">{evalData.commercialViability.score}/100</div>
                  <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Est. {evalData.commercialViability.estimatedPricePoint} • {evalData.commercialViability.salesCycle} sales cycle
                  </div>
                </div>
              </div>

              {evalData.criticalUncertainties.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-medium block mb-1">
                    Critical Uncertainties to De-Risk:
                  </span>
                  <ul className="space-y-1">
                    {evalData.criticalUncertainties.map((u, i) => (
                      <li key={i} className="text-xs text-amber-300/90 flex items-start space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Section A: Evidence & Context */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Evidence & Problem Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Target Customer
                </span>
                <p className="text-xs text-white font-medium">{opportunity.targetCustomer}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Existing Alternatives & Workarounds
                </span>
                <p className="text-xs text-zinc-300">{opportunity.existingAlternatives}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                User Problem Statement
              </span>
              <p className="text-xs sm:text-sm font-medium text-white">{opportunity.userProblem}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{opportunity.evidenceSummary}</p>
            </div>

            {/* Clickable Evidence Quotes */}
            {opportunity.evidenceQuotes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-medium block">
                  First-Hand User Quotes ({opportunity.evidenceQuotes.length})
                </span>
                <div className="space-y-2">
                  {opportunity.evidenceQuotes.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-black/60 border border-zinc-800 space-y-1.5">
                      <p className="text-xs text-zinc-200 italic font-mono leading-relaxed">
                        "{q.quote}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-850">
                        <span className="uppercase font-mono text-[10px] text-zinc-400">
                          {q.platform} {q.author ? `• ${q.author}` : ''}
                        </span>
                        <a
                          href={q.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-zinc-300 hover:text-white transition-colors"
                        >
                          <span>Verify Original Post</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section B: Solution & Market Gap */}
          <div className="space-y-3 pt-5 border-t border-zinc-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Solution Design & Market Gap
            </h3>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                Market Gap
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed">{opportunity.gap}</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium block">
                Proposed Product Solution
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed">{opportunity.proposedSolution}</p>
              <div className="pt-2 text-xs text-zinc-400">
                <span className="text-zinc-200 font-medium">Core Workflow:</span> {opportunity.coreWorkflow}
              </div>
              <div className="pt-1 text-xs text-zinc-400">
                <span className="text-zinc-200 font-medium">Why Useful:</span> {opportunity.whyUseful}
              </div>
            </div>
          </div>

          {/* Section C: MVP Scope vs Anti-Scope */}
          <div className="space-y-3 pt-5 border-t border-zinc-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Calibrated MVP Scope ({opportunity.estimatedMvpBuildTime})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                <span className="text-xs font-medium text-white block">
                  Must-Have MVP Scope
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {opportunity.mvpScope.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-zinc-400 font-mono text-[10px] mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                <span className="text-xs font-medium text-zinc-300 block">
                  What NOT to Build Initially (Anti-Scope)
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {opportunity.whatNotToBuildInitially.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-zinc-500 font-mono text-[10px] mt-0.5">⛔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Complexity</span>
                <span className="font-medium text-zinc-200">{opportunity.technicalComplexity}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Build Horizon</span>
                <span className="font-medium text-zinc-200">{opportunity.estimatedMvpBuildTime}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Distribution</span>
                <span className="font-medium text-zinc-200">{opportunity.distributionDifficulty}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Monetization</span>
                <span className="font-medium text-zinc-200 truncate block">{opportunity.monetizationPossibilities[0] || 'Subscription'}</span>
              </div>
            </div>
          </div>

          {/* Section D: Validation Experiment */}
          <div className="space-y-3 pt-5 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                De-Risking Validation Experiment
              </h3>
              {exp.validationMethod && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {exp.validationMethod}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium block mb-1">
                  Core Hypothesis
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed">{exp.hypothesis}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium block mb-1">
                  The Concrete Test
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">{exp.test}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-medium block mb-1">
                    Success Signal (Validate)
                  </span>
                  <p className="text-xs text-zinc-300">{exp.successSignal}</p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-medium block mb-1">
                    Kill Signal (Invalidate)
                  </span>
                  <p className="text-xs text-zinc-400">{exp.invalidationSignal}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section E: Operator Notes */}
          <div className="space-y-2.5 pt-5 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                Founder Notes & Progress
              </label>
              {notesSaved && (
                <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Notes saved</span>
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record customer interview feedback, customer contacts, or MVP iterations..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNotesSubmit}
                disabled={savingNotes}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
