/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('associates label with input', () => {
    render(<Checkbox label="Subscribe" />);
    expect(screen.getByLabelText('Subscribe')).toBeInTheDocument();
  });

  it('toggles checked state on click', async () => {
    render(<Checkbox label="Agree" />);
    const cb = screen.getByLabelText('Agree') as HTMLInputElement;
    expect(cb.checked).toBe(false);
    await userEvent.click(cb);
    expect(cb.checked).toBe(true);
  });

  it('renders helper text', () => {
    render(<Checkbox label="Newsletter" helper="Weekly tips." />);
    expect(screen.getByText('Weekly tips.')).toBeInTheDocument();
  });
});
