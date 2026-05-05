/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * /dashboard — Step 3 of the redesigned flow per docs/FLOW.md.
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Card, Button, CabinetShell, SetupSteps } from '../components';
import { useRequireAuth, getUserId, getUserName } from '../lib/auth';
import { apiPost } from '../lib/api';
import { track } from '../lib/analytics';
import { REVEAL_CLASS, staggerAttr } from '../lib/motion';

interface Shortcut { label: string; description: string; icon: JSX.Element; to: string }

const SHORTCUTS: Shortcut[] = [
  { label: 'Market & Sell',  description: 'Funnels and promotions', icon: <IconMegaphone />, to: '/products' },
  { label: 'Customers',      description: 'Manage your buyers',     icon: <IconUsers />,     to: '/products' },
  { label: 'Analytics',      description: 'Sales and conversions',  icon: <IconBarChart />,  to: '/products' },
];

const PRODUCT_UPDATES = [
  {
    id: '1',
    icon: '🚀',
    title: 'AI Course Builder — now in beta',
    body: 'Generate a full course outline from a single prompt. Saves hours of planning. Available on Pro and above.',
    tag: 'New',
    date: 'May 2026',
  },
  {
    id: '2',
    icon: '💳',
    title: 'Apple Pay & Google Pay enabled globally',
    body: 'Checkout conversion uplift of ~18% in early tests. Automatically enabled for all active storefronts.',
    tag: 'Improvement',
    date: 'Apr 2026',
  },
  {
    id: '3',
    icon: '📊',
    title: 'New analytics dashboard',
    body: 'Revenue attribution, funnel drop-off, and student completion rates — all in one place.',
    tag: 'New',
    date: 'Apr 2026',
  },
];

const CONVERSION_POINTS = [1.8, 2.1, 1.9, 2.4, 2.8, 3.0, 3.2];
const PAYMENT_POINTS    = [80, 140, 110, 195, 170, 220, 249];

