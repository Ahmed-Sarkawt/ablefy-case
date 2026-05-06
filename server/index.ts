/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Server entry. Wires the singleton DB into the Hono app and listens on :3002.
 */
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db/index';
import { createApp } from './app';

// Run migrations on every start (idempotent — CREATE TABLE IF NOT EXISTS)
const here = dirname(fileURLToPath(import.meta.url));
db.exec(readFileSync(join(here, 'db/schema.sql'), 'utf8'));

const app = createApp(db);

if (process.env.NODE_ENV === 'production') {
  // Serve Vite build artifacts; falls through to next handler when file not found
  app.use('*', serveStatic({ root: './dist' }));
  // SPA fallback — React Router handles client-side navigation
  app.get('*', (c) =>
    c.html(readFileSync(join(process.cwd(), 'dist/index.html'), 'utf8'))
  );
}

const port = Number(process.env.PORT ?? 3002);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🟢 API listening on http://localhost:${info.port}`);
});
