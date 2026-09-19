import type { APIRoute } from 'astro';
import { getSnapshot } from '../../lib/snapshot';
import { SITE } from '../../config';

export const GET: APIRoute = async () => {
  const s = await getSnapshot();
  const body = {
    source: SITE,
    license: 'CC-BY-4.0',
    generated_at: s.builtAt,
    weekday: '0=Sunday … 6=Saturday (UTC)',
    stats: s.stats,
    all: s.all,
    last_30d: s.recent,
    countries: s.countries, // ISO 3166-1 alpha-2, all time
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