export default function Dashboard(): JSX.Element {
  useRequireAuth();
  const navigate = useNavigate();
  const name = getUserName() ?? 'there';

  const [products, setProducts] = useState<Array<{ id: string; status: string }>>([]);
  const [publishing, setPublishing] = useState(false);
  const [step2Done, setStep2Done] = useState(
    () => window.localStorage.getItem('ablefy.step2_done') === '1'
  );
  const [showModal, setShowModal] = useState(
    () => window.localStorage.getItem('ablefy.onboarding_done') !== '1'
  );

  // Re-read step2_done when tab regains focus (user may have added content in another view)
  useEffect(() => {
    function onFocus(): void {
      setStep2Done(window.localStorage.getItem('ablefy.step2_done') === '1');
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    fetch(`/api/products?userId=${userId}`)
      .then((r) => (r.ok ? (r.json() as Promise<Array<{ id: string; status: string }>>) : Promise.reject()))
      .then(setProducts)
      .catch(() => {});
  }, []);

  async function publishProduct(): Promise<void> {
    const pid = products[0]?.id;
    if (!pid || publishing) return;
    setPublishing(true);
    try {
      await fetch(`/api/products/${pid}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'published' }),
      });
      setProducts((prev) => prev.map((p) => p.id === pid ? { ...p, status: 'published' } : p));
    } finally {
      setPublishing(false);
    }
  }

  function dismissModal(newProductId?: string): void {
    window.localStorage.setItem('ablefy.onboarding_done', '1');
    if (newProductId) setProducts((prev) => [...prev, { id: newProductId, status: 'draft' }]);
    setShowModal(false);
  }

  function onCreate(): void {
    const userId = getUserId();
    if (userId) {
      apiPost('/api/events', {
        userId,
        eventType: 'create_clicked',
        attributes: { surface: 'dashboard' },
      }).catch(() => {});
    }
    navigate('/products/new');
  }

  return (
    <CabinetShell title="Overview">
      {/* Onboarding modal overlay */}
      {showModal && <OnboardingModal name={name} onDone={dismissModal} />}

      {/* Greeting */}
      <div className={REVEAL_CLASS} {...staggerAttr(1)}>
        <p className="text-sm text-muted">Welcome back, {name}.</p>
      </div>

      {/* Setup steps */}
      <div className={`mt-4 ${REVEAL_CLASS}`} {...staggerAttr(2)}>
        <SetupSteps hasProducts={products.length > 0} step2Done={step2Done} />
      </div>

      {/* Hero CTA + context — reflects the active step */}
      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {products.length === 0 ? (
          /* Step 1: create a product */
          <>
            <Card padding="lg" className={`flex flex-col justify-between ${REVEAL_CLASS}`} {...staggerAttr(3)}>
              <div>
                <h2 className="font-brand text-xl font-semibold text-ink sm:text-2xl">Create your first product.</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Pick a name, set a price, and you&apos;re live. You can refine everything later — nothing is locked in.
                </p>
              </div>
              <div className="mt-6">
                <Button variant="primary" size="lg" onClick={onCreate} className="!rounded-2xl">Create product</Button>
              </div>
            </Card>
            <Card padding="lg" className={`flex flex-col justify-between ${REVEAL_CLASS}`} {...staggerAttr(3)}>
              <div>
                <h3 className="font-brand text-base font-semibold text-ink">What happens next</h3>
                <ol className="mt-3 flex flex-col gap-2 text-sm text-muted">
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">1.</span><span>Name it and set a price.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">2.</span><span>Save as a draft — only you can see it.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">3.</span><span>Add content and publish whenever you&apos;re ready.</span></li>
                </ol>
              </div>
              <p className="mt-4 text-xs text-muted">Average time: under 2 minutes.</p>
            </Card>
          </>
        ) : !step2Done ? (
          /* Step 2: add content */
          <>
            <Card padding="lg" className={`flex flex-col justify-between ${REVEAL_CLASS}`} {...staggerAttr(3)}>
              <div>
                <h2 className="font-brand text-xl font-semibold text-ink sm:text-2xl">Add content to your product.</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Build your lessons, upload videos, and organise your modules. You can publish whenever you&apos;re ready.
                </p>
              </div>
              <div className="mt-6">
                <Button variant="primary" size="lg" onClick={() => navigate(`/products/${products[0]?.id}?tab=content`)} className="!rounded-2xl">
                  Add course content
                </Button>
              </div>
            </Card>
            <Card padding="lg" className={`flex flex-col justify-between ${REVEAL_CLASS}`} {...staggerAttr(3)}>
              <div>
                <h3 className="font-brand text-base font-semibold text-ink">What to add</h3>
                <ol className="mt-3 flex flex-col gap-2 text-sm text-muted">
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">1.</span><span>Create modules to organise your lessons.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">2.</span><span>Upload videos, PDFs, or write text lessons.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">3.</span><span>Publish when you&apos;re happy with the content.</span></li>
                </ol>
              </div>
            </Card>
          </>
        ) : (
          /* Step 3: publish */
          <>
            <Card padding="lg" className={`flex flex-col justify-between ${REVEAL_CLASS}`} {...staggerAttr(3)}>
              <div>
                {products[0]?.status === 'published' ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary-active">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-active" /> Live
                    </span>
                    <h2 className="mt-3 font-brand text-xl font-semibold text-ink sm:text-2xl">Your product is live!</h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                      Share your link and start selling. Track orders in Payments and engage students in Community.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="font-brand text-xl font-semibold text-ink sm:text-2xl">You&apos;re ready to go live.</h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                      Your product has content. Hit publish and share your link — your audience can start buying right now.
                    </p>
                  </>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                {products[0]?.status === 'published' ? (
                  <Button variant="secondary" size="lg" onClick={() => navigate(`/products/${products[0]?.id}`)} className="!rounded-2xl">
                    View product
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" loading={publishing} onClick={() => void publishProduct()} className="!rounded-2xl">
                    {publishing ? 'Publishing…' : 'Publish product'}
                  </Button>
                )}
              </div>
            </Card>
            <Card padding="lg" className={`flex flex-col justify-between ${REVEAL_CLASS}`} {...staggerAttr(3)}>
              <div>
                <h3 className="font-brand text-base font-semibold text-ink">Before you publish</h3>
                <ol className="mt-3 flex flex-col gap-2 text-sm text-muted">
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">1.</span><span>Preview your checkout page.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">2.</span><span>Set a cover image and final description.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-primary-active">3.</span><span>Share your product link on social.</span></li>
                </ol>
              </div>
              <p className="mt-4 text-xs text-muted">You can unpublish at any time.</p>
            </Card>
          </>
        )}
      </div>

      {/* ── Quick access shortcuts ── */}
      <div className={`mt-6 ${REVEAL_CLASS}`} {...staggerAttr(4)}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Quick access</p>
        <ul className="grid grid-cols-3 gap-3">
          {SHORTCUTS.map(({ label, description, icon, to }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => navigate(to)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3.5 text-left transition-colors hover:bg-bg-surface"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar text-white">
                  {icon}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{label}</p>
                  <p className="text-[11px] text-muted">{description}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Analytics ── */}
      <div className={`mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 ${REVEAL_CLASS}`} {...staggerAttr(5)}>
        {/* Conversion rate */}
        <Card padding="lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Conversion rate
              </h2>
              <p className="mt-1 font-brand text-3xl font-semibold text-ink">3.2%</p>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-active">
                <IconTrendUp /> +0.4% this month
              </span>
              <p className="mt-1 text-xs text-muted">42 sales · 30 days</p>
            </div>
            <Sparkline data={CONVERSION_POINTS} color="var(--color-primary-active)" />
          </div>
          <div className="mt-4 flex gap-4 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary-active" /> Conversion rate 3.2%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-border" /> Sales 42
            </span>
          </div>
        </Card>

        {/* Incoming payments */}
        <Card padding="lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Incoming payments
              </h2>
              <p className="mt-1 font-brand text-3xl font-semibold text-ink">€1,249.00</p>
              <p className="mt-1 text-xs text-muted">17 transactions · 30 days</p>
              <button type="button" className="mt-2 text-[11px] font-medium text-primary-active hover:underline">
                All payment plans ↓
              </button>
            </div>
            <Sparkline data={PAYMENT_POINTS} color="var(--color-primary-active)" />
          </div>
          <div className="mt-4 flex gap-4 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary-active" /> Amount €1,249
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-border" /> Count 17
            </span>
          </div>
        </Card>
      </div>

      {/* ── Community promo ── */}
      <div className={`mt-5 ${REVEAL_CLASS}`} {...staggerAttr(6)}>
        <Card padding="lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary-active">
                Free for ablefy paid plans
              </span>
              <h2 className="mt-3 font-brand text-xl font-semibold text-ink">
                Build a thriving community around your online course
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Community is available on eligible ablefy plans. Connect once with SSO and start engaging members in minutes.
              </p>
              <div className="mt-4">
                <Button variant="primary" size="md" className="!rounded-2xl">
                  Build your community
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Essential 3.0', 'Advanced 3.0', 'Pro 3.0', 'Premium 3.0'].map((plan) => (
                  <span key={plan} className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    {plan}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted">Included at no additional cost for the plans above.</p>
            </div>
            {/* Community preview graphic */}
            <div className="flex-shrink-0">
              <CommunityGraphic />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Product updates ── */}
      <div className={`mt-5 ${REVEAL_CLASS}`} {...staggerAttr(7)}>
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-brand text-base font-semibold text-ink">Product updates</h2>
              <p className="mt-0.5 text-sm text-muted">Stay in the loop with our latest updates 🎉</p>
            </div>
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary-active">3 new</span>
          </div>
          <ul className="mt-4 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
            {PRODUCT_UPDATES.map((u) => (
              <li key={u.id} className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-bg-surface">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar text-base">
                  {u.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-ink">{u.title}</p>
                    {u.tag && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary-active">{u.tag}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{u.body}</p>
                </div>
                <span className="flex-shrink-0 text-[11px] text-muted">{u.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </CabinetShell>
  );
}

/* ── Onboarding Modal ── */

type ModalStep = 'welcome' | 'create-product' | 'add-content';

function OnboardingModal({
  name,
  onDone,
}: {
  name: string;
  onDone: (newProductId?: string) => void;
}): JSX.Element {
  const navigate = useNavigate();
  const [step, setStep] = useState<ModalStep>('welcome');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [productType, setProductType] = useState<'online_course' | 'digital' | 'online_course_recorded'>('online_course');
  const [creating, setCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string; general?: string }>({});
  const [newProductId, setNewProductId] = useState('');

  async function createProduct(): Promise<void> {
    const userId = getUserId();
    if (!userId) return;
    const trimName = productName.trim();
    const trimDesc = description.trim();
    const errs: typeof fieldErrors = {};
    if (trimName.length < 3)  errs.name = 'At least 3 characters required.';
    if (trimDesc.length < 10) errs.description = 'At least 10 characters required.';
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    const priceVal = parseFloat(priceInput);
    const priceCents = isNaN(priceVal) || priceVal <= 0 ? 0 : Math.round(priceVal * 100);
    const paymentConfig = priceCents === 0
      ? { type: 'free' as const }
      : { type: 'one_time' as const, priceCents };

    setCreating(true);
    setFieldErrors({});
    try {
      const res = await apiPost<{ productId: string }>('/api/products', {
        userId,
        name: trimName,
        description: trimDesc,
        currency: 'EUR',
        paymentConfig,
        paymentMethods: [],
        productType,
      });
      setNewProductId(res.productId);
      track('product_created', { productId: res.productId, productType, priceCents });
      setStep('add-content');
    } catch {
      setFieldErrors({ general: 'Could not create product. Please try again.' });
    } finally {
      setCreating(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-page) 55%, transparent)' }}
    >
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-card shadow-fab">

        {/* Step: welcome */}
        {step === 'welcome' && (
          <div className="p-8 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Getting started</p>
            <h2 className="mt-3 font-brand text-2xl font-semibold text-ink">
              Welcome, {name}.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Let&apos;s get your first product live. It takes under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => { track('onboarding_started'); setStep('create-product'); }}
                className="w-full rounded-xl bg-sidebar px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-sidebar/90"
              >
                Show me how →
              </button>
              <button
                type="button"
                onClick={() => { track('onboarding_skipped'); onDone(); }}
                className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-bg-surface"
              >
                Skip — I&apos;ll figure it out
              </button>
            </div>
          </div>
        )}

        {/* Step: create product form */}
        {step === 'create-product' && (
          <div className="p-8">
            <h2 className="font-brand text-xl font-semibold text-ink">Create your first product</h2>
            <p className="mt-1 text-[13px] text-muted">You can edit everything later.</p>
            <div className="mt-6 space-y-4">
              {/* Product name */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Product name <span className="text-error" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Content Creator Course"
                  value={productName}
                  onChange={(e) => { setProductName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                  className={`w-full rounded-lg border px-4 py-2.5 text-[13px] text-ink placeholder-placeholder focus:outline-none focus-visible:ring-2 ${fieldErrors.name ? 'border-error bg-error/5 focus-visible:ring-error/30' : 'border-border bg-bg-card focus-visible:ring-primary/30'}`}
                />
                {fieldErrors.name && <p role="alert" className="mt-1 text-[11px] text-error">{fieldErrors.name}</p>}
              </div>

              {/* Product type */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as typeof productType)}
                  className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <option value="online_course">Online Course</option>
                  <option value="online_course_recorded">Online Course (pre-recorded)</option>
                  <option value="digital">Digital download</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Description <span className="text-error" aria-hidden="true">*</span>
                </label>
                <textarea
                  placeholder="What will students learn? 2–3 sentences."
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: undefined })); }}
                  rows={3}
                  className={`w-full resize-none rounded-lg border px-4 py-2.5 text-[13px] text-ink placeholder-placeholder focus:outline-none focus-visible:ring-2 ${fieldErrors.description ? 'border-error bg-error/5 focus-visible:ring-error/30' : 'border-border bg-bg-card focus-visible:ring-primary/30'}`}
                />
                {fieldErrors.description
                  ? <p role="alert" className="mt-1 text-[11px] text-error">{fieldErrors.description}</p>
                  : <p className="mt-1 text-[11px] text-muted">{description.trim().length}/500</p>
                }
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">Price</label>
                <div className="flex items-center overflow-hidden rounded-lg border border-border bg-bg-card focus-within:ring-2 focus-within:ring-primary/30">
                  <span className="flex-shrink-0 border-r border-border bg-bg-surface px-3 py-2.5 text-[13px] font-medium text-muted">EUR</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 — free"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2.5 text-[13px] text-ink placeholder-placeholder focus:outline-none"
                  />
                </div>
              </div>

              {fieldErrors.general && (
                <p role="alert" className="text-[12px] text-error">{fieldErrors.general}</p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-bg-surface"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void createProduct()}
                disabled={creating}
                className="flex-1 rounded-xl bg-sidebar px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-sidebar/90 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create product →'}
              </button>
            </div>
          </div>
        )}

        {/* Step: add content */}
        {step === 'add-content' && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <IconCheckCircle />
            </div>
            <h2 className="mt-4 font-brand text-xl font-semibold text-ink">Product created!</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Now add your first lesson to make it complete.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  track('onboarding_completed', { action: 'add_content' });
                  onDone(newProductId);
                  navigate(`/products/${newProductId}?tab=content`);
                }}
                className="w-full rounded-xl bg-sidebar px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-sidebar/90"
              >
                Add course content →
              </button>
              <button
                type="button"
                onClick={() => { track('onboarding_completed', { action: 'later' }); onDone(newProductId); }}
                className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-bg-surface"
              >
                I&apos;ll do it later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ── Sub-components ── */

function Sparkline({ data, color }: { data: number[]; color: string }): JSX.Element {
  const w = 100;
  const h = 44;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="flex-shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CommunityGraphic(): JSX.Element {
  return (
    <div className="relative h-[120px] w-[180px] overflow-hidden rounded-xl border border-border bg-bg-surface">
      <div className="flex h-full flex-col gap-2 p-3">
        {[40, 70, 55, 85].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-5 w-5 flex-shrink-0 rounded-full bg-border" />
            <span className="h-2 rounded-full bg-border" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 right-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-sidebar">
        47k
      </div>
    </div>
  );
}

function IconCheckCircle(): JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--color-primary-active)" strokeWidth="2">
      <circle cx="14" cy="14" r="12" />
      <path d="M8.5 14l4 4 7-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMegaphone(): JSX.Element {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7H1v4h2m0-4v4m0-4l10-5v14L3 11m0-4v4" strokeLinejoin="round"/><path d="M15 9h2M14.5 4.5l1.2-1.2M14.5 13.5l1.2 1.2" strokeLinecap="round"/></svg>;
}
function IconUsers(): JSX.Element {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="6" r="2.5"/><path d="M2 15c.6-3 2.5-4.5 5-4.5s4.4 1.5 5 4.5"/><circle cx="13" cy="6" r="2"/><path d="M15.5 14c-.4-2-1.8-3-3.5-3"/></svg>;
}
function IconBarChart(): JSX.Element {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="10" width="3" height="6" rx="1"/><rect x="7.5" y="6" width="3" height="10" rx="1"/><rect x="13" y="3" width="3" height="13" rx="1"/></svg>;
}
function IconTrendUp(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 9l3.5-3.5L7 8l4-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
