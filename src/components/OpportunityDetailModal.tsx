'use client';

import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Bookmark, 
  Copy, 
  Check, 
  Save
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

  const handleCopySpec = () => {
    const spec = `# Opportunity Blueprint: ${opportunity.name}
One-Line: ${opportunity.oneLineDescription}
Target Customer: ${opportunity.targetCustomer}
User Problem: ${opportunity.userProblem}
Evidence: ${opportunity.evidenceSummary}
Proposed Solution: ${opportunity.proposedSolution}
Core Workflow: ${opportunity.coreWorkflow}

MVP Scope:
${opportunity.mvpScope.map(s => `- ${s}`).join('\n')}

Anti-Scope (What NOT to build):
${opportunity.whatNotToBuildInitially.map(s => `- ⛔ ${s}`).join('\n')}

Estimated Build Time: ${opportunity.estimatedMvpBuildTime}
Complexity: ${opportunity.technicalComplexity}
Monetization: ${opportunity.monetizationPossibilities.join(', ')}

Validation Experiment:
- Hypothesis: ${opportunity.validationExperiment.hypothesis}
- Test: ${opportunity.validationExperiment.test}
- Success Signal: ${opportunity.validationExperiment.successSignal}
- Invalidation Signal: ${opportunity.validationExperiment.invalidationSignal}
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
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0c0c10] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0c0c10]/95 flex items-start justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded">
                20-Field Blueprint
              </span>
              <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded text-white font-medium">
                {opportunity.evidenceConfidence}% Confidence
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {opportunity.estimatedMvpBuildTime} build
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight truncate">
              {opportunity.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {opportunity.oneLineDescription}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleCopySpec}
              className="btn-secondary px-2.5 py-1.5 rounded-md text-xs font-mono inline-flex items-center space-x-1"
              title="Copy markdown specification"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-zinc-300" />}
              <span>{copied ? 'Copied' : 'MD Spec'}</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="btn-secondary px-2.5 py-1.5 rounded-md text-xs font-mono inline-flex items-center space-x-1"
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
                  : 'btn-secondary'
              }`}
              title={opportunity.isSaved ? 'Saved to Bookmarks' : 'Bookmark opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${opportunity.isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="btn-secondary p-1.5 rounded-md text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">
          {/* Section A: Evidence & Context */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Evidence & Problem Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Target Customer
                </span>
                <p className="text-xs text-white font-medium">{opportunity.targetCustomer}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.07]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Existing Alternatives & Workarounds
                </span>
                <p className="text-xs text-zinc-300">{opportunity.existingAlternatives}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-2">
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
                    <div key={idx} className="p-3.5 rounded-lg bg-black/60 border border-white/[0.06] space-y-1.5">
                      <p className="text-xs text-zinc-200 italic font-mono leading-relaxed">
                        "{q.quote}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1.5 border-t border-white/[0.05]">
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
          <div className="space-y-3 pt-5 border-t border-white/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Solution Design & Market Gap
            </h3>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                Market Gap
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed">{opportunity.gap}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-2">
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
          <div className="space-y-3 pt-5 border-t border-white/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Narrow MVP Scope ({opportunity.estimatedMvpBuildTime})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-2">
                <span className="text-xs font-medium text-white block">
                  Must-Have MVP Scope
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {opportunity.mvpScope.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-white font-mono">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-2">
                <span className="text-xs font-medium text-zinc-400 block">
                  Anti-Scope (What NOT to Build Initially)
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {opportunity.whatNotToBuildInitially.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-zinc-600 font-mono">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Complexity</span>
                <span className="font-medium text-zinc-200">{opportunity.technicalComplexity}</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Build Time</span>
                <span className="font-medium text-zinc-200">{opportunity.estimatedMvpBuildTime}</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Distribution</span>
                <span className="font-medium text-zinc-200">{opportunity.distributionDifficulty}</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Monetization</span>
                <span className="font-medium text-zinc-200 truncate block">{opportunity.monetizationPossibilities[0] || 'Subscription'}</span>
              </div>
            </div>
          </div>

          {/* Section D: Validation Experiment */}
          <div className="space-y-3 pt-5 border-t border-white/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Validation Experiment
            </h3>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium block mb-1">
                  Core Hypothesis
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed">{opportunity.validationExperiment.hypothesis}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium block mb-1">
                  The Test
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">{opportunity.validationExperiment.test}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-300 uppercase font-medium block mb-1">
                    Success Signal (Validate)
                  </span>
                  <p className="text-xs text-zinc-300">{opportunity.validationExperiment.successSignal}</p>
                </div>

                <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium block mb-1">
                    Kill Signal (Invalidate)
                  </span>
                  <p className="text-xs text-zinc-400">{opportunity.validationExperiment.invalidationSignal}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section E: Operator Notes */}
          <div className="space-y-2.5 pt-5 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                Founder Notes & Progress
              </label>
              {notesSaved && (
                <span className="text-xs text-white font-medium flex items-center space-x-1">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              onClick={handleNotesSubmit}
              disabled={savingNotes}
              className="btn-secondary px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5 text-zinc-400" />
              <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
