// Single source of truth for page paths and per-language meta (used by pages, nav, OG images).
import type { Lang } from '../i18n';
import { ZONES, type Zone } from './timezones';

export interface PageMeta { key: string; path: string; title: Record<Lang, string>; description: Record<Lang, string> }

export const PAGES = {
  home: {
    path: '/',
    title: { en: 'Claude Code Peak Hours — Live Heatmap to Save Your Limits', ru: 'Пиковые часы Claude Code — карта нагрузки для экономии лимитов', zh: 'Claude Code 高峰时段——实时热力图，帮你节省额度', ja: 'Claude Code のピーク時間——利用上限を節約するライブヒートマップ' },
    description: {
      en: 'Save Claude Code limits by working off-peak. A live heatmap of sessions by hour, weekday and country in your time zone shows the quiet hours to start work.',
      ru: 'Экономьте лимиты Claude Code: запускайте работу в ненагруженные часы. Живая карта сессий по часам, дням и странам в вашем часовом поясе.',
      zh: '错开高峰使用 Claude Code，节省用量额度。按小时、星期和国家统计会话的实时热力图，自动换算到你的时区，一眼找到适合开工的空闲时段。',
      ja: '混雑していない時間帯に作業して Claude Code の利用上限を節約。時間帯・曜日・国別のセッションをあなたのタイムゾーンで表示するライブヒートマップで、空いている時間がひと目でわかります。',
    },
  },
  save: {
    path: '/save-claude-code-limits/',
    title: { en: 'How to Save Claude Code Limits: Work in Off-Peak Hours', ru: 'Как экономить лимиты Claude Code: работайте в ненагруженные часы', zh: '如何节省 Claude Code 额度：错开高峰时段工作', ja: 'Claude Code の利用上限を節約する方法：ピークを避けて作業する' },
    description: {
      en: 'Make your Claude Code limits last longer: start heavy work in off-peak hours, time your 5-hour window, avoid wasted re-runs and keep context lean.',
      ru: 'Как тратить лимиты Claude Code медленнее: запускайте тяжёлые задачи в ненагруженные часы, планируйте 5-часовое окно и не тратьте лимит на повторы.',
      zh: '让 Claude Code 额度用得更久：把繁重任务放在非高峰时段，规划好 5 小时窗口，避免无谓的重跑，保持上下文精简。',
      ja: 'Claude Code の上限を長持ちさせるコツ：重い作業は空いている時間に回し、5時間ウィンドウを計画的に使い、無駄な再実行を避け、コンテキストを軽く保つ。',
    },
  },
  best: {
    path: '/best-time-to-use-claude-code/',
    title: { en: 'Best Time to Use Claude Code: Off-Peak Hours That Save Limits', ru: 'Лучшее время для Claude Code: ненагруженные часы для экономии лимитов', zh: 'Claude Code 最佳使用时间：节省额度的非高峰时段', ja: 'Claude Code を使うおすすめの時間：上限を節約できる空き時間帯' },
    description: {
      en: 'The best hours to use Claude Code, from real session data: off-peak windows that save your limits, busy weekdays, and how to plan heavy agent runs.',
      ru: 'Когда лучше работать в Claude Code: ненагруженные окна, в которых лимиты тратятся экономнее, загруженные дни и как планировать тяжёлые задачи агента.',
      zh: '基于真实会话数据的 Claude Code 最佳使用时段：更省额度的空闲窗口、繁忙的工作日，以及如何安排耗时较长的智能体任务。',
      ja: '実際のセッションデータから見る Claude Code のおすすめ時間帯：上限を節約できる空き時間、混雑する曜日、重いエージェント作業の計画方法。',
    },
  },
  zones: {
    path: '/peak-hours/',
    title: { en: 'Claude Code Peak Hours in Every Time Zone', ru: 'Пиковые часы Claude Code по часовым поясам', zh: '各时区的 Claude Code 高峰时段', ja: 'タイムゾーン別 Claude Code のピーク時間' },
    description: {
      en: 'Claude Code peak and off-peak hours converted to your local time: Pacific, Eastern, UK, CET, Moscow, India, Singapore, China, Japan, Sydney and more.',
      ru: 'Пиковые и спокойные часы Claude Code в вашем местном времени: Москва, Екатеринбург, Новосибирск, Алматы, Европа, США, Азия и другие пояса.',
      zh: '换算成当地时间的 Claude Code 高峰与空闲时段：北京、新加坡、东京、首尔、悉尼、欧洲、美国等时区。',
      ja: 'Claude Code のピーク時間と空き時間を現地時間で：日本、韓国、中国、シンガポール、シドニー、ヨーロッパ、米国などのタイムゾーン。',
    },
  },
  slow: {
    path: '/is-claude-slow-right-now/',
    title: { en: 'Is Claude Slow Right Now? Current Claude Code Load', ru: 'Claude тормозит прямо сейчас? Текущая нагрузка на Claude Code', zh: 'Claude 现在很慢吗？Claude Code 当前负载', ja: 'Claude が今遅い？Claude Code の現在の負荷' },
    description: {
      en: 'Claude or Claude Code feels slow or overloaded? See how busy it is right now compared to a normal week, check the official status page, and what to do meanwhile.',
      ru: 'Claude или Claude Code тормозит или пишет «overloaded»? Посмотрите, насколько он загружен прямо сейчас по сравнению с обычной неделей, и что делать.',
      zh: 'Claude 或 Claude Code 很慢、提示 overloaded？看看它现在和平常一周相比有多忙，查看官方状态页，以及这时该怎么办。',
      ja: 'Claude や Claude Code が遅い、overloaded と表示される？今の混雑を普段の1週間と比べ、公式ステータスページを確認し、その間にできることを紹介します。',
    },
  },
  limits: {
    path: '/claude-code-usage-limits/',
    title: { en: 'Claude Code Usage Limits and Peak Hours Explained (2026)', ru: 'Лимиты Claude Code и пиковые часы: как это устроено (2026)', zh: 'Claude Code 用量限制与高峰时段详解（2026）', ja: 'Claude Code の利用上限とピーク時間を解説（2026年）' },
    description: {
      en: 'How Claude Code’s 5-hour session limits and weekly limits work, what changed with peak-hour limits in 2026, and how to get more done within your plan.',
      ru: 'Как работают 5-часовые и недельные лимиты Claude Code, что изменилось с пиковыми часами в 2026 году и как успевать больше в рамках своего тарифа.',
      zh: 'Claude Code 的 5 小时会话限制和每周限制如何运作，2026 年高峰时段限制有哪些变化，以及如何在套餐范围内完成更多工作。',
      ja: 'Claude Code の5時間セッション上限と週間上限の仕組み、2026年のピーク時間に関する変更点、プランの範囲内でより多くこなす方法。',
    },
  },
  setup: {
    path: '/setup/',
    title: { en: 'Claude Code Hooks: Track Sessions, Messages and Tokens', ru: 'Hooks для Claude Code: сессии, сообщения и токены на карте', zh: 'Claude Code Hooks：匿名记录会话、消息和 token', ja: 'Claude Code の Hooks：セッション・メッセージ・トークンを匿名で記録' },
    description: {
      en: 'Copy-paste Claude Code hooks (SessionStart, UserPromptSubmit, Stop) that anonymously log sessions, messages and tokens per turn. No text sent.',
      ru: 'Готовые hooks для Claude Code (SessionStart, UserPromptSubmit, Stop): анонимно отмечают сессии, сообщения и токены за ход. Текст не отправляется.',
      zh: '可直接复制的 Claude Code hooks（SessionStart、UserPromptSubmit、Stop），匿名记录会话、消息和每轮 token 数。不发送任何文本。',
      ja: 'コピーして使える Claude Code の hooks（SessionStart・UserPromptSubmit・Stop）。セッション、メッセージ、ターンごとのトークン数を匿名で記録します。テキストは送信しません。',
    },
  },
  data: {
    path: '/data/',
    title: { en: 'Open Dataset: Claude Code Usage by Hour and Weekday', ru: 'Открытый датасет: использование Claude Code по часам и дням', zh: '开放数据集：按小时和星期统计的 Claude Code 使用情况', ja: 'オープンデータ：時間帯・曜日別の Claude Code 利用状況' },
    description: {
      en: 'Download the community Claude Code usage dataset as JSON or CSV: check-ins aggregated by UTC weekday and hour, updated several times a day. CC BY 4.0.',
      ru: 'Скачайте открытый датасет использования Claude Code в JSON или CSV: отметки, агрегированные по дню недели и часу UTC, обновляются несколько раз в день. CC BY 4.0.',
      zh: '下载社区 Claude Code 使用数据集（JSON 或 CSV）：按 UTC 星期和小时聚合，每天更新多次。CC BY 4.0 许可。',
      ja: 'コミュニティによる Claude Code 利用データセットを JSON・CSV でダウンロード。UTC の曜日と時間で集計し、1日に数回更新。CC BY 4.0。',
    },
  },
  faq: {
    path: '/faq/',
    title: { en: 'Claude Code Peak Hours FAQ', ru: 'Пиковые часы Claude Code: вопросы и ответы', zh: 'Claude Code 高峰时段常见问题', ja: 'Claude Code のピーク時間 よくある質問' },
    description: {
      en: 'Answers about Claude Code peak hours: when Claude is busiest, whether peak hours affect limits, why Claude says overloaded, and how this heatmap is built.',
      ru: 'Ответы о пиковых часах Claude Code: когда Claude загружен сильнее всего, влияют ли пики на лимиты, почему Claude пишет overloaded и как строится карта.',
      zh: '关于 Claude Code 高峰时段的解答：Claude 什么时候最忙、高峰是否影响额度、为什么会提示 overloaded，以及这张热力图是怎么来的。',
      ja: 'Claude Code のピーク時間についての回答：いつ最も混むのか、ピークは上限に影響するのか、なぜ overloaded と出るのか、このヒートマップの仕組み。',
    },
  },
  about: {
    path: '/about/',
    title: { en: 'About Hourglyph and Privacy', ru: 'О проекте Hourglyph и приватность', zh: '关于 Hourglyph 与隐私', ja: 'Hourglyph について・プライバシー' },
    description: {
      en: 'What Hourglyph is, exactly what data it stores (one timestamp bucket per session, nothing else), rate limiting, and how to opt out.',
      ru: 'Что такое Hourglyph, какие данные хранятся (только час и день недели на сессию, больше ничего), защита от накрутки и как отказаться.',
      zh: 'Hourglyph 是什么、具体存储哪些数据（每个会话只有一个时间段，别无其他）、防刷限制，以及如何退出。',
      ja: 'Hourglyph とは何か、保存するデータ（セッションごとの時間帯のみ、それ以外は一切なし）、不正対策の制限、利用をやめる方法。',
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
      zh: `${z.zh.name}（${en}）的 Claude Code 高峰时段`,
      ja: `${z.ja.name}（${en}）の Claude Code ピーク時間`,
    },
    description: {
      en: `Claude Code peak hours in ${z.en.name}: live heatmap, busiest and quietest hours, and when to work so your limits last longer.`,
      ru: `Пиковые часы Claude Code ${z.ru.by}: живая карта, загруженные и спокойные часы и когда работать, чтобы лимиты тратились медленнее.`,
      zh: `${z.zh.name}的 Claude Code 高峰时段：实时热力图、最忙与最空闲的时段，以及怎样安排工作让额度用得更久。`,
      ja: `${z.ja.name}での Claude Code のピーク時間：ライブヒートマップ、混雑する時間と空いている時間、上限を長持ちさせる作業タイミング。`,
    },
  };
}

export const ALL_PAGES: PageMeta[] = [
  ...(Object.keys(PAGES) as PageKey[]).map(page),
  ...ZONES.map(zonePage),
];
