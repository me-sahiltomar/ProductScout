'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { NewResearchView } from '@/components/NewResearchView';
import { RunProgressView } from '@/components/RunProgressView';
import { ResultsView } from '@/components/ResultsView';
import { OpportunityDetailModal } from '@/components/OpportunityDetailModal';
import { HistoryView } from '@/components/HistoryView';
import { SavedView } from '@/components/SavedView';
import { SettingsView } from '@/components/SettingsView';
import { Footer } from '@/components/Footer';
import { api, RunSummary } from '@/lib/api/client';
import { ProductOpportunity, ResearchRun, ResearchRunConfig, SystemSettings } from '@/types';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<ProductOpportunity[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    aiProvider: 'heuristic',
    defaultMaxSources: 30,
    defaultTimeframe: '30d',
  });

  const [activeRun, setActiveRun] = useState<ResearchRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningTopic, setRunningTopic] = useState('');
  const [newRunConfig, setNewRunConfig] = useState<Partial<ResearchRunConfig> | undefined>(undefined);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ProductOpportunity | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [runsList, savedList, sysSettings] = await Promise.all([
        api.getRuns(),
        api.getSavedOpportunities(),
        api.getSettings(),
      ]);
      setRuns(runsList);
      setSavedOpportunities(savedList);
      setSettings(sysSettings);

      // If runs exist and no active run set, set latest run as active
      if (runsList.length > 0 && !activeRun) {
        const fullRun = await api.getRun(runsList[0].id);
        setActiveRun(fullRun);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleStartResearch = async (config: ResearchRunConfig) => {
    setIsRunning(true);
    setRunningTopic(config.topic);
    try {
      const completedRun = await api.runResearch(config);
      setActiveRun(completedRun);
      await loadData();
      setCurrentView('results');
    } catch (err: any) {
      alert(`Research run failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenRun = async (id: string) => {
    try {
      const run = await api.getRun(id);
      setActiveRun(run);
      setCurrentView('results');
    } catch (err: any) {
      alert(`Could not load run: ${err.message}`);
    }
  };

  const handleDeleteRun = async (id: string) => {
    await api.deleteRun(id);
    await loadData();
    if (activeRun?.id === id) {
      setActiveRun(null);
      setCurrentView('dashboard');
    }
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const { isSaved } = await api.toggleBookmark(id, activeRun?.id);
      
      // Update activeRun locally
      if (activeRun) {
        setActiveRun({
          ...activeRun,
          opportunities: activeRun.opportunities.map(o => 
            o.id === id ? { ...o, isSaved } : o
          ),
        });
      }

      // Update modal if open
      if (selectedOpportunity && selectedOpportunity.id === id) {
        setSelectedOpportunity({ ...selectedOpportunity, isSaved });
      }

      // Refresh saved list
      const saved = await api.getSavedOpportunities();
      setSavedOpportunities(saved);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    await api.saveNotes(id, notes);
    if (selectedOpportunity && selectedOpportunity.id === id) {
      setSelectedOpportunity({ ...selectedOpportunity, notes });
    }
    if (activeRun) {
      setActiveRun({
        ...activeRun,
        opportunities: activeRun.opportunities.map(o => 
          o.id === id ? { ...o, notes } : o
        ),
      });
    }
    const saved = await api.getSavedOpportunities();
    setSavedOpportunities(saved);
  };

  const handleSaveSettings = async (newSettings: Partial<SystemSettings>) => {
    const res = await api.updateSettings(newSettings);
    setSettings(res.settings);
  };

  return (
    <div className="min-h-screen bg-[#08080a] bg-spotlight text-zinc-300 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        savedCount={savedOpportunities.length}
        isRunning={isRunning}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isRunning ? (
          <RunProgressView topic={runningTopic} />
        ) : (
          <>
            {currentView === 'dashboard' && (
              <DashboardView
                runs={runs}
                savedCount={savedOpportunities.length}
                onStartNew={(blueprint) => {
                  setNewRunConfig(blueprint);
                  setCurrentView('new-research');
                }}
                onOpenRun={handleOpenRun}
              />
            )}

            {currentView === 'new-research' && (
              <NewResearchView
                initialConfig={newRunConfig}
                onSubmit={handleStartResearch}
                isLoading={isRunning}
              />
            )}

            {currentView === 'results' && activeRun && (
              <ResultsView
                run={activeRun}
                onOpenOpportunity={(opp) => setSelectedOpportunity(opp)}
                onToggleBookmark={handleToggleBookmark}
                onStartNewWithSameConfig={() => {
                  setNewRunConfig(activeRun.config);
                  setCurrentView('new-research');
                }}
              />
            )}

            {currentView === 'results' && !activeRun && (
              <div className="p-12 text-center text-slate-400">
                <p>No active research run selected.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-3 px-3.5 py-1.5 rounded-md bg-white text-neutral-950 text-xs font-medium hover:bg-neutral-200 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

            {currentView === 'history' && (
              <HistoryView
                runs={runs}
                onOpenRun={handleOpenRun}
                onDeleteRun={handleDeleteRun}
                onStartNew={() => setCurrentView('new-research')}
              />
            )}

            {currentView === 'saved' && (
              <SavedView
                opportunities={savedOpportunities}
                onOpenOpportunity={(opp) => setSelectedOpportunity(opp)}
                onToggleBookmark={handleToggleBookmark}
                onStartNew={() => setCurrentView('new-research')}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </>
        )}
      </main>

      {/* Branded Application Footer */}
      <Footer onNavigate={setCurrentView} />

      {/* Opportunity Deep Dive Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onToggleBookmark={handleToggleBookmark}
          onSaveNotes={handleSaveNotes}
        />
      )}
    </div>
  );
}
