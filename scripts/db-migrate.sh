#!/usr/bin/env bash
# Apply new supabase/migrations/*.sql to the project database, in order, once each.
# Applied files are recorded in private.schema_migrations.
# Needs SUPABASE_DB_URL, or SUPABASE_DB_PASSWORD (+ optional SUPABASE_DB_HOST) in .env.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; [ -f .env ] && . ./.env; set +a

REF=ludtufvegukpzbdarhnq
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  : "${SUPABASE_DB_PASSWORD:?set SUPABASE_DB_PASSWORD or SUPABASE_DB_URL in .env}"
  HOST=${SUPABASE_DB_HOST:-aws-1-eu-west-1.pooler.supabase.com}
  SUPABASE_DB_URL="postgresql://postgres.${REF}:${SUPABASE_DB_PASSWORD}@${HOST}:5432/postgres?sslmode=require"
fi

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -c "
  create schema if not exists private;
  create table if not exists private.schema_migrations (name text primary key, applied_at timestamptz not null default now());"

for f in supabase/migrations/*.sql; do
  name=$(basename "$f")
  applied=$(psql "$SUPABASE_DB_URL" -tA -c "select 1 from private.schema_migrations where name = '$name'")
  if [ "$applied" = "1" ]; then
    echo "✓ $name (already applied)"
    continue
  fi
  echo "→ $name"
  # File and its journal entry commit together.
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q --single-transaction \
    -f "$f" -c "insert into private.schema_migrations (name) values ('$name')"
done
echo "done"
