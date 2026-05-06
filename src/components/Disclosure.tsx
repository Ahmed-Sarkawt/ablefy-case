/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Disclosure — accessible expand/collapse with chevron and aria-expanded.
 * Smooth height transition; respects prefers-reduced-motion via animations.css.
 */
import { useId, useState } from 'react';
import type { ReactNode } from 'react';

interface DisclosureProps {
  /** Trigger label. Can include icons. */
  label: ReactNode;
  /** Content shown when expanded. */
  children: ReactNode;
  /** Start expanded. Defaults to false. */
  defaultOpen?: boolean;
  /** Visual variant — 'default' shows a subtle button, 'plain' is just a text trigger. */
  variant?: 'default' | 'plain';
  className?: string;
}

export function Disclosure({
  label,
  children,
  defaultOpen = false,
  variant = 'default',
  className = '',
}: DisclosureProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const triggerClasses =
    variant === 'default'
      ? 'inline-flex items-center gap-2 px-3 h-9 text-sm font-medium rounded-md border border-border bg-bg-card hover:bg-bg-surface transition-colors duration-fast'
      : 'inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-primary-active transition-colors duration-fast';

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={triggerClasses}
      >
        <span>{label}</span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform duration-fast ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2 4l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className={open ? 'mt-3' : ''}
      >
        {children}
      </div>
    </div>
  );
}
