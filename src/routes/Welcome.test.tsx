/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Welcome from './Welcome';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

function renderWithRouter(): void {
  render(
    <MemoryRouter>
      <Welcome />
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

describe('Welcome', () => {
  it('renders personalized greeting and the value-prop sentence', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome, Alex.');
    expect(screen.getByText(/get your first product live/i)).toBeInTheDocument();
  });

  it('exposes both Show-me-how and Skip actions', () => {
    renderWithRouter();
    expect(screen.getByRole('button', { name: /show me how/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('logs welcome_completed with action=tour and navigates on Show me how', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.click(screen.getByRole('button', { name: /show me how/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"action":"tour"'),
      })
    );
  });

  it('logs welcome_completed with action=skip and navigates on Skip', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.click(screen.getByRole('button', { name: /skip/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        body: expect.stringContaining('"action":"skip"'),
      })
    );
  });

  it('still navigates when telemetry POST fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter();
    await userEvent.click(screen.getByRole('button', { name: /skip/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
