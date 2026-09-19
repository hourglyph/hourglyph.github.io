// Live layer: re-renders heatmaps and bar charts in the visitor's (or page's) time zone,
// refreshes stats and the country map, switches chart tabs, and handles the manual check-in
// and copy buttons.
import { checkin, fetchCells, fetchCountries, fetchStats, type Cell, type CountryRow } from '../lib/supabase';
import { MIN_SAMPLE } from '../config';
import { WEEK_ORDER, analyze, fromCells, level, loadBand, offsetMinutes, toZone, fmtOffset } from '../lib/heatmap';
import { countryName, flag } from '../lib/countries';

const i18n = JSON.parse(document.getElementById('hg-i18n')?.textContent || '{}');
const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
function plural(n: number, [one, few, many]: string[]) {
  if (i18n.lang === 'ru') {
    const m10 = n % 10, m100 = n % 100;
    return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
  }
  return n === 1 ? one : many;
}
const unit = (n: number) => plural(n, i18n.unitForms);
const countriesCount = (n: number) => `${n} ${plural(n, i18n.countryForms)}`;

const cache = new Map<string, Promise<Cell[]>>();
const cells = (w: 'all' | '30d') => {
  if (!cache.has(w)) cache.set(w, fetchCells(w));
  return cache.get(w)!;
};
let countriesP: Promise<CountryRow[]> | undefined;
const countries = () => (countriesP ??= fetchCountries('all'));

const resolveTz = (tz?: string) => (!tz || tz === 'auto' ? visitorTz : tz);
const zoneText = (offset: number) => `${visitorTz.replace(/_/g, ' ')} (${fmtOffset(offset)})`;

/** Current time shifted so getUTCDay/getUTCHours give the grid cell (matches toZone's whole-hour shift). */
const zonedNow = (offset: number) => new Date(Date.now() + Math.floor(offset / 60) * 3_600_000);

