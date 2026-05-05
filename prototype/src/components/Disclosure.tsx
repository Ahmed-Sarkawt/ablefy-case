/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Disclosure — accessible expand/collapse with chevron and aria-expanded.
 * Smooth height transition; respects prefers-reduced-motion via animations.css.
 */
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

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
        <ChevronDown
          aria-hidden="true"
          size={12}
          strokeWidth={1.5}
          className={`transition-transform duration-fast ${open ? 'rotate-180' : ''}`}
        />
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
