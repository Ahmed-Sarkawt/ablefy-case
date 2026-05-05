/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * Checkbox — labeled checkbox with optional helper text.
 * Wraps native input for accessibility and keyboard support.
 */
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  helper?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, helper, id, className = '', ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const helperId = helper ? `${inputId}-helper` : undefined;

  return (
    <div className={`flex gap-3 ${className}`}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        aria-describedby={helperId}
        className="mt-0.5 h-4 w-4 rounded-sm border-[1.5px] border-border accent-primary cursor-pointer"
        {...rest}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm text-ink leading-snug cursor-pointer">
          {label}
        </label>
        {helper ? (
          <p id={helperId} className="text-xs text-muted">
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  );
});
