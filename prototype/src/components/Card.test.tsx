/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('passes through HTML attributes (data-*, aria-*)', () => {
    render(
      <Card data-testid="my-card" aria-label="Pricing">
        Body
      </Card>
    );
    const card = screen.getByTestId('my-card');
    expect(card).toHaveAttribute('aria-label', 'Pricing');
  });

  it('applies bordered class when bordered=true', () => {
    render(
      <Card bordered data-testid="c">
        x
      </Card>
    );
    expect(screen.getByTestId('c').className).toContain('border');
  });
});
