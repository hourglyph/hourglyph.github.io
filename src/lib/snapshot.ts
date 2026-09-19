// Build-time data snapshot, fetched once per build and shared by every page.
import { fetchCells, fetchStats, type Cell, type Stats } from './supabase';

export interface Snapshot { all: Cell[]; recent: Cell[]; stats: Stats; builtAt: string; ok: boolean }

let cached: Promise<Snapshot> | undefined;

export function getSnapshot(): Promise<Snapshot> {
  cached ??= (async () => {
    const builtAt = new Date().toISOString();
    try {
      const [all, recent, stats] = await Promise.all([fetchCells('all'), fetchCells('30d'), fetchStats()]);
      return { all, recent, stats, builtAt, ok: true };
    } catch (err) {
      // Never fail the build because the API hiccuped; the live script fills data in on the client.
      console.warn('[hourglyph] snapshot fetch failed:', err);
      const stats: Stats = { total: 0, last_hour: 0, last_24h: 0, last_30d: 0, first_at: null, last_at: null, generated_at: builtAt };
      return { all: [], recent: [], stats, builtAt, ok: false };
    }
  })();
  return cached;
}
