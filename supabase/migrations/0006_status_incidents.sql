-- Anthropic status incidents (status.claude.com, Atlassian Statuspage public API).
-- The database pulls the latest incidents itself every hour (pg_cron + http), so no external
-- job or secret is involved. Heatmap views gain an `incidents` column: how many incident-hours
-- fell into each UTC weekday/hour.

create extension if not exists http with schema extensions;
create extension if not exists pg_cron;

create table if not exists public.status_incidents (
  id          text primary key,
  name        text not null,
  impact      text not null,                 -- none | minor | major | critical | maintenance
  status      text not null,                 -- investigating | identified | monitoring | resolved | postmortem
  started_at  timestamptz not null,
  resolved_at timestamptz,
  components  text[] not null default '{}',
  shortlink   text,
  updated_at  timestamptz not null
);
create index if not exists status_incidents_started_idx on public.status_incidents (started_at);

alter table public.status_incidents enable row level security;
revoke all on public.status_incidents from anon, authenticated;
grant select on public.status_incidents to anon, authenticated;
drop policy if exists "incidents are public" on public.status_incidents;
create policy "incidents are public" on public.status_incidents
  for select to anon, authenticated using (true);

-- ── Hourly sync ──────────────────────────────────────────────────────────
create or replace function private.sync_status()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_res  extensions.http_response;
  v_n    integer;
begin
  select * into v_res from extensions.http_get('https://status.claude.com/api/v2/incidents.json');
  if v_res.status <> 200 then
    raise warning 'status.claude.com returned %', v_res.status;
    return 0;
  end if;

  insert into public.status_incidents as s
    (id, name, impact, status, started_at, resolved_at, components, shortlink, updated_at)
  select
    i ->> 'id',
    i ->> 'name',
    i ->> 'impact',
    i ->> 'status',
    coalesce(i ->> 'started_at', i ->> 'created_at')::timestamptz,
    (i ->> 'resolved_at')::timestamptz,
    coalesce(array(select c ->> 'name' from json_array_elements(i -> 'components') c), '{}'),
    i ->> 'shortlink',
    (i ->> 'updated_at')::timestamptz
  from json_array_elements(v_res.content::json -> 'incidents') i
  on conflict (id) do update set
    name = excluded.name, impact = excluded.impact, status = excluded.status,
    started_at = excluded.started_at, resolved_at = excluded.resolved_at,
    components = excluded.components, shortlink = excluded.shortlink, updated_at = excluded.updated_at
  where s.updated_at is distinct from excluded.updated_at;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;
revoke all on function private.sync_status() from public, anon, authenticated;

-- Every hour at :07.
select cron.unschedule(jobid) from cron.job where jobname = 'hourglyph-status-sync';
select cron.schedule('hourglyph-status-sync', '7 * * * *', 'select private.sync_status()');

-- ── Incident hours ───────────────────────────────────────────────────────
-- Incidents that touch Claude Code, the API or claude.ai, or that Anthropic rated as having
-- impact. Each is expanded into the UTC hours it was open (capped at 48 h so a forgotten,
-- never-resolved incident can't flood the map).
create or replace view public.status_incident_hours with (security_invoker = true) as
select i.id, h.hour
from public.status_incidents i
cross join lateral generate_series(
  date_trunc('hour', i.started_at),
  date_trunc('hour', least(coalesce(i.resolved_at, now()), i.started_at + interval '48 hours')),
  interval '1 hour'
) as h(hour)
where i.impact in ('minor', 'major', 'critical')
   or i.components && array['Claude Code', 'Claude API (api.anthropic.com)', 'claude.ai'];

grant select on public.status_incident_hours to anon, authenticated;

-- ── Heatmap views gain `incidents` (new column appended) ─────────────────
create or replace view public.heatmap with (security_invoker = true) as
with h as (
  select utc_weekday, utc_hour,
    sum(total)::int    as total,
    sum(messages)::int as messages,
    sum(tokens_in + tokens_out + tokens_cache_write + tokens_cache_read)::bigint as tokens
  from public.checkin_hours
  group by utc_weekday, utc_hour
), i as (
  select extract(dow from hour at time zone 'utc')::smallint as wd,
         extract(hour from hour at time zone 'utc')::smallint as hh,
         count(*)::int as incidents
  from public.status_incident_hours
  group by 1, 2
)
select
  coalesce(h.utc_weekday, i.wd) as utc_weekday,
  coalesce(h.utc_hour, i.hh)    as utc_hour,
  coalesce(h.total, 0)          as total,
  coalesce(h.messages, 0)       as messages,
  coalesce(h.tokens, 0)::bigint as tokens,
  coalesce(i.incidents, 0)      as incidents
from h full join i on i.wd = h.utc_weekday and i.hh = h.utc_hour;

create or replace view public.heatmap_30d with (security_invoker = true) as
with h as (
  select utc_weekday, utc_hour,
    sum(total)::int    as total,
    sum(messages)::int as messages,
    sum(tokens_in + tokens_out + tokens_cache_write + tokens_cache_read)::bigint as tokens
  from public.checkin_hours
  where hour_start >= date_trunc('hour', now()) - interval '30 days'
  group by utc_weekday, utc_hour
), i as (
  select extract(dow from hour at time zone 'utc')::smallint as wd,
         extract(hour from hour at time zone 'utc')::smallint as hh,
         count(*)::int as incidents
  from public.status_incident_hours
  where hour >= date_trunc('hour', now()) - interval '30 days'
  group by 1, 2
)
select
  coalesce(h.utc_weekday, i.wd) as utc_weekday,
  coalesce(h.utc_hour, i.hh)    as utc_hour,
  coalesce(h.total, 0)          as total,
  coalesce(h.messages, 0)       as messages,
  coalesce(h.tokens, 0)::bigint as tokens,
  coalesce(i.incidents, 0)      as incidents
from h full join i on i.wd = h.utc_weekday and i.hh = h.utc_hour;

revoke all on public.heatmap, public.heatmap_30d from anon, authenticated;
grant select on public.heatmap, public.heatmap_30d to anon, authenticated;

-- Backfill right away (the 50 most recent incidents, ~2 months).
select private.sync_status();
