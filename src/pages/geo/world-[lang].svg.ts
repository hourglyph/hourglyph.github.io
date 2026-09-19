// World map as a static SVG (one per language, for <title> names). Built once; the browser only
// recolours paths by `data-cc`, so no mapping library ships to visitors.
import type { APIRoute } from 'astro';
import { createRequire } from 'node:module';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { LANGS, UI, type Lang } from '../../i18n';
import { countryName } from '../../lib/countries';

const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-110m.json');
const iso = require('i18n-iso-countries');

// Features world-atlas ships without an ISO numeric id.
const BY_NAME: Record<string, string> = { Kosovo: 'XK', Somaliland: 'SO', 'N. Cyprus': 'CY' };
const W = 960, H = 470;

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const fc = feature(world, world.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
  fc.features = fc.features.filter((f) => f.id !== '010'); // Antarctica: no users, lots of pixels
  const projection = geoEqualEarth().fitSize([W, H], fc);
  const path = geoPath(projection).digits(1);

  const paths = fc.features
    .map((f) => {
      const cc = (f.id && iso.numericToAlpha2(String(f.id))) || BY_NAME[f.properties.name] || '';
      const name = cc ? countryName(cc, UI[lang].locale) : f.properties.name;
      return `<path d="${path(f)}"${cc ? ` data-cc="${cc}"` : ''}><title>${name}</title></path>`;
    })
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${lang === 'ru' ? 'Карта мира' : 'World map'}">${paths}</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
