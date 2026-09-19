-- Per-message and per-turn token tracking.
--   session — a new Claude Code session (SessionStart hook, or the site's manual button)
--   message — the user sent a prompt (UserPromptSubmit hook); no content is sent
--   tokens  — token usage of one finished turn (Stop hook), four integers
-- The old public.checkin(p_source) keeps working and records a session.
-- Idempotent: safe to re-run.

-- ── Raw rows ─────────────────────────────────────────────────────────────
alter table public.checkins add column if not exists event text not null default 'session';
alter table public.checkins add column if not exists tokens_in          integer not null default 0;
alter table public.checkins add column if not exists tokens_out         integer not null default 0;
alter table public.checkins add column if not exists tokens_cache_write integer not null default 0;
alter table public.checkins add column if not exists tokens_cache_read  integer not null default 0;
alter table public.checkins drop constraint if exists checkins_event_check;
alter table public.checkins add constraint checkins_event_check check (event in ('session', 'message', 'tokens'));

-- ── Aggregates (public, counts only) ─────────────────────────────────────
alter table public.checkin_hours add column if not exists messages           integer not null default 0;
alter table public.checkin_hours add column if not exists turns              integer not null default 0;
alter table public.checkin_hours add column if not exists tokens_in          bigint  not null default 0;
alter table public.checkin_hours add column if not exists tokens_out         bigint  not null default 0;
alter table public.checkin_hours add column if not exists tokens_cache_write bigint  not null default 0;
alter table public.checkin_hours add column if not exists tokens_cache_read  bigint  not null default 0;

alter table public.checkin_country_days add column if not exists messages integer not null default 0;
alter table public.checkin_country_days add column if not exists tokens   bigint  not null default 0;

-- ── Rate limiting for high-frequency events ──────────────────────────────
-- Per salted IP hash and event: at most 30 per minute (a busy office behind one IP
-- still fits; a spam loop doesn't).
create table if not exists private.event_throttle (
  ip_hash      text        not null,
  event        text        not null,
  window_start timestamptz not null,
  n            integer     not null,
  primary key (ip_hash, event)
);

-- ── Write path ───────────────────────────────────────────────────────────
create or replace function private.track(
  p_event text, p_source text,
  p_input bigint, p_output bigint, p_cache_write bigint, p_cache_read bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers json;
  v_ip      text;
  v_hash    text;
  v_salt    text;
  v_country text;
  v_now     timestamptz := now();
  v_minute  timestamptz := date_trunc('minute', now());
  v_hour    timestamptz := date_trunc('hour', v_now at time zone 'utc') at time zone 'utc';
  v_wd      smallint    := extract(dow  from v_now at time zone 'utc')::smallint;
  v_h       smallint    := extract(hour from v_now at time zone 'utc')::smallint;
  v_in      integer;
  v_out     integer;
  v_cw      integer;
  v_cr      integer;
  v_n       integer;
begin
  if p_event is null or p_event not in ('session', 'message', 'tokens') then
    raise exception 'invalid event' using errcode = '22023';
  end if;
  if p_source is null or p_source not in ('hook', 'manual') then
    raise exception 'invalid source' using errcode = '22023';
  end if;

  -- Token counts only for "tokens"; clamp to plausible per-turn ceilings so one
  -- forged request can't dominate the map.
  if p_event = 'tokens' then
    if least(p_input, p_output, p_cache_write, p_cache_read) < 0 then
      raise exception 'invalid tokens' using errcode = '22023';
    end if;
    v_in  := least(p_input,       1000000);
    v_out := least(p_output,       200000);
    v_cw  := least(p_cache_write, 1000000);
    v_cr  := least(p_cache_read, 20000000);
    if v_in + v_out + v_cw + v_cr = 0 then
      return false;
    end if;
  else
    v_in := 0; v_out := 0; v_cw := 0; v_cr := 0;
  end if;

  v_headers := nullif(current_setting('request.headers', true), '')::json;
  v_ip := trim(split_part(coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip', ''), ',', 1));

  v_country := upper(trim(coalesce(v_headers ->> 'cf-ipcountry', '')));
  if v_country !~ '^[A-Z]{2}$' or v_country in ('XX', 'T1') then
    v_country := null;
  end if;

  if v_ip <> '' then
    select value into v_salt from private.settings where key = 'ip_salt';
    v_hash := encode(sha256(convert_to(v_salt || '|' || (v_now at time zone 'utc')::date || '|' || v_ip, 'UTF8')), 'hex');

    if p_event = 'session' then
      -- Sessions: at most one per IP per 10 minutes (unchanged behaviour).
      insert into private.checkin_throttle as t (ip_hash, last_at)
      values (v_hash, v_now)
      on conflict (ip_hash) do update
        set last_at = excluded.last_at
        where t.last_at < v_now - interval '10 minutes';
      if not found then
        return false;
      end if;
    else
      insert into private.event_throttle as t (ip_hash, event, window_start, n)
      values (v_hash, p_event, v_minute, 1)
      on conflict (ip_hash, event) do update
        set n = case when t.window_start = excluded.window_start then t.n + 1 else 1 end,
            window_start = excluded.window_start
      returning n into v_n;
      if v_n > 30 then
        return false;
      end if;
    end if;

    if random() < 0.01 then
      delete from private.checkin_throttle where last_at < v_now - interval '1 day';
      delete from private.event_throttle where window_start < v_now - interval '1 hour';
    end if;
  end if;

  insert into public.checkins (utc_hour, utc_weekday, source, country, event, tokens_in, tokens_out, tokens_cache_write, tokens_cache_read)
  values (v_h, v_wd, p_source, v_country, p_event, v_in, v_out, v_cw, v_cr);

  insert into public.checkin_hours as c
    (hour_start, utc_weekday, utc_hour, total, messages, turns, tokens_in, tokens_out, tokens_cache_write, tokens_cache_read)
  values (
    v_hour, v_wd, v_h,
    (p_event = 'session')::int, (p_event = 'message')::int, (p_event = 'tokens')::int,
    v_in, v_out, v_cw, v_cr
  )
  on conflict (hour_start) do update set
    total              = c.total + excluded.total,
    messages           = c.messages + excluded.messages,
    turns              = c.turns + excluded.turns,
    tokens_in          = c.tokens_in + excluded.tokens_in,
    tokens_out         = c.tokens_out + excluded.tokens_out,
    tokens_cache_write = c.tokens_cache_write + excluded.tokens_cache_write,
    tokens_cache_read  = c.tokens_cache_read + excluded.tokens_cache_read;

  if v_country is not null then
    insert into public.checkin_country_days as c (day, country, total, messages, tokens)
    values (
      (v_now at time zone 'utc')::date, v_country,
      (p_event = 'session')::int, (p_event = 'message')::int, v_in + v_out + v_cw + v_cr
    )
    on conflict (day, country) do update set
      total    = c.total + excluded.total,
      messages = c.messages + excluded.messages,
      tokens   = c.tokens + excluded.tokens;
  end if;

  return true;
end;
$$;

revoke all on function private.track(text, text, bigint, bigint, bigint, bigint) from public;
grant execute on function private.track(text, text, bigint, bigint, bigint, bigint) to anon, authenticated;

-- The old entry point now delegates, so existing hooks and the site button keep working.
create or replace function private.checkin(p_source text)
returns boolean
language sql
security definer
set search_path = ''
as $$ select private.track('session', p_source, 0, 0, 0, 0) $$;

-- New public entry point: POST /rest/v1/rpc/track
drop function if exists public.track(text, bigint, bigint, bigint, bigint);
create function public.track(
  p_event text,
  p_input bigint default 0, p_output bigint default 0,
  p_cache_write bigint default 0, p_cache_read bigint default 0
)
returns boolean
language sql
security invoker
set search_path = ''
as $$ select private.track(p_event, 'hook', p_input, p_output, p_cache_write, p_cache_read) $$;

revoke all on function public.track(text, bigint, bigint, bigint, bigint) from public;
grant execute on function public.track(text, bigint, bigint, bigint, bigint) to anon, authenticated;

-- ── Read path (new columns appended, existing ones unchanged) ────────────
create or replace view public.heatmap with (security_invoker = true) as
select utc_weekday, utc_hour,
  sum(total)::int    as total,
  sum(messages)::int as messages,
  sum(tokens_in + tokens_out + tokens_cache_write + tokens_cache_read)::bigint as tokens
from public.checkin_hours
group by utc_weekday, utc_hour;

create or replace view public.heatmap_30d with (security_invoker = true) as
select utc_weekday, utc_hour,
  sum(total)::int    as total,
  sum(messages)::int as messages,
  sum(tokens_in + tokens_out + tokens_cache_write + tokens_cache_read)::bigint as tokens
from public.checkin_hours
where hour_start >= date_trunc('hour', now()) - interval '30 days'
group by utc_weekday, utc_hour;

create or replace view public.stats with (security_invoker = true) as
select
  coalesce(sum(total), 0)::int                                                                  as total,
  coalesce(sum(total) filter (where hour_start >= date_trunc('hour', now())), 0)::int           as last_hour,
  coalesce(sum(total) filter (where hour_start >= date_trunc('hour', now()) - interval '23 hours'), 0)::int as last_24h,
  coalesce(sum(total) filter (where hour_start >= date_trunc('hour', now()) - interval '30 days'), 0)::int  as last_30d,
  min(hour_start)                                                                               as first_at,
  max(hour_start)                                                                               as last_at,
  now()                                                                                         as generated_at,
  coalesce(sum(messages), 0)::int                                                               as messages_total,
  coalesce(sum(messages) filter (where hour_start >= date_trunc('hour', now())), 0)::int        as messages_hour,
  coalesce(sum(messages) filter (where hour_start >= date_trunc('hour', now()) - interval '23 hours'), 0)::int as messages_24h,
  coalesce(sum(tokens_in + tokens_out + tokens_cache_write + tokens_cache_read), 0)::bigint     as tokens_total,
  coalesce(sum(tokens_in + tokens_out + tokens_cache_write + tokens_cache_read)
    filter (where hour_start >= date_trunc('hour', now()) - interval '23 hours'), 0)::bigint    as tokens_24h,
  coalesce(sum(turns), 0)::int                                                                  as turns_total
from public.checkin_hours;

create or replace view public.countries with (security_invoker = true) as
select country, sum(total)::int as total, sum(messages)::int as messages, sum(tokens)::bigint as tokens
from public.checkin_country_days
group by country;

create or replace view public.countries_30d with (security_invoker = true) as
select country, sum(total)::int as total, sum(messages)::int as messages, sum(tokens)::bigint as tokens
from public.checkin_country_days
where day >= (now() at time zone 'utc')::date - 30
group by country;

revoke all on public.heatmap, public.heatmap_30d, public.stats, public.countries, public.countries_30d from anon, authenticated;
grant select on public.heatmap, public.heatmap_30d, public.stats, public.countries, public.countries_30d to anon, authenticated;
