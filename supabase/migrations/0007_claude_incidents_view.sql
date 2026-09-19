-- Incidents relevant to Claude Code users (same rule as status_incident_hours), for the site's list.
create or replace view public.claude_incidents with (security_invoker = true) as
select id, name, impact, status, started_at, resolved_at, components, shortlink
from public.status_incidents
where impact in ('minor', 'major', 'critical')
   or components && array['Claude Code', 'Claude API (api.anthropic.com)', 'claude.ai'];

grant select on public.claude_incidents to anon, authenticated;
