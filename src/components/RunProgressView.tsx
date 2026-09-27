'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface RunProgressViewProps {
  topic: string;
}

const STAGES = [
  { id: 1, name: 'Multi-Source Signal Collection', desc: 'Querying public Reddit, Hacker News, GitHub, and web feeds in parallel...' },
  { id: 2, name: 'Evidence Hierarchy & Authenticity', desc: 'Classifying first-hand user complaints and demoting vendor marketing...' },
  { id: 3, name: 'Problem & Workaround Extraction', desc: 'Identifying painful jobs-to-be-done, time lost, and current spreadsheet workarounds...' },
  { id: 4, name: 'Operational Clustering', desc: 'Grouping related friction points into unified workflow clusters without artificial inflation...' },
  { id: 5, name: 'Incumbent Solution & Gap Detection', desc: 'Analyzing existing competitors, tools, and identifying evidence-backed market gaps...' },
  { id: 6, name: 'Opportunity & Narrow MVP Profiling', desc: 'Formulating 20-field opportunity profiles, anti-scopes, and build time estimates...' },
  { id: 7, name: '10-Point QC & Weak Signals Audit', desc: 'Auditing each opportunity against evidence criteria and routing unverified signals...' },
  { id: 8, name: 'Executive Report Synthesis', desc: 'Compiling structured executive summary, citations, and clickable source links...' },
];

export const RunProgressView: React.FC<RunProgressViewProps> = ({ topic }) => {
  const [activeStage, setActiveStage] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setActiveStage((prev) => (prev < 8 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(stageTimer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6 animate-fade-in">
      {/* Status Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] text-white mx-auto">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-200" />
        </div>

        <div>
          <span className="badge-mono px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Active Research Pipeline
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-white mt-1.5">
            "{topic}"
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Elapsed: {elapsedSeconds}s • Grounding strictly in authentic user evidence
          </p>
        </div>
      </div>

      {/* Stages Progress List */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl divide-y divide-white/[0.06]">
        {STAGES.map((s) => {
          const isDone = activeStage > s.id;
          const isCurrent = activeStage === s.id;

          return (
            <div key={s.id} className="py-2.5 flex items-start space-x-3 transition-colors">
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-zinc-300 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/10 bg-black/60 flex items-center justify-center text-[9px] font-mono text-zinc-600">
                    {s.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3
                    className={`text-xs font-medium ${
                      isDone
                        ? 'text-zinc-300'
                        : isCurrent
                        ? 'text-white font-semibold'
                        : 'text-zinc-500'
                    }`}
                  >
                    {s.name}
                  </h3>
                  {isCurrent && (
                    <span className="badge-mono text-[9px] font-mono px-1.5 py-0.2 rounded text-white animate-subtle-pulse">
                      PROCESSING
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isCurrent ? 'text-zinc-300' : isDone ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div className="glass-panel p-3 rounded-xl text-center text-xs text-zinc-400 flex items-center justify-center space-x-2">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
        <span>Evidence Integrity Rule: AI inferences are never disguised as real user quotes.</span>
      </div>
    </div>
  );
};
