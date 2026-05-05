/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * SetupSteps — 4-step onboarding progress tracker.
 * Steps 1 & 2 are functional in the MVP; 3 & 4 unlock when prior steps are done.
 */
import { Fragment } from 'react';
import { Check } from 'lucide-react';

interface Props {
  hasProducts: boolean;
  step2Done?: boolean;
}

const STEPS = [
  { label: 'Create your product', sub: 'Pick a name and set a price' },
  { label: 'Add content',         sub: 'Upload lessons or files' },
  { label: 'Start selling',       sub: 'Publish to your audience' },
  { label: 'Get paid',            sub: 'Set up your payouts' },
];

export function SetupSteps({ hasProducts, step2Done = false }: Props): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-wider text-muted">Setup progress</p>
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done =
            (i === 0 && hasProducts) ||
            (i === 1 && step2Done);
          const isActive =
            (i === 0 && !hasProducts) ||
            (i === 1 && hasProducts && !step2Done) ||
            (i === 2 && step2Done);

          return (
            <Fragment key={i}>
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-colors ${
                    done
                      ? 'bg-primary text-sidebar'
                      : isActive
                      ? 'border-2 border-primary-active bg-bg-card text-primary-active'
                      : 'bg-bg-surface text-muted/40'
                  }`}
                >
                  {done ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : i + 1}
                </div>
                <span className={`text-center text-[11px] font-semibold leading-tight ${done || isActive ? 'text-ink' : 'text-muted/40'}`}>
                  {step.label}
                </span>
                <span className={`text-center text-[10px] leading-tight ${done || isActive ? 'text-muted' : 'text-muted/30'}`}>
                  {step.sub}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mt-4 h-px flex-shrink-0 self-start ${done ? 'bg-primary' : 'bg-border'}`}
                  style={{ width: '8%', maxWidth: 64 }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

