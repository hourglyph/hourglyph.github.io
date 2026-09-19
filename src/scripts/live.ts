// Live layer: re-renders heatmaps in the visitor's (or page's) time zone, refreshes stats,
// marks the current hour, and handles the manual check-in and copy buttons.
import { checkin, fetchCells, fetchStats, type Cell } from '../lib/supabase';
import { MIN_SAMPLE } from '../config';
import { fromCells, level, loadBand, offsetMinutes, toZone, fmtOffset } from '../lib/heatmap';

const i18n = JSON.parse(document.getElementById('hg-i18n')?.textContent || '{}');
const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const unit = (n: number) => {
  const [one, few, many] = i18n.unitForms as string[];
  if (i18n.lang === 'ru') {
    const m10 = n % 10, m100 = n % 100;
    return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
  }
  return n === 1 ? one : many;
};

const cache = new Map<string, Promise<Cell[]>>();
const cells = (w: 'all' | '30d') => {
  if (!cache.has(w)) cache.set(w, fetchCells(w));
  return cache.get(w)!;
};

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
      if (label) label.textContent = `${visitorTz.replace(/_/g, ' ')} (${fmtOffset(offset)})`;
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
    await Promise.all([renderHeatmaps(), renderStats()]);
  } catch (err) {
    console.warn('[hourglyph] live refresh failed', err);
  }
}

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
    } catch { /* clipboard blocked: the text is still selectable */ }
  });
});
