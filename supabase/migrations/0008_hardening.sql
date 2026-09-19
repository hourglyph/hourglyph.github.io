-- Security hardening after the public-key review.
--   1. Rate limits key IPv6 clients by their /64 subnet (a single host usually owns a whole /64,
--      so per-address limits were trivially bypassed by rotating addresses).
--   2. Hook sessions: up to 8 per minute per network (people run several projects at once);
--      the site's manual button keeps "once per 10 minutes". Messages/tokens stay at 30/min.
--   3. Bounded storage: messages and tokens only update the aggregates (no raw row per event);
--      raw session rows are kept 30 days; throttle tables are swept every 10 minutes by pg_cron.
--      Spam can skew counts but can no longer grow the database.
--   4. Views are read-only for API roles (drop write grants Supabase adds by default).

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
  v_key     text;
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
  v_limit   integer;
begin
  if p_event is null or p_event not in ('session', 'message', 'tokens') then
    raise exception 'invalid event' using errcode = '22023';
  end if;
  if p_source is null or p_source not in ('hook', 'manual') then
    raise exception 'invalid source' using errcode = '22023';
  end if;

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
    -- Rate-limit key: IPv4 address, or the /64 subnet for IPv6.
    begin
      v_key := case when family(v_ip::inet) = 6
                    then host(network(set_masklen(v_ip::inet, 64))) || '/64'
                    else host(v_ip::inet) end;
    exception when others then
      v_key := v_ip;
    end;

    select value into v_salt from private.settings where key = 'ip_salt';
    v_hash := encode(sha256(convert_to(v_salt || '|' || (v_now at time zone 'utc')::date || '|' || v_key, 'UTF8')), 'hex');

    if p_event = 'session' and p_source = 'manual' then
      -- The site's button: once per network per 10 minutes.
      insert into private.checkin_throttle as t (ip_hash, last_at)
      values (v_hash, v_now)
      on conflict (ip_hash) do update
        set last_at = excluded.last_at
        where t.last_at < v_now - interval '10 minutes';
      if not found then
        return false;
      end if;
    else
      v_limit := case when p_event = 'session' then 8 else 30 end;
      insert into private.event_throttle as t (ip_hash, event, window_start, n)
      values (v_hash, p_event, v_minute, 1)
      on conflict (ip_hash, event) do update
        set n = case when t.window_start = excluded.window_start then t.n + 1 else 1 end,
            window_start = excluded.window_start
      returning n into v_n;
      if v_n > v_limit then
        return false;
      end if;
    end if;
  end if;

  -- Raw rows only for sessions (kept 30 days); everything else lives in the aggregates.
  if p_event = 'session' then
    insert into public.checkins (utc_hour, utc_weekday, source, country, event)
    values (v_h, v_wd, p_source, v_country, 'session');
  end if;

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

-- ── Housekeeping every 10 minutes ────────────────────────────────────────
create or replace function private.housekeeping()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from private.checkin_throttle where last_at < now() - interval '10 minutes';
  delete from private.event_throttle   where window_start < now() - interval '2 minutes';
  delete from public.checkins          where created_at < now() - interval '30 days';
$$;
revoke all on function private.housekeeping() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'hourglyph-housekeeping';
select cron.schedule('hourglyph-housekeeping', '*/10 * * * *', 'select private.housekeeping()');

-- Raw message/token rows are no longer needed (their totals are in the aggregates).
delete from public.checkins where event in ('message', 'tokens');

-- ── Views: read-only for API roles ───────────────────────────────────────
revoke all on public.heatmap, public.heatmap_30d, public.stats, public.countries, public.countries_30d,
              public.status_incident_hours, public.claude_incidents
  from anon, authenticated;
grant select on public.heatmap, public.heatmap_30d, public.stats, public.countries, public.countries_30d,
                public.status_incident_hours, public.claude_incidents
  to anon, authenticated;

-- Future objects in public: no implicit write access for API roles.
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon, authenticated;
