import { ProductOpportunity, ResearchRun, ResearchRunConfig, SystemSettings } from '@/types';

const BASE_URL = '/api';

export interface RunSummary {
  id: string;
  createdAt: string;
  topic: string;
  timeframe: string;
  focus: string;
  status: 'pending' | 'collecting' | 'analyzing' | 'completed' | 'failed';
  sourcesCount: number;
  problemsCount: number;
  opportunitiesCount: number;
  weakSignalsCount: number;
}

export const api = {
  async runResearch(config: ResearchRunConfig): Promise<ResearchRun> {
    const res = await fetch(`${BASE_URL}/research/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Failed to execute research run');
    }
    const run: ResearchRun = await res.json();
    this.cacheRunLocally(run);
    return run;
  },

  async getRuns(): Promise<RunSummary[]> {
    try {
      const res = await fetch(`${BASE_URL}/research/runs`);
      if (res.ok) {
        const runs: RunSummary[] = await res.json();
        return runs;
      }
    } catch (e) {
      console.warn('API getRuns failed, using local cache:', e);
    }
    return this.getLocalRunSummaries();
  },

  async getRun(id: string): Promise<ResearchRun> {
    try {
      const res = await fetch(`${BASE_URL}/research/runs/${id}`);
      if (res.ok) {
        const run: ResearchRun = await res.json();
        this.cacheRunLocally(run);
        return run;
      }
    } catch (e) {
      console.warn('API getRun failed, checking local cache:', e);
    }

    const cached = this.getCachedRun(id);
    if (cached) return cached;
    throw new Error('Research run not found');
  },

  async deleteRun(id: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/research/runs/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete run API error:', e);
    }
    this.removeCachedRun(id);
  },

  async getSavedOpportunities(): Promise<ProductOpportunity[]> {
    try {
      const res = await fetch(`${BASE_URL}/opportunities/saved`);
      if (res.ok) {
        const data: ProductOpportunity[] = await res.json();
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cevon_saved_opps', JSON.stringify(data));
          } catch {}
        }
        return data;
      }
    } catch (e) {
      console.warn('Saved opportunities API error, using local fallback:', e);
    }
    return this.getLocalSavedOpportunities();
  },

  async toggleBookmark(opportunityId: string, runId?: string): Promise<{ isSaved: boolean }> {
    try {
      const res = await fetch(`${BASE_URL}/opportunities/${opportunityId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId }),
      });
      if (res.ok) return res.json();
    } catch (e) {
      console.warn('Bookmark API error:', e);
    }
    return { isSaved: true };
  },

  async saveNotes(opportunityId: string, notes: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/opportunities/${opportunityId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } catch (e) {
      console.warn('Save notes API error:', e);
    }
  },

  async getSettings(): Promise<SystemSettings> {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) return res.json();
    } catch (e) {
      console.warn('Get settings API error:', e);
    }
    return {
      aiProvider: 'heuristic',
      defaultMaxSources: 30,
      defaultTimeframe: '30d',
    };
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Client-side localStorage persistence helpers for fast offline caching
  cacheRunLocally(run: ResearchRun) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`cevon_run_${run.id}`, JSON.stringify(run));
      const listRaw = localStorage.getItem('cevon_run_ids');
      const ids: string[] = listRaw ? JSON.parse(listRaw) : [];
      if (!ids.includes(run.id)) {
        ids.unshift(run.id);
        localStorage.setItem('cevon_run_ids', JSON.stringify(ids.slice(0, 20)));
      }
    } catch (e) {
      console.warn('localStorage cache error:', e);
    }
  },

  getCachedRun(id: string): ResearchRun | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`cevon_run_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  removeCachedRun(id: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`cevon_run_${id}`);
      const listRaw = localStorage.getItem('cevon_run_ids');
      if (listRaw) {
        const ids: string[] = JSON.parse(listRaw);
        localStorage.setItem('cevon_run_ids', JSON.stringify(ids.filter(i => i !== id)));
      }
    } catch {}
  },

  getLocalRunSummaries(): RunSummary[] {
    if (typeof window === 'undefined') return [];
    try {
      const listRaw = localStorage.getItem('cevon_run_ids');
      if (!listRaw) return [];
      const ids: string[] = JSON.parse(listRaw);
      const runs: RunSummary[] = [];
      for (const id of ids) {
        const r = this.getCachedRun(id);
        if (r) {
          runs.push({
            id: r.id,
            createdAt: r.createdAt,
            topic: r.config.topic,
            timeframe: r.config.timeframe,
            focus: r.config.focus,
            status: r.status,
            sourcesCount: r.coverage?.sourcesCollectedCount || r.rawEvidenceCount || 0,
            problemsCount: r.problems?.length || 0,
            opportunitiesCount: r.opportunities?.length || 0,
            weakSignalsCount: r.weakSignals?.length || 0,
          });
        }
      }
      return runs;
    } catch {
      return [];
    }
  },

  getLocalSavedOpportunities(): ProductOpportunity[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('cevon_saved_opps');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
