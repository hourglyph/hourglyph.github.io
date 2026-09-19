<p align="center">
  <a href="https://hourglyph.github.io">
    <img src=".github/assets/hero.svg" width="100%" alt="Hourglyph — an hourglass next to a weekly heatmap of Claude Code usage with a busy weekday peak and quiet hours">
  </a>
</p>

<h1 align="center">Hourglyph — Claude Code peak hours</h1>

<p align="center">
  <b><a href="https://hourglyph.github.io">hourglyph.github.io</a></b> · <a href="https://hourglyph.github.io/ru/">Русская версия</a> · <a href="https://hourglyph.github.io/data/">Open data</a>
</p>

A live, community-sourced heatmap of when developers use Claude Code, by weekday and hour, shown in your time zone.
Unofficial project, not affiliated with Anthropic.

## Why

**To know when to work so your limits go further.**

- **Limits have depended on the clock.** In March 2026 Anthropic made 5-hour limits drain faster during the weekday
  peak (5–11 AM Pacific). On May 6, 2026 that was lifted only for Claude Code on Pro and Max
  ([announcement](https://www.anthropic.com/news/higher-limits-spacex)). The map shows where the peak falls in your zone.
- **Fewer wasted re-runs.** Peak hours bring slower replies and `overloaded` errors; an interrupted agent task has to
  be run again, and your limit pays for the retry.
- **Time your window.** The 5-hour window starts with your first message — start in a quiet hour and it resets
  before the rush, not in the middle of it.

> **RU:** Hourglyph помогает понять, когда лучше работать с Claude Code, чтобы лимиты уходили медленнее: карта
> показывает пиковые и спокойные часы в вашем часовом поясе.

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
- `scripts/gen-hero.py` regenerates `.github/assets/hero.svg` (the heatmap in it is a stylised pattern, not live data).
