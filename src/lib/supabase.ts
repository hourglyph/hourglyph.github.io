import { SUPABASE_KEY, SUPABASE_URL } from '../config';

export interface Cell { utc_weekday: number; utc_hour: number; total: number }
export interface Stats {
  total: number; last_hour: number; last_24h: number; last_30d: number;
  first_at: string | null; last_at: string | null; generated_at: string;
}

const headers = { apikey: SUPABASE_KEY };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const fetchCells = (window: 'all' | '30d') =>
  get<Cell[]>(`${window === 'all' ? 'heatmap' : 'heatmap_30d'}?select=*`);

export const fetchStats = async () => (await get<Stats[]>('stats?select=*'))[0];

/** Returns true if counted, false if rate-limited. */
export async function checkin(source: 'hook' | 'manual'): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/checkin`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_source: source }),
  });
  if (!res.ok) throw new Error(`checkin: HTTP ${res.status}`);
  return res.json();
}
