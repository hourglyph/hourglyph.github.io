# Hourglyph — Claude Code peak hours

**https://hourglyph.github.io** · [Русская версия](https://hourglyph.github.io/ru/)

A live, community-sourced heatmap of when developers use Claude Code, by weekday and hour, shown in your time zone.
Unofficial project, not affiliated with Anthropic.

## Add your sessions (opt-in)

Add this to `~/.claude/settings.json` (merge with any existing `hooks`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -m 5 -X POST 'https://ludtufvegukpzbdarhnq.supabase.co/rest/v1/rpc/checkin' -H 'apikey: sb_publishable_yUz1zIFhM4V8qvELLDkKnA_YpjZmPIc' -H 'Content-Type: application/json' -d '{\"p_source\":\"hook\"}' >/dev/null 2>&1 || true",
            "async": true
          }
        ]
      }
    ]
  }
}
```

**What it does:** on each *new* session (not resume/clear/compact) it sends one empty POST in the background.
The server stamps the UTC hour and weekday itself. No prompts, code, file names, user IDs or IPs are stored
(a salted, daily-rotating IP hash is kept only for 10-minute rate limiting). The key is Supabase's public
*publishable* key: it can only call the check-in function, not read raw rows.

**To stop:** delete that `SessionStart` entry. More: [setup page](https://hourglyph.github.io/setup/) · [privacy](https://hourglyph.github.io/about/).

## Data

Aggregates are CC BY 4.0: [`/data/heatmap.json`](https://hourglyph.github.io/data/heatmap.json),
[`/data/heatmap.csv`](https://hourglyph.github.io/data/heatmap.csv), or live via the `heatmap`, `heatmap_30d`
and `stats` REST views.

## Development

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/, fetches a data snapshot from Supabase
```

- `supabase/migrations/` — schema, RLS, `checkin()` RPC with rate limiting, public views.
  Apply with `npm run db:migrate` (needs `SUPABASE_DB_PASSWORD` in `.env`, see `.env.example`).
- `src/lib/` — heatmap math (time-zone shifting, peak detection), time zones, page registry.
- `src/views/` — page content (EN + RU); `src/pages/` — thin routes, OG image, data and `llms.txt` endpoints.
- GitHub Actions rebuilds on push and every 6 hours so the numbers in the static HTML stay fresh.
