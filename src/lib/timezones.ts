export interface Zone {
  slug: string;
  tz: string;
  abbr: string;
  /** Russian abbreviation when it differs (МСК). */
  abbrRu?: string;
  en: { name: string; city: string };
  /** ru.name — nominative ("Московское время"), ru.by — "по московскому времени", ru.city — город */
  ru: { name: string; by: string; city: string };
}

export const ZONES: Zone[] = [
  { slug: 'pacific-time', tz: 'America/Los_Angeles', abbr: 'PT',
    en: { name: 'Pacific Time', city: 'San Francisco, Los Angeles, Seattle' },
    ru: { name: 'Тихоокеанское время', by: 'по тихоокеанскому времени (PT)', city: 'Сан-Франциско, Лос-Анджелес, Сиэтл' } },
  { slug: 'eastern-time', tz: 'America/New_York', abbr: 'ET',
    en: { name: 'Eastern Time', city: 'New York, Toronto, Miami' },
    ru: { name: 'Восточное время США', by: 'по восточному времени США (ET)', city: 'Нью-Йорк, Торонто, Майами' } },
  { slug: 'central-time', tz: 'America/Chicago', abbr: 'CT',
    en: { name: 'Central Time', city: 'Chicago, Austin, Dallas' },
    ru: { name: 'Центральное время США', by: 'по центральному времени США (CT)', city: 'Чикаго, Остин, Даллас' } },
  { slug: 'brasilia-time', tz: 'America/Sao_Paulo', abbr: 'BRT',
    en: { name: 'Brasília Time', city: 'São Paulo, Rio de Janeiro' },
    ru: { name: 'Бразильское время', by: 'по времени Бразилиа (BRT)', city: 'Сан-Паулу, Рио-де-Жанейро' } },
  { slug: 'uk-time', tz: 'Europe/London', abbr: 'UK',
    en: { name: 'UK Time', city: 'London, Dublin, Lisbon' },
    ru: { name: 'Время Великобритании', by: 'по лондонскому времени', city: 'Лондон, Дублин, Лиссабон' } },
  { slug: 'central-european-time', tz: 'Europe/Berlin', abbr: 'CET',
    en: { name: 'Central European Time', city: 'Berlin, Paris, Warsaw, Belgrade' },
    ru: { name: 'Центральноевропейское время', by: 'по центральноевропейскому времени (CET)', city: 'Берлин, Париж, Варшава, Белград' } },
  { slug: 'eastern-european-time', tz: 'Europe/Kyiv', abbr: 'EET',
    en: { name: 'Eastern European Time', city: 'Kyiv, Helsinki, Riga, Chișinău' },
    ru: { name: 'Восточноевропейское время', by: 'по восточноевропейскому времени (EET)', city: 'Киев, Хельсинки, Рига, Кишинёв' } },
  { slug: 'moscow-time', tz: 'Europe/Moscow', abbr: 'MSK', abbrRu: 'МСК',
    en: { name: 'Moscow Time', city: 'Moscow, Saint Petersburg, Minsk, Istanbul' },
    ru: { name: 'Московское время', by: 'по московскому времени (МСК)', city: 'Москва, Санкт-Петербург, Минск, Стамбул' } },
  { slug: 'dubai-time', tz: 'Asia/Dubai', abbr: 'GST',
    en: { name: 'Gulf Standard Time', city: 'Dubai, Abu Dhabi, Tbilisi, Yerevan' },
    ru: { name: 'Время Дубая', by: 'по времени Дубая (GST)', city: 'Дубай, Абу-Даби, Тбилиси, Ереван' } },
  { slug: 'yekaterinburg-time', tz: 'Asia/Yekaterinburg', abbr: 'YEKT',
    en: { name: 'Yekaterinburg Time', city: 'Yekaterinburg, Tashkent, Karachi' },
    ru: { name: 'Екатеринбургское время', by: 'по екатеринбургскому времени', city: 'Екатеринбург, Челябинск, Ташкент' } },
  { slug: 'india-time', tz: 'Asia/Kolkata', abbr: 'IST',
    en: { name: 'India Standard Time', city: 'Bengaluru, Mumbai, Delhi' },
    ru: { name: 'Индийское время', by: 'по индийскому времени (IST)', city: 'Бангалор, Мумбаи, Дели' } },
  { slug: 'almaty-time', tz: 'Asia/Almaty', abbr: 'ALMT',
    en: { name: 'Almaty Time', city: 'Almaty, Astana, Bishkek' },
    ru: { name: 'Время Алматы', by: 'по времени Алматы', city: 'Алматы, Астана, Бишкек' } },
  { slug: 'novosibirsk-time', tz: 'Asia/Novosibirsk', abbr: 'NOVT',
    en: { name: 'Novosibirsk Time', city: 'Novosibirsk, Omsk, Tomsk' },
    ru: { name: 'Новосибирское время', by: 'по новосибирскому времени', city: 'Новосибирск, Томск, Барнаул' } },
  { slug: 'singapore-time', tz: 'Asia/Singapore', abbr: 'SGT',
    en: { name: 'Singapore Time', city: 'Singapore, Kuala Lumpur, Manila' },
    ru: { name: 'Сингапурское время', by: 'по сингапурскому времени (SGT)', city: 'Сингапур, Куала-Лумпур, Манила' } },
  { slug: 'china-time', tz: 'Asia/Shanghai', abbr: 'CST',
    en: { name: 'China Standard Time', city: 'Beijing, Shanghai, Shenzhen, Taipei' },
    ru: { name: 'Китайское время', by: 'по пекинскому времени', city: 'Пекин, Шанхай, Шэньчжэнь, Тайбэй' } },
  { slug: 'japan-time', tz: 'Asia/Tokyo', abbr: 'JST',
    en: { name: 'Japan Standard Time', city: 'Tokyo, Osaka' },
    ru: { name: 'Японское время', by: 'по токийскому времени (JST)', city: 'Токио, Осака' } },
  { slug: 'korea-time', tz: 'Asia/Seoul', abbr: 'KST',
    en: { name: 'Korea Standard Time', city: 'Seoul, Busan' },
    ru: { name: 'Корейское время', by: 'по сеульскому времени (KST)', city: 'Сеул, Пусан' } },
  { slug: 'sydney-time', tz: 'Australia/Sydney', abbr: 'AET',
    en: { name: 'Australian Eastern Time', city: 'Sydney, Melbourne, Brisbane' },
    ru: { name: 'Восточноавстралийское время', by: 'по сиднейскому времени', city: 'Сидней, Мельбурн, Брисбен' } },
];

export const zoneBySlug = (slug: string) => ZONES.find((z) => z.slug === slug);
