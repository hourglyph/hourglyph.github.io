import type { APIRoute } from 'astro';
import { getSnapshot } from '../../lib/snapshot';
import { fromCells } from '../../lib/heatmap';

export const GET: APIRoute = async () => {
  const s = await getSnapshot();
  const all = fromCells(s.all), recent = fromCells(s.recent);
  const rows = ['utc_weekday,utc_hour,total_all,total_30d'];
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) rows.push(`${d},${h},${all[d][h]},${recent[d][h]}`);
  return new Response(rows.join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
