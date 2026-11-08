/**
 * Sahiraah Database Backup Script
 * ================================
 * Exports all non-auth data from Supabase to a timestamped SQL file.
 * Run with: node supabase/scripts/backup_data.js
 *
 * Requirements: npm install @supabase/supabase-js dotenv
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually parse .env (no dotenv dependency needed)
function loadEnv(envPath) {
  try {
    const raw = readFileSync(envPath, 'utf8');
    raw.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    });
  } catch {
    // .env not found — rely on environment variables already set
  }
}

loadEnv(join(__dirname, '../../.env'));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tables to back up (public/static data — does NOT include user PII or auth)
const TABLES_TO_BACKUP = [
  'courses',
  'nsqf_qualifications',
  'colleges',
  'entrance_exams',
  'career_pathways',
  'experts',
  'expert_availability',
];

// Helper: escape single quotes in strings
function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function rowToInsert(table, row) {
  const cols = Object.keys(row).join(', ');
  const vals = Object.values(row).map(esc).join(', ');
  return `INSERT INTO public.${table} (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`;
}

async function backupTable(tableName) {
  console.log(`  📦 Backing up: ${tableName}`);
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.warn(`  ⚠️  Could not read ${tableName}: ${error.message}`);
    return `-- WARNING: Could not read ${tableName}: ${error.message}\n`;
  }
  if (!data || data.length === 0) {
    return `-- ${tableName}: no rows\n`;
  }

  const lines = [
    `-- ============================================================`,
    `-- Table: ${tableName} (${data.length} rows)`,
    `-- ============================================================`,
    `TRUNCATE public.${tableName} RESTART IDENTITY CASCADE;`,
    ...data.map(row => rowToInsert(tableName, row)),
    '',
  ];
  return lines.join('\n');
}

async function main() {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const backupDir = join(__dirname, '../backups');
  const backupFile = join(backupDir, `backup_${timestamp}.sql`);

  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  console.log('\n🛡️  Sahiraah Database Backup');
  console.log(`📍  Source: ${SUPABASE_URL}`);
  console.log(`💾  Output: ${backupFile}\n`);

  const header = [
    `-- ============================================================`,
    `-- Sahiraah Database Backup`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Source: ${SUPABASE_URL}`,
    `-- ============================================================`,
    `-- To restore: paste this file into Supabase SQL Editor and run.`,
    `-- WARNING: TRUNCATE statements will clear existing data first.`,
    `-- ============================================================`,
    '',
    `SET session_replication_role = replica; -- Disable FK checks during restore`,
    '',
  ].join('\n');

  let sql = header;

  for (const table of TABLES_TO_BACKUP) {
    sql += await backupTable(table);
  }

  sql += `\nSET session_replication_role = DEFAULT; -- Re-enable FK checks\n`;
  sql += `\n-- ✅ Backup complete: ${new Date().toISOString()}\n`;

  writeFileSync(backupFile, sql, 'utf8');

  console.log(`\n✅ Backup saved to: ${backupFile}`);
  console.log(`📊 Total size: ${(Buffer.byteLength(sql) / 1024).toFixed(1)} KB`);
  console.log('\nTo restore: open Supabase SQL Editor → paste backup file → Run\n');
}

main().catch(err => {
  console.error('❌ Backup failed:', err.message);
  process.exit(1);
});
