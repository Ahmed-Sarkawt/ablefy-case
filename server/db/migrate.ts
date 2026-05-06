/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Run schema.sql against the dev database. Idempotent — safe to re-run.
 */
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = join(here, 'dev.db');
const schemaPath = join(here, 'schema.sql');

const db = new Database(dbPath);
db.exec(readFileSync(schemaPath, 'utf8'));

console.log(`✅ Migrated ${dbPath}`);
db.close();
