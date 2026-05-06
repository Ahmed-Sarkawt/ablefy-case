/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Integration tests for /api/auth/signup against an in-memory DB.
 */
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { createAuthRoutes } from '../../server/routes/auth';
import { createTestDb } from './_fixture';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
}

interface EventRow {
  event_type: string;
  user_id: string;
}

function makeApp(): { app: Hono; db: ReturnType<typeof createTestDb> } {
  const db = createTestDb();
  const app = new Hono().route('/api/auth', createAuthRoutes(db));
  return { app, db };
}

describe('POST /api/auth/signup', () => {
  it('creates a user with bcrypt-hashed password and returns userId', async () => {
    const { app, db } = makeApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: 'correcthorse',
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { userId: string; name: string };
    expect(body.userId).toMatch(/[0-9a-f-]{36}/);
    expect(body.name).toBe('Alex Rivera');

    const row = db
      .prepare('SELECT id, email, password_hash, name FROM users WHERE id = ?')
      .get(body.userId) as UserRow | undefined;
    expect(row).toBeDefined();
    expect(row?.email).toBe('alex@example.com');
    expect(await bcrypt.compare('correcthorse', row!.password_hash)).toBe(true);
  });

  it('writes a signup_completed event', async () => {
    const { app, db } = makeApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex',
        email: 'alex2@example.com',
        password: 'correcthorse',
      }),
    });
    const { userId } = (await res.json()) as { userId: string };
    const event = db
      .prepare('SELECT event_type, user_id FROM onboarding_events WHERE user_id = ?')
      .get(userId) as EventRow | undefined;
    expect(event?.event_type).toBe('signup_completed');
  });

  it('rejects an existing email with 409', async () => {
    const { app } = makeApp();
    const body = {
      name: 'Alex',
      email: 'dup@example.com',
      password: 'correcthorse',
    };
    await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(res.status).toBe(409);
  });

  it('rejects short password with 400', async () => {
    const { app } = makeApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex',
        email: 'short@example.com',
        password: 'short',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('rejects malformed email with 400', async () => {
    const { app } = makeApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex',
        email: 'not-an-email',
        password: 'correcthorse',
      }),
    });
    expect(res.status).toBe(400);
  });
});
