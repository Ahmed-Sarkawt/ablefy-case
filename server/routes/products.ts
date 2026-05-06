/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Product routes.
 *
 * GET  /api/products/:id  — returns { id, name, status } for the success screen.
 * POST /api/products      — creates a draft product.
 *
 * paymentConfig is a discriminated union over five plan types:
 *   free         — no charge
 *   one_time     — single price (priceCents)
 *   installment  — totalCents, count, interval, optional firstPaymentCents
 *   subscription — priceCents, interval, trialDays, optional firstPaymentCents
 *   limited      — priceCents, count, interval, optional firstPaymentCents
 *
 * paymentMethods — array of accepted method IDs the seller enables.
 */
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { posthog } from '../lib/posthog';

const Interval = z.enum(['weekly', 'monthly', 'yearly']);
const OptFirstPayment = z.number().int().nonnegative().max(9_999_999).nullable().optional();

const PaymentConfig = z.discriminatedUnion('type', [
  z.object({ type: z.literal('free') }),
  z.object({ type: z.literal('one_time'), priceCents: z.number().int().positive().max(9_999_999) }),
  z.object({
    type: z.literal('installment'),
    totalCents: z.number().int().positive().max(9_999_999),
    count: z.number().int().min(2).max(36),
    interval: Interval,
    firstPaymentCents: OptFirstPayment,
  }),
  z.object({
    type: z.literal('subscription'),
    priceCents: z.number().int().positive().max(9_999_999),
    interval: Interval,
    trialDays: z.number().int().min(0).max(365).nullable(),
    firstPaymentCents: OptFirstPayment,
  }),
  z.object({
    type: z.literal('limited'),
    priceCents: z.number().int().positive().max(9_999_999),
    count: z.number().int().min(2).max(36),
    interval: Interval,
    firstPaymentCents: OptFirstPayment,
  }),
]);

const PaymentMethodId = z.enum([
  'paypal',
  'card',
  'bank_wire',
  'sepa',
  'pay_later',
  'p24',
  'apple_pay',
  'google_pay',
  'ideal',
]);

const ProductBody = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(500),
  coverImageUrl: z.string().trim().url('Enter a valid URL').max(500).optional().or(z.literal('')),
  currency: z.string().trim().length(3).default('EUR'),
  paymentConfig: PaymentConfig,
  paymentMethods: z.array(PaymentMethodId).default([]),
  // Plan display options:
  planName: z.string().max(100).nullable().optional(),
  originalPriceCents: z.number().int().nonnegative().max(9_999_999).nullable().optional(),
  showNetPrice: z.boolean().default(false),
  payLaterDueDays: z.number().int().min(1).max(365).nullable().optional(),
  // Advanced settings:
  productType: z
    .enum(['digital', 'online_course', 'online_course_recorded'])
    .default('online_course'),
  lifetimeAccess: z.boolean().default(true),
  durationMonths: z.number().int().positive().max(120).nullable().optional(),
  unavailableRedirect: z.enum(['shop', 'sold_out', 'another']).default('shop'),
  position: z.number().int().min(0).max(9999).nullable().optional(),
  overallLimit: z.number().int().positive().max(999999).nullable().optional(),
});

interface UserRow {
  id: string;
}
interface SignupRow {
  occurred_at: number;
}
interface ProductListRow {
  id: string;
  name: string;
  status: string;
  price_cents: number;
  currency: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}
interface ProductDetailRow extends ProductListRow {
  description: string;
  payment_model: string;
  product_type: string;
  lifetime_access: number;
  duration_months: number | null;
  unavailable_redirect: string;
  position: number | null;
  overall_limit: number | null;
}

function derivePaymentColumns(cfg: z.infer<typeof PaymentConfig>): {
  payment_model: string;
  price_cents: number;
  payment_interval: string | null;
  installment_count: number | null;
  payment_count: number | null;
  trial_days: number | null;
  first_payment_cents: number | null;
} {
  switch (cfg.type) {
    case 'free':
      return {
        payment_model: 'free',
        price_cents: 0,
        payment_interval: null,
        installment_count: null,
        payment_count: null,
        trial_days: null,
        first_payment_cents: null,
      };
    case 'one_time':
      return {
        payment_model: 'one_time',
        price_cents: cfg.priceCents,
        payment_interval: null,
        installment_count: null,
        payment_count: null,
        trial_days: null,
        first_payment_cents: null,
      };
    case 'installment':
      return {
        payment_model: 'installment',
        price_cents: cfg.totalCents,
        payment_interval: cfg.interval,
        installment_count: cfg.count,
        payment_count: null,
        trial_days: null,
        first_payment_cents: cfg.firstPaymentCents ?? null,
      };
    case 'subscription':
      return {
        payment_model: 'subscription',
        price_cents: cfg.priceCents,
        payment_interval: cfg.interval,
        installment_count: null,
        payment_count: null,
        trial_days: cfg.trialDays,
        first_payment_cents: cfg.firstPaymentCents ?? null,
      };
    case 'limited':
      return {
        payment_model: 'limited',
        price_cents: cfg.priceCents,
        payment_interval: cfg.interval,
        installment_count: null,
        payment_count: cfg.count,
        trial_days: null,
        first_payment_cents: cfg.firstPaymentCents ?? null,
      };
  }
}

