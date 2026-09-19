// Public values only. The publishable key is safe to ship: all writes go through the
// rate-limited `checkin` RPC and raw rows are not readable (see supabase/migrations).
export const SITE = 'https://hourglyph.github.io';
export const SITE_NAME = 'Hourglyph';
export const SUPABASE_URL = 'https://ludtufvegukpzbdarhnq.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_yUz1zIFhM4V8qvELLDkKnA_YpjZmPIc';
export const REPO_URL = 'https://github.com/hourglyph/hourglyph.github.io';

/** Below this many check-ins we don't state conclusions about peaks. */
export const MIN_SAMPLE = 150;

/** The hook script, served by the site and kept in the repo at public/hook/hourglyph.sh. */
export const HOOK_SCRIPT_URL = `${SITE}/hook/hourglyph.sh`;
/** Human-readable source on GitHub (the site serves the raw file for downloading). */
export const HOOK_SCRIPT_SOURCE = `${REPO_URL}/blob/main/public/hook/hourglyph.sh`;
export const HOOK_SCRIPT_PATH = '~/.claude/hooks/hourglyph.sh';

/** Uninstaller: removes only Hourglyph entries from settings.json (with a backup) and the script. */
export const UNINSTALL_URL = `${SITE}/hook/uninstall.sh`;
export const UNINSTALL_SOURCE = `${REPO_URL}/blob/main/public/hook/uninstall.sh`;
export const UNINSTALL_CMD = `curl -fsSL ${UNINSTALL_URL} | sh`;
export const HOOK_INSTALL = `mkdir -p ~/.claude/hooks && curl -fsSL ${HOOK_SCRIPT_URL} -o ${HOOK_SCRIPT_PATH}`;

const hookCmd = (event: string) => ({ type: 'command', command: `sh "$HOME/.claude/hooks/hourglyph.sh" ${event}`, async: true });

/** Entries to add under `hooks` in ~/.claude/settings.json. */
export const HOOK_ENTRIES = {
  SessionStart: [{ matcher: 'startup', hooks: [hookCmd('session')] }],
  UserPromptSubmit: [{ hooks: [hookCmd('message')] }],
  Stop: [{ hooks: [hookCmd('stop')] }],
};

export const HOOK_JSON = JSON.stringify({ hooks: HOOK_ENTRIES }, null, 2);

/** Commands containing this belong to Hourglyph (new script, or the old inline rpc/checkin curl). */
export const HOOK_MARKERS = ['hourglyph.sh', 'rpc/checkin'];
