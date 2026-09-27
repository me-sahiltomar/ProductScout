'use client';

import React from 'react';
import { 
  Bookmark, 
  Clock, 
  ArrowRight, 
  Quote, 
  User
} from 'lucide-react';
import { ProductOpportunity } from '@/types';

interface OpportunityCardProps {
  opportunity: ProductOpportunity;
  onOpen: (opp: ProductOpportunity) => void;
  onToggleBookmark: (id: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onOpen,
  onToggleBookmark,
}) => {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col justify-between group cursor-pointer" onClick={() => onOpen(opportunity)}>
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded text-white font-medium">
              {opportunity.evidenceConfidence}% Confidence
            </span>

            <span className="badge-mono text-[10px] font-mono px-2 py-0.5 rounded text-zinc-400">
              {opportunity.evidenceQuotes.length} Verified Signal(s)
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(opportunity.id);
            }}
            className={`p-1.5 rounded-md border transition-all duration-150 ${
              opportunity.isSaved
                ? 'bg-white text-black border-white shadow-sm'
                : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20'
            }`}
            title={opportunity.isSaved ? 'Remove bookmark' : 'Bookmark opportunity'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${opportunity.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Opportunity Name & Description */}
        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-zinc-100 transition-colors leading-snug">
          {opportunity.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
          {opportunity.oneLineDescription}
        </p>

        {/* Target Customer */}
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-zinc-400">
          <User className="w-3 h-3 text-zinc-500 shrink-0" />
          <span className="truncate">{opportunity.targetCustomer}</span>
        </div>

        {/* Problem Extract */}
        <div className="mt-3 p-3 rounded-lg bg-[#050507]/90 border border-white/[0.06] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium block">
            Evidence-Backed Problem
          </span>
          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
            {opportunity.userProblem}
          </p>
        </div>

        {/* Sample Quote Snippet */}
        {opportunity.evidenceQuotes[0] && (
          <div className="mt-2.5 flex items-start space-x-2 text-[11px] text-zinc-400 italic">
            <Quote className="w-3 h-3 text-zinc-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2">
              "{opportunity.evidenceQuotes[0].quote}"
            </p>
          </div>
        )}
      </div>

      {/* Footer / MVP Metadata */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5 text-zinc-500 font-mono text-[11px]">
          <span className="flex items-center space-x-1" title="Estimated MVP Build Time">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{opportunity.estimatedMvpBuildTime}</span>
          </span>

          <span className="text-zinc-700">•</span>

          <span className="text-[10px]">
            {opportunity.technicalComplexity} Complexity
          </span>
        </div>

        <div className="inline-flex items-center space-x-1 text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
          <span>Deep Dive</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
};
