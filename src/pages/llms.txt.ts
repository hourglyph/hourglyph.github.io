import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { ALL_PAGES } from '../lib/pages';
import { getSnapshot } from '../lib/snapshot';

export const GET: APIRoute = async () => {
  const s = await getSnapshot();
  const lines = [
    '# Hourglyph — Claude Code peak hours',
    '',
    '> Unofficial, community-sourced heatmap of when developers use Claude Code, by UTC weekday and hour. Data comes from an opt-in SessionStart hook; only the hour and weekday of each session start are stored.',
    '',
    `Snapshot ${s.builtAt}: ${s.stats.total} check-ins total, ${s.stats.last_24h} in the last 24 h.`,
    'Anthropic has named weekdays 5–11 AM Pacific as its peak window; since May 6, 2026 Claude Code Pro/Max limits no longer drain faster during it.',
    '',
    '## Pages',
    ...ALL_PAGES.map((p) => `- [${p.title.en}](${SITE}${p.path}): ${p.description.en}`),
    '',
    '## Data',
    `- [heatmap.json](${SITE}/data/heatmap.json): aggregates, CC BY 4.0`,
    `- [heatmap.csv](${SITE}/data/heatmap.csv): same as CSV`,
    '',
    '## Russian',
    `- [Русская версия](${SITE}/ru/)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
