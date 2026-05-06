/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Card — surface container with token-driven padding/radius/border.
 */
import type { HTMLAttributes, ReactNode } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  bordered?: boolean;
  children: ReactNode;
}

const PADDING_CLASSES: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  padding = 'md',
  bordered = false,
  className = '',
  children,
  ...rest
}: CardProps): JSX.Element {
  const classes = [
    'bg-bg-card rounded-lg shadow-low',
    PADDING_CLASSES[padding],
    bordered ? 'border border-border' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
