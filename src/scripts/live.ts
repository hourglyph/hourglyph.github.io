// Live layer: re-renders heatmaps, bar charts and the country map in the visitor's (or page's)
// time zone and chosen metric, refreshes stats, switches chart tabs and metrics, and handles the
// manual check-in and copy buttons.
import { checkin, fetchCells, fetchCountries, fetchStats, type Cell, type CountryRow } from '../lib/supabase';
import { MIN_SAMPLE } from '../config';
import {
  analyze, fmtNum, fmtOffset, fromCells, level, loadBand, loadMetric, offsetMinutes, plural, toZone,
  type Metric,
} from '../lib/heatmap';
import { countryName, countryValue, flag } from '../lib/countries';

const i18n = JSON.parse(document.getElementById('hg-i18n')?.textContent || '{}');
const lang: string = i18n.lang;
const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const valueText = (v: number, m: Metric) => `${fmtNum(v, m, i18n.locale)} ${plural(v, lang, i18n.metricUnits[m])}`;
const countriesCount = (n: number) => `${n} ${plural(n, lang, i18n.countryForms)}`;

// ── Data (cached per refresh) ────────────────────────────────────────────
const cellCache = new Map<string, Promise<Cell[]>>();
const cells = (w: 'all' | '30d') => {
  if (!cellCache.has(w)) cellCache.set(w, fetchCells(w));
  return cellCache.get(w)!;
};
let countriesP: Promise<CountryRow[]> | undefined;
const countries = () => (countriesP ??= fetchCountries('all'));

const resolveTz = (tz?: string) => (!tz || tz === 'auto' ? visitorTz : tz);
const zoneText = (offset: number) => `${visitorTz.replace(/_/g, ' ')} (${fmtOffset(offset)})`;
const metricOf = (el: Element): Metric =>
  ((el.closest<HTMLElement>('[data-views]')?.dataset.metric || (el as HTMLElement).dataset?.metric || 'total') as Metric);

/** Current time shifted so getUTCDay/getUTCHours give the grid cell (matches toZone's whole-hour shift). */
const zonedNow = (offset: number) => new Date(Date.now() + Math.floor(offset / 60) * 3_600_000);
const hhFor = (minute: number) => (h: number) => (minute ? `${h}:${String(minute).padStart(2, '0')}` : String(h));

// ── Renderers ────────────────────────────────────────────────────────────
async function renderHeatmaps() {
  for (const fig of document.querySelectorAll<HTMLElement>('[data-heatmap]')) {
    const offset = offsetMinutes(resolveTz(fig.dataset.tz));
    const metric = metricOf(fig);
    const { grid, minute } = toZone(fromCells(await cells((fig.dataset.window as 'all' | '30d') || 'all'), metric), offset);
    const max = Math.max(0, ...grid.flat());
    const hh = hhFor(minute);
    const now = zonedNow(offset);

    fig.querySelectorAll<HTMLElement>('thead th[data-h]').forEach((th) => {
      const h = Number(th.dataset.h);
      th.innerHTML = h % 3 === 0 ? hh(h) : `<span class="sr-only">${hh(h)}</span>`;
    });
    fig.querySelectorAll<HTMLTableCellElement>('td[data-d]').forEach((td) => {
      const d = Number(td.dataset.d), h = Number(td.dataset.h), v = grid[d][h];
      td.dataset.l = String(level(v, max));
      td.title = `${i18n.daysShort[d]} ${hh(h)} · ${valueText(v, metric)}`;
      td.classList.toggle('is-now', d === now.getUTCDay() && h === now.getUTCHours());
    });
    if (fig.dataset.tz === 'auto') {
      const label = fig.querySelector('[data-zone-label]');
      if (label) label.textContent = zoneText(offset);
    }
  }
}

async function renderBars() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-bars]')) {
    const offset = offsetMinutes(resolveTz(el.dataset.tz));
    const metric = metricOf(el);
    const { grid, minute } = toZone(fromCells(await cells('all'), metric), offset);
    const a = analyze(grid);
    const hh = hhFor(minute);
    const hours = el.dataset.bars === 'hours';
    const vals = hours ? a.hourTotals : a.dayTotals;
    const max = Math.max(1, ...vals);
    const now = zonedNow(offset);

    el.querySelectorAll<HTMLElement>(hours ? '.bar-col' : '.bar-row').forEach((row) => {
      const i = Number(row.dataset.i), v = vals[i];
      row.querySelector<HTMLElement>('.bar')?.style.setProperty('--v', String(v / max));
      row.title = `${hours ? hh(i) : i18n.daysShort[i]} · ${valueText(v, metric)}`;
      row.classList.toggle('is-now', hours ? i === now.getUTCHours() : i === now.getUTCDay());
      const value = row.querySelector('[data-value]');
      if (value) value.textContent = fmtNum(v, metric, i18n.locale);
    });
    if (hours) {
      el.querySelectorAll<HTMLElement>('.bars-v-axis [data-i]').forEach((s) => {
        const h = Number(s.dataset.i);
        s.textContent = h % 3 === 0 ? hh(h) : '';
      });
    }
    if (el.dataset.tz === 'auto') {
      const label = el.querySelector('[data-zone-label]');
      if (label) label.textContent = zoneText(offset);
    }
  }
}

