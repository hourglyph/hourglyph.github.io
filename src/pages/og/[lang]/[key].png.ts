// 1200×630 Open Graph image per page and language, rendered at build time.
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { LANGS, UI, type Lang } from '../../../i18n';
import { ALL_PAGES, type PageMeta } from '../../../lib/pages';
import { getSnapshot } from '../../../lib/snapshot';
import { WEEK_ORDER, fromCells, level } from '../../../lib/heatmap';

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`));
const fonts = [
  { name: 'Serif', weight: 500 as const, data: font('source-serif-4', 'source-serif-4-latin-500-normal.woff') },
  { name: 'SerifCyr', weight: 500 as const, data: font('source-serif-4', 'source-serif-4-cyrillic-500-normal.woff') },
  { name: 'Sans', weight: 500 as const, data: font('inter', 'inter-latin-500-normal.woff') },
  { name: 'SansCyr', weight: 500 as const, data: font('inter', 'inter-cyrillic-500-normal.woff') },
];

// Han/kana: satori has no system fallback, so fetch a subset of Noto (only the glyphs these
// images use) from Google Fonts at build time. Without a browser User-Agent it serves TTF.
const CJK: Partial<Record<Lang, { sans: string; serif: string }>> = {
  zh: { sans: 'Noto Sans SC', serif: 'Noto Serif SC' },
  ja: { sans: 'Noto Sans JP', serif: 'Noto Serif JP' },
};
async function subsetFont(family: string, text: string): Promise<ArrayBuffer> {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@500&text=${encodeURIComponent(text)}`)).text();
  const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`No font URL for ${family}`);
  return (await fetch(url)).arrayBuffer();
}
const cjkFonts = new Map<Lang, Promise<{ name: string; weight: 500; data: ArrayBuffer }[]>>();
function fontsFor(lang: Lang) {
  const c = CJK[lang];
  if (!c) return Promise.resolve([]);
  if (!cjkFonts.has(lang)) {
    const text = [...new Set([UI[lang].ogTagline, ...ALL_PAGES.map((p) => p.title[lang])].join(''))].join('');
    cjkFonts.set(lang, Promise.all([
      subsetFont(c.sans, text).then((data) => ({ name: 'SansCJK', weight: 500 as const, data })),
      subsetFont(c.serif, text).then((data) => ({ name: 'SerifCJK', weight: 500 as const, data })),
    ]));
  }
  return cjkFonts.get(lang)!;
}

const RAMP = ['#efede4', '#f6ddd1', '#efbda6', '#e59a7c', '#d97757', '#a9472a'];

export function getStaticPaths() {
  return LANGS.flatMap((lang) => ALL_PAGES.map((p) => ({ params: { lang, key: p.key }, props: { lang, meta: p } })));
}

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): El => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { lang, meta } = props as { lang: Lang; meta: PageMeta };
  const snap = await getSnapshot();
  const g = fromCells(snap.all);
  const max = Math.max(0, ...g.flat());

  const grid = h('div', { display: 'flex', flexDirection: 'column', gap: 5 },
    WEEK_ORDER.map((d) => h('div', { display: 'flex', gap: 5 },
      g[d].map((v) => h('div', { width: 18, height: 18, borderRadius: 4, background: RAMP[level(v, max)] })))));

  const tree = h('div', {
    width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    background: '#faf9f5', padding: '64px 72px', fontFamily: 'Sans, SansCyr, SansCJK', color: '#141413',
  }, [
    h('div', { display: 'flex', alignItems: 'center', gap: 14, fontSize: 30 }, [
      h('div', { width: 40, height: 40, borderRadius: 12, background: '#d97757' }),
      h('div', { fontFamily: 'Serif, SerifCyr' }, 'Hourglyph'),
      h('div', { color: '#73726c', fontSize: 24, marginLeft: 12 }, UI[lang].ogTagline),
    ]),
    h('div', { display: 'flex', fontFamily: 'Serif, SerifCyr, SerifCJK', fontSize: CJK[lang] ? (meta.title[lang].length > 24 ? 56 : 66) : meta.title[lang].length > 48 ? 58 : 68, lineHeight: 1.12, letterSpacing: CJK[lang] ? 0 : -1, maxWidth: 1050 }, meta.title[lang]),
    h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }, [
      grid,
      h('div', { color: '#73726c', fontSize: 24 }, 'hourglyph.github.io'),
    ]),
  ]);

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: [...fonts, ...(await fontsFor(lang))] });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
