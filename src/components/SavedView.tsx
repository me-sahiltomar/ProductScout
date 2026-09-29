'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProductOpportunity } from '@/types';
import { OpportunityCard } from './OpportunityCard';

interface SavedViewProps {
  opportunities: ProductOpportunity[];
  onOpenOpportunity: (opp: ProductOpportunity) => void;
  onToggleBookmark: (id: string) => void;
  onStartNew: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  opportunities,
  onOpenOpportunity,
  onToggleBookmark,
  onStartNew,
}) => {
  const { firstName, isAuthenticated } = useAuth();

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      <div className="border-b border-white/[0.08] pb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          {isAuthenticated ? `${firstName}'s Saved Opportunities` : 'Saved Opportunities'}
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          High-conviction product opportunities pinned across all research runs for validation and prototyping.
        </p>
      </div>

      {opportunities.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center space-y-2">
          <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-xs font-medium text-zinc-300">No saved opportunities yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Click the bookmark icon on any opportunity card in your results to pin it here.
          </p>
          <button
            onClick={onStartNew}
            className="btn-primary mt-3 px-3.5 py-1.5 rounded-md text-xs"
          >
            Launch Research Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onOpen={onOpenOpportunity}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};
