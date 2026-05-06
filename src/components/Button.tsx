/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Button — pill-shaped per ablefy cabinet screenshots (Generate Design folder).
 * Variants: primary (green), dark (black for flow CTAs), secondary (white outline),
 * ghost (transparent). Pills are the dominant ablefy button shape.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'dark' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primary text-sidebar shadow-low hover:bg-primary-hover active:bg-primary-active disabled:bg-bg-surface disabled:text-muted disabled:shadow-none',
  dark:
    'bg-black text-white shadow-low hover:bg-ink active:bg-black disabled:bg-bg-canvas disabled:text-soft disabled:shadow-none',
  secondary:
    'bg-bg-surface text-ink hover:bg-border active:bg-border disabled:opacity-50',
  ghost:
    'bg-transparent text-ink hover:bg-bg-surface active:bg-bg-surface disabled:opacity-50',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-10 px-6 text-sm',
  lg: 'h-12 px-8 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps): JSX.Element {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-semibold leading-none rounded-full',
    'transition-colors duration-fast',
    'disabled:cursor-not-allowed',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