async function renderHeatmaps() {
  const figs = document.querySelectorAll<HTMLElement>('[data-heatmap]');
  let visitorGrid: number[][] | undefined;
  for (const fig of figs) {
    const tz = fig.dataset.tz === 'auto' ? visitorTz : fig.dataset.tz!;
    const w = (fig.dataset.window as 'all' | '30d') || 'all';
    const offset = offsetMinutes(tz);
    const { grid, minute } = toZone(fromCells(await cells(w)), offset);
    const max = Math.max(0, ...grid.flat());
    const hh = (h: number) => (minute ? `${h}:${String(minute).padStart(2, '0')}` : String(h));

    const local = zonedNow(offset);
    const nowD = local.getUTCDay();
    const nowH = local.getUTCHours();

    fig.querySelectorAll<HTMLElement>('thead th[data-h]').forEach((th) => {
      const h = Number(th.dataset.h);
      th.innerHTML = h % 3 === 0 ? hh(h) : `<span class="sr-only">${hh(h)}</span>`;
    });
    fig.querySelectorAll<HTMLTableCellElement>('td[data-d]').forEach((td) => {
      const d = Number(td.dataset.d), h = Number(td.dataset.h), v = grid[d][h];
      td.dataset.l = String(level(v, max));
      td.title = `${i18n.daysShort[d]} ${hh(h)} · ${v.toLocaleString(i18n.locale)} ${unit(v)}`;
      td.classList.toggle('is-now', d === nowD && h === nowH);
    });
    if (fig.dataset.tz === 'auto') {
      const label = fig.querySelector('[data-zone-label]');
      if (label) label.textContent = zoneText(offset);
      visitorGrid ??= grid;
    }
  }

  // "Right now" band, always relative to the visitor's own zone and the all-time pattern.
  const band = document.querySelector<HTMLElement>('[data-now-band]');
  if (band) {
    const offset = offsetMinutes(visitorTz);
    const grid = visitorGrid ?? toZone(fromCells(await cells('all')), offset).grid;
    const local = zonedNow(offset);
    // With a tiny sample every non-empty hour looks like a "peak"; don't claim anything yet.
    const total = grid.flat().reduce((a, v) => a + v, 0);
    const b = total < MIN_SAMPLE ? 'collecting' : loadBand(grid[local.getUTCDay()][local.getUTCHours()], grid);
    band.dataset.band = b;
    band.textContent = i18n.bands[b];
    const time = document.querySelector('[data-now-time]');
    if (time) {
      time.textContent = new Intl.DateTimeFormat(i18n.locale, { weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(new Date()) + ` · ${i18n.yourTz}`;
    }
  }
}

async function renderBars() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-bars]')) {
    const offset = offsetMinutes(resolveTz(el.dataset.tz));
    const { grid, minute } = toZone(fromCells(await cells('all')), offset);
    const a = analyze(grid);
    const hh = (h: number) => (minute ? `${h}:${String(minute).padStart(2, '0')}` : String(h));
    const hours = el.dataset.bars === 'hours';
    const vals = hours ? a.hourTotals : a.dayTotals;
    const max = Math.max(1, ...vals);
    const now = zonedNow(offset);

    el.querySelectorAll<HTMLElement>(hours ? '.bar-col' : '.bar-row').forEach((row) => {
      const i = Number(row.dataset.i), v = vals[i];
      row.querySelector<HTMLElement>('.bar')?.style.setProperty('--v', String(v / max));
      const label = hours ? hh(i) : i18n.daysShort[i];
      row.title = `${label} · ${v.toLocaleString(i18n.locale)} ${unit(v)}`;
      row.classList.toggle('is-now', hours ? i === now.getUTCHours() : i === now.getUTCDay());
      const value = row.querySelector('[data-value]');
      if (value) value.textContent = v.toLocaleString(i18n.locale);
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
  const maps = document.querySelectorAll<HTMLElement>('[data-world] svg');
  if (!lists.length && !maps.length) return;
  const rows = [...(await countries())].sort((x, y) => y.total - x.total);
  const max = Math.max(1, ...rows.map((r) => r.total));
  const byCc = new Map(rows.map((r) => [r.country, r.total]));

  lists.forEach((list) => {
    list.innerHTML = rows
      .slice(0, 10)
      .map((r) =>
        `<li data-cc="${r.country}"><span class="cl-name">${flag(r.country)} ${countryName(r.country, i18n.locale)}</span>` +
        `<span class="cl-bar"><span class="bar" style="--v:${r.total / max}"></span></span>` +
        `<span class="cl-value">${r.total.toLocaleString(i18n.locale)}</span></li>`,
      )
      .join('');
    const panel = list.parentElement;
    const empty = panel?.querySelector<HTMLElement>('[data-countries-empty]');
    if (empty) empty.hidden = rows.length > 0;
    const count = panel?.querySelector('[data-countries-count]');
    if (count) count.textContent = countriesCount(rows.length);
  });

  maps.forEach((svg) => {
    svg.querySelectorAll<SVGPathElement>('path[data-cc]').forEach((p) => {
      const v = byCc.get(p.dataset.cc!) ?? 0;
      p.dataset.l = String(level(v, max));
      const t = p.querySelector('title');
      const name = t?.dataset.name ?? t?.textContent ?? '';
      if (t) {
        t.dataset.name = name;
        t.textContent = `${name} · ${v.toLocaleString(i18n.locale)} ${unit(v)}`;
      }
    });
  });
}

async function loadWorld(el: HTMLElement) {
  if (el.dataset.loaded) return;
  el.dataset.loaded = '1';
  try {
    const res = await fetch(el.dataset.src!);
    el.innerHTML = await res.text();
    await renderCountries();
  } catch (err) {
    delete el.dataset.loaded;
    console.warn('[hourglyph] world map failed to load', err);
  }
}

async function renderStats() {
  const els = document.querySelectorAll<HTMLElement>('[data-stat]');
  if (!els.length) return;
  const s = await fetchStats();
  els.forEach((el) => {
    const v = (s as unknown as Record<string, number>)[el.dataset.stat!];
    if (typeof v === 'number') el.textContent = v.toLocaleString(i18n.locale);
  });
}

async function refresh() {
  cache.clear();
  try {
    countriesP = undefined;
    await Promise.all([renderHeatmaps(), renderBars(), renderStats(), renderCountries()]);
  } catch (err) {
    console.warn('[hourglyph] live refresh failed', err);
  }
}

// ── Chart tabs ──────────────────────────────────────────────────────────
const VIEW_KEY = 'hg-view';
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

document.querySelectorAll<HTMLElement>('[data-views]').forEach((root) => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      selectView(root, tab.dataset.tab!);
      try { localStorage.setItem(VIEW_KEY, tab.dataset.tab!); } catch {}
    });
    tab.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      const jump = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (!step && jump < 0) return;
      e.preventDefault();
      const next = tabs[jump >= 0 ? jump : (i + step + tabs.length) % tabs.length];
      selectView(root, next.dataset.tab!, true);
      try { localStorage.setItem(VIEW_KEY, next.dataset.tab!); } catch {}
    });
  });
  let saved: string | null = null;
  try { saved = localStorage.getItem(VIEW_KEY); } catch {}
  if (saved) selectView(root, saved);
});

refresh();
setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60_000);

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
