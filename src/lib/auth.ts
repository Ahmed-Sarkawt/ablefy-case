/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Real session auth — HTTP-only cookie (server) + localStorage cache (client).
 *
 * The cookie is the source of truth. localStorage is a fast UX cache for
 * reading userId/name without an extra round-trip on every render.
 *
 * Flow:
 *   signup / login → server sets cookie + returns { userId, name }
 *                  → we cache userId/name in localStorage
 *   useRequireAuth → quick localStorage check, then async server verify
 *   logout         → call /api/auth/logout (clears cookie) + clear cache
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KEY_ID   = 'ablefy.userId';
const KEY_NAME = 'ablefy.userName';

/* ── Local cache helpers ── */

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY_ID);
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY_NAME);
}

export function setSession(userId: string, name: string): void {
  window.localStorage.setItem(KEY_ID, userId);
  window.localStorage.setItem(KEY_NAME, name);
}

function clearLocalCache(): void {
  window.localStorage.removeItem(KEY_ID);
  window.localStorage.removeItem(KEY_NAME);
}

/* ── Server calls ── */

/** Verify cookie with the server. Returns user or null. Syncs local cache. */
export async function verifySession(): Promise<{ userId: string; name: string } | null> {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    if (!r.ok) {
      clearLocalCache();
      return null;
    }
    const data = (await r.json()) as { userId: string; name: string };
    setSession(data.userId, data.name);
    return data;
  } catch {
    return null;
  }
}

/** Invalidate the server session and clear local cache. Fire-and-forget on the API call. */
export function clearSession(): void {
  clearLocalCache();
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  import('./analytics').then(({ resetUser }) => resetUser()).catch(() => {});
}

/* ── Auth hook ── */

/**
 * Redirect to /login when no session is present.
 * Quick local check first, then async server verify.
 */
export function useRequireAuth(): void {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getUserId()) {
      navigate('/login', { replace: true });
      return;
    }
    verifySession().then((user) => {
      if (!user) navigate('/login', { replace: true });
    });
  }, [navigate]);
}
