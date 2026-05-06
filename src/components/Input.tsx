/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Input — labeled text/email/password input per ablefy_design.md.
 * 40px height, 1px border, 8px radius, green soft focus ring, muted label.
 * Required-state asterisk appended to label.
 */
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: ReactNode;
  error?: string;
  /** Visually hide the label (still read by screen readers). */
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, hideLabel = false, id, required, className = '', ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const helperId = helper ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = Boolean(error);

  const inputClasses = [
    'w-full h-12 px-5 text-sm rounded-2xl text-ink',
    'border placeholder:text-placeholder',
    'transition-colors duration-fast outline-none',
    hasError
      ? 'border-error bg-error/5 focus:border-error focus:shadow-[var(--ring-error)]'
      : 'border-border bg-bg-surface focus:border-primary focus:bg-bg-card focus:shadow-[var(--ring-primary)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className,
  ].join(' ');

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={
          hideLabel
            ? 'sr-only'
            : 'text-sm font-medium text-ink'
        }
      >
        {label}
        {required ? <span className="ml-0.5 text-error">*</span> : null}
      </label>
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={inputClasses}
        {...rest}
      />
      {helper && !error ? (
        <p id={helperId} className="text-xs text-muted">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-error"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="flex-shrink-0"
          >
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" fill="none" />
            <path
              d="M6 3.5v3M6 8v0.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
});
