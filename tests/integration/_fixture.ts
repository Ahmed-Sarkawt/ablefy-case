/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * In-memory SQLite fixture for integration tests.
 * Each test gets a fresh DB so they're isolated and parallelizable.
 */
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, '../../server/db/schema.sql');

export function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.exec(readFileSync(schemaPath, 'utf8'));
  return db;
}
