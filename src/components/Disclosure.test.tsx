/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Disclosure } from './Disclosure';

describe('Disclosure', () => {
  it('starts collapsed by default with hidden panel', () => {
    render(
      <Disclosure label="More options">
        <p>Hidden content</p>
      </Disclosure>
    );
    const trigger = screen.getByRole('button', { name: /more options/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Hidden content').parentElement).toHaveAttribute('hidden');
  });

  it('expands when defaultOpen is true', () => {
    render(
      <Disclosure label="More" defaultOpen>
        <p>Visible</p>
      </Disclosure>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles on click and updates aria-expanded', async () => {
    render(
      <Disclosure label="Advanced">
        <p>Settings</p>
      </Disclosure>
    );
    const trigger = screen.getByRole('button', { name: /advanced/i });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('wires aria-controls to the panel id', () => {
    render(
      <Disclosure label="Open">
        <p>Body</p>
      </Disclosure>
    );
    const trigger = screen.getByRole('button');
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toBeTruthy();
  });
});
