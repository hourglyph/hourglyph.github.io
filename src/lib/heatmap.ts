// Pure heatmap math shared by the build (SSR) and the browser (live refresh).
// A Grid is always [weekday 0=Sunday..6][hour 0..23].

export type Grid = number[][];
export interface CellLike { utc_weekday: number; utc_hour: number; total: number }

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // display Monday-first
export const LEVELS = 5;

export const emptyGrid = (): Grid => Array.from({ length: 7 }, () => Array(24).fill(0));

export function fromCells(cells: CellLike[]): Grid {
  const g = emptyGrid();
  for (const c of cells) g[c.utc_weekday][c.utc_hour] += c.total;
  return g;
}

/** UTC offset of `timeZone` in minutes at instant `at` (DST-aware). */
export function offsetMinutes(timeZone: string, at = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
  }).formatToParts(at);
  const n = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const local = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'));
  return Math.round((local - Math.floor(at.getTime() / 60000) * 60000) / 60000);
}

export interface Zoned { grid: Grid; minute: number; offset: number }

/**
 * Shift a UTC grid into a zone. For half-hour zones (e.g. India, +5:30) each cell keeps its
 * one-hour width and is labelled with the minute remainder (cells start at :30).
 */
export function toZone(utc: Grid, offset: number): Zoned {
  const shift = Math.floor(offset / 60);
  const minute = offset - shift * 60;
  const g = emptyGrid();
  for (let d = 0; d < 7; d++)
    for (let h = 0; h < 24; h++) {
      const i = (((d * 24 + h + shift) % 168) + 168) % 168;
      g[Math.floor(i / 24)][i % 24] = utc[d][h];
    }
  return { grid: g, minute, offset };
}

export function level(v: number, max: number): number {
  if (!v || !max) return 0;
  return Math.min(LEVELS, Math.max(1, Math.ceil((v / max) * LEVELS)));
}

export interface Analysis {
  total: number;
  max: number;
  hourTotals: number[];
  dayTotals: number[];
  peakStart: number;   // start hour of the busiest 3-hour window (whole week)
  quietStart: number;  // start hour of the quietest 3-hour window
  workdayPeakStart: number; // busiest 3-hour window on Mon–Fri only
  busiestDay: number;
  quietestDay: number;
  weekendShare: number; // 0..1
  peakCell: { d: number; h: number; v: number };
}

const WINDOW = 3;

function bestWindow(totals: number[], pick: (a: number, b: number) => boolean): number {
  let best = 0, bestSum = NaN;
  for (let s = 0; s < 24; s++) {
    let sum = 0;
    for (let k = 0; k < WINDOW; k++) sum += totals[(s + k) % 24];
    if (Number.isNaN(bestSum) || pick(sum, bestSum)) { best = s; bestSum = sum; }
  }
  return best;
}

export function analyze(g: Grid): Analysis {
  const hourTotals = Array(24).fill(0);
  const workday = Array(24).fill(0);
  const dayTotals = Array(7).fill(0);
  let max = 0, total = 0, peakCell = { d: 1, h: 0, v: 0 };
  for (let d = 0; d < 7; d++)
    for (let h = 0; h < 24; h++) {
      const v = g[d][h];
      hourTotals[h] += v; dayTotals[d] += v; total += v;
      if (d >= 1 && d <= 5) workday[h] += v;
      if (v > max) { max = v; peakCell = { d, h, v }; }
    }
  const byDay = WEEK_ORDER.slice();
  return {
    total, max, hourTotals, dayTotals, peakCell,
    peakStart: bestWindow(hourTotals, (a, b) => a > b),
    quietStart: bestWindow(hourTotals, (a, b) => a < b),
    workdayPeakStart: bestWindow(workday, (a, b) => a > b),
    busiestDay: byDay.reduce((a, b) => (dayTotals[b] > dayTotals[a] ? b : a)),
    quietestDay: byDay.reduce((a, b) => (dayTotals[b] < dayTotals[a] ? b : a)),
    weekendShare: total ? (dayTotals[0] + dayTotals[6]) / total : 0,
  };
}

export const WINDOW_HOURS = WINDOW;

/** Relative load of one cell vs. the average non-empty week cell. */
export function loadBand(v: number, g: Grid): 'quiet' | 'normal' | 'busy' | 'peak' {
  const vals = g.flat();
  const total = vals.reduce((a, b) => a + b, 0);
  if (!total) return 'normal';
  const ratio = v / (total / 168);
  if (ratio < 0.6) return 'quiet';
  if (ratio < 1.3) return 'normal';
  if (ratio < 2) return 'busy';
  return 'peak';
}

// ── Formatting ────────────────────────────────────────────────────────────
export function fmtHour(h: number, minute: number, lang: string): string {
  h = ((h % 24) + 24) % 24;
  const mm = String(minute).padStart(2, '0');
  if (lang === 'en') {
    const h12 = h % 12 || 12;
    return `${h12}${minute ? ':' + mm : ''} ${h < 12 ? 'AM' : 'PM'}`;
  }
  return `${String(h).padStart(2, '0')}:${mm}`;
}

export const fmtWindow = (start: number, minute: number, lang: string) =>
  `${fmtHour(start, minute, lang)}–${fmtHour(start + WINDOW, minute, lang)}`;

export function fmtOffset(offset: number): string {
  const sign = offset < 0 ? '−' : '+';
  const a = Math.abs(offset);
  const m = a % 60;
  return `UTC${sign}${Math.floor(a / 60)}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

/**
 * Anthropic's published weekday peak window (March 2026 announcement): 5–11 AM Pacific.
 * Returns that window's start/end hour (+minute) in `tz`, for the current DST state.
 */
export function officialPeakIn(tz: string, at = new Date()) {
  const diff = offsetMinutes(tz, at) - offsetMinutes('America/Los_Angeles', at);
  const start = (((5 * 60 + diff) % 1440) + 1440) % 1440;
  const end = (start + 6 * 60) % 1440;
  const f = (m: number) => ({ h: Math.floor(m / 60), m: m % 60 });
  return { start: f(start), end: f(end), crossesMidnight: end < start };
}
