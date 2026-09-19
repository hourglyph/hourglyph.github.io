import type { APIRoute } from 'astro';
import { getSnapshot } from '../../lib/snapshot';

export const GET: APIRoute = async () => {
  const s = await getSnapshot();
  const rows = ['country,total', ...[...s.countries].sort((a, b) => b.total - a.total).map((c) => `${c.country},${c.total}`)];
  return new Response(rows.join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
