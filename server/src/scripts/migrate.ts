import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, withTransaction } from '../db/pool.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('[LOKHA Migrations] Starting PostgreSQL database migrations...');
  const migrationsDir = path.resolve(__dirname, '../../migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`[LOKHA Migrations] Migrations directory not found at: ${migrationsDir}`);
    process.exit(1);
  }

  // Create migrations tracker table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const executedRes = await pool.query('SELECT filename FROM schema_migrations');
  const executedFiles = new Set(executedRes.rows.map((r) => r.filename));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`[LOKHA Migrations] Found ${files.length} migration file(s).`);

  for (const file of files) {
    if (executedFiles.has(file)) {
      console.log(`[LOKHA Migrations] Skipping already executed: ${file}`);
      continue;
    }

    console.log(`[LOKHA Migrations] Executing: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    });

    console.log(`[LOKHA Migrations] Successfully completed: ${file}`);
  }

  console.log('[LOKHA Migrations] All migrations applied successfully!');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('[LOKHA Migrations Error] Migration failed:', err);
  pool.end().finally(() => process.exit(1));
});
