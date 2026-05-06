/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * /products/:id — full product editor matching the ablefy cabinet reference.
 *
 * Layout (top → bottom):
 *   1. Standard CabinetShell topbar with ← Back link
 *   2. Product header card: avatar + name + price | Published ▼ | … menu
 *   3. Action buttons: General settings | Advanced settings ▼ | Preview | Unpublish | Duplicate | Archive
 *   4. Tab nav: Product details | Content | Checkout | Market & Upsell | Delivery | Pages | Advanced | Community
 *   5. Tab content panel
 *
 * Tab is driven by ?tab= URL search param.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CabinetShell } from '../components';
import { useRequireAuth } from '../lib/auth';

interface ProductData {
  id: string;
  name: string;
  description: string;
  status: string;
  price_cents: number;
  currency: string;
  cover_image_url: string | null;
  product_type: string;
  lifetime_access: number;
  duration_months: number | null;
  unavailable_redirect: string;
  position: number | null;
  overall_limit: number | null;
}

type TabId = 'product-details' | 'content' | 'checkout' | 'market-upsell' | 'delivery' | 'pages' | 'advanced' | 'community';

const TABS: { id: TabId; label: string; community?: boolean }[] = [
  { id: 'product-details',  label: 'Product details' },
  { id: 'content',          label: 'Content' },
  { id: 'pages',            label: 'Sell' },
  { id: 'checkout',         label: 'Checkout' },
  { id: 'market-upsell',   label: 'Market & Upsell' },
  { id: 'delivery',         label: 'Delivery' },
  { id: 'advanced',         label: 'Advanced' },
  { id: 'community',        label: 'Community', community: true },
];

