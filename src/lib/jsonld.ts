import { SITE, SITE_NAME, REPO_URL } from '../config';
import { localize, type Lang } from '../i18n';
import type { PageMeta } from './pages';
import type { Stats } from './supabase';

export const datasetJsonLd = (lang: Lang, stats: Stats) => ({
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: lang === 'ru' ? 'Использование Claude Code по часам и дням недели' : 'Claude Code usage by hour and weekday',
  description:
    lang === 'ru'
      ? 'Анонимные отметки о начале сессий Claude Code от добровольцев, агрегированные по дню недели и часу UTC.'
      : 'Anonymous, opt-in Claude Code session-start check-ins from volunteers, aggregated by UTC weekday and hour.',
  url: SITE + (lang === 'ru' ? '/ru/data/' : '/data/'),
  license: 'https://creativecommons.org/licenses/by/4.0/',
  isAccessibleForFree: true,
  inLanguage: lang,
  creator: { '@type': 'Organization', name: SITE_NAME, url: SITE + '/' },
  temporalCoverage: stats.first_at ? `${stats.first_at.slice(0, 10)}/..` : undefined,
  variableMeasured: ['utc_weekday', 'utc_hour', 'total'],
  dateModified: stats.generated_at,
  sameAs: REPO_URL,
  distribution: [
    { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: SITE + '/data/heatmap.json' },
    { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: SITE + '/data/heatmap.csv' },
  ],
});

export const websiteJsonLd = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: lang === 'ru' ? 'Пиковые часы Claude Code' : 'Claude Code Peak Hours',
  url: SITE + '/',
  inLanguage: ['en', 'ru'],
});

export const articleJsonLd = (lang: Lang, page: PageMeta) => ({
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: page.title[lang],
  description: page.description[lang],
  inLanguage: lang,
  mainEntityOfPage: SITE + localize(lang, page.path),
  dateModified: new Date().toISOString(),
  author: { '@type': 'Organization', name: SITE_NAME, url: SITE + '/' },
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE + '/' },
  image: `${SITE}/og/${lang}/${page.key}.png`,
});
