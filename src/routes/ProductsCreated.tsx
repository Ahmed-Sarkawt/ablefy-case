/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * /products/:id/created — Step 5 per docs/FLOW.md.
 *
 * Animations (cross-browser, prefers-reduced-motion-safe):
 *   - success-pulse wraps the card (scale 1→1.03→1, 400ms)
 *   - checkmark draw-in via stroke-dashoffset on the SVG path (300ms)
 *
 * Primary CTA: "Add Course Content" → /products/:id/content
 * Secondary: "More options" disclosure — Edit product page · Customize
 *   checkout · Set up delivery (the three actions from the current
 *   post-creation screen, demoted from equal weight to secondary).
 *
 * Records `post_creation_action` event for every CTA click.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CabinetShell, SetupSteps } from '../components';
import { useRequireAuth, getUserId } from '../lib/auth';
import { recordEvent } from '../lib/events';
import { SUCCESS_PULSE_CLASS, CHECKMARK_CLASS } from '../lib/motion';

interface ProductSummary {
  id: string;
  name: string;
  status: string;
}


export default function ProductsCreated(): JSX.Element {
  useRequireAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? (r.json() as Promise<ProductSummary>) : Promise.reject()))
      .then((data) => setProductName(data.name))
      .catch(() => {
        // Non-blocking — generic fallback renders while or if fetch fails.
      });
  }, [id]);

  function fireAction(action: string): void {
    const userId = getUserId();
    if (userId && id) {
      recordEvent(userId, 'post_creation_action', { action, productId: id });
    }
  }

  return (
    <CabinetShell title="Product created">
      <div className={SUCCESS_PULSE_CLASS}>
        <Card padding="lg" className="text-center">
          {/* Animated checkmark circle */}
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface"
            aria-hidden="true"
          >
            <svg
              className={CHECKMARK_CLASS}
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary-active)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12l5 5L20 7" />
            </svg>
          </div>

          <h1 className="font-brand text-2xl font-semibold text-ink">
            🎉 {productName ?? 'Your product'} is ready
          </h1>
          <p className="mt-2 text-sm text-muted">
            Now add your course content. You can publish whenever you&apos;re ready.
          </p>

          {/* Primary action */}
          <div className="mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                fireAction('add_content');
                navigate(`/products/${id}?tab=content`);
              }}
              className="!rounded-2xl w-full sm:w-auto"
            >
              Add Course Content
            </Button>
          </div>

          {/* What's next */}
          <div className="mt-8 text-left">
            <SetupSteps
              hasProducts={true}
              step2Done={window.localStorage.getItem('ablefy.step2_done') === '1'}
            />
          </div>
        </Card>
      </div>
    </CabinetShell>
  );
}