export function createProductRoutes(db: Database.Database): Hono {
  const router = new Hono();

  router.get('/', (c) => {
    const userId = c.req.query('userId');
    if (!userId) return c.json({ error: 'userId required' }, 400);
    const rows = db
      .prepare(
        `SELECT id, name, status, price_cents, currency, cover_image_url, created_at, updated_at
         FROM products WHERE user_id = ? ORDER BY created_at DESC`
      )
      .all(userId) as ProductListRow[];
    return c.json(rows);
  });

  router.get('/:id', (c) => {
    const id = c.req.param('id');
    const row = db
      .prepare(
        `SELECT id, name, description, status, price_cents, currency, cover_image_url,
                payment_model, product_type, lifetime_access, duration_months,
                unavailable_redirect, position, overall_limit, created_at, updated_at
         FROM products WHERE id = ?`
      )
      .get(id) as ProductDetailRow | undefined;
    if (!row) return c.json({ error: 'Product not found' }, 404);
    return c.json(row);
  });

  router.patch('/:id/status', async (c) => {
    const sid = getCookie(c, 'ablefy_sid');
    if (!sid) return c.json({ error: 'Not authenticated' }, 401);

    const session = db
      .prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?')
      .get(sid, Date.now()) as { user_id: string } | undefined;
    if (!session) return c.json({ error: 'Session expired' }, 401);

    const id = c.req.param('id');
    const product = db
      .prepare('SELECT user_id FROM products WHERE id = ?')
      .get(id) as { user_id: string } | undefined;
    if (!product) return c.json({ error: 'Product not found' }, 404);
    if (product.user_id !== session.user_id) return c.json({ error: 'Forbidden' }, 403);

    const raw = await c.req.json().catch(() => null);
    const status = (raw as { status?: string } | null)?.status === 'published' ? 'published' : 'draft';

    db.prepare("UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);

    if (status === 'published') {
      posthog.capture({
        distinctId: session.user_id,
        event: 'product_published',
        properties: { product_id: id },
      });
    }

    return c.json({ id, status });
  });

  router.post('/', async (c) => {
    const raw = await c.req.json().catch(() => null);
    const parsed = ProductBody.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return c.json(
        { error: first?.message ?? 'Invalid request', field: first?.path[0] ?? null },
        400
      );
    }

    const {
      userId,
      name,
      description,
      coverImageUrl,
      currency,
      paymentConfig,
      paymentMethods,
      planName,
      originalPriceCents,
      showNetPrice,
      payLaterDueDays,
      productType,
      lifetimeAccess,
      durationMonths,
      unavailableRedirect,
      position,
      overallLimit,
    } = parsed.data;

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as UserRow | undefined;
    if (!user) return c.json({ error: 'Unknown user', field: 'userId' }, 401);

    const pay = derivePaymentColumns(paymentConfig);
    const productId = randomUUID();

    db.prepare(
      `INSERT INTO products
         (id, user_id, name, description, cover_image_url, price_cents, currency,
          payment_model, payment_interval, installment_count, payment_count, trial_days,
          first_payment_cents, accepted_payment_methods,
          plan_name, original_price_cents, show_net_price, pay_later_due_days,
          product_type, lifetime_access, duration_months,
          unavailable_redirect, position, overall_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      productId,
      userId,
      name,
      description,
      coverImageUrl && coverImageUrl.length > 0 ? coverImageUrl : null,
      pay.price_cents,
      currency,
      pay.payment_model,
      pay.payment_interval,
      pay.installment_count,
      pay.payment_count,
      pay.trial_days,
      pay.first_payment_cents,
      paymentMethods.length > 0 ? JSON.stringify(paymentMethods) : null,
      planName ?? null,
      originalPriceCents ?? null,
      showNetPrice ? 1 : 0,
      payLaterDueDays ?? null,
      productType,
      lifetimeAccess ? 1 : 0,
      durationMonths ?? null,
      unavailableRedirect,
      position ?? null,
      overallLimit ?? null
    );

    const signup = db
      .prepare(
        `SELECT occurred_at FROM onboarding_events WHERE user_id = ? AND event_type = 'signup_completed' ORDER BY occurred_at ASC LIMIT 1`
      )
      .get(userId) as SignupRow | undefined;
    const timeSinceSignupMs = signup ? Date.now() - signup.occurred_at : null;

    db.prepare(
      'INSERT INTO onboarding_events (user_id, event_type, attributes) VALUES (?, ?, ?)'
    ).run(userId, 'product_created', JSON.stringify({ productId, timeSinceSignupMs }));

    posthog.capture({
      distinctId: userId,
      event: 'product_created',
      properties: {
        product_id: productId,
        product_type: productType,
        payment_model: pay.payment_model,
        currency,
        price_cents: pay.price_cents,
        time_since_signup_ms: timeSinceSignupMs,
      },
    });

    return c.json({ productId, status: 'draft' }, 201);
  });

  return router;
}
