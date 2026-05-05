/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Motion utilities. Thin helpers around CSS classes defined in animations.css.
 * No JS animation library — keeps bundle tiny and ensures cross-browser parity.
 */

export const REVEAL_CLASS = 'animate-reveal';
export const MODAL_IN_CLASS = 'animate-modal-in';
export const SUCCESS_PULSE_CLASS = 'animate-success-pulse';
export const CHECKMARK_CLASS = 'animate-checkmark';

/**
 * Returns true if the user prefers reduced motion.
 * Use sparingly — most motion should be controlled via CSS, not JS.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Build a stagger attribute for ordered reveal animations (1-indexed, max 4).
 */
export function staggerAttr(index: number): { 'data-stagger': string } {
  const clamped = Math.min(Math.max(index, 1), 4);
  return { 'data-stagger': String(clamped) };
}
