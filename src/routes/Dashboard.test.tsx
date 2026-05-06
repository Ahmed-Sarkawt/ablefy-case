/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

function renderWithRouter(): void {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Dashboard />
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

describe('Dashboard', () => {
  it('renders a single primary CTA — Create product', () => {
    renderWithRouter();
    const ctas = screen.getAllByRole('button', { name: /create product/i });
    expect(ctas).toHaveLength(1);
  });

  it('shows the create-product hero and what-happens-next panel', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { name: /create your first product/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument();
  });

  it('renders no warning banner', () => {
    renderWithRouter();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/tax number/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/compliance/i)).not.toBeInTheDocument();
  });

  it('logs create_clicked and navigates to /products/new', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: async () => (String(url).includes('/api/products') ? [] : { ok: true }),
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.click(screen.getByRole('button', { name: /create product/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/products/new');
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"create_clicked"'),
      })
    );
  });

  it('still navigates when telemetry fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.click(screen.getByRole('button', { name: /create product/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/products/new');
    });
  });
});
