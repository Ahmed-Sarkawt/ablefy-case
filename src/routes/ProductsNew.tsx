/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * /products/new — Step 4 of the redesigned flow per docs/FLOW.md.
 *
 * Visible fields:
 *   - Product name *
 *   - Short description *
 *   - Cover image URL (optional + sample helper)
 *   - Payment (summary row → opens PaymentModal to configure)
 *
 * Advanced settings (collapsed):
 *   - Product type, Access & Duration, When unavailable, Position & Limits
 *
 * On submit: POST /api/products → redirects to /products/:id/created.
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Input, Checkbox, Disclosure, Card, CabinetShell,
  PaymentModal, paymentPlanLabel, DEFAULT_PAYMENT_OPTIONS,
} from '../components';
import type { PaymentPlan, PaymentDisplayOptions } from '../components';
import { useRequireAuth, getUserId } from '../lib/auth';
import { apiPost, ApiRequestError } from '../lib/api';
import { MODAL_IN_CLASS } from '../lib/motion';

interface ProductCreated {
  productId: string;
  status: 'draft';
}

interface FieldErrors {
  name?: string;
  description?: string;
  coverImageUrl?: string;
  general?: string;
}

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80';
const NAME_MIN = 3;
const NAME_MAX = 100;
const DESC_MIN = 10;
const DESC_MAX = 500;
const DEFAULT_PAYMENT: PaymentPlan = { type: 'one_time', priceCents: 9700 };

function validate(values: { name: string; description: string; coverImageUrl: string }): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedName = values.name.trim();
  if (trimmedName.length < NAME_MIN) errors.name = `At least ${NAME_MIN} characters`;
  if (trimmedName.length > NAME_MAX) errors.name = `At most ${NAME_MAX} characters`;
  const trimmedDesc = values.description.trim();
  if (trimmedDesc.length < DESC_MIN) errors.description = `At least ${DESC_MIN} characters`;
  if (trimmedDesc.length > DESC_MAX) errors.description = `At most ${DESC_MAX} characters`;
  if (values.coverImageUrl.trim().length > 0) {
    try { new URL(values.coverImageUrl.trim()); }
    catch { errors.coverImageUrl = 'Enter a valid URL'; }
  }
  return errors;
}

