// A prompt users paste into Claude Code so the agent installs the hooks itself.
// It must be safe on any existing settings file: back up, merge, never clobber, show the diff.
import { HOOK_ENTRIES, HOOK_INSTALL, HOOK_MARKERS, HOOK_SCRIPT_PATH, HOOK_SCRIPT_SOURCE, SITE, UNINSTALL_CMD } from '../config';
import { localize, type Lang } from '../i18n';

const entries = JSON.stringify(HOOK_ENTRIES, null, 2);
const markers = HOOK_MARKERS.map((m) => `"${m}"`).join(' / ');

export function setupPrompt(lang: Lang): string {
  const url = `${SITE}${localize(lang, '/setup/')}`;
  switch (lang) {
    case 'ru':
      return `Подключи у меня hooks Hourglyph для Claude Code (${url}).

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
7. Покажи мне diff и объясни, как всё удалить: убрать эти три записи из settings.json и файл ${HOOK_SCRIPT_PATH} — или одной командой: ${UNINSTALL_CMD}

Больше ничего не меняй. Данные начнут приходить со следующей новой сессии.`;
    case 'zh':
      return `请在这台机器上为 Claude Code 安装 Hourglyph hooks（${url}）。

目标：把会话启动时间、发送消息的时间以及每轮的 token 数匿名发送到高峰时段地图。消息文本、回复、代码和路径都不会发送。

步骤：
1. 下载脚本，在继续之前把完整内容展示给我：
   ${HOOK_INSTALL}
   （GitHub 源码：${HOOK_SCRIPT_SOURCE}）。确认它除了发送事件名和四个 token 数字之外不做任何事。
2. 读取 ~/.claude/settings.json（文件不存在就当作 {}）。如果文件存在，先备份到 ~/.claude/settings.json.bak。
3. 从 hooks 中删除所有旧的 Hourglyph 条目——即包含 ${markers} 的命令——避免重复。
4. 合并而不是覆盖：保留其他所有设置和 hook，把下面这些元素原样追加到 hooks.SessionStart、hooks.UserPromptSubmit 和 hooks.Stop 数组中（不存在就创建）：

${entries}

5. 以合法 JSON 写回文件，并重新读取确认可以解析。
6. 检查 curl 和 awk 是否可用（command -v curl awk）。
7. 给我看 diff，并告诉我如何全部删除：从 settings.json 删掉这三个条目并删除文件 ${HOOK_SCRIPT_PATH}——或者用一条命令：${UNINSTALL_CMD}

不要修改其他任何内容。从下一个新会话开始就会发送数据。`;
    case 'ja':
      return `このマシンの Claude Code に Hourglyph の hooks を設定してください（${url}）。

目的：セッションの開始時刻、メッセージを送信した時刻、ターンごとのトークン数を、ピーク時間マップに匿名で送信すること。メッセージのテキスト、応答、コード、パスは送信しません。

手順：
1. スクリプトをダウンロードし、先に進む前に内容をすべて見せてください：
   ${HOOK_INSTALL}
   （GitHub のソース：${HOOK_SCRIPT_SOURCE}）。イベント名と4つのトークン数を送る以外に何もしていないことを確認してください。
2. ~/.claude/settings.json を読み込みます（ファイルがなければ {} とみなす）。ファイルがある場合は、まず ~/.claude/settings.json.bak にバックアップしてください。
3. 重複しないよう、hooks から古い Hourglyph のエントリ（${markers} を含むコマンド）をすべて削除してください。
4. 上書きではなくマージしてください。ほかの設定と hook はすべて残し、hooks.SessionStart・hooks.UserPromptSubmit・hooks.Stop の各配列（なければ作成）に次の要素をそのまま追加します：

${entries}

5. 有効な JSON としてファイルを書き戻し、読み直してパースできることを確認してください。
6. curl と awk が使えるか確認してください（command -v curl awk）。
7. diff を見せ、すべてを削除する方法を教えてください：settings.json からこの3つのエントリを消し、${HOOK_SCRIPT_PATH} ファイルを削除する。またはコマンド1つで：${UNINSTALL_CMD}

それ以外は何も変更しないでください。データは次の新しいセッションから送信されます。`;
    default:
      return `Set up the Hourglyph hooks for Claude Code on this machine (${url}).

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
7. Show me the diff and tell me how to remove everything: delete those three entries from settings.json and the file ${HOOK_SCRIPT_PATH} — or in one command: ${UNINSTALL_CMD}

Don't change anything else. Data starts flowing with the next new session.`;
  }
}

export function uninstallPrompt(lang: Lang): string {
  const url = `${SITE}${localize(lang, '/setup/')}`;
  switch (lang) {
    case 'ru':
      return `Удали у меня hooks Hourglyph для Claude Code (${url}).

1. Сделай резервную копию ~/.claude/settings.json в ~/.claude/settings.json.hourglyph-bak.
2. Удали из hooks только записи Hourglyph — команды, содержащие ${markers}. Все остальные hooks и настройки оставь как есть; пустые группы и события удали.
3. Запиши файл как валидный JSON и перечитай его, чтобы убедиться, что он парсится.
4. Удали файл ${HOOK_SCRIPT_PATH}.
5. Покажи мне diff.`;
    case 'zh':
      return `请在这台机器上删除 Claude Code 的 Hourglyph hooks（${url}）。

1. 把 ~/.claude/settings.json 备份到 ~/.claude/settings.json.hourglyph-bak。
2. 只从 hooks 中删除 Hourglyph 的条目——即包含 ${markers} 的命令。其他 hook 和设置保持原样；删掉因此变空的分组和事件。
3. 以合法 JSON 写回文件，并重新读取确认可以解析。
4. 删除文件 ${HOOK_SCRIPT_PATH}。
5. 给我看 diff。`;
    case 'ja':
      return `このマシンの Claude Code から Hourglyph の hooks を削除してください（${url}）。

1. ~/.claude/settings.json を ~/.claude/settings.json.hourglyph-bak にバックアップしてください。
2. hooks から Hourglyph のエントリ（${markers} を含むコマンド）だけを削除してください。ほかの hook と設定はそのまま残し、空になったグループやイベントは削除します。
3. 有効な JSON としてファイルを書き戻し、読み直してパースできることを確認してください。
4. ${HOOK_SCRIPT_PATH} ファイルを削除してください。
5. diff を見せてください。`;
    default:
      return `Remove the Hourglyph hooks for Claude Code on this machine (${url}).

1. Back up ~/.claude/settings.json to ~/.claude/settings.json.hourglyph-bak.
2. Remove only the Hourglyph entries from hooks — commands containing ${markers}. Keep every other hook and setting as is; drop groups and events left empty.
3. Write the file back as valid JSON and re-read it to confirm it parses.
4. Delete ${HOOK_SCRIPT_PATH}.
5. Show me the diff.`;
  }
}
