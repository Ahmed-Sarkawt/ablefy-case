/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Event routes — POST /api/events for onboarding instrumentation.
 * Used by every flow step to log time-to-value.
 */
import { Hono } from 'hono';
import { z } from 'zod';
import type Database from 'better-sqlite3';

const EventBody = z.object({
  userId: z.string().uuid(),
  eventType: z.enum([
    'signup_completed',
    'welcome_completed',
    'create_clicked',
    'product_created',
    'post_creation_action',
    'add_content_clicked',
  ]),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export function createEventRoutes(db: Database.Database): Hono {
  const router = new Hono();

  router.post('/', async (c) => {
    const raw = await c.req.json().catch(() => null);
    const parsed = EventBody.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: 'Invalid event payload' }, 400);
    }
    const { userId, eventType, attributes } = parsed.data;
    db.prepare(
      'INSERT INTO onboarding_events (user_id, event_type, attributes) VALUES (?, ?, ?)'
    ).run(userId, eventType, attributes ? JSON.stringify(attributes) : null);
    return c.json({ ok: true }, 201);
  });

  return router;
}
