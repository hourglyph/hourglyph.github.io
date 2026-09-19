#!/usr/bin/env bash
# Apply supabase/migrations/*.sql to the project database.
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

for f in supabase/migrations/*.sql; do
  echo "→ $f"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f "$f"
done
echo "done"
