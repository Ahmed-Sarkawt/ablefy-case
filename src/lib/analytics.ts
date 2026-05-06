/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * PostHog analytics — thin wrapper so call sites stay clean.
 * Init once in main.tsx; identify after every login/signup.
 */
import posthog from 'posthog-js';

const KEY = import.meta.env.VITE_POSTHOG_KEY as string;

export function initAnalytics(): void {
  if (!KEY) return;
  posthog.init(KEY, {
    api_host: 'https://us.i.posthog.com',
    defaults: '2026-01-30',
  });
}

export function identifyUser(userId: string, name: string): void {
  posthog.identify(userId, { name });
}

export function resetUser(): void {
  posthog.reset();
}

export function track(event: string, props?: Record<string, unknown>): void {
  posthog.capture(event, props);
}
