/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * recordEvent — fire-and-forget POST to /api/events.
 * Failures are logged, not thrown — instrumentation must never block the flow.
 */
import { apiPost } from './api';

export type OnboardingEvent =
  | 'signup_completed'
  | 'welcome_completed'
  | 'create_clicked'
  | 'product_created'
  | 'post_creation_action'
  | 'add_content_clicked';

export async function recordEvent(
  userId: string,
  eventType: OnboardingEvent,
  attributes?: Record<string, unknown>
): Promise<void> {
  try {
    await apiPost('/api/events', { userId, eventType, attributes });
  } catch (err) {
    console.warn('[events] failed to record', eventType, err);
  }
}
