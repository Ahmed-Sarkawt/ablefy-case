/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Server entry. Wires the singleton DB into the Hono app and listens on :3002.
 */
import { serve } from '@hono/node-server';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db/index';
import { createApp } from './app';

// Run migrations on every start (idempotent — CREATE TABLE IF NOT EXISTS)
const here = dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(join(here, 'db/schema.sql'), 'utf8'));

const app = createApp(db);
const port = Number(process.env.PORT ?? 3002);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🟢 API listening on http://localhost:${info.port}`);
});
