import type { Lang } from '../i18n';

export interface QA { q: string; a: string } // `a` is trusted HTML authored here

export const FAQ: Record<Lang, QA[]> = {
  en: [
    { q: 'What is Hourglyph for?',
      a: 'It helps you save Claude Code limits by starting work in off-peak hours. Anthropic has tied limits to the time of day before, peak hours bring more slow replies and failed runs you end up repeating, and your 5-hour window starts with your first message. The <a href="/">heatmap</a> shows when the load peaks in your time zone so you can plan heavy work around it. More tips: <a href="/save-claude-code-limits/">how to save Claude Code limits</a>.' },
    { q: 'When are Claude Code’s peak hours?',
      a: 'Anthropic has described weekdays from 5 to 11 AM Pacific Time (8 AM–2 PM Eastern, 13:00–19:00 UK in summer) as its peak window. That is when US mornings overlap with the European afternoon. The live heatmap on the <a href="/">home page</a> shows how real Claude Code sessions are distributed across the week, converted to your time zone.' },
    { q: 'What is the best time to use Claude Code?',
      a: 'Outside the weekday peak: late evening and night in the Americas, early morning in Europe, and weekends everywhere tend to be calmer. See <a href="/best-time-to-use-claude-code/">best time to use Claude Code</a> for the current quiet windows.' },
    { q: 'Do peak hours affect my Claude Code usage limits?',
      a: 'Not anymore for most paid users. In March 2026 Anthropic made 5-hour session limits drain faster during weekday peak hours. On May 6, 2026 it doubled Claude Code’s 5-hour limits for Pro, Max, Team and seat-based Enterprise plans and removed the peak-hour reduction for Pro and Max. Weekly limits still apply. Details: <a href="/claude-code-usage-limits/">Claude Code usage limits explained</a>.' },
    { q: 'Why does Claude say “overloaded” or feel slow?',
      a: 'An “overloaded” error (HTTP 529) means capacity is temporarily exhausted; it is more likely at peak hours and during incidents. Check <a href="https://status.claude.com" rel="nofollow">status.claude.com</a> for incidents and <a href="/is-claude-slow-right-now/">current load on this site</a>.' },
    { q: 'Is this an official Anthropic tool?',
      a: 'No. Hourglyph is an independent, open-source community project. Numbers come only from people who chose to add the hook or press the check-in button, so they show relative patterns, not Anthropic’s internal traffic.' },
    { q: 'What data does the hook send?',
      a: 'Three kinds of event: a session started, a message was sent (without its text), and a turn finished with four token counts computed locally from your transcript. The server adds the UTC hour, weekday and the country code the network derives from the connection. No prompts, answers, code, paths, session IDs or IP addresses are stored. See <a href="/about/">privacy</a>.' },
    { q: 'Why count messages and tokens, not just sessions?',
      a: 'One session can last all day. Messages show when people are actually working, and tokens show how heavy that work is — together they give a far better picture of load, and of the hours when limits go further.' },
    { q: 'Where does the world map data come from?',
      a: 'From the same check-ins. The country is the two-letter code Cloudflare attaches to each request; only per-day totals per country are published. With a VPN, the VPN’s country is counted.' },
    { q: 'Where does the incident data come from?',
      a: 'From Anthropic’s official status page, status.claude.com, through its public API. Our database syncs recent incidents every hour and counts the hours when an incident affecting Claude, the API or Claude Code was open. Pick “Incidents” above the charts to see when outages cluster.' },
    { q: 'Which time zone is the heatmap in?',
      a: 'Your browser’s time zone. Data is stored in UTC and converted on the fly. There are also dedicated pages for <a href="/peak-hours/">major time zones</a>.' },
    { q: 'Can I use the data?',
      a: 'Yes, it is published under CC BY 4.0 as <a href="/data/">JSON and CSV</a>. Please link back to Hourglyph.' },
  ],
  ru: [
    { q: 'Зачем нужен Hourglyph?',
      a: 'Hourglyph помогает экономить лимиты Claude Code: запускайте работу в ненагруженные часы. Anthropic уже привязывала расход лимитов ко времени суток; в часы пик чаще бывают медленные ответы и сбои, из-за которых задачу приходится перезапускать; а 5-часовое окно лимита начинается с первого сообщения. <a href="/ru/">Карта</a> показывает, когда нагрузка максимальна в вашем поясе, чтобы планировать тяжёлую работу в обход пика. Другие советы: <a href="/ru/save-claude-code-limits/">как экономить лимиты Claude Code</a>.' },
    { q: 'Когда у Claude Code пиковые часы?',
      a: 'Anthropic называла пиковым окном будни с 5:00 до 11:00 по тихоокеанскому времени — это 15:00–21:00 по Москве с марта по ноябрь и 16:00–22:00 зимой, когда в США действует стандартное время. В это время утро в США совпадает со второй половиной дня в Европе. Живая карта на <a href="/ru/">главной</a> показывает, как распределены реальные сессии Claude Code по неделе в вашем часовом поясе.' },
    { q: 'Когда лучше всего работать в Claude Code?',
      a: 'Вне будничного пика: для России и Европы — утро и первая половина дня, а также поздний вечер и ночь; выходные спокойнее везде. Актуальные спокойные окна — на странице <a href="/ru/best-time-to-use-claude-code/">лучшее время для Claude Code</a>.' },
    { q: 'Влияют ли пиковые часы на лимиты Claude Code?',
      a: 'Для большинства платных пользователей — уже нет. В марте 2026 года Anthropic сделала так, что в будничные пиковые часы 5-часовые лимиты расходовались быстрее. 6 мая 2026 года 5-часовые лимиты Claude Code для Pro, Max, Team и Enterprise (по местам) удвоили, а снижение в пиковые часы для Pro и Max отменили. Недельные лимиты действуют. Подробнее: <a href="/ru/claude-code-usage-limits/">лимиты Claude Code</a>.' },
    { q: 'Почему Claude пишет «overloaded» или тормозит?',
      a: 'Ошибка «overloaded» (HTTP 529) означает, что мощности временно исчерпаны; чаще она бывает в пиковые часы и во время инцидентов. Проверьте <a href="https://status.claude.com" rel="nofollow">status.claude.com</a> и <a href="/ru/is-claude-slow-right-now/">текущую нагрузку</a>.' },
    { q: 'Это официальный инструмент Anthropic?',
      a: 'Нет. Hourglyph — независимый проект сообщества с открытым кодом. Данные поступают только от тех, кто сам подключил hook или нажал кнопку отметки, поэтому карта показывает относительные закономерности, а не внутренний трафик Anthropic.' },
    { q: 'Какие данные отправляет hook?',
      a: 'Три вида событий: началась сессия, отправлено сообщение (без текста) и завершён ход — с четырьмя числами токенов, посчитанными локально по файлу переписки. Сервер добавляет час и день недели по UTC и код страны, который сеть определяет по соединению. Промпты, ответы, код, пути, идентификаторы сессий и IP-адреса не хранятся. Подробнее — в разделе <a href="/ru/about/">о приватности</a>.' },
    { q: 'Зачем считать сообщения и токены, а не только сессии?',
      a: 'Одна сессия может длиться весь день. Сообщения показывают, когда люди действительно работают, а токены — насколько тяжела эта работа. Вместе они дают гораздо более точную картину нагрузки и часов, когда лимиты тратятся экономнее.' },
    { q: 'Откуда данные для карты мира?',
      a: 'Из тех же отметок. Страна — это двухбуквенный код, который Cloudflare добавляет к каждому запросу; публикуются только суммы по странам за день. При работе через VPN учитывается страна VPN-сервера.' },
    { q: 'Откуда данные о сбоях?',
      a: 'С официальной статус-страницы Anthropic, status.claude.com, через её публичный API. База раз в час синхронизирует свежие инциденты и считает часы, когда был открыт инцидент по Claude, API или Claude Code. Выберите «Сбои» над графиками, чтобы увидеть, на какие часы они приходятся.' },
    { q: 'В каком часовом поясе показана карта?',
      a: 'В часовом поясе вашего браузера: данные хранятся в UTC и пересчитываются на лету. Есть и отдельные страницы для <a href="/ru/peak-hours/">популярных часовых поясов</a>, включая Москву, Екатеринбург, Новосибирск и Алматы.' },
    { q: 'Можно ли использовать данные?',
      a: 'Да, они опубликованы под лицензией CC BY 4.0 в формате <a href="/ru/data/">JSON и CSV</a>. Пожалуйста, ставьте ссылку на Hourglyph.' },
  ],
};

const strip = (html: string) => html.replace(/<[^>]+>/g, '');

export const faqJsonLd = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: lang,
  mainEntity: FAQ[lang].map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
});
