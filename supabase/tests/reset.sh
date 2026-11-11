#!/bin/bash
# Rebuilds a throw-away local Postgres database "lt" with Supabase stand-ins and
# applies every migration in supabase/migrations in order.
# Tested on Ubuntu 24.04 + PostgreSQL 16 (run as root; uses `su postgres`).
DIR="$(cd "$(dirname "$0")" && pwd)"
pg_ctlcluster 16 main status >/dev/null 2>&1 || pg_ctlcluster 16 main start
sleep 2
su postgres -c "psql -q -c 'drop database if exists lt' -c 'create database lt'" 2>/dev/null
su postgres -c "psql -d lt -v ON_ERROR_STOP=1 -q -f $DIR/00_supabase_stub.sql" 2>&1 | grep -v "wal_level\|HINT"
for f in "$DIR"/../migrations/*.sql; do
  echo "== applying $(basename "$f")"
  su postgres -c "psql -d lt -v ON_ERROR_STOP=1 -q -f $f" 2>&1 | grep -v "NOTICE\|^$" | head -8
done
