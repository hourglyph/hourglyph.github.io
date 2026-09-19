// Public values only. The publishable key is safe to ship: all writes go through the
// rate-limited `checkin` RPC and raw rows are not readable (see supabase/migrations).
export const SITE = 'https://hourglyph.github.io';
export const SITE_NAME = 'Hourglyph';
export const SUPABASE_URL = 'https://ludtufvegukpzbdarhnq.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_yUz1zIFhM4V8qvELLDkKnA_YpjZmPIc';
export const REPO_URL = 'https://github.com/hourglyph/hourglyph.github.io';

/** Below this many check-ins we don't state conclusions about peaks. */
export const MIN_SAMPLE = 150;

export const HOOK_COMMAND =
  `curl -s -m 5 -X POST '${SUPABASE_URL}/rest/v1/rpc/checkin' ` +
  `-H 'apikey: ${SUPABASE_KEY}' -H 'Content-Type: application/json' ` +
  `-d '{"p_source":"hook"}' >/dev/null 2>&1 || true`;

export const HOOK_JSON = JSON.stringify(
  {
    hooks: {
      SessionStart: [
        { matcher: 'startup', hooks: [{ type: 'command', command: HOOK_COMMAND, async: true }] },
      ],
    },
  },
  null,
  2,
);
