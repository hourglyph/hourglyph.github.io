export const LANGS = ['en', 'ru'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

/** '/setup/' → '/ru/setup/' for non-default languages. */
export const localize = (lang: Lang, path: string) =>
  lang === DEFAULT_LANG ? path : `/${lang}${path === '/' ? '/' : path}`;

export const UI = {
  en: {
    locale: 'en-US',
    skip: 'Skip to content',
    nav: { home: 'Heatmap', best: 'Best time', zones: 'Time zones', limits: 'Limits', setup: 'Add your sessions' },
    langName: 'English',
    switchTo: 'Русский',
    theme: 'Toggle dark mode',
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    checkins: (n: number) => `${n.toLocaleString('en-US')} check-in${n === 1 ? '' : 's'}`,
    less: 'Less', more: 'More',
    yourTz: 'your time zone',
    utc: 'UTC',
    halfHour: 'Cells start at :30 in this zone.',
    hmCaption: 'Claude Code sessions by weekday and hour',
    bands: { collecting: 'Collecting data', quiet: 'Quiet', normal: 'Typical load', busy: 'Busy', peak: 'Peak hours' },
    now: 'Right now',
    nowIn: 'in your time zone',
    stats: { last_hour: 'last hour', last_24h: 'last 24 h', last_30d: 'last 30 days', total: 'all time' },
    checkinBtn: 'I’m using Claude Code right now',
    checkinOk: 'Counted — thanks! The map updates within a minute.',
    checkinDup: 'Already counted from your network in the last 10 minutes.',
    checkinErr: 'Couldn’t reach the server. Try again later.',
    window: { all: 'All time', '30d': 'Last 30 days' },
    updated: 'Snapshot built',
    footerNote: 'Unofficial community project. Not affiliated with, endorsed by, or sponsored by Anthropic. “Claude” and “Claude Code” are trademarks of Anthropic, PBC.',
    footerData: 'Data: CC BY 4.0',
    footerSource: 'Source on GitHub',
    breadcrumbsHome: 'Home',
    copy: 'Copy', copied: 'Copied',
  },
  ru: {
    locale: 'ru-RU',
    skip: 'К содержимому',
    nav: { home: 'Карта', best: 'Лучшее время', zones: 'Часовые пояса', limits: 'Лимиты', setup: 'Добавить свои сессии' },
    langName: 'Русский',
    switchTo: 'English',
    theme: 'Переключить тёмную тему',
    daysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    daysLong: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
    checkins: (n: number) => {
      const m10 = n % 10, m100 = n % 100;
      const w = m10 === 1 && m100 !== 11 ? 'отметка' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'отметки' : 'отметок';
      return `${n.toLocaleString('ru-RU')} ${w}`;
    },
    less: 'Меньше', more: 'Больше',
    yourTz: 'ваш часовой пояс',
    utc: 'UTC',
    halfHour: 'В этом поясе ячейки начинаются в :30.',
    hmCaption: 'Сессии Claude Code по дням недели и часам',
    bands: { collecting: 'Собираем данные', quiet: 'Спокойно', normal: 'Обычная нагрузка', busy: 'Загружено', peak: 'Пиковые часы' },
    now: 'Прямо сейчас',
    nowIn: 'в вашем часовом поясе',
    stats: { last_hour: 'за час', last_24h: 'за 24 ч', last_30d: 'за 30 дней', total: 'всего' },
    checkinBtn: 'Я сейчас работаю в Claude Code',
    checkinOk: 'Учтено — спасибо! Карта обновится в течение минуты.',
    checkinDup: 'Из вашей сети уже была отметка за последние 10 минут.',
    checkinErr: 'Сервер недоступен. Попробуйте позже.',
    window: { all: 'За всё время', '30d': 'За 30 дней' },
    updated: 'Снимок данных от',
    footerNote: 'Неофициальный проект сообщества. Не связан с Anthropic и не одобрен ею. «Claude» и «Claude Code» — товарные знаки Anthropic, PBC.',
    footerData: 'Данные: CC BY 4.0',
    footerSource: 'Исходный код на GitHub',
    breadcrumbsHome: 'Главная',
    copy: 'Копировать', copied: 'Скопировано',
  },
} as const;

export type UIStrings = (typeof UI)[Lang];
