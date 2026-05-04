/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * /welcome — Step 2 of the redesigned flow per docs/FLOW.md.
 * Personalized greeting, one-sentence value prop, two paths:
 * "Show me how" (tour) and "Skip — I'll figure it out" (skip).
 * Both advance to /dashboard. Logs welcome_completed with action attribute.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components';
import { useRequireAuth, getUserId, getUserName } from '../lib/auth';
import { apiPost } from '../lib/api';

type Action = 'tour' | 'skip';

export default function Welcome(): JSX.Element {
  useRequireAuth();
  const navigate = useNavigate();
  const name = getUserName() ?? 'there';
  const [advancing, setAdvancing] = useState<Action | null>(null);

  async function advance(action: Action): Promise<void> {
    if (advancing) return;
    setAdvancing(action);
    const userId = getUserId();
    if (userId) {
      apiPost('/api/events', {
        userId,
        eventType: 'welcome_completed',
        attributes: { action },
      }).catch(() => {
        // Telemetry failure must not block the flow.
      });
    }
    navigate('/dashboard', { replace: true });
  }

  return (
    <main className="min-h-screen bg-bg-canvas text-soft">
      <header className="px-6 sm:px-10 pt-8 pb-6">
        <img src="/ablefy-logo-dark.svg" alt="ablefy" className="h-8 w-auto" />
      </header>

      <section className="flex flex-1 items-center justify-center px-6 pb-20 pt-6 sm:px-10">
        <div className="w-full max-w-xl text-center">
          <h1 className="font-brand text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Welcome, {name}.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Let&apos;s get your first product live.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => void advance('tour')}
              loading={advancing === 'tour'}
              disabled={advancing !== null}
              className="!rounded-2xl"
            >
              Show me how
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => void advance('skip')}
              loading={advancing === 'skip'}
              disabled={advancing !== null}
              className="!rounded-2xl"
            >
              Skip — I&apos;ll figure it out
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
