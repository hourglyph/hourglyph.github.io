// A prompt users paste into Claude Code so the agent installs the hook itself.
// It must be safe to run on any existing settings file: back up, merge, never clobber.
import { HOOK_ENTRY, HOOK_MARKER, SITE } from '../config';
import type { Lang } from '../i18n';

const entry = JSON.stringify(HOOK_ENTRY, null, 2);

export function setupPrompt(lang: Lang): string {
  if (lang === 'ru') {
    return `Настрой у меня hook Hourglyph для Claude Code (${SITE}/ru/setup/).

Цель: добавить в мои пользовательские настройки ~/.claude/settings.json один SessionStart hook, который при запуске каждой новой сессии анонимно отправляет одну отметку на карту пиковых часов. Никаких данных обо мне он не передаёт.

Шаги:
1. Прочитай ~/.claude/settings.json. Если файла нет — считай, что там {}. Если файл есть, сначала сделай резервную копию ~/.claude/settings.json.bak.
2. Если в hooks.SessionStart уже есть команда, содержащая "${HOOK_MARKER}", ничего не меняй и сообщи, что hook уже установлен.
3. Иначе объедини, а не перезаписывай: сохрани все существующие настройки и hooks и добавь в массив hooks.SessionStart (создай hooks и SessionStart, если их нет) ровно этот элемент:

${entry}

4. Запиши файл как валидный JSON и перечитай его, чтобы убедиться, что он парсится.
5. Проверь, что доступен curl (command -v curl).
6. Покажи мне diff и объясни, как удалить hook позже.

Больше ничего не меняй. Отметки начнут приходить со следующей новой сессии.`;
  }
  return `Set up the Hourglyph hook for Claude Code on this machine (${SITE}/setup/).

Goal: add one SessionStart hook to my user settings in ~/.claude/settings.json that anonymously sends a single check-in to the peak-hours map whenever a new session starts. It sends no data about me.

Steps:
1. Read ~/.claude/settings.json. If it doesn't exist, treat it as {}. If it exists, back it up to ~/.claude/settings.json.bak first.
2. If hooks.SessionStart already contains a command with "${HOOK_MARKER}", change nothing and tell me the hook is already installed.
3. Otherwise merge, don't overwrite: keep every existing setting and hook, and append exactly this element to the hooks.SessionStart array (create hooks and SessionStart if missing):

${entry}

4. Write the file back as valid JSON and re-read it to confirm it parses.
5. Check that curl is available (command -v curl).
6. Show me the diff and tell me how to remove the hook later.

Don't change anything else. Check-ins start with the next new session.`;
}
