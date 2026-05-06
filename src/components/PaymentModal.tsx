/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * PaymentModal — pick and configure a payment plan + accepted payment methods.
 *
 * Five plans, each with its own settings (2-col grid):
 *   Free          — no fields
 *   One-time      — price
 *   Installment   — total, count, interval, first payment
 *   Subscription  — price per period, trial, interval, first payment
 *   Limited       — price per payment, count, interval, first payment
 *
 * "First payment" is a separate amount for the initial charge only.
 * Leave blank to charge the same as the regular amount.
 *
 * Below plan settings: 9-option payment method selector (3-col grid).
 *
 * Fixed 600px height — no UI shift when switching plans.
 * Uses <dialog> for native focus-trapping and Escape handling.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Button, Input } from './index';

export type PaymentInterval = 'weekly' | 'monthly' | 'yearly';

export type PaymentPlan =
  | { type: 'free' }
  | { type: 'one_time'; priceCents: number }
  | { type: 'installment'; totalCents: number; count: number; interval: PaymentInterval; firstPaymentCents: number | null }
  | { type: 'subscription'; priceCents: number; interval: PaymentInterval; trialDays: number | null; firstPaymentCents: number | null }
  | { type: 'limited'; priceCents: number; count: number; interval: PaymentInterval; firstPaymentCents: number | null };

export interface PaymentDisplayOptions {
  planName: string | null;
  originalPriceCents: number | null;
  showNetPrice: boolean;
  payLaterDueDays: number | null;
}

export const DEFAULT_PAYMENT_OPTIONS: PaymentDisplayOptions = {
  planName: null,
  originalPriceCents: null,
  showNetPrice: false,
  payLaterDueDays: null,
};

interface PlanMeta {
  type: PaymentPlan['type'];
  label: string;
  hint: string;
}

interface MethodMeta {
  id: string;
  label: string;
}

const PLAN_META: PlanMeta[] = [
  { type: 'free',         label: 'Free',         hint: 'No charge' },
  { type: 'one_time',     label: 'One-time',     hint: 'Charged once' },
  { type: 'installment',  label: 'Installment',  hint: 'Split into payments' },
  { type: 'subscription', label: 'Subscription', hint: 'Recurring billing' },
  { type: 'limited',      label: 'Limited',      hint: 'Fixed number of charges' },
];

const PAYMENT_METHODS: MethodMeta[] = [
  { id: 'paypal',      label: 'PayPal' },
  { id: 'card',        label: 'Credit card' },
  { id: 'bank_wire',   label: 'Bank wire' },
  { id: 'sepa',        label: 'SEPA' },
  { id: 'pay_later',   label: 'Pay later' },
  { id: 'p24',         label: 'Przelewy24' },
  { id: 'apple_pay',   label: 'Apple Pay' },
  { id: 'google_pay',  label: 'Google Pay' },
  { id: 'ideal',       label: 'iDEAL' },
];

const INTERVALS: { value: PaymentInterval; label: string }[] = [
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly' },
];

export interface PaymentModalProps {
  open: boolean;
  initialPlan: PaymentPlan;
  initialMethods: string[];
  onApply: (plan: PaymentPlan, methods: string[]) => void;
  onClose: () => void;
}

