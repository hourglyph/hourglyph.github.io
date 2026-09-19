import type { APIRoute } from 'astro';
import { getSnapshot } from '../../lib/snapshot';

export const GET: APIRoute = async () => {
  const s = await getSnapshot();
  const rows = [
    'country,sessions,messages,tokens',
    ...[...s.countries].sort((a, b) => b.messages - a.messages || b.total - a.total).map((c) => `${c.country},${c.total},${c.messages},${c.tokens}`),
  ];
  return new Response(rows.join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
