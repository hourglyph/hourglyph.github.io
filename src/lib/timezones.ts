import { offsetMinutes } from './heatmap';

// One naming scheme for every zone:
//   en.name — "<Adjective/Place> Time"            ru.name — "<прилагательное> время"
//   zh/ja.name — local names;  ru.by   — "по <прилагательное> времени"        cities  — exactly three, all on the same clock year-round
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
  zh: { name: string; city: string };
  ja: { name: string; city: string };
}

export const ZONES: Zone[] = [
  { slug: 'pacific-time', tz: 'America/Los_Angeles', abbr: 'PT',
    en: { name: 'Pacific Time', city: 'San Francisco, Los Angeles, Seattle' },
    ru: { name: 'Тихоокеанское время', by: 'по тихоокеанскому времени', city: 'Сан-Франциско, Лос-Анджелес, Сиэтл' },
    zh: { name: '太平洋时间', city: '旧金山、洛杉矶、西雅图' },
    ja: { name: '太平洋時間', city: 'サンフランシスコ、ロサンゼルス、シアトル' } },
  { slug: 'central-time', tz: 'America/Chicago', abbr: 'CT',
    en: { name: 'Central Time', city: 'Chicago, Austin, Dallas' },
    ru: { name: 'Центральное время США', by: 'по центральному времени США', city: 'Чикаго, Остин, Даллас' },
    zh: { name: '美国中部时间', city: '芝加哥、奥斯汀、达拉斯' },
    ja: { name: '米国中部時間', city: 'シカゴ、オースティン、ダラス' } },
  { slug: 'eastern-time', tz: 'America/New_York', abbr: 'ET',
    en: { name: 'Eastern Time', city: 'New York, Toronto, Miami' },
    ru: { name: 'Восточное время США', by: 'по восточному времени США', city: 'Нью-Йорк, Торонто, Майами' },
    zh: { name: '美国东部时间', city: '纽约、多伦多、迈阿密' },
    ja: { name: '米国東部時間', city: 'ニューヨーク、トロント、マイアミ' } },
  { slug: 'brasilia-time', tz: 'America/Sao_Paulo', abbr: 'BRT',
    en: { name: 'Brasília Time', city: 'São Paulo, Rio de Janeiro, Buenos Aires' },
    ru: { name: 'Бразильское время', by: 'по бразильскому времени', city: 'Сан-Паулу, Рио-де-Жанейро, Буэнос-Айрес' },
    zh: { name: '巴西利亚时间', city: '圣保罗、里约热内卢、布宜诺斯艾利斯' },
    ja: { name: 'ブラジリア時間', city: 'サンパウロ、リオデジャネイロ、ブエノスアイレス' } },
  { slug: 'uk-time', tz: 'Europe/London', abbr: 'GMT', abbrDst: 'BST',
    en: { name: 'British Time', city: 'London, Dublin, Lisbon' },
    ru: { name: 'Британское время', by: 'по британскому времени', city: 'Лондон, Дублин, Лиссабон' },
    zh: { name: '英国时间', city: '伦敦、都柏林、里斯本' },
    ja: { name: '英国時間', city: 'ロンドン、ダブリン、リスボン' } },
  { slug: 'central-european-time', tz: 'Europe/Berlin', abbr: 'CET', abbrDst: 'CEST',
    en: { name: 'Central European Time', city: 'Berlin, Paris, Warsaw' },
    ru: { name: 'Центральноевропейское время', by: 'по центральноевропейскому времени', city: 'Берлин, Париж, Варшава' },
    zh: { name: '欧洲中部时间', city: '柏林、巴黎、华沙' },
    ja: { name: '中央ヨーロッパ時間', city: 'ベルリン、パリ、ワルシャワ' } },
  { slug: 'eastern-european-time', tz: 'Europe/Kyiv', abbr: 'EET', abbrDst: 'EEST',
    en: { name: 'Eastern European Time', city: 'Kyiv, Helsinki, Riga' },
    ru: { name: 'Восточноевропейское время', by: 'по восточноевропейскому времени', city: 'Киев, Хельсинки, Рига' },
    zh: { name: '欧洲东部时间', city: '基辅、赫尔辛基、里加' },
    ja: { name: '東ヨーロッパ時間', city: 'キーウ、ヘルシンキ、リガ' } },
  { slug: 'moscow-time', tz: 'Europe/Moscow', abbr: 'MSK', abbrRu: 'МСК',
    en: { name: 'Moscow Time', city: 'Moscow, Saint Petersburg, Minsk' },
    ru: { name: 'Московское время', by: 'по московскому времени', city: 'Москва, Санкт-Петербург, Минск' },
    zh: { name: '莫斯科时间', city: '莫斯科、圣彼得堡、明斯克' },
    ja: { name: 'モスクワ時間', city: 'モスクワ、サンクトペテルブルク、ミンスク' } },
  { slug: 'dubai-time', tz: 'Asia/Dubai', abbr: 'GST', abbrRu: 'GST',
    en: { name: 'Gulf Time', city: 'Dubai, Abu Dhabi, Tbilisi' },
    ru: { name: 'Дубайское время', by: 'по дубайскому времени', city: 'Дубай, Абу-Даби, Тбилиси' },
    zh: { name: '海湾时间', city: '迪拜、阿布扎比、第比利斯' },
    ja: { name: '湾岸時間', city: 'ドバイ、アブダビ、トビリシ' } },
  { slug: 'yekaterinburg-time', tz: 'Asia/Yekaterinburg', abbr: 'YEKT', abbrRu: 'МСК+2',
    en: { name: 'Yekaterinburg Time', city: 'Yekaterinburg, Chelyabinsk, Tashkent' },
    ru: { name: 'Екатеринбургское время', by: 'по екатеринбургскому времени', city: 'Екатеринбург, Челябинск, Ташкент' },
    zh: { name: '叶卡捷琳堡时间', city: '叶卡捷琳堡、车里雅宾斯克、塔什干' },
    ja: { name: 'エカテリンブルク時間', city: 'エカテリンブルク、チェリャビンスク、タシケント' } },
  { slug: 'almaty-time', tz: 'Asia/Almaty', abbr: 'KZT',
    en: { name: 'Kazakhstan Time', city: 'Almaty, Astana, Shymkent' },
    ru: { name: 'Казахстанское время', by: 'по казахстанскому времени', city: 'Алматы, Астана, Шымкент' },
    zh: { name: '哈萨克斯坦时间', city: '阿拉木图、阿斯塔纳、奇姆肯特' },
    ja: { name: 'カザフスタン時間', city: 'アルマトイ、アスタナ、シムケント' } },
  { slug: 'india-time', tz: 'Asia/Kolkata', abbr: 'IST',
    en: { name: 'India Time', city: 'Bengaluru, Mumbai, Delhi' },
    ru: { name: 'Индийское время', by: 'по индийскому времени', city: 'Бангалор, Мумбаи, Дели' },
    zh: { name: '印度时间', city: '班加罗尔、孟买、德里' },
    ja: { name: 'インド時間', city: 'ベンガルール、ムンバイ、デリー' } },
  { slug: 'novosibirsk-time', tz: 'Asia/Novosibirsk', abbr: 'NOVT', abbrRu: 'МСК+4',
    en: { name: 'Novosibirsk Time', city: 'Novosibirsk, Tomsk, Barnaul' },
    ru: { name: 'Новосибирское время', by: 'по новосибирскому времени', city: 'Новосибирск, Томск, Барнаул' },
    zh: { name: '新西伯利亚时间', city: '新西伯利亚、托木斯克、巴尔瑙尔' },
    ja: { name: 'ノヴォシビルスク時間', city: 'ノヴォシビルスク、トムスク、バルナウル' } },
  { slug: 'singapore-time', tz: 'Asia/Singapore', abbr: 'SGT',
    en: { name: 'Singapore Time', city: 'Singapore, Kuala Lumpur, Manila' },
    ru: { name: 'Сингапурское время', by: 'по сингапурскому времени', city: 'Сингапур, Куала-Лумпур, Манила' },
    zh: { name: '新加坡时间', city: '新加坡、吉隆坡、马尼拉' },
    ja: { name: 'シンガポール時間', city: 'シンガポール、クアラルンプール、マニラ' } },
  { slug: 'china-time', tz: 'Asia/Shanghai', abbr: 'CST',
    en: { name: 'China Time', city: 'Beijing, Shanghai, Shenzhen' },
    ru: { name: 'Китайское время', by: 'по китайскому времени', city: 'Пекин, Шанхай, Шэньчжэнь' },
    zh: { name: '北京时间', city: '北京、上海、深圳' },
    ja: { name: '中国時間', city: '北京、上海、深圳' } },
  { slug: 'japan-time', tz: 'Asia/Tokyo', abbr: 'JST',
    en: { name: 'Japan Time', city: 'Tokyo, Osaka, Yokohama' },
    ru: { name: 'Японское время', by: 'по японскому времени', city: 'Токио, Осака, Иокогама' },
    zh: { name: '日本时间', city: '东京、大阪、横滨' },
    ja: { name: '日本時間', city: '東京、大阪、横浜' } },
  { slug: 'korea-time', tz: 'Asia/Seoul', abbr: 'KST',
    en: { name: 'Korea Time', city: 'Seoul, Busan, Incheon' },
    ru: { name: 'Корейское время', by: 'по корейскому времени', city: 'Сеул, Пусан, Инчхон' },
    zh: { name: '韩国时间', city: '首尔、釜山、仁川' },
    ja: { name: '韓国時間', city: 'ソウル、釜山、仁川' } },
  { slug: 'sydney-time', tz: 'Australia/Sydney', abbr: 'AEST', abbrDst: 'AEDT',
    en: { name: 'Australian Eastern Time', city: 'Sydney, Melbourne, Canberra' },
    ru: { name: 'Восточноавстралийское время', by: 'по восточноавстралийскому времени', city: 'Сидней, Мельбурн, Канберра' },
    zh: { name: '澳大利亚东部时间', city: '悉尼、墨尔本、堪培拉' },
    ja: { name: 'オーストラリア東部時間', city: 'シドニー、メルボルン、キャンベラ' } },
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
