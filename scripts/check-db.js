/* eslint-disable no-console */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
const { execSync } = require('child_process');
const semver = require('semver');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

if (process.env.SKIP_DB_CHECK) {
  console.log('Skipping database check.');
  process.exit(0);
}

const isTurso = process.env.TURSO_DATABASE_URL?.length > 0;

function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = url && url.split(':')[0];

  if (type === 'postgres') {
    return 'postgresql';
  }

  if (type === 'file') {
    return 'sqlite';
  }

  return type;
}

const prisma = new PrismaClient();
const databaseType = getDatabaseType();

function success(msg) {
  console.log(chalk.greenBright(`✓ ${msg}`));
}

function error(msg) {
  console.log(chalk.redBright(`✗ ${msg}`));
}

async function checkEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined.');
  } else {
    success('DATABASE_URL is defined.');
  }
}

async function checkConnection() {
  try {
    await prisma.$connect();

    success('Database connection successful.');
  } catch (e) {
    throw new Error('Unable to connect to the database.');
  }
}

async function checkDatabaseVersion() {
  if (databaseType !== 'sqlite') {
    const query = await prisma.$queryRaw`select version() as version`;
    const version = semver.valid(semver.coerce(query[0].version));

    const minVersion = databaseType === 'postgresql' ? '9.4.0' : '5.7.0';

    if (semver.lt(version, minVersion)) {
      throw new Error(
        `Database version is not compatible. Please upgrade ${databaseType} version to ${minVersion} or greater`,
      );
    }

    success('Database version check successful.');
  }
}

async function checkV1Tables() {
  // check for v1 migrations before v2 release date
  const releaseDate = databaseType !== 'sqlite' ? "'2023-04-17'" : 1686268800000;
  try {
    const record =
      await prisma.$queryRaw`select * from _prisma_migrations where started_at < ${releaseDate}`;

    if (record.length > 0) {
      error('Umami v1 tables detected.');
      process.exit(1);
    }
  } catch (e) {
    // Ignore
  }
}

function execTursoMigrations(dbUrl, token) {
  try {
    execSync('turso --version');
  } catch (e) {
    error('Turso CLI is not installed.');
    execSync('curl -sSfL https://get.tur.so/install.sh | bash');
  }
  const dbExists = db => {
    try {
      const cmd = `turso db shell ${dbUrl} "SELECT name FROM sqlite_master WHERE type='table' AND name='${db}'"`;

      const result = execSync(cmd).toString();
      return result.split('\n').filter(Boolean).length > 1;
    } catch (e) {
      throw new Error(`Database ${db} does not exist.`);
    }
  };
  execSync(`turso config token set ${token}`);
  if (!dbExists('user')) {
    execSync(
      `turso db shell ${dbUrl} < ${path.join(ROOT, 'prisma/migrations/01_init/migration.sql')}`,
    );
  }
  if (!dbExists('session_data')) {
    execSync(
      `turso db shell ${dbUrl} < ${path.join(
        ROOT,
        'prisma/migrations/02_report_schema_session_data/migration.sql',
      )}`,
    );
  }
  if (!dbExists('event_data')) {
    execSync(
      `turso db shell ${dbUrl} < ${path.join(
        ROOT,
        'prisma/migrations/03_metric_performance_index/migration.sql',
      )}`,
    );
  }
  if (!dbExists('team')) {
    execSync(
      `turso db shell ${dbUrl} < ${path.join(
        ROOT,
        'prisma/migrations/04_team_redesign/migration.sql',
      )}`,
    );
  }
}

async function applyMigration() {
  if (databaseType === 'sqlite' && isTurso) {
    const token = process.env.TURSO_AUTH_TOKEN;
    const dbUrl = process.env.TURSO_DATABASE_URL;
    if (!token) {
      throw new Error('TURSO_AUTH_TOKEN is not defined.');
    }
    if (!dbUrl) {
      throw new Error('TURSO_DATABASE_URL is not defined.');
    }
    execTursoMigrations(dbUrl, token);
    success('Database is up to date.');
  }
  console.log(execSync('prisma migrate deploy').toString());

  success('Database is up to date.');
}

(async () => {
  let err = false;
  for (let fn of [checkEnv, checkConnection, checkDatabaseVersion, checkV1Tables, applyMigration]) {
    try {
      await fn();
    } catch (e) {
      error(e.message);
      err = true;
    } finally {
      await prisma.$disconnect();
      if (err) {
        process.exit(1);
      }
    }
  }
})();
