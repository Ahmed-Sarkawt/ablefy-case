/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from './Signup';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

function renderWithRouter(): void {
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

beforeEach(() => {
  navigate.mockReset();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('Signup', () => {
  it('disables submit button until all fields are valid', async () => {
    renderWithRouter();
    const submit = screen.getByRole('button', { name: /create seller account/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/^Name/), 'Alex');
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/^Email/), 'alex@example.com');
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/^Password/), 'correcthorse');
    expect(submit).toBeEnabled();
  });

  it('does not mark fields invalid before submit (typing only)', async () => {
    renderWithRouter();
    const password = screen.getByLabelText(/^Password/);
    await userEvent.type(password, 'abc');
    expect(password).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders a disabled visual Google button', () => {
    renderWithRouter();
    const btn = screen.getByRole('button', { name: /sign up with google/i });
    expect(btn).toBeDisabled();
  });

  it('submits, persists session, and navigates on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ userId: '11111111-1111-4111-8111-111111111111', name: 'Alex' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/^Name/), 'Alex');
    await userEvent.type(screen.getByLabelText(/^Email/), 'alex@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'correcthorse');
    await userEvent.click(screen.getByRole('button', { name: /create seller account/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
    expect(window.localStorage.getItem('ablefy.userId')).toBe(
      '11111111-1111-4111-8111-111111111111'
    );
    expect(window.localStorage.getItem('ablefy.userName')).toBe('Alex');
  });

  it('shows server error on 409 duplicate email', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Email already used', field: 'email' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/^Name/), 'Alex');
    await userEvent.type(screen.getByLabelText(/^Email/), 'dup@example.com');
    await userEvent.type(screen.getByLabelText(/^Password/), 'correcthorse');
    await userEvent.click(screen.getByRole('button', { name: /create seller account/i }));

    expect(await screen.findByText('Email already used')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
