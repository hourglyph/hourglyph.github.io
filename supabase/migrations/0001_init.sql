-- Hourglyph: anonymous Claude Code session check-ins → public 7×24 heatmap.
-- Idempotent: safe to re-run.

-- ── Raw events ────────────────────────────────────────────────────────────
create table if not exists public.checkins (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  utc_hour    smallint    not null check (utc_hour between 0 and 23),
  utc_weekday smallint    not null check (utc_weekday between 0 and 6), -- 0 = Sunday
  source      text        not null default 'hook' check (source in ('hook', 'manual'))
);

create index if not exists checkins_hour_weekday_idx on public.checkins (utc_weekday, utc_hour);
create index if not exists checkins_created_at_idx   on public.checkins (created_at);

alter table public.checkins enable row level security;
-- No policies: API roles cannot touch the table directly. Writes go through checkin(), reads through views.
revoke all on public.checkins from anon, authenticated;

-- ── Private schema (not exposed through the REST API) ────────────────────
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Random salt so stored IP hashes can't be reversed by brute-forcing the IPv4 space.
create table if not exists private.settings (
  key   text primary key,
  value text not null
);
insert into private.settings (key, value)
values ('ip_salt', gen_random_uuid()::text)
on conflict (key) do nothing;

-- One row per (salted, daily-rotated) IP hash; used only for rate limiting.
create table if not exists private.checkin_throttle (
  ip_hash text        primary key,
  last_at timestamptz not null
);

-- ── Write path ────────────────────────────────────────────────────────────
drop function if exists public.checkin(text);
create function public.checkin(p_source text default 'hook')
returns boolean
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_headers json;
  v_ip      text;
  v_hash    text;
  v_salt    text;
  v_now     timestamptz := now();
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

    -- Opportunistic cleanup: hashes rotate daily, so older rows are useless.
    if random() < 0.02 then
      delete from private.checkin_throttle where last_at < v_now - interval '1 day';
    end if;
  end if;

  insert into public.checkins (utc_hour, utc_weekday, source)
  values (
    extract(hour from v_now at time zone 'utc')::smallint,
    extract(dow  from v_now at time zone 'utc')::smallint,
    p_source
  );
  return true;
end;
$$;

revoke all on function public.checkin(text) from public;
grant execute on function public.checkin(text) to anon, authenticated;

-- ── Read path (views run as owner, so they see the RLS-protected table) ──
create or replace view public.heatmap as
select utc_weekday, utc_hour, count(*)::int as total
from public.checkins
group by utc_weekday, utc_hour;

create or replace view public.heatmap_30d as
select utc_weekday, utc_hour, count(*)::int as total
from public.checkins
where created_at >= now() - interval '30 days'
group by utc_weekday, utc_hour;

create or replace view public.stats as
select
  count(*)::int                                                          as total,
  (count(*) filter (where created_at >= now() - interval '1 hour'))::int  as last_hour,
  (count(*) filter (where created_at >= now() - interval '24 hours'))::int as last_24h,
  (count(*) filter (where created_at >= now() - interval '30 days'))::int as last_30d,
  min(created_at)                                                        as first_at,
  max(created_at)                                                        as last_at,
  now()                                                                  as generated_at
from public.checkins;

revoke all on public.heatmap, public.heatmap_30d, public.stats from anon, authenticated;
grant select on public.heatmap, public.heatmap_30d, public.stats to anon, authenticated;
