DB=$1

if [ -z "$DB" ]; then
  echo "Usage: $0 <db>"
  exit 1
fi

turso db shell $DB < ./migrations/01_init/migration.sql
turso db shell $DB < ./migrations/02_report_schema_session_data/migration.sql
turso db shell $DB < ./migrations/03_metric_performance_index/migration.sql
turso db shell $DB < ./migrations/04_team_redesign/migration.sql