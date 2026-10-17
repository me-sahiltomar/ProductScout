'use client';

import React from 'react';
import { Sparkles, CheckCircle2, GitCommit, Calendar, Tag } from 'lucide-react';

export const ChangelogSection: React.FC = () => {
  const releases = [
    {
      version: 'v1.1',
      status: 'Current Release',
      isCurrent: true,
      date: 'October 2026',
      headline: 'Public Read-Only Sandbox Explorer & 20-Field Evidence Segregation',
      summary:
        'Launched the Public Read-Only Sandbox Explorer allowing operators and founders to inspect curated market intelligence briefs above the fold with zero forced login. Enforced mathematical segregation between raw user evidence (Box A) and AI inference hypotheses (Box B) across all 20 schema fields.',
      changes: [
        'Interactive Master-Detail Opportunity Explorer workbench with category filters and instant keyword search',
        'Strict separation of concerns: Box A (Raw User Evidence, verbatim quotes, provenance URLs) vs Box B (AI Opportunity Synthesis, Anti-Scope, Kill-Criteria)',
        'Public Sandbox Mode with graceful modal protecting live scraper quotas and Supabase writes',
        '25-30% wider Swiss-grid responsive layout (max-w-[1640px]) optimized for deep analytical inspection',
        'Added explicit Invalidation Kill-Criteria and Anti-Scope checklists to eliminate speculative feature creep',
      ],
    },
    {
      version: 'v1.0',
      status: 'Production Architecture',
      isCurrent: false,
      date: 'September 2026',
      headline: 'Supabase PostgreSQL 17.6 Migration & Multi-Source Collectors',
      summary:
        'Production migration to the CevonX Products central unified database (Ref: gzhiltwyuhclzbhaypzd) on PostgreSQL 17.6 with Row Level Security (RLS), Next.js 14 server actions, and resilient offline cache fallback.',
      changes: [
        'Central products table registration and productscout_* table namespacing',
        'Row Level Security policies with private schema helper functions for multi-tenant isolation',
        'Multi-source ingestion collectors for Reddit, Hacker News, GitHub Issues, and Web scrapers',
        'Multi-provider LLM support with runtime fallback (OpenAI, Google Gemini, and deterministic heuristics)',
        'Local SQLite (WAL mode) and JSON database fallback for zero-downtime offline execution',
      ],
    },
  ];

  return (
    <section id="changelog" className="w-full py-16 sm:py-20 border-t border-white/[0.08] scroll-mt-20">
      <div className="max-w-[1640px] mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] mb-3">
            <Tag className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">
              Living Feature Updates & Changelog
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineering Evolution & Product Releases
          </h2>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Continuous delivery log documenting schema enhancements, evidence integrity hardening, and architectural migrations.
          </p>
        </div>

        {/* Minimalist Timeline Cards */}
        <div className="space-y-6">
          {releases.map((rel) => (
            <div
              key={rel.version}
              className={`rounded-xl border p-5 sm:p-6 transition-all duration-200 ${
                rel.isCurrent
                  ? 'border-white/20 bg-[#0c0c0f] shadow-lg ring-1 ring-white/10'
                  : 'border-white/[0.08] bg-[#0a0a0c]/80'
              }`}
            >
              {/* Release Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold font-mono text-white">
                    {rel.version}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-medium ${
                      rel.isCurrent
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08]'
                    }`}
                  >
                    {rel.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  <span>{rel.date}</span>
                </div>
              </div>

              {/* Headline & Summary */}
              <div className="mt-4">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {rel.headline}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  {rel.summary}
                </p>
              </div>

              {/* Bullet Points */}
              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2.5">
                  Shipped Highlights
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {rel.changes.map((change, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                      <span className="leading-snug">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
