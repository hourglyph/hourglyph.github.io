// Build-time data snapshot, fetched once per build and shared by every page.
import { fetchCells, fetchCountries, fetchIncidents, fetchStats, type Cell, type CountryRow, type Incident, type Stats } from './supabase';

export interface Snapshot {
  all: Cell[]; recent: Cell[]; countries: CountryRow[]; incidents: Incident[]; stats: Stats; builtAt: string; ok: boolean;
}

let cached: Promise<Snapshot> | undefined;

export function getSnapshot(): Promise<Snapshot> {
  cached ??= (async () => {
    const builtAt = new Date().toISOString();
    try {
      const [all, recent, countries, incidents, stats] = await Promise.all([
        fetchCells('all'), fetchCells('30d'), fetchCountries('all'), fetchIncidents(8), fetchStats(),
      ]);
      return { all, recent, countries, incidents, stats, builtAt, ok: true };
    } catch (err) {
      // Never fail the build because the API hiccuped; the live script fills data in on the client.
      console.warn('[hourglyph] snapshot fetch failed:', err);
      const stats: Stats = {
        total: 0, last_hour: 0, last_24h: 0, last_30d: 0, first_at: null, last_at: null, generated_at: builtAt,
        messages_total: 0, messages_hour: 0, messages_24h: 0, tokens_total: 0, tokens_24h: 0, turns_total: 0,
      };
      return { all: [], recent: [], countries: [], incidents: [], stats, builtAt, ok: false };
    }
  })();
  return cached;
}
