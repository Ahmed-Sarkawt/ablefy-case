/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Hono app factory. Lets index.ts boot for prod and tests instantiate
 * with an in-memory DB.
 */
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type Database from 'better-sqlite3';
import { createAuthRoutes } from './routes/auth';
import { createEventRoutes } from './routes/events';
import { createProductRoutes } from './routes/products';

export function createApp(db: Database.Database): Hono {
  const app = new Hono();

  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: ['http://localhost:5173'],
      credentials: true,
    })
  );

  app.get('/api/health', (c) =>
    c.json({ status: 'ok', service: 'ablefy-case-study', timestamp: Date.now() })
  );

  app.route('/api/auth', createAuthRoutes(db));
  app.route('/api/events', createEventRoutes(db));
  app.route('/api/products', createProductRoutes(db));

  return app;
}