export default function ProductsNew(): JSX.Element {
  useRequireAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>(DEFAULT_PAYMENT);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentDisplayOptions>(DEFAULT_PAYMENT_OPTIONS);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currency, setCurrency] = useState('EUR');

  // Advanced settings
  const [productType, setProductType] = useState<'digital' | 'online_course' | 'online_course_recorded'>('online_course');
  const [lifetimeAccess, setLifetimeAccess] = useState(true);
  const [durationMonths, setDurationMonths] = useState('');
  const [unavailableRedirect, setUnavailableRedirect] = useState<'shop' | 'sold_out' | 'another'>('shop');
  const [position, setPosition] = useState('');
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [overallLimit, setOverallLimit] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    const validation = validate({ name, description, coverImageUrl });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const userId = getUserId();
    if (!userId) { navigate('/signup', { replace: true }); return; }

    setSubmitting(true);
    try {
      const res = await apiPost<ProductCreated>('/api/products', {
        userId,
        name: name.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim() || undefined,
        currency,
        paymentConfig: paymentPlan,
        paymentMethods,
        planName: paymentOptions.planName,
        originalPriceCents: paymentOptions.originalPriceCents,
        showNetPrice: paymentOptions.showNetPrice,
        payLaterDueDays: paymentOptions.payLaterDueDays,
        productType,
        lifetimeAccess,
        durationMonths: (!lifetimeAccess && durationMonths.trim()) ? Number(durationMonths) : null,
        unavailableRedirect,
        position: position.trim() ? Number(position) : null,
        overallLimit: limitEnabled && overallLimit.trim() ? Number(overallLimit) : null,
      });
      navigate(`/products/${res.productId}/created`, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const field = err.payload.field;
        if (field === 'name' || field === 'description' || field === 'coverImageUrl') {
          setErrors({ [field]: err.payload.error });
        } else {
          setErrors({ general: err.payload.error });
        }
      } else {
        setErrors({ general: 'Something went wrong. Try again.' });
      }
      setSubmitting(false);
    }
  }

  return (
    <CabinetShell title="Create product">
      <form noValidate onSubmit={onSubmit} className={MODAL_IN_CLASS}>
        <Card padding="lg">
          <header className="mb-6">
            <h2 className="font-brand text-xl font-semibold text-ink sm:text-2xl">New product</h2>
            <p className="mt-1 text-sm text-muted">Save as a draft now and refine the rest later.</p>
          </header>

          <div className="flex flex-col gap-6">
            {/* Name */}
            <Input
              label="Product name"
              required
              autoComplete="off"
              placeholder="AI Influencer Playbook"
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              helper={`${name.trim().length}/${NAME_MAX}`}
            />

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="product-description" className="text-sm font-medium text-ink">
                Short description<span className="ml-0.5 text-error">*</span>
              </label>
              <textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                maxLength={DESC_MAX}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={errors.description ? 'product-description-error' : 'product-description-helper'}
                placeholder="Two or three sentences your audience will see on the checkout page."
                className={[
                  'w-full rounded-2xl border bg-bg-surface px-5 py-3 text-sm text-ink placeholder:text-placeholder',
                  'transition-colors duration-fast outline-none',
                  errors.description
                    ? 'border-error bg-error/5 focus:border-error focus:shadow-[var(--ring-error)]'
                    : 'border-border focus:border-primary focus:bg-bg-card focus:shadow-[var(--ring-primary)]',
                ].join(' ')}
              />
              {errors.description ? (
                <p id="product-description-error" role="alert" className="text-xs font-medium text-error">
                  {errors.description}
                </p>
              ) : (
                <p id="product-description-helper" className="text-xs text-muted">
                  {description.trim().length}/{DESC_MAX}
                </p>
              )}
            </div>

            {/* Cover image */}
            <div className="flex flex-col gap-2">
              <Input
                label="Cover image URL"
                type="url"
                autoComplete="off"
                placeholder="https://"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                error={errors.coverImageUrl}
              />
              <button
                type="button"
                onClick={() => setCoverImageUrl(SAMPLE_IMAGE)}
                className="self-start text-xs font-semibold text-primary-active hover:underline"
              >
                Use a sample image
              </button>
            </div>

            {/* Payment plan */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-ink">
                Payment<span className="ml-0.5 text-error">*</span>
              </p>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-surface px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{paymentPlanLabel(paymentPlan)}</p>
                  <p className="text-xs text-muted capitalize">{paymentPlan.type.replace('_', '-')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="text-sm font-semibold text-primary-active hover:underline"
                  aria-label="Configure payment plan"
                >
                  Configure
                </button>
              </div>
            </div>

            {/* Advanced settings — 3 semantic sections */}
            <Disclosure label="Advanced settings" variant="default">
              <div className="divide-y divide-border rounded-2xl border border-border bg-bg-surface overflow-hidden">

                {/* ── Delivery ── */}
                <div className="p-5 flex flex-col gap-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Delivery</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label htmlFor="product-type" className="text-sm font-medium text-ink">
                        Product type
                      </label>
                      <select
                        id="product-type"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value as typeof productType)}
                        className="h-10 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-ink transition-colors duration-fast focus:border-primary focus:shadow-[var(--ring-primary)] outline-none"
                      >
                        <option value="digital">Digital</option>
                        <option value="online_course">Online Course</option>
                        <option value="online_course_recorded">Online Course (pre-recorded)</option>
                      </select>
                    </div>
                    <Checkbox
                      label="Lifetime access"
                      checked={lifetimeAccess}
                      onChange={(e) => setLifetimeAccess(e.target.checked)}
                      helper="Uncheck to set a time limit."
                    />
                    {!lifetimeAccess && (
                      <Input
                        label="Duration (months)"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="120"
                        placeholder="12"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(e.target.value)}
                        helper="Access expires after this many months."
                      />
                    )}
                  </div>
                </div>

                {/* ── Availability ── */}
                <div className="p-5 flex flex-col gap-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Availability</p>
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <Input
                      label="Position in shop"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="9999"
                      placeholder="Auto"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      helper="Leave blank to auto-sort."
                    />
                    <Checkbox
                      label="Overall limit"
                      checked={limitEnabled}
                      onChange={(e) => { setLimitEnabled(e.target.checked); if (!e.target.checked) setOverallLimit(''); }}
                      helper="Cap total purchases."
                    />
                  </div>
                  {limitEnabled && (
                    <Input
                      label="Max purchases"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="999999"
                      placeholder="100"
                      value={overallLimit}
                      onChange={(e) => setOverallLimit(e.target.value)}
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-ink">When unavailable</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'shop',     label: 'Redirect to shop' },
                        { value: 'sold_out', label: 'Show sold-out' },
                        { value: 'another',  label: 'Redirect to product' },
                      ] as const).map((opt) => (
                        <label key={opt.value} className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                          <input
                            type="radio"
                            name="unavailable-redirect"
                            value={opt.value}
                            checked={unavailableRedirect === opt.value}
                            onChange={() => setUnavailableRedirect(opt.value)}
                            className="h-4 w-4 accent-primary"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Pricing ── */}
                <div className="p-5 flex flex-col gap-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pricing</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="currency" className="text-sm font-medium text-ink">Currency</label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-ink transition-colors duration-fast focus:border-primary focus:shadow-[var(--ring-primary)] outline-none"
                      >
                        <option value="EUR">EUR €</option>
                        <option value="USD">USD $</option>
                        <option value="GBP">GBP £</option>
                      </select>
                    </div>
                    <Input
                      label="Save plan as"
                      autoComplete="off"
                      placeholder="e.g. Monthly starter"
                      value={paymentOptions.planName ?? ''}
                      onChange={(e) => setPaymentOptions({ ...paymentOptions, planName: e.target.value || null })}
                      helper="Name this plan to reuse it on other products."
                      maxLength={100}
                    />
                    <Input
                      label="Original price"
                      type="number"
                      inputMode="numeric"
                      step="10"
                      min="0"
                      placeholder="—"
                      value={paymentOptions.originalPriceCents != null ? String(Math.round(paymentOptions.originalPriceCents / 100)) : ''}
                      onChange={(e) => setPaymentOptions({ ...paymentOptions, originalPriceCents: e.target.value ? Math.round((parseFloat(e.target.value) || 0) * 100) : null })}
                      helper="Crossed-out for discounts"
                    />
                    {paymentMethods.includes('pay_later') && (
                      <Input
                        label="Pay later due date (days)"
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="1"
                        max="365"
                        placeholder="14"
                        value={paymentOptions.payLaterDueDays != null ? String(paymentOptions.payLaterDueDays) : ''}
                        onChange={(e) => setPaymentOptions({ ...paymentOptions, payLaterDueDays: e.target.value ? Math.max(1, parseInt(e.target.value, 10) || 14) : null })}
                        helper="Days until payment is due"
                      />
                    )}
                  </div>
                  <Checkbox
                    label="Show prices without taxes (net)"
                    checked={paymentOptions.showNetPrice}
                    onChange={(e) => setPaymentOptions({ ...paymentOptions, showNetPrice: e.target.checked })}
                    helper="Display net price at checkout instead of gross"
                  />
                </div>

              </div>
            </Disclosure>

            {errors.general && (
              <p role="alert" className="text-sm text-error">{errors.general}</p>
            )}

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/products')} disabled={submitting} className="!rounded-2xl">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="lg" loading={submitting} className="!rounded-2xl">
                {submitting ? 'Saving draft…' : 'Create product'}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Payment modal — rendered outside the form so it floats above everything */}
      <PaymentModal
        open={paymentModalOpen}
        initialPlan={paymentPlan}
        initialMethods={paymentMethods}
        onApply={(plan, methods) => {
          setPaymentPlan(plan);
          setPaymentMethods(methods);
          setPaymentModalOpen(false);
        }}
        onClose={() => setPaymentModalOpen(false)}
      />
    </CabinetShell>
  );
}