async function renderCountries() {
  const lists = document.querySelectorAll<HTMLElement>('[data-countries]');
  const maps = document.querySelectorAll<SVGSVGElement>('[data-world] svg');
  if (!lists.length && !maps.length) return;
  const all = await countries();
  const rank = (metric: Metric) => {
    const rows = all.filter((r) => countryValue(r, metric) > 0).sort((x, y) => countryValue(y, metric) - countryValue(x, metric));
    return { rows, max: Math.max(1, ...rows.map((r) => countryValue(r, metric))) };
  };

  lists.forEach((list) => {
    const metric = metricOf(list);
    const { rows, max } = metric === 'incidents' ? { rows: [], max: 1 } : rank(metric);
    list.innerHTML = rows
      .slice(0, 10)
      .map((r) =>
        `<li data-cc="${r.country}"><span class="cl-name">${flag(r.country)} ${countryName(r.country, i18n.locale)}</span>` +
        `<span class="cl-bar"><span class="bar" style="--v:${countryValue(r, metric) / max}"></span></span>` +
        `<span class="cl-value">${fmtNum(countryValue(r, metric), metric, i18n.locale)}</span></li>`,
      )
      .join('');
    const panel = list.parentElement;
    const empty = panel?.querySelector<HTMLElement>('[data-countries-empty]');
    if (empty) {
      empty.dataset.default ??= empty.textContent ?? '';
      empty.textContent = metric === 'incidents' ? i18n.mapNoIncidents : empty.dataset.default;
      empty.hidden = rows.length > 0;
    }
    const count = panel?.querySelector('[data-countries-count]');
    if (count) count.textContent = countriesCount(rows.length);
  });

  maps.forEach((svg) => {
    const metric = metricOf(svg);
    const { rows, max } = metric === 'incidents' ? { rows: [], max: 1 } : rank(metric);
    const byCc = new Map(rows.map((r) => [r.country, countryValue(r, metric)]));
    svg.querySelectorAll<SVGPathElement>('path[data-cc]').forEach((p) => {
      const v = byCc.get(p.dataset.cc!) ?? 0;
      p.dataset.l = String(level(v, max));
      const t = p.querySelector('title');
      if (t) {
        t.dataset.name ??= t.textContent ?? '';
        t.textContent = `${t.dataset.name} · ${valueText(v, metric)}`;
      }
    });
  });
}

async function renderNow() {
  const band = document.querySelector<HTMLElement>('[data-now-band]');
  if (!band) return;
  const all = await cells('all');
  const metric = loadMetric(all);
  const offset = offsetMinutes(visitorTz);
  const { grid } = toZone(fromCells(all, metric), offset);
  const now = zonedNow(offset);
  // With a tiny sample every non-empty hour looks like a "peak"; don't claim anything yet.
  const total = grid.flat().reduce((s, v) => s + v, 0);
  const b = total < MIN_SAMPLE ? 'collecting' : loadBand(grid[now.getUTCDay()][now.getUTCHours()], grid);
  band.dataset.band = b;
  band.textContent = i18n.bands[b];
  const time = document.querySelector('[data-now-time]');
  if (time) {
    time.textContent =
      new Intl.DateTimeFormat(i18n.locale, { weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(new Date()) +
      ` · ${i18n.yourTz}`;
  }
}

async function renderStats() {
  const els = document.querySelectorAll<HTMLElement>('[data-stat]');
  if (!els.length) return;
  const s = (await fetchStats()) as unknown as Record<string, number>;
  els.forEach((el) => {
    const key = el.dataset.stat!;
    if (typeof s[key] === 'number') el.textContent = fmtNum(s[key], key.startsWith('tokens') ? 'tokens' : 'total', i18n.locale);
  });
}

// Live Anthropic status (status.claude.com allows cross-origin reads).
async function renderStatus() {
  const panels = document.querySelectorAll<HTMLElement>('[data-status-panel]');
  const lines = document.querySelectorAll<HTMLElement>('[data-status-line]');
  if (!panels.length && !lines.length) return;
  const res = await fetch('https://status.claude.com/api/v2/summary.json');
  if (!res.ok) return;
  const s = await res.json();
  const indicator: string = s.status?.indicator ?? 'none';
  const band = indicator === 'none' ? 'ok' : indicator === 'minor' || indicator === 'maintenance' ? 'busy' : 'peak';
  const text = i18n.statusIndicator?.[indicator] ?? s.status?.description ?? '';
  panels.forEach((p) => {
    const ind = p.querySelector<HTMLElement>('[data-status-indicator]');
    if (ind) { ind.textContent = text; ind.dataset.band = band; }
    p.querySelectorAll<HTMLElement>('[data-comp]').forEach((li) => {
      const c = (s.components ?? []).find((x: { name: string }) => x.name === li.dataset.comp);
      const b = li.querySelector<HTMLElement>('[data-comp-state]');
      if (c && b) { b.dataset.state = c.status; b.textContent = i18n.statusComp?.[c.status] ?? c.status; }
    });
  });
  lines.forEach((l) => { l.textContent = text; l.dataset.band = band; });
}

const renderCharts = () => Promise.all([renderHeatmaps(), renderBars(), renderCountries()]);

/** Until the visitor picks a metric, follow the live data (the build-time default may be stale). */
async function autoMetric() {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-views]')].filter((r) => !r.dataset.userMetric);
  const loose = [...document.querySelectorAll<HTMLElement>('[data-heatmap]')].filter((f) => !f.closest('[data-views]'));
  if (!roots.length && !loose.length) return;
  const metric = loadMetric(await cells('all'));
  roots.forEach((r) => selectMetric(r, metric));
  loose.forEach((f) => (f.dataset.metric = metric));
}

async function refresh() {
  cellCache.clear();
  countriesP = undefined;
  try {
    await autoMetric();
    await Promise.all([renderCharts(), renderNow(), renderStats(), renderStatus().catch(() => {})]);
  } catch (err) {
    console.warn('[hourglyph] live refresh failed', err);
  }
}

// ── World map (lazy) ─────────────────────────────────────────────────────
async function loadWorld(el: HTMLElement) {
  if (el.dataset.loaded) return;
  el.dataset.loaded = '1';
  try {
    el.innerHTML = await (await fetch(el.dataset.src!)).text();
    await renderCountries();
  } catch (err) {
    delete el.dataset.loaded;
    console.warn('[hourglyph] world map failed to load', err);
  }
}

// ── Chart tabs and metric switch ─────────────────────────────────────────
const VIEW_KEY = 'hg-view';
const METRIC_KEY = 'hg-metric';
const remember = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };
const recall = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

