// Country helpers shared by the build (map SVG, lists) and the browser.

/** Localised country name from an ISO 3166-1 alpha-2 code (e.g. "RU" → "Россия"). */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Regional-indicator flag emoji for an alpha-2 code. */
export const flag = (code: string) =>
  /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : '';

/** A country's value for a metric; incidents aren't per-country, so they read as 0. */
export const countryValue = (r: { total: number; messages: number; tokens: number }, metric: string): number =>
  metric === 'total' || metric === 'messages' || metric === 'tokens' ? r[metric] : 0;
