/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * /demo-reset — hidden route for presentation demos.
 * Clears all ablefy localStorage flags and the session cookie,
 * then redirects to /signup so the demo starts completely fresh.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../lib/auth';

export default function DemoReset(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all ablefy-namespaced keys
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('ablefy.'))
      .forEach((k) => window.localStorage.removeItem(k));

    clearSession();
    navigate('/signup', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page">
      <p className="text-sm text-muted">Resetting demo…</p>
    </div>
  );
}
