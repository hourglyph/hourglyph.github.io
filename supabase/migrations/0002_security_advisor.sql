-- Address Supabase Security Advisor findings without widening access:
--   * security_definer_view            → views become security_invoker over a public, aggregate-only table
--   * anon/authenticated_security_definer_function_executable
--                                       → the definer function moves to the unexposed `private` schema;
--                                         public.checkin is a thin SECURITY INVOKER wrapper
--   * rls_enabled_no_policy             → explicit deny-all policy on raw rows
-- Idempotent: safe to re-run.

-- ── Hourly aggregate table: the only thing the public can read ───────────
-- One row per UTC hour. Contains nothing but counts, so exposing it is equivalent to
-- exposing the heatmap itself.
create table if not exists public.checkin_hours (
  hour_start  timestamptz primary key,          -- date_trunc('hour', created_at) in UTC
  utc_weekday smallint not null check (utc_weekday between 0 and 6),
  utc_hour    smallint not null check (utc_hour between 0 and 23),
  total       integer  not null default 0 check (total >= 0)
);
create index if not exists checkin_hours_wd_h_idx on public.checkin_hours (utc_weekday, utc_hour);

alter table public.checkin_hours enable row level security;
revoke all on public.checkin_hours from anon, authenticated;
grant select on public.checkin_hours to anon, authenticated;
drop policy if exists "aggregates are public" on public.checkin_hours;
create policy "aggregates are public" on public.checkin_hours
  for select to anon, authenticated using (true);

-- Backfill from raw rows (no-op on an empty table, correct on a populated one).
insert into public.checkin_hours (hour_start, utc_weekday, utc_hour, total)
select date_trunc('hour', created_at at time zone 'utc') at time zone 'utc', utc_weekday, utc_hour, count(*)
from public.checkins
group by 1, 2, 3
on conflict (hour_start) do update set total = excluded.total;

-- ── Raw rows: make "nobody through the API" explicit ────────────────────
drop policy if exists "no direct api access" on public.checkins;
create policy "no direct api access" on public.checkins
  as restrictive for all to anon, authenticated using (false) with check (false);

-- ── Write path ───────────────────────────────────────────────────────────
-- The privileged implementation lives in `private`, which PostgREST does not expose.
-- API roles may call it only via public.checkin; they get USAGE on the schema but no
-- rights on its tables.
grant usage on schema private to anon, authenticated;

create or replace function private.checkin(p_source text)
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
  v_now     timestamptz := now();
  v_hour    timestamptz := date_trunc('hour', v_now at time zone 'utc') at time zone 'utc';
  v_wd      smallint    := extract(dow  from v_now at time zone 'utc')::smallint;
  v_h       smallint    := extract(hour from v_now at time zone 'utc')::smallint;
begin
  if p_source is null or p_source not in ('hook', 'manual') then
    raise exception 'invalid source' using errcode = '22023';
  end if;

  v_headers := nullif(current_setting('request.headers', true), '')::json;
  v_ip := trim(split_part(coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip', ''), ',', 1));

  if v_ip <> '' then
    select value into v_salt from private.settings where key = 'ip_salt';
    v_hash := encode(sha256(convert_to(v_salt || '|' || (v_now at time zone 'utc')::date || '|' || v_ip, 'UTF8')), 'hex');

    -- At most one check-in per IP per 10 minutes; extra calls are silently ignored.
    insert into private.checkin_throttle as t (ip_hash, last_at)
    values (v_hash, v_now)
    on conflict (ip_hash) do update
      set last_at = excluded.last_at
      where t.last_at < v_now - interval '10 minutes';
    if not found then
      return false;
    end if;

    if random() < 0.02 then
      delete from private.checkin_throttle where last_at < v_now - interval '1 day';
    end if;
  end if;

  insert into public.checkins (utc_hour, utc_weekday, source) values (v_h, v_wd, p_source);

  insert into public.checkin_hours as c (hour_start, utc_weekday, utc_hour, total)
  values (v_hour, v_wd, v_h, 1)
  on conflict (hour_start) do update set total = c.total + 1;

  return true;
end;
$$;

revoke all on function private.checkin(text) from public;
grant execute on function private.checkin(text) to anon, authenticated;

-- Public entry point (same URL as before: /rest/v1/rpc/checkin). Runs as the caller.
drop function if exists public.checkin(text);
create function public.checkin(p_source text default 'hook')
returns boolean
language sql
security invoker
set search_path = ''
as $$ select private.checkin(p_source) $$;

revoke all on function public.checkin(text) from public;
grant execute on function public.checkin(text) to anon, authenticated;

-- ── Read path: invoker views over the aggregate table ───────────────────
drop view if exists public.heatmap, public.heatmap_30d, public.stats;

create view public.heatmap with (security_invoker = true) as
select utc_weekday, utc_hour, sum(total)::int as total
from public.checkin_hours
group by utc_weekday, utc_hour;

create view public.heatmap_30d with (security_invoker = true) as
select utc_weekday, utc_hour, sum(total)::int as total
from public.checkin_hours
where hour_start >= date_trunc('hour', now()) - interval '30 days'
group by utc_weekday, utc_hour;

-- last_hour = the current UTC hour so far (hourly buckets can't do a rolling 60 minutes).
create view public.stats with (security_invoker = true) as
select
  coalesce(sum(total), 0)::int                                                                  as total,
  coalesce(sum(total) filter (where hour_start >= date_trunc('hour', now())), 0)::int           as last_hour,
  coalesce(sum(total) filter (where hour_start >= date_trunc('hour', now()) - interval '23 hours'), 0)::int as last_24h,
  coalesce(sum(total) filter (where hour_start >= date_trunc('hour', now()) - interval '30 days'), 0)::int  as last_30d,
  min(hour_start)                                                                               as first_at,
  max(hour_start)                                                                               as last_at,
  now()                                                                                         as generated_at
from public.checkin_hours;

revoke all on public.heatmap, public.heatmap_30d, public.stats from anon, authenticated;
grant select on public.heatmap, public.heatmap_30d, public.stats to anon, authenticated;
