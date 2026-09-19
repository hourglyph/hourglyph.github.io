-- Country-level geography for the world map.
-- The country comes from Cloudflare's `cf-ipcountry` request header, computed by the platform
-- from the caller's IP. We store only the ISO 3166-1 alpha-2 code — never the IP — and the
-- public only sees per-day, per-country counts. Idempotent: safe to re-run.

alter table public.checkins add column if not exists country char(2);

create table if not exists public.checkin_country_days (
  day     date    not null,             -- UTC date
  country char(2) not null check (country ~ '^[A-Z]{2}$'),
  total   integer not null default 0 check (total >= 0),
  primary key (day, country)
);

alter table public.checkin_country_days enable row level security;
revoke all on public.checkin_country_days from anon, authenticated;
grant select on public.checkin_country_days to anon, authenticated;
drop policy if exists "aggregates are public" on public.checkin_country_days;
create policy "aggregates are public" on public.checkin_country_days
  for select to anon, authenticated using (true);

-- ── Write path: same as 0002 plus the country bucket ────────────────────
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
  v_country text;
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

  -- Cloudflare uses XX for unknown and T1 for Tor; treat both as "no country".
  v_country := upper(trim(coalesce(v_headers ->> 'cf-ipcountry', '')));
  if v_country !~ '^[A-Z]{2}$' or v_country in ('XX', 'T1') then
    v_country := null;
  end if;

  if v_ip <> '' then
    select value into v_salt from private.settings where key = 'ip_salt';
    v_hash := encode(sha256(convert_to(v_salt || '|' || (v_now at time zone 'utc')::date || '|' || v_ip, 'UTF8')), 'hex');

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

  insert into public.checkins (utc_hour, utc_weekday, source, country) values (v_h, v_wd, p_source, v_country);

  insert into public.checkin_hours as c (hour_start, utc_weekday, utc_hour, total)
  values (v_hour, v_wd, v_h, 1)
  on conflict (hour_start) do update set total = c.total + 1;

  if v_country is not null then
    insert into public.checkin_country_days as c (day, country, total)
    values ((v_now at time zone 'utc')::date, v_country, 1)
    on conflict (day, country) do update set total = c.total + 1;
  end if;

  return true;
end;
$$;

revoke all on function private.checkin(text) from public;
grant execute on function private.checkin(text) to anon, authenticated;

-- ── Read path ────────────────────────────────────────────────────────────
create or replace view public.countries with (security_invoker = true) as
select country, sum(total)::int as total
from public.checkin_country_days
group by country;

create or replace view public.countries_30d with (security_invoker = true) as
select country, sum(total)::int as total
from public.checkin_country_days
where day >= (now() at time zone 'utc')::date - 30
group by country;

revoke all on public.countries, public.countries_30d from anon, authenticated;
grant select on public.countries, public.countries_30d to anon, authenticated;
