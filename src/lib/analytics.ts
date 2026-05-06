/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Thin posthog-js wrappers for non-component call sites (auth, events).
 * Components should use the usePostHog hook from @posthog/react instead.
 * Posthog is initialized in main.tsx before any of these are called.
 */
import posthog from 'posthog-js';

export function identifyUser(userId: string, name: string): void {
  posthog.identify(userId, { name });
}

export function resetUser(): void {
  posthog.reset();
}

export function track(event: string, props?: Record<string, unknown>): void {
  posthog.capture(event, props);
}
