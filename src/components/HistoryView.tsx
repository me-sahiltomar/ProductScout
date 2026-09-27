'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  ArrowRight, 
  Radio
} from 'lucide-react';
import { RunSummary } from '@/lib/api/client';

interface HistoryViewProps {
  runs: RunSummary[];
  onOpenRun: (id: string) => void;
  onDeleteRun: (id: string) => Promise<void>;
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  runs,
  onOpenRun,
  onDeleteRun,
  onStartNew,
}) => {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = runs.filter(r => 
    r.topic.toLowerCase().includes(search.toLowerCase()) ||
    (r.focus && r.focus.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this research run?')) return;
    setDeletingId(id);
    try {
      await onDeleteRun(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Research History
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Access previous research scans, extracted user evidence, and opportunity blueprints.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search previous scans..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-black/70 border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/30 w-52 transition-colors"
            />
          </div>
          <button
            onClick={onStartNew}
            className="btn-primary px-3 py-1.5 rounded-md text-xs shrink-0"
          >
            New Scan
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center space-y-2">
          <Radio className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-xs font-medium text-zinc-300">No matching research runs</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {search ? 'Try adjusting your search terms.' : 'Run your first ProductScout scan to populate history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((run) => (
            <div
              key={run.id}
              onClick={() => onOpenRun(run.id)}
              className="glass-card p-4 rounded-xl cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="badge-mono text-[10px] font-mono uppercase px-1.5 py-0.5 rounded">
                    {run.timeframe === 'all' ? 'All time' : run.timeframe}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {new Date(run.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-zinc-100 transition-colors truncate">
                  {run.topic}
                </h3>
                {run.focus && (
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    "{run.focus}"
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/[0.05] text-center">
                    <div className="text-[9px] text-zinc-500 uppercase">Signals</div>
                    <div className="font-medium text-zinc-200">{run.sourcesCount}</div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/[0.05] text-center">
                    <div className="text-[9px] text-zinc-500 uppercase">Problems</div>
                    <div className="font-medium text-zinc-200">{run.problemsCount}</div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/[0.05] text-center">
                    <div className="text-[9px] text-zinc-500 uppercase">Opps</div>
                    <div className="font-semibold text-white">{run.opportunitiesCount}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 pl-2 border-l border-white/[0.08]">
                  <button
                    onClick={(e) => handleDelete(e, run.id)}
                    disabled={deletingId === run.id}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                    title="Delete run"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-1.5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
