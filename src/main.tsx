/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react';
import App from './App';
import './styles/index.css';

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN as string, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string ?? 'https://us.i.posthog.com',
  defaults: '2026-01-30',
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PostHogProvider>
  </StrictMode>
);
