/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Integration tests for /api/products against an in-memory DB.
 */
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { randomUUID } from 'node:crypto';
import { createProductRoutes } from '../../server/routes/products';
import { createTestDb } from './_fixture';

interface ProductRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price_cents: number;
  payment_model: string;
  status: string;
}

interface EventRow {
  event_type: string;
  attributes: string | null;
}

function makeApp(): { app: Hono; db: ReturnType<typeof createTestDb>; userId: string } {
  const db = createTestDb();
  const userId = randomUUID();
  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(userId, 'alex@example.com', 'hash', 'Alex');
  db.prepare('INSERT INTO onboarding_events (user_id, event_type) VALUES (?, ?)').run(userId, 'signup_completed');
  const app = new Hono().route('/api/products', createProductRoutes(db));
  return { app, db, userId };
}

/** Minimal valid body — one_time plan at €99. */
function validBody(userId: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    userId,
    name: 'AI Influencer Playbook',
    description: 'A short and clear description of the playbook.',
    paymentConfig: { type: 'one_time', priceCents: 9900 },
    currency: 'EUR',
    ...overrides,
  };
}

describe('POST /api/products', () => {
  it('creates a draft product and stores the payment model', async () => {
    const { app, db, userId } = makeApp();
    const res = await app.request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody(userId)),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { productId: string; status: string };
    expect(body.productId).toMatch(/[0-9a-f-]{36}/);
    expect(body.status).toBe('draft');

    const row = db
      .prepare('SELECT id, user_id, name, price_cents, payment_model, status FROM products WHERE id = ?')
      .get(body.productId) as ProductRow | undefined;
    expect(row?.user_id).toBe(userId);
    expect(row?.status).toBe('draft');
    expect(row?.price_cents).toBe(9900);
    expect(row?.payment_model).toBe('one_time');
  });

  it('accepts a free plan (price_cents = 0)', async () => {
    const { app, db, userId } = makeApp();
    const res = await app.request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody(userId, { paymentConfig: { type: 'free' } })),
    });
    expect(res.status).toBe(201);
    const { productId } = (await res.json()) as { productId: string };
    const row = db.prepare('SELECT price_cents, payment_model FROM products WHERE id = ?').get(productId) as ProductRow;
    expect(row.price_cents).toBe(0);
    expect(row.payment_model).toBe('free');
  });

  it('logs product_created event with timeSinceSignupMs', async () => {
    const { app, db, userId } = makeApp();
    const res = await app.request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody(userId)),
    });
    expect(res.status).toBe(201);
    const event = db
      .prepare(`SELECT event_type, attributes FROM onboarding_events WHERE user_id = ? AND event_type = 'product_created'`)
      .get(userId) as EventRow | undefined;
    expect(event?.event_type).toBe('product_created');
    const attrs = JSON.parse(event!.attributes!) as { productId: string; timeSinceSignupMs: number | null };
    expect(attrs.productId).toMatch(/[0-9a-f-]{36}/);
    expect(typeof attrs.timeSinceSignupMs).toBe('number');
  });

  it('rejects a name shorter than 3 chars with 400', async () => {
    const { app, userId } = makeApp();
    const res = await app.request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody(userId, { name: 'ab' })),
    });
    expect(res.status).toBe(400);
  });

  it('rejects an unknown user with 401', async () => {
    const { app } = makeApp();
    const res = await app.request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody('99999999-9999-4999-8999-999999999999')),
    });
    expect(res.status).toBe(401);
  });

  it('rejects a one_time price above €99,999.99 with 400', async () => {
    const { app, userId } = makeApp();
    const res = await app.request('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody(userId, { paymentConfig: { type: 'one_time', priceCents: 10_000_000 } })),
    });
    expect(res.status).toBe(400);
  });
});
