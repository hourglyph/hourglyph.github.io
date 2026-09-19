-- Drop indexes nothing reads (Supabase Performance Advisor: unused_index).
--   * checkin_hours has at most one row per hour (~8.8k/year); the heatmap views aggregate the
--     whole table, where a sequential scan is the right plan. The 30-day view uses the primary key.
--   * checkins is write-only since 0002 (all reads go through checkin_hours), so its secondary
--     indexes only slow down inserts.
drop index if exists public.checkin_hours_wd_h_idx;
drop index if exists public.checkins_hour_weekday_idx;
drop index if exists public.checkins_created_at_idx;