export function PaymentModal({
  open, initialPlan, initialMethods, onApply, onClose,
}: PaymentModalProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [plan, setPlan] = useState<PaymentPlan>(initialPlan);
  const [methods, setMethods] = useState<string[]>(initialMethods);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      setPlan(initialPlan);
      setMethods(initialMethods);
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open, initialPlan, initialMethods]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); };
    el.addEventListener('cancel', onCancel);
    return () => el.removeEventListener('cancel', onCancel);
  }, [onClose]);

  function selectType(type: PaymentPlan['type']): void {
    const prev = plan;
    const prevFirst = 'firstPaymentCents' in prev ? prev.firstPaymentCents : null;
    const prevInterval = 'interval' in prev ? prev.interval : 'monthly';
    switch (type) {
      case 'free':
        setPlan({ type: 'free' });
        break;
      case 'one_time':
        setPlan({ type: 'one_time', priceCents: prev.type === 'one_time' ? prev.priceCents : 9700 });
        break;
      case 'installment':
        setPlan({
          type: 'installment',
          totalCents: prev.type === 'installment' ? prev.totalCents : 29700,
          count:      prev.type === 'installment' ? prev.count      : 3,
          interval:   prevInterval,
          firstPaymentCents: prevFirst,
        });
        break;
      case 'subscription':
        setPlan({
          type: 'subscription',
          priceCents: 'priceCents' in prev && prev.type !== 'one_time' ? prev.priceCents : 2700,
          interval:   prevInterval,
          trialDays:  null,
          firstPaymentCents: prevFirst,
        });
        break;
      case 'limited':
        setPlan({
          type: 'limited',
          priceCents: 'priceCents' in prev ? prev.priceCents : 9700,
          count:      (prev.type === 'installment' || prev.type === 'limited') ? prev.count : 3,
          interval:   prevInterval,
          firstPaymentCents: prevFirst,
        });
        break;
    }
  }

  function toggleMethod(id: string): void {
    setMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function euros(cents: number) { return String(Math.round(cents / 100)); }
  function fromStr(s: string) { return Math.round((parseFloat(s) || 0) * 100); }

  return (
    <dialog
      ref={dialogRef}
      className="flex flex-col w-full max-w-lg h-[720px] rounded-2xl border-0 bg-bg-card shadow-high overflow-hidden outline-none"
      aria-labelledby="pm-title"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <h2 id="pm-title" className="font-brand text-lg font-semibold text-ink">
          Payment plan
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close payment plan dialog"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-muted transition-colors hover:bg-bg-surface hover:text-ink"
        >
          ✕
        </button>
      </div>

      {/* Plan grid — 2 columns */}
      <div className="shrink-0 px-6 pt-4 pb-2">
        <div role="group" aria-label="Payment plan type" className="grid grid-cols-2 gap-2">
          {PLAN_META.map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => selectType(p.type)}
                aria-pressed={plan.type === p.type}
                className={[
                'flex flex-col rounded-xl border px-4 py-2.5 text-left transition-colors w-full',
                plan.type === p.type
                  ? 'border-primary bg-primary/10 text-ink'
                  : 'border-border bg-bg-surface text-ink hover:border-primary/40 hover:bg-bg-canvas',
              ].join(' ')}
            >
              <span className="text-sm font-semibold">{p.label}</span>
              <span className="text-xs text-muted">{p.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable settings area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-6">

        {/* Plan-specific settings */}
        {plan.type === 'free' && (
          <p className="rounded-xl bg-bg-surface px-4 py-3 text-sm text-muted">
            Students access this product for free. No charge applied at checkout.
          </p>
        )}

        {plan.type === 'one_time' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Price"
                type="number"
                inputMode="numeric"
                step="10"
                min="0"
                required
                value={euros(plan.priceCents)}
                onChange={(e) => setPlan({ ...plan, priceCents: fromStr(e.target.value) })}
                helper="EUR · charged once at purchase"
              />
            </div>
          </div>
        )}

        {plan.type === 'installment' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total price"
              type="number"
              inputMode="numeric"
              step="10"
              min="0"
              required
              value={euros(plan.totalCents)}
              onChange={(e) => setPlan({ ...plan, totalCents: fromStr(e.target.value) })}
              helper="Total across all installments"
            />
            <Input
              label="Number of installments"
              type="number"
              inputMode="numeric"
              step="1"
              min="2"
              max="36"
              required
              value={String(plan.count)}
              onChange={(e) =>
                setPlan({ ...plan, count: Math.max(2, parseInt(e.target.value, 10) || 2) })
              }
            />
            <IntervalSelect value={plan.interval} onChange={(v) => setPlan({ ...plan, interval: v })} />
            <Input
              label="First payment"
              type="number"
              inputMode="numeric"
              step="10"
              min="0"
              placeholder={euros(Math.round(plan.totalCents / plan.count))}
              value={plan.firstPaymentCents != null ? euros(plan.firstPaymentCents) : ''}
              onChange={(e) =>
                setPlan({ ...plan, firstPaymentCents: e.target.value ? fromStr(e.target.value) : null })
              }
              helper="Blank = same as each installment"
            />
            <div className="col-span-2 rounded-xl bg-bg-surface px-4 py-2.5 text-sm text-muted">
              Amount per payment:{' '}
              <span className="font-semibold text-ink">
                €{parseFloat((plan.totalCents / plan.count / 100).toFixed(2))}
              </span>
            </div>
          </div>
        )}

        {plan.type === 'subscription' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price per period"
              type="number"
              inputMode="numeric"
              step="10"
              min="0"
              required
              value={euros(plan.priceCents)}
              onChange={(e) => setPlan({ ...plan, priceCents: fromStr(e.target.value) })}
              helper="Charged each billing cycle"
            />
            <Input
              label="Trial period (days)"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              max="365"
              placeholder="No trial"
              value={plan.trialDays != null ? String(plan.trialDays) : ''}
              onChange={(e) => {
                const s = e.target.value.trim();
                setPlan({ ...plan, trialDays: s ? Math.max(0, parseInt(s, 10) || 0) : null });
              }}
              helper="Leave blank for no trial"
            />
            <IntervalSelect value={plan.interval} onChange={(v) => setPlan({ ...plan, interval: v })} />
            <Input
              label="First payment"
              type="number"
              inputMode="numeric"
              step="10"
              min="0"
              placeholder={euros(plan.priceCents)}
              value={plan.firstPaymentCents != null ? euros(plan.firstPaymentCents) : ''}
              onChange={(e) =>
                setPlan({ ...plan, firstPaymentCents: e.target.value ? fromStr(e.target.value) : null })
              }
              helper="Blank = same as regular price"
            />
          </div>
        )}

        {plan.type === 'limited' && (
          <div className="grid grid-cols-2 gap-4">
            <p className="col-span-2 text-xs text-muted">
              Customer is charged a fixed amount for a limited number of billing cycles, then access ends.
            </p>
            <Input
              label="Amount per payment"
              type="number"
              inputMode="numeric"
              step="10"
              min="0"
              required
              value={euros(plan.priceCents)}
              onChange={(e) => setPlan({ ...plan, priceCents: fromStr(e.target.value) })}
              helper={`Total: €${Math.round(plan.priceCents * plan.count / 100)}`}
            />
            <Input
              label="Number of payments"
              type="number"
              inputMode="numeric"
              step="1"
              min="2"
              max="36"
              required
              value={String(plan.count)}
              onChange={(e) =>
                setPlan({ ...plan, count: Math.max(2, parseInt(e.target.value, 10) || 2) })
              }
            />
            <IntervalSelect value={plan.interval} onChange={(v) => setPlan({ ...plan, interval: v })} />
            <Input
              label="First payment"
              type="number"
              inputMode="numeric"
              step="10"
              min="0"
              placeholder={euros(plan.priceCents)}
              value={plan.firstPaymentCents != null ? euros(plan.firstPaymentCents) : ''}
              onChange={(e) =>
                setPlan({ ...plan, firstPaymentCents: e.target.value ? fromStr(e.target.value) : null })
              }
              helper="Blank = same as regular amount"
            />
          </div>
        )}

        {/* Payment methods — always shown */}
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Accepted payment methods
          </p>
          <div className="grid grid-cols-3 gap-x-3 gap-y-2">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-ink"
              >
                <input
                  type="checkbox"
                  checked={methods.includes(m.id)}
                  onChange={() => toggleMethod(m.id)}
                  className="h-4 w-4 accent-primary"
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Footer — always pinned */}
      <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
        <Button type="button" variant="secondary" onClick={onClose} className="!rounded-2xl">
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => onApply(plan, methods)}
          className="!rounded-2xl"
        >
          Apply
        </Button>
      </div>
    </dialog>
  );
}

function IntervalSelect({
  value,
  onChange,
}: {
  value: PaymentInterval;
  onChange: (v: PaymentInterval) => void;
}): JSX.Element {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink" htmlFor={id}>
        Billing interval
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as PaymentInterval)}
        className="h-10 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:shadow-[var(--ring-primary)]"
      >
        {INTERVALS.map((i) => (
          <option key={i.value} value={i.value}>{i.label}</option>
        ))}
      </select>
    </div>
  );
}

/** Short human-readable summary for the main form display. */
export function paymentPlanLabel(plan: PaymentPlan): string {
  switch (plan.type) {
    case 'free':
      return 'Free';
    case 'one_time':
      return `One-time · €${Math.round(plan.priceCents / 100)}`;
    case 'installment':
      return `${plan.count} × €${parseFloat((plan.totalCents / plan.count / 100).toFixed(2))} · ${plan.interval}`;
    case 'subscription':
      return `€${Math.round(plan.priceCents / 100)}/${plan.interval}${plan.trialDays ? ` · ${plan.trialDays}d trial` : ''}`;
    case 'limited':
      return `${plan.count} × €${Math.round(plan.priceCents / 100)}/${plan.interval}`;
  }
}
