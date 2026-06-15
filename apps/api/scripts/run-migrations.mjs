#!/usr/bin/env node
// Generalized migration runner — applies all *.sql files in migrations/ in alphabetical order
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '../src/shared/database/migrations');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration(s): ${files.join(', ')}`);

  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying ${file}…`);
      await client.query(sql);
      console.log(`✓ ${file} done`);
    }
    console.log('All migrations applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
