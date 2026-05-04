/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Singleton SQLite connection. Use this everywhere; never `new Database()` in handlers.
 */
import Database from 'better-sqlite3';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH ?? join(here, 'dev.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export type DB = typeof db;
