#!/usr/bin/env bash
set -euo pipefail

# Run SQL migrations against Supabase/Postgres.
# Usage:
#   SUPABASE_DB_URL="postgres://user:pass@host:port/dbname" ./scripts/run_migrations.sh
# To also run seeds:
#   RUN_SEEDS=true SUPABASE_DB_URL="..." ./scripts/run_migrations.sh

MIGRATIONS_DIR="sql/migrations"
SEEDS_DIR="sql/seed"

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql is not installed or not on PATH." >&2
  echo "Install psql (Postgres client) and re-run. On macOS: brew install libpq && brew link --force libpq" >&2
  exit 1
fi

: "${SUPABASE_DB_URL:?Environment variable SUPABASE_DB_URL must be set (Postgres libpq connection string)}"

echo "Using SUPABASE_DB_URL=${SUPABASE_DB_URL/://****@}"  # do not print full creds

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found at $MIGRATIONS_DIR. Nothing to do."
  exit 0
fi

echo "Applying migrations from $MIGRATIONS_DIR..."
shopt -s nullglob
FILES=( "$MIGRATIONS_DIR"/*.sql )
if [ ${#FILES[@]} -eq 0 ]; then
  echo "No migration files found."
else
  IFS=$'\n' sorted=($(sort <<<"${FILES[*]}"))
  for f in "${sorted[@]}"; do
    echo "-> Applying $(basename "$f")..."
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f"
    echo "   OK"
  done
fi

if [ "${RUN_SEEDS:-false}" = "true" ]; then
  if [ -d "$SEEDS_DIR" ]; then
    echo "Applying seed files from $SEEDS_DIR..."
    SEED_FILES=( "$SEEDS_DIR"/*.sql )
    if [ ${#SEED_FILES[@]} -eq 0 ]; then
      echo "No seed files found."
    else
      IFS=$'\n' ssorted=($(sort <<<"${SEED_FILES[*]}"))
      for f in "${ssorted[@]}"; do
        echo "-> Seeding $(basename "$f")..."
        psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f"
        echo "   OK"
      done
    fi
  else
    echo "No seed directory found at $SEEDS_DIR; skipping seeds."
  fi
fi

echo "Migrations completed successfully."
