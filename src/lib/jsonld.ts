import { SITE, SITE_NAME, REPO_URL } from '../config';
import { LANGS, UI, localize, tr, type Lang } from '../i18n';
import type { PageMeta } from './pages';
import type { Stats } from './supabase';

export const datasetJsonLd = (lang: Lang, stats: Stats) => ({
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: tr(lang, {
    en: 'Claude Code usage by hour and weekday',
    ru: 'Использование Claude Code по часам и дням недели',
    zh: '按小时和星期统计的 Claude Code 使用情况',
    ja: '時間帯・曜日別の Claude Code 利用状況',
  }),
  description: tr(lang, {
    en: 'Anonymous, opt-in Claude Code sessions, messages and token counts from volunteers, aggregated by UTC weekday, hour and country. Helps pick off-peak hours to save usage limits.',
    ru: 'Анонимные данные о сессиях, сообщениях и токенах Claude Code от добровольцев, агрегированные по дню недели, часу UTC и стране. Помогают выбрать ненагруженные часы и экономить лимиты.',
    zh: '志愿者自愿提供的匿名 Claude Code 会话、消息和 token 数据，按 UTC 星期、小时和国家聚合。帮助选择非高峰时段、节省用量额度。',
    ja: '有志が任意で提供した Claude Code のセッション・メッセージ・トークン数の匿名データを、UTC の曜日・時間・国ごとに集計。空いている時間を選んで利用上限を節約するのに役立ちます。',
  }),
  url: SITE + localize(lang, '/data/'),
  license: 'https://creativecommons.org/licenses/by/4.0/',
  isAccessibleForFree: true,
  inLanguage: UI[lang].htmlLang,
  creator: { '@type': 'Organization', name: SITE_NAME, url: SITE + '/' },
  temporalCoverage: stats.first_at ? `${stats.first_at.slice(0, 10)}/..` : undefined,
  variableMeasured: ['utc_weekday', 'utc_hour', 'country', 'sessions', 'messages', 'tokens'],
  dateModified: stats.generated_at,
  sameAs: REPO_URL,
  distribution: [
    { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: SITE + '/data/heatmap.json' },
    { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: SITE + '/data/heatmap.csv' },
    { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: SITE + '/data/countries.csv' },
  ],
});

export const websiteJsonLd = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: tr(lang, { en: 'Claude Code Peak Hours', ru: 'Пиковые часы Claude Code', zh: 'Claude Code 高峰时段', ja: 'Claude Code ピーク時間' }),
  description: tr(lang, {
    en: 'A live Claude Code load map that helps you save usage limits by starting work in off-peak hours.',
    ru: 'Живая карта нагрузки Claude Code, которая помогает экономить лимиты: запускайте работу в ненагруженные часы.',
    zh: 'Claude Code 实时负载地图，帮你在非高峰时段开工、节省用量额度。',
    ja: '空いている時間に作業を始めて利用上限を節約するための、Claude Code のライブ負荷マップ。',
  }),
  url: SITE + localize(lang, '/'),
  inLanguage: LANGS.map((l) => UI[l].htmlLang),
});

export const articleJsonLd = (lang: Lang, page: PageMeta) => ({
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: page.title[lang],
  description: page.description[lang],
  inLanguage: UI[lang].htmlLang,
  mainEntityOfPage: SITE + localize(lang, page.path),
  dateModified: new Date().toISOString(),
  author: { '@type': 'Organization', name: SITE_NAME, url: SITE + '/' },
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE + '/' },
  image: `${SITE}/og/${lang}/${page.key}.png`,
});
