-- @license MIT
-- Copyright (c) 2026 Firat Gomi
--
-- ablefy case-study prototype schema.
-- All tables include created_at; mutable tables include updated_at.
-- Foreign keys enforced; cascading deletes only where it makes sense.

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- === Users ===
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                -- UUID v4
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                   -- bcrypt
  name          TEXT NOT NULL,
  -- Optional fields, deferred from current ablefy's signup form:
  phone         TEXT,
  shop_name     TEXT,
  business_type TEXT,
  -- Compliance fields, moved out of onboarding:
  tax_number    TEXT,
  vat_id        TEXT,
  contact_address TEXT,
  -- Audit:
  created_at    INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at    INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- === Products ===
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  cover_image_url TEXT,
  price_cents     INTEGER NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'EUR',
  -- payment_model: 'one_time' | 'subscription' | 'installment' | 'free' | 'limited'
  payment_model   TEXT NOT NULL DEFAULT 'one_time',
  -- Shared across subscription / installment / limited:
  payment_interval    TEXT,        -- 'weekly' | 'monthly' | 'yearly'
  -- Installment-specific:
  installment_count   INTEGER,     -- number of installments
  -- Limited-subscription-specific:
  payment_count       INTEGER,     -- number of recurring payments
  -- Subscription-specific:
  trial_days          INTEGER,     -- trial period in days (NULL = no trial)
  -- Installment / Subscription / Limited:
  first_payment_cents INTEGER,     -- amount for first charge if different from regular (NULL = same)
  -- Accepted payment methods — JSON array of method IDs:
  accepted_payment_methods TEXT,   -- e.g. '["card","paypal","apple_pay"]'
  -- Plan display options:
  plan_name            TEXT,       -- custom name shown at checkout (NULL = plan type label)
  original_price_cents INTEGER,    -- crossed-out price for discount display (NULL = no original)
  show_net_price       INTEGER NOT NULL DEFAULT 0, -- 1 = display price without taxes
  pay_later_due_days   INTEGER,    -- days until payment due when Pay later is selected
  -- Advanced settings (from design references):
  -- product_type: matches ablefy Cabinet product-type picker
  product_type    TEXT NOT NULL DEFAULT 'online_course'
                  CHECK (product_type IN ('digital', 'online_course', 'online_course_recorded')),
  -- lifetime_access: 1=lifetime (default), 0=time-limited
  lifetime_access INTEGER NOT NULL DEFAULT 1,
  -- duration_months: only meaningful when lifetime_access=0
  duration_months INTEGER,
  -- unavailable_redirect: what happens when product is unavailable for purchase
  unavailable_redirect TEXT NOT NULL DEFAULT 'shop'
                  CHECK (unavailable_redirect IN ('shop', 'sold_out', 'another')),
  -- position: optional display-order index in the shop (NULL = auto-sorted)
  position        INTEGER,
  -- overall_limit: optional cap on total purchases (NULL = unlimited)
  overall_limit   INTEGER,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at      INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at      INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- === Lessons (schema present, not used in Option 01 prototype) ===
CREATE TABLE IF NOT EXISTS lessons (
  id          TEXT PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INTEGER NOT NULL,
  content_md  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_lessons_product ON lessons(product_id, position);

-- === Onboarding events — instrumentation for time-to-value measurement ===
CREATE TABLE IF NOT EXISTS onboarding_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  -- Event types we emit:
  --   signup_completed
  --   welcome_completed (with attributes.action='tour'|'skip')
  --   create_clicked
  --   product_created (with attributes.time_since_signup_ms)
  --   post_creation_action (with attributes.action='add_content'|'edit_page'|'customize_checkout'|'set_up_delivery')
  attributes  TEXT,                                  -- JSON
  occurred_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_events_user_time ON onboarding_events(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON onboarding_events(event_type);

-- === Sessions — server-side auth sessions ===
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,                -- random UUID
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  expires_at  INTEGER NOT NULL                 -- unix ms
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
