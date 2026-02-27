#!/usr/bin/env node
/**
 * setup.mjs — One-command local dev setup
 *
 * 1. Copies .env.example → .env (if missing)
 * 2. Runs npm install
 * 3. Connects to the database
 * 4. Creates a _migrations tracking table
 * 5. Detects if Docker already applied migrations (checks for `users` table)
 * 6. Applies any unapplied migrations in order, inside transactions
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MIGRATIONS_DIR = path.join(ROOT, 'db', 'migrations');

function log(msg) {
  console.log(`\x1b[36m[setup]\x1b[0m ${msg}`);
}
function warn(msg) {
  console.log(`\x1b[33m[setup]\x1b[0m ${msg}`);
}
function fail(msg) {
  console.error(`\x1b[31m[setup]\x1b[0m ${msg}`);
  process.exit(1);
}

// ── Step 1: .env ────────────────────────────────────────────────────────
const envPath = path.join(ROOT, '.env');
const envExamplePath = path.join(ROOT, '.env.example');

if (!fs.existsSync(envPath)) {
  if (!fs.existsSync(envExamplePath)) {
    fail('.env.example not found — cannot create .env');
  }
  fs.copyFileSync(envExamplePath, envPath);
  log('Created .env from .env.example');
} else {
  log('.env already exists — skipping copy');
}

// ── Step 2: npm install ─────────────────────────────────────────────────
log('Running npm install...');
try {
  execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
} catch {
  fail('npm install failed');
}

// ── Step 3: Load env vars (simple parser — no dotenv dependency yet) ────
function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
loadEnv(envPath);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  fail('DATABASE_URL not set in .env');
}

// ── Step 4: Connect to DB ───────────────────────────────────────────────
log(`Connecting to database...`);
const pool = new pg.Pool({ connectionString: databaseUrl });

let client;
try {
  client = await pool.connect();
  log('Database connection OK');
} catch (err) {
  fail(`Cannot connect to database: ${err.message}\n  Hint: run \`docker compose up -d db\` first.`);
}

try {
  // ── Step 5: Create _migrations table ──────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // ── Step 6: Detect if Docker already applied migrations ───────────────
  const { rows: tables } = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'users'
  `);

  const { rows: applied } = await client.query('SELECT name FROM _migrations ORDER BY name');
  const appliedSet = new Set(applied.map((r) => r.name));

  // Read migration files sorted by name
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    warn('No migration files found in db/migrations/');
  }

  // If `users` table exists but _migrations is empty, Docker init already ran them
  if (tables.length > 0 && appliedSet.size === 0) {
    log('Detected existing schema (Docker init). Marking all migrations as applied...');
    for (const file of migrationFiles) {
      await client.query(
        'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
        [file]
      );
      appliedSet.add(file);
    }
  }

  // ── Step 7: Apply unapplied migrations ────────────────────────────────
  let appliedCount = 0;
  for (const file of migrationFiles) {
    if (appliedSet.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    log(`Applying ${file}...`);

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      appliedCount++;
    } catch (err) {
      await client.query('ROLLBACK');
      fail(`Migration ${file} failed: ${err.message}`);
    }
  }

  if (appliedCount > 0) {
    log(`Applied ${appliedCount} migration(s)`);
  } else {
    log('All migrations are up to date');
  }

  log('Setup complete!');
} finally {
  client.release();
  await pool.end();
}
