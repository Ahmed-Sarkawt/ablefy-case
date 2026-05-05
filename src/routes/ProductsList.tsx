/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * /products — lists all products for the authenticated user.
 * Based on the reference screenshot: sortable table with ID, thumbnail,
 * name, created/edited dates, price, sell toggle, share, and action menu.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button, CabinetShell } from '../components';
import { useRequireAuth, getUserId } from '../lib/auth';

interface Product {
  id: string;
  name: string;
  status: string;
  price_cents: number;
  currency: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProductsList(): JSX.Element {
  useRequireAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    fetch(`/api/products?userId=${userId}`)
      .then((r) => (r.ok ? (r.json() as Promise<Product[]>) : Promise.reject()))
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).replace(',', '');
    } catch {
      return iso;
    }
  }

  function formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(cents / 100);
  }

  function handleShare(id: string): void {
    navigator.clipboard.writeText(`${window.location.origin}/products/${id}`).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <CabinetShell title="Products">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 py-2 text-[13px] font-medium text-ink hover:bg-bg-surface"
          >
            <IconFilter /> Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 py-2 text-[13px] font-medium text-ink hover:bg-bg-surface"
          >
            Create label
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-muted">
              <IconSearch />
            </span>
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border border-border bg-bg-card pl-9 pr-3 text-[13px] text-ink placeholder-placeholder focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 py-2 text-[13px] font-medium text-ink hover:bg-bg-surface"
          >
            <IconDownload /> CSV
          </button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/products/new')}
            aria-label="Create product"
            className="!rounded-xl"
          >
            <IconPlus />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-card shadow-low" style={{ minHeight: 640 }}>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => navigate('/products/new')} searched={search.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-bg-surface text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 w-[70px]">ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 hidden md:table-cell">Created</th>
                  <th className="px-4 py-3 hidden md:table-cell">Edited</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 w-[60px]">Live</th>
                  <th className="px-4 py-3 w-[80px]"></th>
                  <th className="px-4 py-3 w-[32px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    menuOpen={menuOpenId === p.id}
                    copied={copiedId === p.id}
                    onRowClick={() => navigate(`/products/${p.id}`)}
                    onMenuToggle={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                    onMenuClose={() => setMenuOpenId(null)}
                    onShare={() => handleShare(p.id)}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CabinetShell>
  );
}

interface RowProps {
  product: Product;
  menuOpen: boolean;
  copied: boolean;
  onRowClick: () => void;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onShare: () => void;
  formatDate: (s: string) => string;
  formatPrice: (c: number, cur: string) => string;
}