export default function ProductDetail(): JSX.Element {
  useRequireAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId) ?? 'content';

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dotMenuOpen, setDotMenuOpen] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? (r.json() as Promise<ProductData>) : Promise.reject()))
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    function handler(e: MouseEvent): void {
      if (dotRef.current && !dotRef.current.contains(e.target as Node)) setDotMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function setTab(tab: TabId): void {
    setSearchParams({ tab }, { replace: true });
  }

  const isPublished = product?.status === 'published';

  const priceLabel = product
    ? product.price_cents > 0
      ? new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: product.currency || 'EUR',
        }).format(product.price_cents / 100)
      : 'Free'
    : '—';

  return (
    <CabinetShell
      headerLeft={
        <Link
          to="/products"
          className="hidden items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-muted transition-colors hover:bg-bg-surface hover:text-ink lg:flex"
        >
          <IconBack /> Back
        </Link>
      }
    >
      {loading && (
        <div className="flex h-48 items-center justify-center text-sm text-muted">Loading…</div>
      )}

      {!loading && !product && (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-muted">Product not found.</p>
          <button type="button" onClick={() => navigate('/products')} className="text-sm font-medium text-primary-active hover:underline">
            ← Back to products
          </button>
        </div>
      )}

      {product && (
        <div className="-mx-4 -mt-6 sm:-mx-8 sm:-mt-8">
          {/* ── Product header card ── */}
          <div className="border-b border-border bg-bg-card px-6 py-4">
            <div className="mx-auto flex max-w-5xl items-center gap-4">
              <ProductAvatar url={product.cover_image_url} name={product.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-brand text-lg font-semibold text-ink">{product.name}</p>
                <p className="text-sm text-muted">
                  {priceLabel} · <span className="capitalize">{product.product_type?.replace(/_/g, ' ') ?? 'Online Course'}</span>
                </p>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                    isPublished
                      ? 'bg-primary/15 text-primary-active hover:bg-primary/25'
                      : 'border border-border bg-bg-card text-muted hover:bg-bg-surface'
                  }`}
                >
                  {isPublished && <span className="h-1.5 w-1.5 rounded-full bg-primary-active" />}
                  {isPublished ? 'Published' : 'Draft'}
                  <IconChevronDown />
                </button>

                {/* … menu */}
                <div ref={dotRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDotMenuOpen((o) => !o)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-bg-surface"
                  >
                    <IconDots />
                  </button>
                  {dotMenuOpen && (
                    <div className="absolute right-0 top-10 z-50 min-w-[160px] overflow-hidden rounded-xl border border-border bg-bg-card shadow-med">
                      {['Preview', 'Duplicate', 'Unpublish', 'Archive'].map((label) => (
                        <button key={label} type="button" onClick={() => setDotMenuOpen(false)} className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-ink hover:bg-bg-surface">
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Tab nav ── */}
          <div className="border-b border-border bg-bg-card px-6">
            <div className="mx-auto max-w-5xl">
              <nav aria-label="Product sections" className="-mb-px flex gap-1 overflow-x-auto">
                {TABS.map(({ id: tabId, label, community }) => (
                  <button
                    key={tabId}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tabId}
                    onClick={() => setTab(tabId)}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-3.5 text-[13px] font-medium transition-colors duration-fast ${
                      activeTab === tabId
                        ? 'border-b-2 border-ink text-ink'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {label}
                    {community && <span className="inline-block h-2 w-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ── Tab content ── */}
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-5xl">
              {activeTab === 'content'         && <ContentTab productId={product.id} />}
              {activeTab === 'product-details' && <ProductDetailsTab product={product} />}
              {activeTab === 'pages'           && <PagesTab productId={product.id} productName={product.name} />}
              {activeTab === 'checkout'        && <StubTab title="Checkout" description="Configure payment methods, order bumps, and checkout appearance." />}
              {activeTab === 'market-upsell'   && <StubTab title="Market & Upsell" description="Set up upsell funnels and post-purchase offers." />}
              {activeTab === 'delivery'        && <StubTab title="Delivery" description="Set up email delivery, drip content, and access rules." />}
              {activeTab === 'advanced'        && <StubTab title="Advanced" description="Internal name, custom URL slug, and availability limits." />}
              {activeTab === 'community'       && <StubTab title="Community" description="Connect your course to your ablefy community with SSO." />}
            </div>
          </div>
        </div>
      )}
    </CabinetShell>
  );
}

/* ─── Content Tab ─── */

interface Lesson { id: string; title: string }
interface Module { id: string; title: string; lessons: Lesson[] }

function ContentTab({ productId }: { productId: string }): JSX.Element {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Inline creation state
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [addingLessonModId, setAddingLessonModId] = useState<string | null>(null);
  const [newLessonName, setNewLessonName] = useState('');

  function saveModule(): void {
    const title = newModuleName.trim();
    if (!title) return;
    const id = `m-${Date.now()}`;
    setModules((prev) => [...prev, { id, title, lessons: [] }]);
    setExpandedId(id);
    setAddingModule(false);
    setNewModuleName('');
    window.localStorage.setItem('ablefy.step2_done', '1');
  }

  function saveLesson(modId: string): void {
    const title = newLessonName.trim();
    if (!title) return;
    const lesson: Lesson = { id: `l-${Date.now()}`, title };
    setModules((prev) => prev.map((m) => m.id === modId ? { ...m, lessons: [...m.lessons, lesson] } : m));
    setSelectedLesson(lesson);
    setAddingLessonModId(null);
    setNewLessonName('');
  }

  const isEmpty = modules.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-brand text-[15px] font-semibold text-ink">Course content</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Organise your content into modules, then add lessons inside each module.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex-shrink-0 rounded-full border border-border bg-bg-card px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-bg-surface"
          >
            Apply theme
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/${productId}/content`)}
            className="flex-shrink-0 rounded-full border border-border bg-bg-card px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-bg-surface"
          >
            Preview content
          </button>
        </div>
      </div>

      {isEmpty && !addingModule ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-bg-card py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-surface text-muted">
            <IconFilePlus />
          </div>
          <div>
            <p className="font-semibold text-ink">No modules yet</p>
            <p className="mt-1 text-sm text-muted">Add your first module to start building your course.</p>
          </div>
          <button
            type="button"
            onClick={() => setAddingModule(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-sidebar transition-colors hover:bg-primary-hover"
          >
            <IconPlus /> Add item
          </button>
        </div>
      ) : isEmpty && addingModule ? (
        /* Inline new-module form in empty state */
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <p className="mb-3 text-[13px] font-semibold text-ink">New module</p>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              placeholder="e.g. Introduction to AI Content"
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveModule(); if (e.key === 'Escape') { setAddingModule(false); setNewModuleName(''); } }}
              className="flex-1 rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <button
              type="button"
              onClick={saveModule}
              className="rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-sidebar hover:bg-primary-hover"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setAddingModule(false); setNewModuleName(''); }}
              className="rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-bg-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Two-column layout: tree left, editor right */
        <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
          <div className="flex min-h-[500px]">
            {/* Left: course tree */}
            <div className="w-64 flex-shrink-0 border-r border-border">
              <ul className="divide-y divide-border">
                {modules.map((mod) => (
                  <li key={mod.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === mod.id ? null : mod.id)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-bg-surface"
                    >
                      <IconChevronRight className={`flex-shrink-0 transition-transform duration-fast ${expandedId === mod.id ? 'rotate-90' : ''}`} />
                      {mod.title}
                    </button>
                    {expandedId === mod.id && (
                      <ul>
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedLesson(lesson)}
                              className={`flex w-full items-center gap-2 border-t border-border px-6 py-2.5 text-left text-[13px] transition-colors hover:bg-bg-surface ${selectedLesson?.id === lesson.id ? 'bg-bg-surface font-medium text-ink' : 'text-muted'}`}
                            >
                              <IconFileText />
                              {lesson.title}
                            </button>
                          </li>
                        ))}
                        {/* Inline add-lesson form */}
                        {addingLessonModId === mod.id ? (
                          <li className="border-t border-border px-3 py-2">
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Lesson name"
                                value={newLessonName}
                                onChange={(e) => setNewLessonName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') saveLesson(mod.id); if (e.key === 'Escape') { setAddingLessonModId(null); setNewLessonName(''); } }}
                                className="flex-1 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-[12px] text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                              />
                              <button type="button" onClick={() => saveLesson(mod.id)} className="rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-sidebar hover:bg-primary-hover">Add</button>
                              <button type="button" onClick={() => { setAddingLessonModId(null); setNewLessonName(''); }} className="rounded-md border border-border px-2 py-1.5 text-[11px] text-muted hover:bg-bg-surface">✕</button>
                            </div>
                          </li>
                        ) : (
                          <li className="border-t border-border px-4 py-2.5">
                            <button
                              type="button"
                              onClick={() => { setAddingLessonModId(mod.id); setNewLessonName(''); }}
                              className="text-[12px] font-medium text-primary-active hover:underline"
                            >
                              + Add lesson
                            </button>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              {/* Inline add-module form or buttons */}
              {addingModule ? (
                <div className="border-t border-border p-3">
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Module name"
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveModule(); if (e.key === 'Escape') { setAddingModule(false); setNewModuleName(''); } }}
                      className="rounded-md border border-border bg-bg-surface px-3 py-1.5 text-[12px] text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                    <div className="flex gap-1.5">
                      <button type="button" onClick={saveModule} className="flex-1 rounded-md bg-primary py-1.5 text-[11px] font-semibold text-sidebar hover:bg-primary-hover">Save</button>
                      <button type="button" onClick={() => { setAddingModule(false); setNewModuleName(''); }} className="flex-1 rounded-md border border-border py-1.5 text-[11px] text-muted hover:bg-bg-surface">Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border p-4">
                  <button type="button" onClick={() => setAddingModule(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-sidebar hover:bg-primary-hover">
                    <IconPlus /> Add item
                  </button>
                </div>
              )}
            </div>

            {/* Right: lesson editor */}
            <div className="flex-1 overflow-auto p-6">
              {selectedLesson ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Title</label>
                      <p className="mt-1 font-brand text-lg font-semibold text-ink">{selectedLesson.title}</p>
                    </div>
                    <button type="button" className="rounded-full border border-border bg-bg-card px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-bg-surface">
                      Copy deep link
                    </button>
                  </div>
                  <div className="flex gap-3 border-b border-border pb-3 text-[13px]">
                    {['Page content', 'Before start date', 'After end date'].map((t, i) => (
                      <button key={t} className={`py-1 ${i === 0 ? 'border-b-2 border-ink font-medium text-ink' : 'text-muted'}`}>{t}</button>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 text-center text-muted">
                    <IconFilePlus />
                    <p className="text-sm">Drag files here or</p>
                    <button type="button" className="rounded-full border border-border bg-bg-card px-4 py-2 text-[13px] font-medium text-ink hover:bg-bg-surface">
                      Browse files
                    </button>
                    <p className="text-[11px]">Video, PDF, text, audio — up to 4 GB</p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-[11px] text-muted">or build a rich page</span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-xl border border-border bg-bg-card py-3 text-[13px] font-semibold text-ink transition-colors hover:bg-bg-surface"
                  >
                    ✦ Open page builder
                  </button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                  <IconFileText />
                  <p className="text-sm">Select a lesson to edit its content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Product Details Tab ─── */

function ProductDetailsTab({ product }: { product: ProductData }): JSX.Element {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? '');
  const [coverUrl, setCoverUrl] = useState(product.cover_image_url ?? '');
  const [lifetimeAccess, setLifetimeAccess] = useState(product.lifetime_access === 1);
  const [saved, setSaved] = useState(false);

  function handleSave(): void { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
      <div className="space-y-8">
        {/* Main product details */}
        <section>
          <SectionHeader title="Main product details" description="Add basic product information and cover image. You can change this information later at any time." />
          <div className="mt-5 space-y-5">
            <FormField label="Product name" required>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </FormField>
            <FormField label="Description">
              <div className="rounded-lg border border-border bg-bg-card">
                <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">
                  {['B', 'I', 'U', 'A'].map((f) => (
                    <button key={f} type="button" className="flex h-6 w-6 items-center justify-center rounded text-[12px] font-semibold text-muted hover:bg-bg-surface">{f}</button>
                  ))}
                </div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                  className="w-full px-4 py-3 text-[13px] text-ink focus:outline-none" />
              </div>
            </FormField>
            <FormField label="Cover" helper="Recommended file size: Square. Minimum 1080 × 1080 pixels.">
              {coverUrl ? (
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img src={coverUrl} alt="Cover" className="h-32 w-32 rounded-xl object-cover" />
                    <label className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
                      <input type="checkbox" defaultChecked className="accent-primary" />
                      Show cover image on checkout page
                    </label>
                  </div>
                  <button type="button" onClick={() => setCoverUrl('')} className="text-[12px] text-muted hover:text-error">Remove</button>
                </div>
              ) : (
                <input type="url" placeholder="https://images.unsplash.com/…" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
              )}
            </FormField>
          </div>
        </section>

        <Divider />

        {/* Advanced product details */}
        <section>
          <SectionHeader title="Advanced product details" description="These details are automatically predefined by the system for your convenience. However, you can update the internal name, product type, custom product URL at any time." />
          <div className="mt-5 space-y-5">
            <FormField label="Internal product name">
              <input type="text" placeholder="Internal product name"
                className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </FormField>
            <FormField label="Product type">
              <select className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                <option value="digital">Digital · Online Course · Online Course (pre-recorded)</option>
                <option value="online_course" selected={product.product_type === 'online_course'}>Online Course</option>
                <option value="online_course_recorded" selected={product.product_type === 'online_course_recorded'}>Online Course (pre-recorded)</option>
              </select>
            </FormField>
            <FormField label="Custom product URL">
              <input type="url" defaultValue={`https://myablefy.com/s/course-${product.id.slice(0, 8)}`}
                className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </FormField>
          </div>
        </section>

        <Divider />

        {/* Access & Duration */}
        <section>
          <SectionHeader title="Access & Duration" description="You can adjust the maximum duration of course access. Lifetime access from payment date is the default duration." />
          <div className="mt-5 space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={lifetimeAccess} onChange={(e) => setLifetimeAccess(e.target.checked)} className="h-4 w-4 accent-primary" />
              <span className="text-[13px] font-medium text-ink">Lifetime access</span>
            </label>
            {lifetimeAccess && (
              <div className="flex gap-2">
                {['FROM PAYMENT', 'FROM SPECIFIC DATE'].map((opt) => (
                  <button key={opt} type="button" className="rounded-full border border-border bg-bg-surface px-3 py-1 text-[11px] font-semibold text-muted first:bg-sidebar first:text-white">
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {!lifetimeAccess && (
              <FormField label="Duration months">
                <input type="number" min="1" max="120" defaultValue={product.duration_months ?? 12}
                  className="w-32 rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
              </FormField>
            )}
          </div>
        </section>

        <Divider />

        {/* Redirect if unavailable */}
        <section>
          <SectionHeader title="Redirect if product is unavailable" description="" />
          <div className="mt-4 space-y-3">
            {[
              { value: 'shop',     label: 'Redirect to the shop page' },
              { value: 'sold_out', label: 'Add redirect button' },
              { value: 'another',  label: 'Redirect to another product' },
            ].map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-3">
                <input type="radio" name="unavailable" value={value} defaultChecked={product.unavailable_redirect === value || (value === 'shop' && !product.unavailable_redirect)} className="accent-primary" />
                <span className="text-[13px] text-ink">{label}</span>
              </label>
            ))}
          </div>
        </section>

        <Divider />

        {/* More options */}
        <section>
          <SectionHeader title="More options" description="You can set the overall limit of products available for purchase, and set up the product stock visibility on the checkout page." />
          <div className="mt-5 grid grid-cols-2 gap-5">
            <FormField label="Position">
              <input type="number" min="0" defaultValue={product.position ?? ''} placeholder="Auto"
                className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </FormField>
            <FormField label="Overall limit">
              <input type="number" min="1" defaultValue={product.overall_limit ?? ''} placeholder="Unlimited"
                className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
            </FormField>
          </div>
        </section>

        <div className="flex gap-3 border-t border-border pt-6">
          <button type="button" onClick={handleSave} className="rounded-xl border border-border bg-bg-card px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-bg-surface">
            {saved ? '✓ Saved' : 'Update'}
          </button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-sidebar px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-sidebar/90">
            Save & close
          </button>
        </div>
      </div>

      {/* Mobile preview */}
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-card shadow-low">
            <div className="flex h-6 items-center gap-1 border-b border-border bg-bg-surface px-2.5">
              {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => (
                <span key={c} className={`h-1.5 w-1.5 rounded-full ${c}`} />
              ))}
            </div>
            {coverUrl ? (
              <img src={coverUrl} alt="" className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center bg-bg-surface text-muted"><IconImage /></div>
            )}
            <div className="p-4">
              <p className="font-brand text-sm font-semibold text-ink">{name || 'Product name'}</p>
              <p className="mt-1 text-base font-bold text-ink">
                {product.price_cents > 0
                  ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: product.currency || 'EUR' }).format(product.price_cents / 100)
                  : 'Free'}
              </p>
              <div className="mt-3 rounded-lg bg-primary py-2 text-center text-[11px] font-semibold text-sidebar">GO TO CHECKOUT</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ─── Pages Tab ─── */

const PAGE_CARDS = [
  { id: 'product',  title: 'Product page',   category: 'Sales',  desc: 'Public landing page for your product.',        icon: <IconGlobe /> },
  { id: 'checkout', title: 'Checkout page',  category: 'Sales',  desc: 'Secure payment checkout.',                     icon: <IconCreditCard /> },
  { id: 'thankyou', title: 'Thank you page', category: 'Sales',  desc: 'Post-purchase confirmation page.',             icon: <IconSparkle /> },
  { id: 'shop',     title: 'Shop page',      category: 'Sales',  desc: 'Your full shop with all published products.',  icon: <IconShop /> },
  { id: 'login',    title: 'Login link',     category: 'Access', desc: 'Direct link for students to log in.',         icon: <IconKey /> },
  { id: 'embed',    title: 'Embed code',     category: 'Access', desc: 'Embed checkout or buy button anywhere.',       icon: <IconCode /> },
] as const;

function PagesTab({ productId, productName }: { productId: string; productName: string }): JSX.Element {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(cardId: string): void {
    navigator.clipboard.writeText(`https://myablefy.com/s/${cardId}-${productId.slice(0, 6)}`).catch(() => {});
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 1800);
  }

  const sales  = PAGE_CARDS.filter((c) => c.category === 'Sales');
  const access = PAGE_CARDS.filter((c) => c.category === 'Access');

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {['Standard links', 'Custom links'].map((t, i) => (
          <button key={t} type="button" className={`px-4 py-2.5 text-[13px] font-medium ${i === 0 ? 'border-b-2 border-ink text-ink' : 'text-muted'}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Sales pages</h2>
            <span className="flex-1 border-t border-border" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sales.map((card) => (
              <PageCard key={card.id} card={card} productName={productName} copied={copiedId === card.id} onCopy={() => copy(card.id)} />
            ))}
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Access & embed</h2>
            <span className="flex-1 border-t border-border" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {access.map((card) => (
              <PageCard key={card.id} card={card} productName={productName} copied={copiedId === card.id} onCopy={() => copy(card.id)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PageCard({ card, productName, copied, onCopy }: {
  card: typeof PAGE_CARDS[number]; productName: string; copied: boolean; onCopy: () => void;
}): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-card transition-shadow hover:shadow-med">
      <div className="relative flex h-40 flex-col gap-1 overflow-hidden bg-bg-surface p-3">
        <div className="flex gap-1">
          {['bg-red-300', 'bg-yellow-300', 'bg-green-300'].map((c) => (
            <span key={c} className={`h-1.5 w-1.5 rounded-full ${c}`} />
          ))}
        </div>
        <div className="mt-1 flex-1 overflow-hidden rounded-lg bg-bg-card p-2 shadow-low">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-bg-surface text-muted">{card.icon}</div>
          <div className="mt-2 h-2 w-3/4 rounded-full bg-border" />
          <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-border" />
          {card.id === 'embed' ? (
            <div className="mt-2 space-y-1">
              {[70, 55, 80, 60].map((w, i) => (
                <div key={i} className="h-1 rounded-full bg-border" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <div className="mt-3 h-5 w-2/3 rounded-lg bg-primary/25" />
          )}
        </div>
        <div className="absolute right-2 top-6 rounded-full bg-bg-card/80 px-2 py-0.5 text-[9px] text-muted shadow-low">
          {productName}
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-[13px] font-semibold text-ink">{card.title}</p>
        <p className="mt-0.5 text-[11px] text-muted">{card.desc}</p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onCopy} aria-label="Copy link"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-primary/30 hover:text-primary-active">
            {copied ? <IconCheck /> : <IconCopySmall />}
          </button>
          <button type="button" aria-label="Open page"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-primary/30 hover:text-primary-active">
            <IconExternalLink />
          </button>
          <button type="button" aria-label="Edit page"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:border-primary/30 hover:text-primary-active">
            <IconPen />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Stub Tab ─── */

function StubTab({ title, description }: { title: string; description: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface text-muted"><IconSettings /></span>
      <p className="font-semibold text-ink">{title}</p>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      <span className="rounded-full border border-dashed border-border px-3 py-1 text-[11px] text-muted">Coming in full version</span>
    </div>
  );
}

/* ─── Layout helpers ─── */

function SectionHeader({ title, description }: { title: string; description: string }): JSX.Element {
  return (
    <div>
      <h3 className="font-brand text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
    </div>
  );
}

function FormField({ label, required, helper, children }: {
  label: string; required?: boolean; helper?: string; children: React.ReactNode;
}): JSX.Element {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}{required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
      {helper && <p className="mt-1 text-[11px] text-muted">{helper}</p>}
    </div>
  );
}

function Divider(): JSX.Element { return <hr className="border-border" />; }

function ProductAvatar({ url, name }: { url: string | null; name: string }): JSX.Element {
  if (url) return <img src={url} alt="" className="h-11 w-11 flex-shrink-0 rounded-xl object-cover" />;
  return (
    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sidebar text-sm font-semibold text-white">
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}

/* ─── Icons ─── */
function IconBack(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IconChevronDown(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 4.5l3.5 3.5 3.5-3.5" strokeLinecap="round"/></svg>;
}
function IconChevronRight({ className }: { className?: string }): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M4.5 2.5l4 3.5-4 3.5" strokeLinecap="round"/></svg>;
}
function IconDots(): JSX.Element {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="12" cy="8" r="1.5"/></svg>;
}
function IconPen(): JSX.Element {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M8 2l3 3-7 7H1V9l7-7z" strokeLinejoin="round"/></svg>;
}
function IconSettings(): JSX.Element {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.25"><circle cx="6.5" cy="6.5" r="2"/><path d="M6.5 1v1.5M6.5 10v1.5M1 6.5h1.5M10 6.5h1.5" strokeLinecap="round"/></svg>;
}
function IconFilePlus(): JSX.Element {
  return <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 2H7a2 2 0 00-2 2v20a2 2 0 002 2h14a2 2 0 002-2V10l-7-8z"/><path d="M16 2v8h6M14 17v-5M11.5 14.5h5" strokeLinecap="round"/></svg>;
}
function IconFileText(): JSX.Element {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M7.5 1H3a1 1 0 00-1 1v9a1 1 0 001 1h7a1 1 0 001-1V5.5L7.5 1z" strokeLinejoin="round"/><path d="M7.5 1v4.5H12M4 7h5M4 9.5h3" strokeLinecap="round"/></svg>;
}
function IconPlus(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v8M2 6h8" strokeLinecap="round"/></svg>;
}
function IconCheck(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IconCopySmall(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.25"/><path d="M8.5 3.5V2.5a1 1 0 00-1-1H2a1 1 0 00-1 1v6a1 1 0 001 1h1" strokeLinecap="round"/></svg>;
}
function IconExternalLink(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M6.5 1H11v4.5M11 1L5 7M4.5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8" strokeLinecap="round"/></svg>;
}
function IconImage(): JSX.Element {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="18" height="18" rx="3"/><circle cx="7.5" cy="7.5" r="1.5"/><path d="M2 15l5-5 4 4 2-2 4 4" strokeLinecap="round"/></svg>;
}
function IconGlobe(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><circle cx="6" cy="6" r="5"/><path d="M1 6h10M6 1c-1.5 2-2 3-2 5s.5 3 2 5M6 1c1.5 2 2 3 2 5s-.5 3-2 5"/></svg>;
}
function IconCreditCard(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><rect x="1" y="2.5" width="10" height="7" rx="1.25"/><path d="M1 5.5h10M3.5 8h2" strokeLinecap="round"/></svg>;
}
function IconSparkle(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M6 1v10M1 6h10M2.8 2.8l6.4 6.4M9.2 2.8L2.8 9.2" strokeLinecap="round" opacity=".35"/><circle cx="6" cy="6" r="2"/></svg>;
}
function IconShop(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M1 3h10l-1 4H2L1 3z"/><path d="M3.5 10V7M6 10V7M8.5 10V7" strokeLinecap="round"/></svg>;
}
function IconKey(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><circle cx="4.5" cy="4.5" r="2.5"/><path d="M6.5 6.5l4 4M8.5 8.5L10 7" strokeLinecap="round"/></svg>;
}
function IconCode(): JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M4 3L1 6l3 3M8 3l3 3-3 3M6.5 1.5l-1 9" strokeLinecap="round"/></svg>;
}
