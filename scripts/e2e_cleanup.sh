#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/compose.yml"
UPLOADS_DIR="$ROOT_DIR/apps/api/uploads"
EMAIL_PATTERN="${E2E_EMAIL_PATTERN:-e2e-%@iterview.test}"
APPLY=false

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/e2e_cleanup.sh [--apply]

Removes the accounts the browser journeys sign up (e2e-*@iterview.test) from the local Docker
stack's database, with every row that depends on them, and their uploaded files.

Without --apply it only reports what would be removed and rolls back. Only the local compose
database is touched; E2E_EMAIL_PATTERN (a SQL LIKE pattern) changes which accounts match.
USAGE
}

for arg in "$@"; do
  case "$arg" in
    -h | --help) usage; exit 0 ;;
    --apply) APPLY=true ;;
    *) echo "Unknown argument: $arg" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ "$EMAIL_PATTERN" != *"@iterview.test" ]]; then
  echo "Refusing to clean accounts outside the @iterview.test test domain: $EMAIL_PATTERN" >&2
  exit 1
fi

psql_local() {
  docker compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U "${POSTGRES_USER:-iterview}" -d "${POSTGRES_DB:-iterview}" -v ON_ERROR_STOP=1 -q "$@"
}

USER_IDS="$(psql_local -At -v pattern="$EMAIL_PATTERN" <<'SQL'
SELECT id FROM users WHERE email LIKE :'pattern' ORDER BY id;
SQL
)"
if [[ -z "$USER_IDS" ]]; then
  echo "No accounts match $EMAIL_PATTERN."
  exit 0
fi
echo "Accounts matching $EMAIL_PATTERN: $(echo "$USER_IDS" | wc -l | tr -d ' ')"

FINISH="ROLLBACK"
[[ "$APPLY" == true ]] && FINISH="COMMIT"

# Rows are found by walking foreign keys from the matched users until nothing new turns up, so
# rows several hops away (an answer's score, a session question's evidence links) and
# self-references are included. Every collected row is then deleted with foreign-key triggers
# off for this transaction only; nothing outside the collected set references them.
psql_local -v pattern="$EMAIL_PATTERN" <<SQL
BEGIN;
SET LOCAL client_min_messages = notice;
CREATE TEMP TABLE doomed (tbl regclass, row_id tid, PRIMARY KEY (tbl, row_id)) ON COMMIT DROP;
INSERT INTO doomed SELECT 'users'::regclass, ctid FROM users WHERE email LIKE :'pattern';

DO \$\$
DECLARE
  fk record;
  added bigint;
  total bigint;
BEGIN
  LOOP
    total := 0;
    FOR fk IN
      SELECT c.conrelid::regclass AS child, c.confrelid::regclass AS parent,
             (SELECT string_agg(format('c.%I = p.%I', ca.attname, pa.attname), ' AND ')
                FROM unnest(c.conkey, c.confkey) AS k(child_col, parent_col)
                JOIN pg_attribute ca ON ca.attrelid = c.conrelid AND ca.attnum = k.child_col
                JOIN pg_attribute pa ON pa.attrelid = c.confrelid AND pa.attnum = k.parent_col) AS join_on
        FROM pg_constraint c
       WHERE c.contype = 'f'
         AND c.connamespace = 'public'::regnamespace
    LOOP
      EXECUTE format(
        'INSERT INTO doomed SELECT %1\$L::regclass, c.ctid FROM %1\$s c JOIN %2\$s p ON %3\$s
           WHERE p.ctid IN (SELECT row_id FROM doomed WHERE tbl = %2\$L::regclass)
         ON CONFLICT DO NOTHING',
        fk.child, fk.parent, fk.join_on);
      GET DIAGNOSTICS added = ROW_COUNT;
      total := total + added;
    END LOOP;
    EXIT WHEN total = 0;
  END LOOP;
END
\$\$;

SELECT tbl AS "table", count(*) AS "rows" FROM doomed GROUP BY tbl ORDER BY count(*) DESC, tbl::text;

SET LOCAL session_replication_role = replica;
DO \$\$
DECLARE
  t regclass;
BEGIN
  FOR t IN SELECT DISTINCT tbl FROM doomed LOOP
    EXECUTE format('DELETE FROM %s WHERE ctid IN (SELECT row_id FROM doomed WHERE tbl = %L::regclass)', t, t);
  END LOOP;
END
\$\$;
$FINISH;
SQL

if [[ "$APPLY" != true ]]; then
  echo "Dry run: nothing was removed. Run with --apply to remove these rows and the accounts' uploads."
  exit 0
fi

for id in $USER_IDS; do
  rm -rf "$UPLOADS_DIR/resume-files/user-$id" "$UPLOADS_DIR/interview-audio/user-$id"
  rm -f "$UPLOADS_DIR"/profile-images/user-"$id"-*
done
echo "Removed $(echo "$USER_IDS" | wc -l | tr -d ' ') accounts and their uploads."
