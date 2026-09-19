<p align="center">
  <a href="https://hourglyph.github.io">
    <img src=".github/assets/hero.svg" width="100%" alt="Hourglyph — an hourglass next to a weekly heatmap of Claude Code usage with a busy weekday peak and quiet hours">
  </a>
</p>

<h1 align="center">Hourglyph — Claude Code peak hours</h1>

<p align="center"><b>Save your Claude Code limits: start work in off-peak hours.</b><br>
Экономьте лимиты Claude Code — запускайте работу в ненагруженные часы.</p>

<p align="center">
  <b><a href="https://hourglyph.github.io">hourglyph.github.io</a></b> · <a href="https://hourglyph.github.io/ru/">Русская версия</a> · <a href="https://hourglyph.github.io/data/">Open data</a>
</p>

A live, community-sourced map of when and where developers use Claude Code — by hour, weekday and country, shown in
your time zone — so you can **start heavy work in off-peak hours and make your limits go further**.
Unofficial project, not affiliated with Anthropic.

- 🗺️ Heatmap, hour-of-day and weekday charts, and a world map of check-ins
- 🕐 18 time-zone pages with the peak converted to local time (EN + RU)
- 💡 [How to save Claude Code limits](https://hourglyph.github.io/save-claude-code-limits/) · [по-русски](https://hourglyph.github.io/ru/save-claude-code-limits/)

## Why: save your limits

**Start work in off-peak hours and your Claude Code limits go further.**

- **Limits have depended on the clock.** In March 2026 Anthropic made 5-hour limits drain faster during the weekday
  peak (5–11 AM Pacific). On May 6, 2026 that was lifted only for Claude Code on Pro and Max
  ([announcement](https://www.anthropic.com/news/higher-limits-spacex)). The map shows where the peak falls in your zone.
- **Fewer wasted re-runs.** Peak hours bring slower replies and `overloaded` errors; an interrupted agent task has to
  be run again, and your limit pays for the retry.
- **Time your window.** The 5-hour window starts with your first message — start in a quiet hour and it resets
  before the rush, not in the middle of it.

> **RU:** Hourglyph помогает понять, когда лучше работать с Claude Code, чтобы лимиты уходили медленнее: карта
> показывает пиковые и спокойные часы в вашем часовом поясе.

## Add your work to the map (opt-in)

Three hooks record, anonymously: a **session start**, each **message you send** (no text), and the **tokens used
per turn** — so long sessions count as the load they really are.

| Hook | When | What is sent |
|---|---|---|
| `SessionStart` | a new session starts | `{"p_event":"session"}` |
| `UserPromptSubmit` | you send a message | `{"p_event":"message"}` — no text |
| `Stop` | Claude finishes a turn | 4 integers: input, output, cache-write, cache-read tokens |

Token counts are computed **locally** by [`hourglyph.sh`](public/hook/hourglyph.sh) (65 lines of `sh` + `awk`) from
the transcript Claude Code passes to the hook; only the totals leave your machine. The server adds the UTC hour,
weekday and the two-letter country code Cloudflare attaches to the request. No prompts, answers, code, paths,
session IDs or IPs are stored. Rate limits per network (IPv6 per /64): 8 sessions and 30 messages/turns a minute; a salted,
daily-rotating hash is kept for a few minutes only to enforce them. Messages and tokens update aggregates only;
session records are deleted after 30 days.

### Option A: let Claude Code do it

Paste this prompt into Claude Code. It downloads the script and shows it to you, backs up your settings, replaces an
older Hourglyph hook, merges the new entries in and shows the diff (it asks before writing files).

````text
Set up the Hourglyph hooks for Claude Code on this machine (https://hourglyph.github.io/setup/).

Goal: anonymously send session starts, the times I send messages, and token counts per turn to the peak-hours map. Message text, answers, code and paths are never sent.

Steps:
1. Download the script and show me its full contents before continuing:
   mkdir -p ~/.claude/hooks && curl -fsSL https://hourglyph.github.io/hook/hourglyph.sh -o ~/.claude/hooks/hourglyph.sh
   (source on GitHub: https://github.com/hourglyph/hourglyph.github.io/blob/main/public/hook/hourglyph.sh). Check that it does nothing but send an event name and four token counts.
2. Read ~/.claude/settings.json (treat a missing file as {}). If it exists, back it up to ~/.claude/settings.json.bak first.
3. Remove any old Hourglyph entries from hooks — commands containing "hourglyph.sh" / "rpc/checkin" — so nothing is duplicated.
4. Merge, don't overwrite: keep every other setting and hook, and append exactly these elements to hooks.SessionStart, hooks.UserPromptSubmit and hooks.Stop (create them if missing):

{
  "SessionStart": [
    {
      "matcher": "startup",
      "hooks": [
        {
          "type": "command",
          "command": "sh \"$HOME/.claude/hooks/hourglyph.sh\" session",
          "async": true
        }
      ]
    }
  ],
  "UserPromptSubmit": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "sh \"$HOME/.claude/hooks/hourglyph.sh\" message",
          "async": true
        }
      ]
    }
  ],
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "sh \"$HOME/.claude/hooks/hourglyph.sh\" stop",
          "async": true
        }
      ]
    }
  ]
}

5. Write the file back as valid JSON and re-read it to confirm it parses.
6. Check that curl and awk are available (command -v curl awk).
7. Show me the diff and tell me how to remove everything: delete those three entries from settings.json and the file ~/.claude/hooks/hourglyph.sh — or in one command: curl -fsSL https://hourglyph.github.io/hook/uninstall.sh | sh

Don't change anything else. Data starts flowing with the next new session.
````

### Option B: by hand

```sh
mkdir -p ~/.claude/hooks && curl -fsSL https://hourglyph.github.io/hook/hourglyph.sh -o ~/.claude/hooks/hourglyph.sh
```

Then merge this into `~/.claude/settings.json` (remove an older entry with `rpc/checkin` if you had one):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "sh \"$HOME/.claude/hooks/hourglyph.sh\" session",
            "async": true
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "sh \"$HOME/.claude/hooks/hourglyph.sh\" message",
            "async": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "sh \"$HOME/.claude/hooks/hourglyph.sh\" stop",
            "async": true
          }
        ]
      }
    ]
  }
}
```

**To stop:** run the [uninstaller](public/hook/uninstall.sh) — it removes only the Hourglyph entries from
`~/.claude/settings.json` (backup: `settings.json.hourglyph-bak`) and deletes the script:

```sh
curl -fsSL https://hourglyph.github.io/hook/uninstall.sh | sh
```

Or delete the three entries mentioning `hourglyph.sh` and the script file by hand.
More: [setup page](https://hourglyph.github.io/setup/) · [privacy](https://hourglyph.github.io/about/).

## Data

Aggregates are CC BY 4.0: [`/data/heatmap.json`](https://hourglyph.github.io/data/heatmap.json),
[`/data/heatmap.csv`](https://hourglyph.github.io/data/heatmap.csv),
[`/data/countries.csv`](https://hourglyph.github.io/data/countries.csv), or live via the `heatmap`, `heatmap_30d`,
`countries`, `countries_30d` and `stats` REST views. Every table has sessions, messages and tokens.

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