function selectView(root: HTMLElement, key: string, focus = false) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  if (!tabs.some((t) => t.dataset.tab === key)) return;
  for (const t of tabs) {
    const on = t.dataset.tab === key;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  }
  root.querySelectorAll<HTMLElement>('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== key));
  if (key === 'map') root.querySelectorAll<HTMLElement>('[data-world]').forEach(loadWorld);
}

function selectMetric(root: HTMLElement, metric: string) {
  if (!i18n.metricNote?.[metric]) return;
  root.dataset.metric = metric;
  root.querySelectorAll<HTMLButtonElement>('[data-metric-btn]').forEach((b) =>
    b.setAttribute('aria-checked', String(b.dataset.metricBtn === metric)),
  );
  const note = root.querySelector('[data-metric-note]');
  if (note) note.textContent = i18n.metricNote[metric];
}

document.querySelectorAll<HTMLElement>('[data-views]').forEach((root) => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      selectView(root, tab.dataset.tab!);
      remember(VIEW_KEY, tab.dataset.tab!);
    });
    tab.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      const jump = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (!step && jump < 0) return;
      e.preventDefault();
      const next = tabs[jump >= 0 ? jump : (i + step + tabs.length) % tabs.length];
      selectView(root, next.dataset.tab!, true);
      remember(VIEW_KEY, next.dataset.tab!);
    });
  });
  root.querySelectorAll<HTMLButtonElement>('[data-metric-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectMetric(root, btn.dataset.metricBtn!);
      root.dataset.userMetric = '1';
      remember(METRIC_KEY, btn.dataset.metricBtn!);
      renderCharts().catch((err) => console.warn('[hourglyph] re-render failed', err));
    });
  });
  const view = recall(VIEW_KEY);
  if (view) selectView(root, view);
  const metric = recall(METRIC_KEY);
  if (metric) {
    selectMetric(root, metric);
    root.dataset.userMetric = '1';
  }
});

refresh();
setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60_000);

// ── Buttons ──────────────────────────────────────────────────────────────
document.querySelectorAll<HTMLButtonElement>('[data-checkin]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const msg = document.querySelector('[data-checkin-msg]');
    btn.disabled = true;
    try {
      const counted = await checkin('manual');
      if (msg) msg.textContent = counted ? i18n.checkinOk : i18n.checkinDup;
      if (counted) refresh();
    } catch {
      if (msg) msg.textContent = i18n.checkinErr;
      btn.disabled = false;
    }
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const src = btn.parentElement?.querySelector('[data-copy-src]');
    if (!src) return;
    try {
      await navigator.clipboard.writeText(src.textContent || '');
      btn.textContent = i18n.copied;
      setTimeout(() => (btn.textContent = i18n.copy), 1800);
    } catch {
      // Clipboard blocked: select the text so ⌘C / Ctrl+C works.
      const range = document.createRange();
      range.selectNodeContents(src);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  });
});
