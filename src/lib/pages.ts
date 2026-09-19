// Single source of truth for page paths and per-language meta (used by pages, nav, OG images).
import type { Lang } from '../i18n';
import { ZONES, type Zone } from './timezones';

export interface PageMeta { key: string; path: string; title: Record<Lang, string>; description: Record<Lang, string> }

export const PAGES = {
  home: {
    path: '/',
    title: { en: 'Claude Code Peak Hours — Live Usage Heatmap', ru: 'Пиковые часы Claude Code — живая карта нагрузки' },
    description: {
      en: 'When is Claude Code busiest? A live, community-sourced heatmap of Claude Code sessions by hour and weekday, shown in your time zone. Find the quiet hours.',
      ru: 'Когда Claude Code загружен сильнее всего? Живая тепловая карта сессий по часам и дням недели в вашем часовом поясе. Найдите спокойные часы для работы.',
    },
  },
  best: {
    path: '/best-time-to-use-claude-code/',
    title: { en: 'Best Time to Use Claude Code: Quiet Hours by Time Zone', ru: 'Лучшее время для Claude Code: когда нагрузка меньше' },
    description: {
      en: 'The best hours to use Claude Code and Claude, based on real session data: quiet windows, busy weekdays and how to plan heavy agent runs around peak hours.',
      ru: 'Когда лучше работать в Claude Code и Claude: спокойные окна, загруженные дни недели и как планировать тяжёлые задачи агента вне пиковых часов — по реальным данным.',
    },
  },
  zones: {
    path: '/peak-hours/',
    title: { en: 'Claude Code Peak Hours in Every Time Zone', ru: 'Пиковые часы Claude Code по часовым поясам' },
    description: {
      en: 'Claude Code peak and off-peak hours converted to your local time: Pacific, Eastern, UK, CET, Moscow, India, Singapore, China, Japan, Sydney and more.',
      ru: 'Пиковые и спокойные часы Claude Code в вашем местном времени: Москва, Екатеринбург, Новосибирск, Алматы, Европа, США, Азия и другие пояса.',
    },
  },
  slow: {
    path: '/is-claude-slow-right-now/',
    title: { en: 'Is Claude Slow Right Now? Current Claude Code Load', ru: 'Claude тормозит прямо сейчас? Текущая нагрузка на Claude Code' },
    description: {
      en: 'Claude or Claude Code feels slow or overloaded? See how busy it is right now compared to a normal week, check the official status page, and what to do meanwhile.',
      ru: 'Claude или Claude Code тормозит или пишет «overloaded»? Посмотрите, насколько он загружен прямо сейчас по сравнению с обычной неделей, и что делать.',
    },
  },
  limits: {
    path: '/claude-code-usage-limits/',
    title: { en: 'Claude Code Usage Limits and Peak Hours Explained (2026)', ru: 'Лимиты Claude Code и пиковые часы: как это устроено (2026)' },
    description: {
      en: 'How Claude Code’s 5-hour session limits and weekly limits work, what changed with peak-hour limits in 2026, and how to get more done within your plan.',
      ru: 'Как работают 5-часовые и недельные лимиты Claude Code, что изменилось с пиковыми часами в 2026 году и как успевать больше в рамках своего тарифа.',
    },
  },
  setup: {
    path: '/setup/',
    title: { en: 'Claude Code SessionStart Hook: Add Your Sessions to the Map', ru: 'SessionStart hook для Claude Code: добавьте свои сессии на карту' },
    description: {
      en: 'A copy-paste Claude Code SessionStart hook for settings.json that anonymously adds one check-in per session to the peak-hours heatmap. What it sends, how to remove it.',
      ru: 'Готовый SessionStart hook для settings.json Claude Code: анонимно добавляет одну отметку за сессию в общую карту пиковых часов. Что отправляется и как отключить.',
    },
  },
  data: {
    path: '/data/',
    title: { en: 'Open Dataset: Claude Code Usage by Hour and Weekday', ru: 'Открытый датасет: использование Claude Code по часам и дням' },
    description: {
      en: 'Download the community Claude Code usage dataset as JSON or CSV: check-ins aggregated by UTC weekday and hour, updated several times a day. CC BY 4.0.',
      ru: 'Скачайте открытый датасет использования Claude Code в JSON или CSV: отметки, агрегированные по дню недели и часу UTC, обновляются несколько раз в день. CC BY 4.0.',
    },
  },
  faq: {
    path: '/faq/',
    title: { en: 'Claude Code Peak Hours FAQ', ru: 'Пиковые часы Claude Code: вопросы и ответы' },
    description: {
      en: 'Answers about Claude Code peak hours: when Claude is busiest, whether peak hours affect limits, why Claude says overloaded, and how this heatmap is built.',
      ru: 'Ответы о пиковых часах Claude Code: когда Claude загружен сильнее всего, влияют ли пики на лимиты, почему Claude пишет overloaded и как строится карта.',
    },
  },
  about: {
    path: '/about/',
    title: { en: 'About Hourglyph and Privacy', ru: 'О проекте Hourglyph и приватность' },
    description: {
      en: 'What Hourglyph is, exactly what data it stores (one timestamp bucket per session, nothing else), rate limiting, and how to opt out.',
      ru: 'Что такое Hourglyph, какие данные хранятся (только час и день недели на сессию, больше ничего), защита от накрутки и как отказаться.',
    },
  },
} satisfies Record<string, Omit<PageMeta, 'key'>>;

export type PageKey = keyof typeof PAGES;

export const page = (key: PageKey): PageMeta => ({ key, ...PAGES[key] });

export function zonePage(z: Zone): PageMeta {
  return {
    key: `zone-${z.slug}`,
    path: `/peak-hours/${z.slug}/`,
    title: {
      en: `Claude Code Peak Hours in ${z.en.name} (${z.abbr})`,
      ru: `Пиковые часы Claude Code ${z.ru.by}`,
    },
    description: {
      en: `Claude Code peak hours in ${z.abbr}: a live heatmap of sessions, the busiest and quietest hours, and the best time to run long tasks.`,
      ru: `Когда Claude Code загружен ${z.ru.by}: живая карта сессий, пиковые и спокойные часы, лучшее время для долгих задач.`,
    },
  };
}

export const ALL_PAGES: PageMeta[] = [
  ...(Object.keys(PAGES) as PageKey[]).map(page),
  ...ZONES.map(zonePage),
];
