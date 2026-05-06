/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * /products/:id/content — stub destination for "Add Course Content".
 * The lesson builder is out of scope for Option 01 per docs/PLAN.md.
 * This screen exists so the navigation chain is complete end-to-end.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CabinetShell } from '../components';
import { useRequireAuth } from '../lib/auth';

export default function ProductsContentPlaceholder(): JSX.Element {
  useRequireAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <CabinetShell title="Course content">
      <Card padding="lg" className="text-center">
        {/* Lesson icon */}
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface"
          aria-hidden="true"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M9 8h6M9 12h6M9 16h4" />
          </svg>
        </div>

        <h1 className="font-brand text-xl font-semibold text-ink">
          Add your first lesson
        </h1>
        <p className="mt-2 text-sm text-muted">
          The lesson builder arrives in the next sprint.
          <br />
          Your draft is saved and ready when you are.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(`/products/${id}/created`)}
            className="!rounded-2xl"
          >
            Back to product
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="!rounded-2xl"
          >
            Back to overview
          </Button>
        </div>
      </Card>
    </CabinetShell>
  );
}
