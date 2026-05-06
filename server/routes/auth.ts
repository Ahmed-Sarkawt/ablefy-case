/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Auth routes — real server-side sessions via HTTP-only cookie.
 *
 * POST /api/auth/signup  — create account + session → set cookie
 * POST /api/auth/login   — verify credentials + session → set cookie
 * GET  /api/auth/me      — read cookie → return current user
 * POST /api/auth/logout  — delete session + clear cookie
 */
import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { posthog } from '../lib/posthog';

const COOKIE = 'ablefy_sid';
const SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const SignupBody = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  newsletter: z.boolean().optional(),
});

const LoginBody = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

function createSession(db: Database.Database, userId: string): string {
  const id = randomUUID();
  const expiresAt = Date.now() + SESSION_MS;
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    id,
    userId,
    expiresAt
  );
  return id;
}

function setSessionCookie(c: Parameters<typeof setCookie>[0], sessionId: string): void {
  setCookie(c, COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: SESSION_MS / 1000,
    path: '/',
  });
}

export function createAuthRoutes(db: Database.Database): Hono {
  const router = new Hono();

  /* ── Signup ── */
  router.post('/signup', async (c) => {
    const raw = await c.req.json().catch(() => null);
    const parsed = SignupBody.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return c.json(
        { error: first?.message ?? 'Invalid request', field: first?.path[0] ?? null },
        400
      );
    }
    const { name, email, password } = parsed.data;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return c.json({ error: 'An account with that email already exists', field: 'email' }, 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(
      userId,
      email,
      hash,
      name
    );
    db.prepare('INSERT INTO onboarding_events (user_id, event_type) VALUES (?, ?)').run(
      userId,
      'signup_completed'
    );

    const sessionId = createSession(db, userId);
    setSessionCookie(c, sessionId);

    posthog.identify({ distinctId: userId, properties: { name, email } });
    posthog.capture({
      distinctId: userId,
      event: 'user_signed_up',
      properties: { email, newsletter: parsed.data.newsletter ?? false },
    });

    return c.json({ userId, name }, 201);
  });

  /* ── Login ── */
  router.post('/login', async (c) => {
    const raw = await c.req.json().catch(() => null);
    const parsed = LoginBody.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return c.json(
        { error: first?.message ?? 'Invalid request', field: first?.path[0] ?? null },
        400
      );
    }
    const { email, password } = parsed.data;

    const user = db
      .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
      .get(email) as UserRow | undefined;
    if (!user) {
      return c.json({ error: 'Incorrect email or password', field: 'email' }, 401);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return c.json({ error: 'Incorrect email or password', field: 'password' }, 401);
    }

    const sessionId = createSession(db, user.id);
    setSessionCookie(c, sessionId);

    posthog.capture({ distinctId: user.id, event: 'user_logged_in', properties: { email } });

    return c.json({ userId: user.id, name: user.name });
  });

  /* ── Me ── */
  router.get('/me', (c) => {
    const sid = getCookie(c, COOKIE);
    if (!sid) return c.json({ error: 'Not authenticated' }, 401);

    const session = db
      .prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?')
      .get(sid, Date.now()) as { user_id: string } | undefined;

    if (!session) {
      deleteCookie(c, COOKIE, { path: '/' });
      return c.json({ error: 'Session expired' }, 401);
    }

    const user = db
      .prepare('SELECT id, name, email FROM users WHERE id = ?')
      .get(session.user_id) as { id: string; name: string; email: string } | undefined;

    if (!user) return c.json({ error: 'User not found' }, 401);

    return c.json({ userId: user.id, name: user.name, email: user.email });
  });

  /* ── Logout ── */
  router.post('/logout', (c) => {
    const sid = getCookie(c, COOKIE);
    if (sid) db.prepare('DELETE FROM sessions WHERE id = ?').run(sid);
    deleteCookie(c, COOKIE, { path: '/' });
    return c.json({ status: 'logged_out' });
  });

  return router;
}
