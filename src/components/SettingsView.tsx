'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SystemSettings, DiscoveredModel } from '@/types';
import { FALLBACK_GEMINI_MODELS } from '@/lib/engine/geminiModelDiscovery';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [provider, setProvider] = useState<'heuristic' | 'gemini' | 'openai'>(settings.aiProvider || 'heuristic');
  const [geminiModelsList, setGeminiModelsList] = useState<DiscoveredModel[]>(
    settings.availableGeminiModels && settings.availableGeminiModels.length > 0
      ? settings.availableGeminiModels
      : FALLBACK_GEMINI_MODELS
  );
  const [geminiModel, setGeminiModel] = useState(
    settings.geminiModel || settings.recommendedGeminiModel || FALLBACK_GEMINI_MODELS[0].id
  );
  const [isCustomGemini, setIsCustomGemini] = useState(false);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [discoverySource, setDiscoverySource] = useState<'live' | 'fallback'>(
    settings.hasServerGeminiKey ? 'live' : 'fallback'
  );

  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(settings.openaiBaseUrl || 'https://api.openai.com/v1');
  const [openaiModel, setOpenaiModel] = useState(settings.openaiModel || 'gpt-4o-mini');
  const [defaultMaxSources, setDefaultMaxSources] = useState(settings.defaultMaxSources || 30);
  const [defaultTimeframe, setDefaultTimeframe] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>(settings.defaultTimeframe || '30d');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setProvider(settings.aiProvider || 'heuristic');
    const available = settings.availableGeminiModels && settings.availableGeminiModels.length > 0
      ? settings.availableGeminiModels
      : FALLBACK_GEMINI_MODELS;
    setGeminiModelsList(available);

    const topRecommended = settings.recommendedGeminiModel || available[0]?.id || 'gemini-3.8-flash';
    const chosenModel = settings.geminiModel || topRecommended;
    setGeminiModel(chosenModel);
    setIsCustomGemini(!available.some(m => m.id === chosenModel));
    setDiscoverySource(settings.hasServerGeminiKey ? 'live' : 'fallback');

    setOpenaiBaseUrl(settings.openaiBaseUrl || 'https://api.openai.com/v1');
    setOpenaiModel(settings.openaiModel || 'gpt-4o-mini');
    setDefaultMaxSources(settings.defaultMaxSources || 30);
    setDefaultTimeframe(settings.defaultTimeframe || '30d');
  }, [settings]);

  const handleRefreshModels = async () => {
    setRefreshingModels(true);
    try {
      const res = await fetch('/api/models/gemini?refresh=true');
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setGeminiModelsList(data.models);
          setDiscoverySource(data.source);
          if (!isCustomGemini) {
            setGeminiModel(data.recommendedModel);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to refresh Gemini models:', err);
    } finally {
      setRefreshingModels(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings({
        aiProvider: provider,
        geminiModel,
        openaiBaseUrl,
        openaiModel,
        defaultMaxSources,
        defaultTimeframe,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-20 animate-fade-in">
      <div className="border-b border-white/[0.08] pb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          Engine Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Select synthesis model, server-side provider configuration, and default scan parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass-panel p-5 sm:p-7 rounded-2xl space-y-5">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Synthesis & Extraction Engine
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Choose the analysis engine for problem extraction and market gap detection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              onClick={() => setProvider('heuristic')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                provider === 'heuristic'
                  ? 'bg-white text-black border-white shadow-sm font-medium'
                  : 'bg-white/[0.02] border-white/[0.07] text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">{provider === 'heuristic' ? 'Local Heuristic NLP' : 'Local Heuristic'}</span>
                {provider === 'heuristic' && <Check className="w-3.5 h-3.5 text-black" />}
              </div>
              <p className={`text-[11px] leading-normal ${provider === 'heuristic' ? 'text-zinc-700' : 'text-zinc-500'}`}>
                100% offline, zero-cost rule-based classifier. No external API keys required.
              </p>
            </div>

            <div
              onClick={() => setProvider('gemini')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                provider === 'gemini'
                  ? 'bg-white text-black border-white shadow-sm font-medium'
                  : 'bg-white/[0.02] border-white/[0.07] text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Google Gemini</span>
                {provider === 'gemini' && <Check className="w-3.5 h-3.5 text-black" />}
              </div>
              <p className={`text-[11px] leading-normal ${provider === 'gemini' ? 'text-zinc-700' : 'text-zinc-500'}`}>
                Gemini 3.8 Flash (Recommended) or 2.5 / 2.0 for structured deep problem refinement.
              </p>
            </div>

            <div
              onClick={() => setProvider('openai')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                provider === 'openai'
                  ? 'bg-white text-black border-white shadow-sm font-medium'
                  : 'bg-white/[0.02] border-white/[0.07] text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">OpenAI / Compatible</span>
                {provider === 'openai' && <Check className="w-3.5 h-3.5 text-black" />}
              </div>
              <p className={`text-[11px] leading-normal ${provider === 'openai' ? 'text-zinc-700' : 'text-zinc-500'}`}>
                OpenAI, Groq, Ollama, or OpenRouter endpoint inference.
              </p>
            </div>
          </div>

          {provider === 'gemini' && (
            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.07] space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs text-zinc-300 font-medium">
                      Gemini Model
                    </label>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      discoverySource === 'live' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${discoverySource === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                      {discoverySource === 'live' ? 'Live API Models' : 'Preset Models'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {settings.hasServerGeminiKey && (
                      <button
                        type="button"
                        onClick={handleRefreshModels}
                        disabled={refreshingModels}
                        title="Query Google API for active models on your key"
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${refreshingModels ? 'animate-spin text-white' : ''}`} />
                        <span>{refreshingModels ? 'Checking...' : 'Refresh from API key'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCustomGemini) {
                          setIsCustomGemini(true);
                        } else {
                          setIsCustomGemini(false);
                          setGeminiModel(geminiModelsList[0]?.id || 'gemini-3.8-flash');
                        }
                      }}
                      className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                    >
                      {isCustomGemini ? 'Preset models' : 'Custom model ID'}
                    </button>
                  </div>
                </div>

                {!isCustomGemini ? (
                  <select
                    value={geminiModel}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomGemini(true);
                      } else {
                        setGeminiModel(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/[0.08] text-xs text-zinc-200 focus:outline-none focus:border-white/30 font-mono"
                  >
                    {geminiModelsList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} {m.badge ? `(${m.badge})` : ''}
                      </option>
                    ))}
                    <option value="custom">Specify Custom Model Identifier...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      placeholder="e.g. gemini-3.8-flash"
                      className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/[0.08] text-xs text-zinc-200 focus:outline-none focus:border-white/30 font-mono"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Specify any Gemini model name available on your API key (e.g. <code className="text-zinc-400 font-mono">gemini-3.8-flash</code>).
                    </p>
                  </div>
                )}

                {geminiModelsList.find(m => m.id === geminiModel)?.description && (
                  <p className="text-[11px] text-zinc-500 mt-1.5 leading-normal">
                    {geminiModelsList.find(m => m.id === geminiModel)?.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                {settings.hasServerGeminiKey ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">
                      Server Environment Active: <code className="text-[11px] text-zinc-200 bg-white/[0.06] px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> detected. Active models queried in real-time.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-zinc-400">
                      Provider credentials reside in server environment. Set <code className="text-[11px] text-zinc-200 bg-white/[0.06] px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> in <code className="text-[11px] text-zinc-200 font-mono">.env.local</code>.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {provider === 'openai' && (
            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.07] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">
                    Base URL (e.g. Ollama/Groq)
                  </label>
                  <input
                    type="text"
                    value={openaiBaseUrl}
                    onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                {settings.hasServerOpenaiKey ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300">
                      Server Environment Active: <code className="text-[11px] text-zinc-200 bg-white/[0.06] px-1 py-0.5 rounded font-mono">OPENAI_API_KEY</code> detected.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-zinc-400">
                      Provider credentials reside in server environment. Set <code className="text-[11px] text-zinc-200 bg-white/[0.06] px-1 py-0.5 rounded font-mono">OPENAI_API_KEY</code> in <code className="text-[11px] text-zinc-200 font-mono">.env.local</code>.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel p-5 sm:p-7 rounded-2xl space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
            Default Parameters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-zinc-300 mb-1">
                Default Source Ingestion Limit
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={defaultMaxSources}
                onChange={(e) => setDefaultMaxSources(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-white/30 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-300 mb-1">
                Default Timeframe Horizon
              </label>
              <select
                value={defaultTimeframe}
                onChange={(e) => setDefaultTimeframe(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/[0.08] text-xs text-zinc-200 focus:outline-none focus:border-white/30"
              >
                <option value="7d">Past 7 days</option>
                <option value="30d">Past 30 days</option>
                <option value="90d">Past 90 days</option>
                <option value="1y">Past year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Architecture: Supabase persistence with server-side environment secrets.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-1.5 text-xs px-5 py-2.5"
          >
            {saving ? 'Saving...' : savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
