// A prompt users paste into Claude Code so the agent installs the hooks itself.
// It must be safe on any existing settings file: back up, merge, never clobber, show the diff.
import { HOOK_ENTRIES, HOOK_INSTALL, HOOK_MARKERS, HOOK_SCRIPT_PATH, HOOK_SCRIPT_SOURCE, SITE } from '../config';
import type { Lang } from '../i18n';

const entries = JSON.stringify(HOOK_ENTRIES, null, 2);
const markers = HOOK_MARKERS.map((m) => `"${m}"`).join(' / ');

export function setupPrompt(lang: Lang): string {
  if (lang === 'ru') {
    return `Подключи у меня hooks Hourglyph для Claude Code (${SITE}/ru/setup/).

Цель: анонимно отправлять на карту пиковых часов время начала сессий, время отправки сообщений и число токенов за ход. Текст сообщений, ответы, код и пути не отправляются.

Шаги:
1. Скачай скрипт и покажи мне его содержимое целиком, прежде чем продолжать:
   ${HOOK_INSTALL}
   (исходник на GitHub: ${HOOK_SCRIPT_SOURCE}). Проверь, что в нём нет ничего, кроме отправки события и четырёх чисел токенов.
2. Прочитай ~/.claude/settings.json (если файла нет — считай, что там {}). Если файл есть, сделай резервную копию ~/.claude/settings.json.bak.
3. Удали из hooks все старые записи Hourglyph — команды, содержащие ${markers}, — чтобы не было дублей.
4. Объедини, а не перезаписывай: сохрани все остальные настройки и hooks и добавь в соответствующие массивы hooks.SessionStart, hooks.UserPromptSubmit и hooks.Stop (создай их, если их нет) ровно эти элементы:

${entries}

5. Запиши файл как валидный JSON и перечитай его, чтобы убедиться, что он парсится.
6. Проверь, что доступны curl и awk (command -v curl awk).
7. Покажи мне diff и объясни, как всё удалить: убрать эти три записи из settings.json и файл ${HOOK_SCRIPT_PATH}.

Больше ничего не меняй. Данные начнут приходить со следующей новой сессии.`;
  }
  return `Set up the Hourglyph hooks for Claude Code on this machine (${SITE}/setup/).

Goal: anonymously send session starts, the times I send messages, and token counts per turn to the peak-hours map. Message text, answers, code and paths are never sent.

Steps:
1. Download the script and show me its full contents before continuing:
   ${HOOK_INSTALL}
   (source on GitHub: ${HOOK_SCRIPT_SOURCE}). Check that it does nothing but send an event name and four token counts.
2. Read ~/.claude/settings.json (treat a missing file as {}). If it exists, back it up to ~/.claude/settings.json.bak first.
3. Remove any old Hourglyph entries from hooks — commands containing ${markers} — so nothing is duplicated.
4. Merge, don't overwrite: keep every other setting and hook, and append exactly these elements to hooks.SessionStart, hooks.UserPromptSubmit and hooks.Stop (create them if missing):

${entries}

5. Write the file back as valid JSON and re-read it to confirm it parses.
6. Check that curl and awk are available (command -v curl awk).
7. Show me the diff and tell me how to remove everything: delete those three entries from settings.json and the file ${HOOK_SCRIPT_PATH}.

Don't change anything else. Data starts flowing with the next new session.`;
}
