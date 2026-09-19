// Single source of truth for page paths and per-language meta (used by pages, nav, OG images).
import type { Lang } from '../i18n';
import { ZONES, type Zone } from './timezones';

export interface PageMeta { key: string; path: string; title: Record<Lang, string>; description: Record<Lang, string> }

export const PAGES = {
  home: {
    path: '/',
    title: { en: 'Claude Code Peak Hours — Live Heatmap to Save Your Limits', ru: 'Пиковые часы Claude Code — карта нагрузки для экономии лимитов' },
    description: {
      en: 'Save Claude Code limits by working off-peak. A live heatmap of sessions by hour, weekday and country in your time zone shows the quiet hours to start work.',
      ru: 'Экономьте лимиты Claude Code: запускайте работу в ненагруженные часы. Живая карта сессий по часам, дням и странам в вашем часовом поясе.',
    },
  },
  save: {
    path: '/save-claude-code-limits/',
    title: { en: 'How to Save Claude Code Limits: Work in Off-Peak Hours', ru: 'Как экономить лимиты Claude Code: работайте в ненагруженные часы' },
    description: {
      en: 'Make your Claude Code limits last longer: start heavy work in off-peak hours, time your 5-hour window, avoid wasted re-runs and keep context lean.',
      ru: 'Как тратить лимиты Claude Code медленнее: запускайте тяжёлые задачи в ненагруженные часы, планируйте 5-часовое окно и не тратьте лимит на повторы.',
    },
  },
  best: {
    path: '/best-time-to-use-claude-code/',
    title: { en: 'Best Time to Use Claude Code: Off-Peak Hours That Save Limits', ru: 'Лучшее время для Claude Code: ненагруженные часы для экономии лимитов' },
    description: {
      en: 'The best hours to use Claude Code, from real session data: off-peak windows that save your limits, busy weekdays, and how to plan heavy agent runs.',
      ru: 'Когда лучше работать в Claude Code: ненагруженные окна, в которых лимиты тратятся экономнее, загруженные дни и как планировать тяжёлые задачи агента.',
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
    title: { en: 'Claude Code Hooks: Track Sessions, Messages and Tokens', ru: 'Hooks для Claude Code: сессии, сообщения и токены на карте' },
    description: {
      en: 'Copy-paste Claude Code hooks (SessionStart, UserPromptSubmit, Stop) that anonymously log sessions, messages and tokens per turn. No text sent.',
      ru: 'Готовые hooks для Claude Code (SessionStart, UserPromptSubmit, Stop): анонимно отмечают сессии, сообщения и токены за ход. Текст не отправляется.',
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
  // Titles use a DST-independent label ("CET/CEST") so they don't change twice a year.
  const en = z.abbrDst ? `${z.abbr}/${z.abbrDst}` : z.abbr;
  const ru = z.abbrRu ?? en;
  return {
    key: `zone-${z.slug}`,
    path: `/peak-hours/${z.slug}/`,
    title: {
      en: `Claude Code Peak Hours in ${z.en.name} (${en})`,
      ru: `Пиковые часы Claude Code ${z.ru.by} (${ru})`,
    },
    description: {
      en: `Claude Code peak hours in ${z.en.name}: live heatmap, busiest and quietest hours, and when to work so your limits last longer.`,
      ru: `Пиковые часы Claude Code ${z.ru.by}: живая карта, загруженные и спокойные часы и когда работать, чтобы лимиты тратились медленнее.`,
    },
  };
}

export const ALL_PAGES: PageMeta[] = [
  ...(Object.keys(PAGES) as PageKey[]).map(page),
  ...ZONES.map(zonePage),
];
