import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { ALL_PAGES } from '../lib/pages';
import { getSnapshot } from '../lib/snapshot';

export const GET: APIRoute = async () => {
  const s = await getSnapshot();
  const lines = [
    '# Hourglyph — Claude Code peak hours',
    '',
    '> Unofficial, community-sourced heatmap of when developers use Claude Code, by UTC weekday, hour and country. Its purpose: help people save Claude Code usage limits by starting work in off-peak hours. Data comes from opt-in Claude Code hooks: session starts, messages sent (no text) and per-turn token counts computed locally; the server adds hour, weekday and country code (no IPs).',
    '',
    `Snapshot ${s.builtAt}: ${s.stats.messages_total} messages, ${s.stats.tokens_total} tokens and ${s.stats.total} sessions recorded; ${s.stats.messages_24h} messages in the last 24 h.`,
    'Incident hours from Anthropic’s status page (status.claude.com) are synced hourly and shown as a separate metric.',
    'Anthropic has named weekdays 5–11 AM Pacific as its peak window; since May 6, 2026 Claude Code Pro/Max limits no longer drain faster during it.',
    '',
    '## Pages',
    ...ALL_PAGES.map((p) => `- [${p.title.en}](${SITE}${p.path}): ${p.description.en}`),
    '',
    '## Data',
    `- [heatmap.json](${SITE}/data/heatmap.json): aggregates, CC BY 4.0`,
    `- [heatmap.csv](${SITE}/data/heatmap.csv): same as CSV`,
    `- [countries.csv](${SITE}/data/countries.csv): check-ins by country (ISO 3166-1 alpha-2)`,
    '',
    '## Russian',
    `- [Русская версия](${SITE}/ru/)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
