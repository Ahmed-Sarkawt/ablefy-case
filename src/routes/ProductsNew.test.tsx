/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProductsNew from './ProductsNew';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

// jsdom doesn't implement <dialog>, stub its methods so tests don't throw.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function renderWithRouter(): void {
  render(
    <MemoryRouter initialEntries={['/products/new']}>
      <ProductsNew />
    </MemoryRouter>
  );
}

beforeEach(() => {
  navigate.mockReset();
  window.localStorage.clear();
  window.localStorage.setItem('ablefy.userId', '11111111-1111-4111-8111-111111111111');
  window.localStorage.setItem('ablefy.userName', 'Alex');
  vi.restoreAllMocks();
});

describe('ProductsNew', () => {
  it('renders the required visible fields', () => {
    renderWithRouter();
    expect(screen.getByLabelText(/^Product name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Short description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Cover image URL/)).toBeInTheDocument();
    // Payment section: summary row + configure button
    expect(screen.getByRole('button', { name: /configure payment plan/i })).toBeInTheDocument();
  });

  it('defaults to a one-time payment plan summary', () => {
    renderWithRouter();
    // The summary row shows "One-time · €97.00"
    expect(screen.getByText(/one-time · €97/i)).toBeInTheDocument();
  });

  it('hides advanced settings by default', () => {
    renderWithRouter();
    const trigger = screen.getByRole('button', { name: /advanced settings/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows inline validation errors on submit when fields are invalid', async () => {
    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/^Product name/), 'ab'); // too short
    await userEvent.click(screen.getByRole('button', { name: /create product/i }));

    expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it('uses the sample image helper to fill the cover URL', async () => {
    renderWithRouter();
    await userEvent.click(screen.getByRole('button', { name: /use a sample image/i }));
    const cover = screen.getByLabelText(/^Cover image URL/);
    expect((cover as HTMLInputElement).value).toMatch(/^https?:\/\//);
  });

  it('submits with paymentConfig and navigates to the success route on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ productId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', status: 'draft' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/^Product name/), 'AI Influencer Playbook');
    await userEvent.type(screen.getByLabelText(/^Short description/), 'A short clear description.');
    await userEvent.click(screen.getByRole('button', { name: /create product/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(
        '/products/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/created',
        { replace: true }
      );
    });
    // Body must include paymentConfig (not the old flat priceCents)
    const productCall = fetchMock.mock.calls.find(
      (c) => (c as [string])[0] === '/api/products'
    ) as [string, { body: string }] | undefined;
    const body = JSON.parse(productCall?.[1]?.body ?? 'null') as Record<string, unknown>;
    expect(body).toHaveProperty('paymentConfig');
    expect((body.paymentConfig as { type: string }).type).toBe('one_time');
    expect(body).not.toHaveProperty('priceCents');
  });
});
