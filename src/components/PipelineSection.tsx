'use client';

import React from 'react';
import { Database, Filter, Layers, Cpu, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export const PipelineSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Multi-Source Harvesting',
      subtitle: 'Real Web & Community Collectors',
      description:
        'Continuous ingestion dispatched across Reddit, Hacker News, GitHub Issues, StackOverflow, and targeted web crawlers capturing authentic operator discussions.',
      badges: ['Reddit API', 'HN Algolia', 'GitHub Octokit', 'Dispatched Crawlers'],
      icon: Layers,
    },
    {
      number: '02',
      title: 'Deduplication & Noise Filtering',
      subtitle: 'Semantic Filtering & Bot Purge',
      description:
        'Purges automated marketing bots, vendor PR articles, and low-signal noise. Normalizes discourse into verbatim snippets and computes commercial intent scores.',
      badges: ['Bot Removal', 'Commercial Intent', 'Spam Filtering', 'Author Provenance'],
      icon: Filter,
    },
    {
      number: '03',
      title: 'Pain-Point Clustering',
      subtitle: 'Unsupervised Friction Grouping',
      description:
        'Aggregates isolated user complaints into coherent problem domains. Isolates recurring broken workarounds like spreadsheets, manual bash scripts, or Zapier glue.',
      badges: ['Friction Embeddings', 'Workaround Isolation', 'Signal Density', 'Domain Mapping'],
      icon: Cpu,
    },
    {
      number: '04',
      title: '20-Field Schema Scoring',
      subtitle: 'Supabase PostgreSQL 17.6 + RLS',
      description:
        'Synthesizes deep structured validation contracts. Enforces strict separation between authentic user quotes and AI inference hypotheses, backed by RLS.',
      badges: ['PostgreSQL 17.6', 'Row-Level Security', 'Box A/B Separation', 'Kill-Criteria'],
      icon: Database,
    },
  ];

  return (
    <section id="schema" className="w-full py-16 sm:py-20 border-t border-white/[0.08] scroll-mt-20">
      <div className="max-w-[1640px] mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">
              System Architecture & Ingestion Flow
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            4-Stage Ingestion Pipeline
          </h2>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            From noisy public forums to high-confidence 20-field structured validation contracts.
            Every opportunity survives four distinct validation gates before entering the intelligence catalog.
          </p>
        </div>

        {/* 4-Column Horizontal Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-xl border border-white/[0.08] bg-[#0c0c0e]/80 p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-200 group relative"
              >
                <div>
                  {/* Step Top Bar */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                    <span className="text-xl font-bold font-mono text-zinc-500 group-hover:text-white transition-colors">
                      {step.number}
                    </span>
                    <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/20 transition-all">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-sm font-semibold text-white tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                    {step.subtitle}
                  </span>

                  {/* Description */}
                  <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Badges */}
                <div className="mt-5 pt-4 border-t border-white/[0.04] flex flex-wrap gap-1.5">
                  {step.badges.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-mono text-zinc-400 bg-white/[0.02] border border-white/[0.06] px-2 py-0.5 rounded"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Guarantee Strip */}
        <div className="mt-6 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-300">
              <strong className="text-white font-medium">PostgreSQL 17.6 + RLS Protection:</strong> Multi-tenant isolation enforced at the database row layer. No unnamespaced global tables.
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Database Host: db.gzhiltwyuhclzbhaypzd.supabase.co
          </span>
        </div>
      </div>
    </section>
  );
};
