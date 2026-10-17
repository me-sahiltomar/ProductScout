'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { OpportunityExplorer } from '@/components/OpportunityExplorer';
import { PipelineSection } from '@/components/PipelineSection';
import { ChangelogSection } from '@/components/ChangelogSection';
import { Footer } from '@/components/Footer';

export default function RootGatewayPage() {
  return (
    <div className="min-h-screen bg-[#08080a] bg-spotlight text-zinc-300 flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Top Ecosystem & Product Bar */}
      <Navbar isWorkspaceRoute={false} />

      <main className="flex-1 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-10 space-y-14 sm:space-y-16">
        {/* Above-the-Fold: Compact Hero Header */}
        <section className="max-w-4xl pt-2 sm:pt-4">
          {/* Eyebrow */}
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300">
              CEVONX OPPORTUNITY & VALIDATION INTELLIGENCE
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Evidence-first product discovery from real operator pain points.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-3xl">
            Harvests multi-source developer and operator discussions, clusters recurring workflow friction, and separates direct user quotes from AI inference across a 20-field validation model.
          </p>

          {/* Prominent Call-to-Action Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="btn-primary inline-flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold shadow-lg group active:scale-95"
            >
              <span>Launch Full Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="#explorer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-all"
            >
              <span>Explore Pre-Harvested Intelligence</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>

          {/* Technical Authority Badges */}
          <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-zinc-500">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
              <span className="text-zinc-300">100% Provenance-Backed</span>
            </div>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
              <span className="text-zinc-300">20-Field Validation Model</span>
            </div>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
              <span className="text-zinc-300">Zero Unearned Decoration</span>
            </div>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400">PostgreSQL 17.6 + RLS</span>
            </div>
          </div>
        </section>

        {/* Interactive Opportunity Explorer Workbench (#explorer) */}
        <OpportunityExplorer />

        {/* Section: 4-Stage Ingestion Pipeline (#schema) */}
        <PipelineSection />

        {/* Section: Living Feature Updates & Changelog (#changelog) */}
        <ChangelogSection />
      </main>

      {/* Branded Application Footer */}
      <Footer isWorkspaceRoute={false} />
    </div>
  );
}
