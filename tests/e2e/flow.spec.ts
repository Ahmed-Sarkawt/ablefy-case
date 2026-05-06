/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * E2E: signup → course created
 *
 * Measures time-to-value (signup_start → product_created screen).
 * Runs against the dev server (npm run dev).
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Onboarding flow: signup → course created', () => {
  test('completes in under 5 minutes', async ({ page }) => {
    const start = Date.now();

    /* ── 1. Signup ── */
    await page.goto(`${BASE}/signup`);
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();

    await page.getByLabel(/name/i).fill('Alex Demo');
    await page.getByLabel(/email/i).fill(`alex+${Date.now()}@demo.test`);
    await page.getByLabel(/password/i).fill('SecurePass123!');
    await page.getByRole('button', { name: /sign up/i }).click();

    /* ── 2. Welcome ── */
    await expect(page).toHaveURL(`${BASE}/welcome`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('link', { name: /go to dashboard|skip|continue/i }).click();

    /* ── 3. Dashboard ── */
    await expect(page).toHaveURL(`${BASE}/dashboard`);
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible();
    await page.getByRole('button', { name: /create product/i }).click();

    /* ── 4. New product form ── */
    await expect(page).toHaveURL(`${BASE}/products/new`);
    await page.getByLabel(/product name/i).fill('Intro to AI for Creators');
    await page.getByLabel(/description/i).fill('A beginner-friendly course on using AI tools to grow your creator business.');

    // Submit (price defaults to one-time €0, which is fine for the test)
    await page.getByRole('button', { name: /create|save|publish/i }).first().click();

    /* ── 5. Post-creation screen ── */
    await expect(page).toHaveURL(/\/products\/.+\/created/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/ready/i);

    const elapsed = Date.now() - start;
    console.log(`⏱  Time-to-value: ${(elapsed / 1000).toFixed(1)}s`);
    expect(elapsed).toBeLessThan(5 * 60 * 1000); // under 5 min

    /* ── 6. Add Content CTA ── */
    await page.getByRole('button', { name: /add course content/i }).click();
    await expect(page).toHaveURL(/\/products\/.+\/content/);
  });

  test('products sidebar navigates to product list', async ({ page }) => {
    // Seed a session so we land on dashboard
    await page.goto(`${BASE}/signup`);
    await page.getByLabel(/name/i).fill('Alex Nav');
    await page.getByLabel(/email/i).fill(`nav+${Date.now()}@demo.test`);
    await page.getByLabel(/password/i).fill('SecurePass123!');
    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForURL(`${BASE}/welcome`);
    await page.getByRole('link', { name: /go to dashboard|skip|continue/i }).click();
    await page.waitForURL(`${BASE}/dashboard`);

    // Click Products in sidebar
    await page.getByRole('link', { name: /^products$/i }).click();
    await expect(page).toHaveURL(`${BASE}/products`);
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible();
  });

  test('dashboard shows analytics widgets', async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.getByLabel(/name/i).fill('Alex Analytics');
    await page.getByLabel(/email/i).fill(`analytics+${Date.now()}@demo.test`);
    await page.getByLabel(/password/i).fill('SecurePass123!');
    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForURL(`${BASE}/welcome`);
    await page.getByRole('link', { name: /go to dashboard|skip|continue/i }).click();
    await page.waitForURL(`${BASE}/dashboard`);

    await expect(page.getByText(/conversion rate/i)).toBeVisible();
    await expect(page.getByText(/incoming payments/i)).toBeVisible();
    await expect(page.getByText(/community/i)).toBeVisible();
    await expect(page.getByText(/product updates/i)).toBeVisible();
  });
});
