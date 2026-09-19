import type { APIRoute } from 'astro';
import { getSnapshot } from '../../lib/snapshot';
import { fromCells, type Metric } from '../../lib/heatmap';

export const GET: APIRoute = async () => {
  const s = await getSnapshot();
  const m = (cells: typeof s.all, metric: Metric) => fromCells(cells, metric);
  const cols = [
    m(s.all, 'total'), m(s.recent, 'total'),
    m(s.all, 'messages'), m(s.recent, 'messages'),
    m(s.all, 'tokens'), m(s.recent, 'tokens'),
    m(s.all, 'incidents'), m(s.recent, 'incidents'),
  ];
  const rows = ['utc_weekday,utc_hour,sessions_all,sessions_30d,messages_all,messages_30d,tokens_all,tokens_30d,incident_hours_all,incident_hours_30d'];
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) rows.push([d, h, ...cols.map((g) => g[d][h])].join(','));
  return new Response(rows.join('\n') + '\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
