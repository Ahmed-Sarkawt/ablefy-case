/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Tailwind config wired to ablefy design tokens (see src/styles/tokens.css).
 * The principle: never hard-code values here. Read from CSS variables so the
 * tokens.css file is the single source of truth.
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
        },
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        placeholder: 'var(--color-placeholder)',
        border: 'var(--color-border)',
        bg: {
          page: 'var(--color-bg-page)',
          card: 'var(--color-bg-card)',
          surface: 'var(--color-bg-surface)',
          canvas: 'var(--color-bg-canvas)',
        },
        soft: 'var(--color-text-soft)',
        sidebar: 'var(--color-sidebar)',
        warn: { bg: 'var(--color-warn-bg)', border: 'var(--color-warn-border)' },
        error: 'var(--color-error)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        brand: ['"ES Klarheit Grotesk"', 'Inter', 'serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        low: 'var(--shadow-low)',
        med: 'var(--shadow-med)',
        high: 'var(--shadow-high)',
        fab: 'var(--shadow-fab)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
