/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('associates label with input', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows helper text via aria-describedby', () => {
    render(<Input label="Password" helper="Min 8 characters" />);
    const input = screen.getByLabelText('Password');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Min 8 characters').id).toBe(describedBy);
  });

  it('shows error and sets aria-invalid', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('hides helper when error is present', () => {
    render(<Input label="Email" helper="We never share this" error="Required" />);
    expect(screen.queryByText('We never share this')).not.toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('hides label visually when hideLabel is true', () => {
    render(<Input label="Search" hideLabel />);
    const label = screen.getByText('Search');
    expect(label).toHaveClass('sr-only');
  });
});