function ProductRow({
  product, menuOpen, copied,
  onRowClick, onMenuToggle, onMenuClose,
  onShare, formatDate, formatPrice,
}: RowProps): JSX.Element {
  const btnWrapRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent): void {
      const target = e.target as Node;
      const insideBtn = btnWrapRef.current?.contains(target);
      const insidePortal = portalRef.current?.contains(target);
      if (!insideBtn && !insidePortal) onMenuClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, onMenuClose]);

  function handleToggle(e: React.MouseEvent): void {
    e.stopPropagation();
    if (!menuOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuCoords({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    onMenuToggle();
  }

  const shortId = product.id.replace(/-/g, '').slice(0, 6).toUpperCase();
  const isPublished = product.status === 'published';

  return (
    <tr
      className="group cursor-pointer transition-colors duration-fast hover:bg-bg-surface"
      onClick={onRowClick}
    >
      {/* ID */}
      <td className="px-4 py-3 font-mono text-[11px] text-muted">{shortId}</td>

      {/* Product thumbnail + name */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onRowClick}
          className="flex items-center gap-3 text-left hover:underline focus-visible:underline"
        >
          <ProductThumb url={product.cover_image_url} name={product.name} />
          <div>
            <p className="font-medium text-ink">{product.name}</p>
            <span className={`mt-0.5 inline-block rounded-full px-2 py-px text-[10px] font-semibold ${
              isPublished
                ? 'bg-primary/20 text-primary-active'
                : 'bg-bg-canvas text-muted'
            }`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </button>
      </td>

      {/* Created */}
      <td className="hidden px-4 py-3 text-muted md:table-cell">{formatDate(product.created_at)}</td>

      {/* Edited */}
      <td className="hidden px-4 py-3 text-muted md:table-cell">{formatDate(product.updated_at)}</td>

      {/* Price */}
      <td className="px-4 py-3 font-medium text-ink">
        {product.price_cents > 0
          ? formatPrice(product.price_cents, product.currency)
          : <span className="text-muted">Free</span>}
      </td>

      {/* Live toggle */}
      <td className="px-4 py-3">
        <div
          role="status"
          aria-label={isPublished ? 'Live' : 'Not live'}
          className={`mx-auto h-5 w-5 rounded-full border-2 ${
            isPublished ? 'border-primary-active bg-primary' : 'border-border bg-bg-surface'
          }`}
        />
      </td>

      {/* Share */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-[11px] font-medium text-ink transition-colors hover:bg-bg-surface"
        >
          {copied ? <IconCheck /> : <IconShare />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </td>

      {/* Action menu */}
      <td className="px-4 py-3">
        <div ref={btnWrapRef}>
          <button
            ref={btnRef}
            type="button"
            onClick={handleToggle}
            aria-label="More actions"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-canvas hover:text-ink"
          >
            <IconDots />
          </button>
          {menuOpen && menuCoords && createPortal(
            <div
              ref={portalRef}
              style={{ position: 'fixed', top: menuCoords.top, right: menuCoords.right, zIndex: 9999 }}
              className="min-w-[160px] overflow-hidden rounded-xl border border-border bg-bg-card shadow-med"
            >
              {[
                { label: 'Open', icon: <IconEdit />, action: onRowClick },
                { label: 'Preview', icon: <IconEye />, action: () => {} },
                { label: 'Duplicate', icon: <IconCopy />, action: () => {} },
                { label: 'Unpublish', icon: <IconEyeOff />, action: () => {} },
                { label: 'Archive', icon: <IconArchive />, action: () => {} },
              ].map(({ label, icon, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onMenuClose(); action(); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink transition-colors hover:bg-bg-surface"
                >
                  <span className="text-muted">{icon}</span>
                  {label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </td>
    </tr>
  );
}

function ProductThumb({ url, name }: { url: string | null; name: string }): JSX.Element {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar text-sm font-semibold text-white">
      {letter}
    </span>
  );
}

function EmptyState({ onCreate, searched }: { onCreate: () => void; searched: boolean }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-surface text-muted">
        <IconBox />
      </span>
      <p className="font-medium text-ink">
        {searched ? 'No products match your search.' : 'No products yet.'}
      </p>
      {!searched && (
        <Button variant="primary" size="md" onClick={onCreate} className="!rounded-xl mt-1">
          Create your first product
        </Button>
      )}
    </div>
  );
}

/* ── Icons ── */
function IconFilter(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 2.5h12M3 7h8M5.5 11.5h3" strokeLinecap="round"/></svg>;
}
function IconSearch(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="4"/><path d="M10 10l3 3" strokeLinecap="round"/></svg>;
}
function IconDownload(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2v7M4 6l3 3 3-3M2 12h10" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IconPlus(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 2v10M2 7h10" strokeLinecap="round"/></svg>;
}
function IconShare(): JSX.Element {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="2.5" r="1.5"/><circle cx="10.5" cy="10.5" r="1.5"/><circle cx="2.5" cy="6.5" r="1.5"/><path d="M4 6.5l5-3.5M4 6.5l5 3.5" strokeLinecap="round"/></svg>;
}
function IconCheck(): JSX.Element {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7l3 3 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IconDots(): JSX.Element {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="12" cy="8" r="1.5"/></svg>;
}
function IconEdit(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" strokeLinejoin="round"/></svg>;
}
function IconEye(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7c1.5-3 3.5-4.5 6-4.5S11.5 4 13 7c-1.5 3-3.5 4.5-6 4.5S2.5 10 1 7z"/><circle cx="7" cy="7" r="1.5"/></svg>;
}
function IconEyeOff(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l10 10M5.5 5.7A2 2 0 009.3 9M1 7c.7-1.4 1.6-2.4 2.8-3.1M7 2.5c2.4 0 4.4 1.5 6 4.5-.6 1.2-1.3 2.2-2.3 3" strokeLinecap="round"/></svg>;
}
function IconCopy(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="8" height="9" rx="1.5"/><path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h1" strokeLinecap="round"/></svg>;
}
function IconArchive(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2.5" width="12" height="2.5" rx="1"/><path d="M2 5v6.5a1 1 0 001 1h8a1 1 0 001-1V5M5.5 8h3" strokeLinecap="round"/></svg>;
}
function IconBox(): JSX.Element {
  return <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="22" height="22" rx="4"/><path d="M8 14h12M14 8v12" strokeLinecap="round"/></svg>;
}
