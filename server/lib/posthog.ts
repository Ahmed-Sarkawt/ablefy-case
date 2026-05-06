/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Server-side PostHog singleton (posthog-node).
 * Import `posthog` wherever you need to capture server-side events.
 */
import { PostHog } from 'posthog-node';

export const posthog = new PostHog(process.env.POSTHOG_API_KEY ?? 'phc_disabled', {
  host: process.env.POSTHOG_HOST,
  enableExceptionAutocapture: true,
});

process.on('SIGTERM', () => posthog.shutdown());
process.on('SIGINT',  () => posthog.shutdown());
