import { offsetMinutes } from './heatmap';

// One naming scheme for every zone:
//   en.name — "<Adjective/Place> Time"            ru.name — "<прилагательное> время"
//   ru.by   — "по <прилагательное> времени"        cities  — exactly three, all on the same clock year-round
export interface Zone {
  slug: string;
  tz: string;
  /** Standard-time abbreviation; `abbrDst` replaces it while daylight saving is in effect. */
  abbr: string;
  abbrDst?: string;
  /** Russian label when the Latin one isn't what Russians use (МСК, МСК+2…). */
  abbrRu?: string;
  en: { name: string; city: string };
  ru: { name: string; by: string; city: string };
}

export const ZONES: Zone[] = [
  { slug: 'pacific-time', tz: 'America/Los_Angeles', abbr: 'PT',
    en: { name: 'Pacific Time', city: 'San Francisco, Los Angeles, Seattle' },
    ru: { name: 'Тихоокеанское время', by: 'по тихоокеанскому времени', city: 'Сан-Франциско, Лос-Анджелес, Сиэтл' } },
  { slug: 'central-time', tz: 'America/Chicago', abbr: 'CT',
    en: { name: 'Central Time', city: 'Chicago, Austin, Dallas' },
    ru: { name: 'Центральное время США', by: 'по центральному времени США', city: 'Чикаго, Остин, Даллас' } },
  { slug: 'eastern-time', tz: 'America/New_York', abbr: 'ET',
    en: { name: 'Eastern Time', city: 'New York, Toronto, Miami' },
    ru: { name: 'Восточное время США', by: 'по восточному времени США', city: 'Нью-Йорк, Торонто, Майами' } },
  { slug: 'brasilia-time', tz: 'America/Sao_Paulo', abbr: 'BRT',
    en: { name: 'Brasília Time', city: 'São Paulo, Rio de Janeiro, Buenos Aires' },
    ru: { name: 'Бразильское время', by: 'по бразильскому времени', city: 'Сан-Паулу, Рио-де-Жанейро, Буэнос-Айрес' } },
  { slug: 'uk-time', tz: 'Europe/London', abbr: 'GMT', abbrDst: 'BST',
    en: { name: 'British Time', city: 'London, Dublin, Lisbon' },
    ru: { name: 'Британское время', by: 'по британскому времени', city: 'Лондон, Дублин, Лиссабон' } },
  { slug: 'central-european-time', tz: 'Europe/Berlin', abbr: 'CET', abbrDst: 'CEST',
    en: { name: 'Central European Time', city: 'Berlin, Paris, Warsaw' },
    ru: { name: 'Центральноевропейское время', by: 'по центральноевропейскому времени', city: 'Берлин, Париж, Варшава' } },
  { slug: 'eastern-european-time', tz: 'Europe/Kyiv', abbr: 'EET', abbrDst: 'EEST',
    en: { name: 'Eastern European Time', city: 'Kyiv, Helsinki, Riga' },
    ru: { name: 'Восточноевропейское время', by: 'по восточноевропейскому времени', city: 'Киев, Хельсинки, Рига' } },
  { slug: 'moscow-time', tz: 'Europe/Moscow', abbr: 'MSK', abbrRu: 'МСК',
    en: { name: 'Moscow Time', city: 'Moscow, Saint Petersburg, Minsk' },
    ru: { name: 'Московское время', by: 'по московскому времени', city: 'Москва, Санкт-Петербург, Минск' } },
  { slug: 'dubai-time', tz: 'Asia/Dubai', abbr: 'GST', abbrRu: 'GST',
    en: { name: 'Gulf Time', city: 'Dubai, Abu Dhabi, Tbilisi' },
    ru: { name: 'Дубайское время', by: 'по дубайскому времени', city: 'Дубай, Абу-Даби, Тбилиси' } },
  { slug: 'yekaterinburg-time', tz: 'Asia/Yekaterinburg', abbr: 'YEKT', abbrRu: 'МСК+2',
    en: { name: 'Yekaterinburg Time', city: 'Yekaterinburg, Chelyabinsk, Tashkent' },
    ru: { name: 'Екатеринбургское время', by: 'по екатеринбургскому времени', city: 'Екатеринбург, Челябинск, Ташкент' } },
  { slug: 'almaty-time', tz: 'Asia/Almaty', abbr: 'KZT',
    en: { name: 'Kazakhstan Time', city: 'Almaty, Astana, Shymkent' },
    ru: { name: 'Казахстанское время', by: 'по казахстанскому времени', city: 'Алматы, Астана, Шымкент' } },
  { slug: 'india-time', tz: 'Asia/Kolkata', abbr: 'IST',
    en: { name: 'India Time', city: 'Bengaluru, Mumbai, Delhi' },
    ru: { name: 'Индийское время', by: 'по индийскому времени', city: 'Бангалор, Мумбаи, Дели' } },
  { slug: 'novosibirsk-time', tz: 'Asia/Novosibirsk', abbr: 'NOVT', abbrRu: 'МСК+4',
    en: { name: 'Novosibirsk Time', city: 'Novosibirsk, Tomsk, Barnaul' },
    ru: { name: 'Новосибирское время', by: 'по новосибирскому времени', city: 'Новосибирск, Томск, Барнаул' } },
  { slug: 'singapore-time', tz: 'Asia/Singapore', abbr: 'SGT',
    en: { name: 'Singapore Time', city: 'Singapore, Kuala Lumpur, Manila' },
    ru: { name: 'Сингапурское время', by: 'по сингапурскому времени', city: 'Сингапур, Куала-Лумпур, Манила' } },
  { slug: 'china-time', tz: 'Asia/Shanghai', abbr: 'CST',
    en: { name: 'China Time', city: 'Beijing, Shanghai, Shenzhen' },
    ru: { name: 'Китайское время', by: 'по китайскому времени', city: 'Пекин, Шанхай, Шэньчжэнь' } },
  { slug: 'japan-time', tz: 'Asia/Tokyo', abbr: 'JST',
    en: { name: 'Japan Time', city: 'Tokyo, Osaka, Yokohama' },
    ru: { name: 'Японское время', by: 'по японскому времени', city: 'Токио, Осака, Иокогама' } },
  { slug: 'korea-time', tz: 'Asia/Seoul', abbr: 'KST',
    en: { name: 'Korea Time', city: 'Seoul, Busan, Incheon' },
    ru: { name: 'Корейское время', by: 'по корейскому времени', city: 'Сеул, Пусан, Инчхон' } },
  { slug: 'sydney-time', tz: 'Australia/Sydney', abbr: 'AEST', abbrDst: 'AEDT',
    en: { name: 'Australian Eastern Time', city: 'Sydney, Melbourne, Canberra' },
    ru: { name: 'Восточноавстралийское время', by: 'по восточноавстралийскому времени', city: 'Сидней, Мельбурн, Канберра' } },
];

export const zoneBySlug = (slug: string) => ZONES.find((z) => z.slug === slug);

/** Daylight saving is on when the offset differs from the zone's standard (smaller) offset. */
function isDst(z: Zone, at = new Date()): boolean {
  const y = at.getUTCFullYear();
  const jan = offsetMinutes(z.tz, new Date(Date.UTC(y, 0, 15)));
  const jul = offsetMinutes(z.tz, new Date(Date.UTC(y, 6, 15)));
  return jan !== jul && offsetMinutes(z.tz, at) === Math.max(jan, jul);
}

/** Abbreviation to show right now, in the page language. */
export function zoneAbbr(z: Zone, lang: string, at = new Date()): string {
  if (lang === 'ru' && z.abbrRu) return z.abbrRu;
  return z.abbrDst && isDst(z, at) ? z.abbrDst : z.abbr;
}
