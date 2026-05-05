/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 *
 * CabinetShell — authenticated layout per docs/DESIGN-SYSTEM.md.
 */
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserName, clearSession } from '../lib/auth';

interface CabinetShellProps {
  title?: ReactNode;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
}

interface SubItem { label: string; to?: string }

interface NavItem {
  label: string;
  to?: string;
  expandable?: boolean;
  badge?: 'New';
  subItems?: SubItem[];
  icon: JSX.Element;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',       to: '/dashboard', icon: <NavIcon d="M3 9l6-6 6 6v9H9v-5H7v5H3z" /> },
  {
    label: 'Products', to: '/products', expandable: true,
    icon: <NavIcon d="M2 7l8-5 8 5v9H2V7z M6 16V9h4v7" />,
    subItems: [
      { label: 'All products', to: '/products' },
      { label: 'Product categories' },
      { label: 'Course themes' },
      { label: 'File library' },
    ],
  },
  { label: 'Pages',          expandable: true,  icon: <NavIconPath d="M4 2h9l5 5v13H4V2zm9 0v5h5M7 9h8M7 12h8M7 15h5" /> },
  { label: 'Market & Sell',  expandable: true,  icon: <NavIconPath d="M3 7H1v4h2L13 16V2L3 7zm10 1.5a3 3 0 010 3M15.5 5.5a7 7 0 010 9" /> },
  { label: 'Sales OS',       expandable: true,  icon: <NavIconPath d="M2 14l4-4 4 4 4-8 2 2" /> },
  { label: 'Payments',       expandable: true,  icon: <NavIconPath d="M1 5h16v10H1V5zm0 4h16M4 12h3" /> },
  { label: 'Affiliate',      expandable: true,  icon: <NavIconPath d="M12 5a2 2 0 100-4 2 2 0 000 4zm0 0L8 9m0 0a2 2 0 100 4 2 2 0 000-4zm0 0L4 5m0 0a2 2 0 100-4 2 2 0 000 4zm0 0l4 4" /> },
  { label: 'Customers',      expandable: true,  icon: <NavIconPath d="M6 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4 7c.6-3 2.4-4.5 4-4.5s3.4 1.5 4 4.5m1-7.5a2 2 0 110-4 2 2 0 010 4zm2 7c-.4-2-1.8-3.5-3.5-3" /> },
  { label: 'Community',      expandable: true,  badge: 'New', icon: <NavIconPath d="M15 10c0 3.3-3.1 6-7 6a8 8 0 01-3-.6L1 17l1.3-3.7A5.7 5.7 0 011 10c0-3.3 3.1-6 7-6s7 2.7 7 6z" /> },
  { label: 'Mobile App',                        icon: <NavIconPath d="M5 1h8a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V2a1 1 0 011-1zm4 13h.01" /> },
  { label: 'Analytics',      expandable: true,  icon: <NavIconPath d="M2 13h3V7H2v6zm5 0h3V3H7v10zm5 0h3V9h-3v4z" /> },
  { label: 'Checkout Tools', expandable: true,  icon: <NavIconPath d="M1 2h2l2 8h9l1-5H5M12 15a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2z" /> },
  { label: 'Cashout',                           icon: <NavIconPath d="M9 1v2m0 12v2M5 3.7l1.4 1.4M12.6 11.3l1.4 1.4M3 9H1m14 0h-2M5 14.3l1.4-1.4M12.6 6.7l1.4-1.4M9 6a3 3 0 110 6 3 3 0 010-6z" /> },
  { label: 'Logs',                              icon: <NavIconPath d="M3 4h12M3 8h9M3 12h6M3 16h8" /> },
  { label: 'Settings',                          icon: <NavIconPath d="M9 1v2m0 12v2M5 3.7l1.4 1.4M12.6 11.3l1.4 1.4M3 9H1m14 0h-2M5 14.3l1.4-1.4M12.6 6.7l1.4-1.4M9 6a3 3 0 110 6 3 3 0 010-6z" /> },
];

const NOTIFICATIONS_DATA = [
  { id: '1', title: 'New sale!',                    body: 'Someone purchased AI Creator Course · €99',  time: '2m ago',  unread: true,  important: true,  icon: '💸' },
  { id: '2', title: 'Payout processed',             body: '€1,249 sent to your bank account',           time: '1h ago',  unread: true,  important: true,  icon: '🏦' },
  { id: '3', title: 'New student enrolled',         body: 'Sarah J. joined AI Content Creator Course',  time: '3h ago',  unread: false, important: false, icon: '🎓' },
  { id: '4', title: 'New review received',          body: '★★★★☆ "Great course structure!"',            time: '1d ago',  unread: false, important: false, icon: '⭐' },
  { id: '5', title: 'Upload your legal documents',  body: 'Upload to start selling',                    time: 'Now',     unread: true,  important: true,  icon: '⚠️' },
];

type NotifTab = 'all' | 'unread' | 'important';

export function CabinetShell({ title, headerLeft, headerRight, children }: CabinetShellProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(getUserName() ?? 'Seller');
  const name    = displayName;
  const initial = name.trim().charAt(0).toUpperCase() || 'S';

  // Sidebar collapse
  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem('ablefy.sidebar_collapsed') === '1'
  );
  function toggleCollapse(): void {
    const next = !collapsed;
    setCollapsed(next);
    window.localStorage.setItem('ablefy.sidebar_collapsed', next ? '1' : '0');
  }

  // Notifications
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifTab,  setNotifTab]    = useState<NotifTab>('all');
  const [unreadIds, setUnreadIds]   = useState<Set<string>>(
    () => new Set(NOTIFICATIONS_DATA.filter((n) => n.unread).map((n) => n.id))
  );
  const notifRef = useRef<HTMLDivElement>(null);

  // User menu
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent): void {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onProductsRoute = location.pathname.startsWith('/products');

  const sidebarW     = collapsed ? 'w-[52px]' : 'w-[220px]';
  const contentPad   = collapsed ? 'lg:pl-[52px]' : 'lg:pl-[220px]';

  const filteredNotifs = NOTIFICATIONS_DATA.filter((n) => {
    if (notifTab === 'unread')    return unreadIds.has(n.id);
    if (notifTab === 'important') return n.important;
    return true;
  });

  return (
    <div className="min-h-screen bg-bg-page">
      {/* === Sidebar === */}
      <aside
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-black text-white transition-all duration-200 lg:flex ${sidebarW}`}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex h-12 flex-shrink-0 items-center border-b border-white/[0.06] px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <img src="/ablefy-logo.svg" alt="ablefy" className="h-5 w-auto" />}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <IconHamburger />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive      = item.to !== undefined && location.pathname === item.to;
              const isProductsGroup = item.label === 'Products';
              const isExpanded    = isProductsGroup && onProductsRoute && !collapsed;

              const itemCls = [
                'flex h-9 w-full items-center rounded-md text-[13px] transition-colors duration-fast text-left',
                collapsed ? 'justify-center px-0 mx-0' : 'gap-2 px-3',
                isActive || isExpanded
                  ? 'bg-white/[0.08] font-semibold text-primary'
                  : 'text-white/75 hover:bg-white/[0.05] hover:text-white',
              ].join(' ');

              const iconEl = (
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center ${collapsed ? 'opacity-80' : 'opacity-60'}`}
                  aria-hidden="true"
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                </span>
              );

              return (
                <li key={item.label} className={collapsed ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}>
                  {item.to ? (
                    <Link to={item.to} aria-current={isActive ? 'page' : undefined} className={itemCls}>
                      {iconEl}
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="inline-flex h-[18px] items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-black">
                              {item.badge}
                            </span>
                          )}
                          {item.expandable && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
                              className={`opacity-40 transition-transform duration-fast ${isExpanded ? 'rotate-180' : ''}`}>
                              <path d="M2.5 4l2.5 2.5L7.5 4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </>
                      )}
                    </Link>
                  ) : (
                    <button type="button" className={itemCls}>
                      {iconEl}
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="inline-flex h-[18px] items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-black">
                              {item.badge}
                            </span>
                          )}
                          {item.expandable && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="opacity-40">
                              <path d="M2.5 4l2.5 2.5L7.5 4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </>
                      )}
                    </button>
                  )}

                  {/* Products submenu */}
                  {isProductsGroup && isExpanded && item.subItems && (
                    <ul className="ml-3 mt-0.5 flex flex-col border-l border-white/10 pl-3">
                      {item.subItems.map((sub) => {
                        const subActive = sub.to !== undefined && location.pathname === sub.to;
                        const subCls = [
                          'flex h-8 items-center rounded-md px-2 text-[12px] transition-colors duration-fast w-full text-left',
                          subActive ? 'font-semibold text-primary' : 'text-white/55 hover:text-white',
                        ].join(' ');
                        return (
                          <li key={sub.label}>
                            {sub.to
                              ? <Link to={sub.to} className={subCls} aria-current={subActive ? 'page' : undefined}>{sub.label}</Link>
                              : <button type="button" className={subCls}>{sub.label}</button>
                            }
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-center py-3">
          {collapsed ? (
            <AbleglyGlyph />
          ) : (
            <span className="text-[11px] text-white/20">© ablefy 2026</span>
          )}
        </div>
      </aside>

      {/* === Top bar + content === */}
      <div className={`${contentPad} transition-all duration-200`}>
        <header className="sticky top-0 z-20 flex h-12 items-center gap-4 border-b border-border bg-bg-card px-4 sm:px-6">
          {/* Mobile logo */}
          <div className="flex flex-1 items-center gap-3 lg:hidden">
            <img src="/ablefy-logo-dark.svg" alt="ablefy" className="h-5 w-auto" />
          </div>

          {/* Left slot */}
          <div className="hidden min-w-0 flex-1 items-center lg:flex">
            {headerLeft ? headerLeft : title ? (
              <h1 className="font-brand text-lg font-semibold text-ink">{title}</h1>
            ) : null}
          </div>

          {/* Center: trial notice */}
          <p className="hidden text-xs text-muted md:block">
            Trial ends in 14 days{' '}
            <a href="#upgrade" className="font-semibold text-primary-active hover:underline">Upgrade now</a>
          </p>

          {/* Right slot */}
          <div className="flex items-center gap-2">
            {headerRight}

            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-bg-surface"
              >
                <IconBell />
                {unreadIds.size > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-xl border border-border bg-bg-card shadow-med">
                  {/* Header row */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-[13px] font-semibold text-ink">Notifications</p>
                    {unreadIds.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setUnreadIds(new Set())}
                        className="text-[11px] font-medium text-primary-active hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-border">
                    {(['all', 'unread', 'important'] as NotifTab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setNotifTab(tab)}
                        className={`flex-1 py-2 text-[12px] font-medium capitalize transition-colors ${
                          notifTab === tab
                            ? 'border-b-2 border-ink text-ink'
                            : 'text-muted hover:text-ink'
                        }`}
                      >
                        {tab}
                        {tab === 'unread' && unreadIds.size > 0 && (
                          <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary-active">
                            {unreadIds.size}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* List */}
                  <ul>
                    {filteredNotifs.length === 0 ? (
                      <li className="px-4 py-8 text-center text-[12px] text-muted">No notifications here.</li>
                    ) : filteredNotifs.map((n) => (
                      <li
                        key={n.id}
                        className={`flex items-start gap-3 border-b border-border px-4 py-3 last:border-0 ${unreadIds.has(n.id) ? 'bg-primary/[0.04]' : ''}`}
                      >
                        <span className="mt-0.5 text-lg leading-none">{n.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[13px] ${unreadIds.has(n.id) ? 'font-semibold text-ink' : 'font-medium text-muted'}`}>
                            {n.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted">{n.body}</p>
                        </div>
                        <span className="flex-shrink-0 text-[11px] text-muted">{n.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* User avatar menu */}
            <div ref={userRef} className="relative">
              <button
                type="button"
                aria-label={`Account menu — ${name}`}
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-surface text-xs font-semibold text-ink hover:bg-border"
              >
                {initial}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-bg-card shadow-med">
                  <div className="border-b border-border px-4 py-2.5">
                    <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); setSettingsOpen(true); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink hover:bg-bg-surface"
                  >
                    <IconSettingsSmall /> Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.localStorage.removeItem('ablefy.onboarding_done');
                      window.localStorage.removeItem('ablefy.step2_done');
                      clearSession();
                      navigate('/login', { replace: true });
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-error hover:bg-bg-surface"
                  >
                    <IconLogout /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Settings modal */}
          {settingsOpen && (
            <SettingsModal
              currentName={name}
              onClose={() => setSettingsOpen(false)}
              onSave={(newName) => { setDisplayName(newName); setSettingsOpen(false); }}
            />
          )}
        </header>

        <main className="px-4 py-6 sm:px-8 sm:py-8">
          <div key={location.pathname} className="animate-page-enter mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>

      {/* === Floating help FAB === */}
      <button
        type="button"
        className="fixed bottom-5 right-5 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-sidebar shadow-fab transition-colors duration-fast hover:bg-primary-hover"
      >
        Help <span aria-hidden="true">🎉</span>
      </button>
    </div>
  );
}

/* ── Settings Modal ── */

function SettingsModal({ currentName, onClose, onSave }: {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}): JSX.Element {
  const [name,     setName]     = useState(currentName);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [saved,    setSaved]    = useState(false);

  function handleSave(): void {
    if (name.trim().length < 2) return;
    window.localStorage.setItem('ablefy.userName', name.trim());
    setSaved(true);
    setTimeout(() => { onSave(name.trim()); }, 800);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-page) 55%, transparent)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-card shadow-fab">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-brand text-[15px] font-semibold text-ink">Account settings</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-bg-surface">
            <IconClose />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Display name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Email address</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink placeholder-placeholder focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">New password</label>
            <input type="password" placeholder="Leave blank to keep current" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-[13px] text-ink placeholder-placeholder focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose}
            className="rounded-xl border border-border bg-bg-card px-4 py-2 text-[13px] font-medium text-ink hover:bg-bg-surface">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saved}
            className="rounded-xl bg-black px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-black/80 disabled:opacity-70">
            {saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconSettingsSmall(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M3 3l1 1M10 10l1 1M3 11l1-1M10 4l1-1"/></svg>;
}
function IconLogout(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12H2a1 1 0 01-1-1V3a1 1 0 011-1h3M9 10l3-3-3-3M12 7H5"/></svg>;
}
function IconClose(): JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>;
}
function NavIcon({ d }: { d: string }): JSX.Element {
  return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}
function NavIconPath({ d }: { d: string }): JSX.Element {
  return <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}
function AbleglyGlyph(): JSX.Element {
  return (
    <svg width="18" height="22" viewBox="0 0 28 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26.6175 34.8035C25.6641 35.7569 24.3464 36.347 22.891 36.346C22.0266 36.346 21.2118 36.1381 20.4915 35.7691C19.5063 35.2642 18.7008 34.4588 18.1961 33.4736C17.829 32.7534 17.621 31.9396 17.621 31.0761V30.9384C17.6333 30.442 17.7147 29.9625 17.8552 29.5111C17.8552 29.5092 17.8561 29.5074 17.8552 29.5064C18.1081 28.6869 18.2438 27.8159 18.2448 26.9132C18.2448 25.7612 18.0228 24.6607 17.6201 23.6512C17.1734 22.5292 16.5019 21.5214 15.6627 20.6814C14.8236 19.8413 13.815 19.1698 12.6929 18.724C11.6833 18.3213 10.5829 18.1003 9.43098 18.0993C8.52816 18.0993 7.65718 18.2361 6.8377 18.489H6.83302C6.38161 18.6295 5.90303 18.7109 5.40572 18.7231H5.26805C4.4055 18.7231 3.5907 18.5161 2.8705 18.148C1.88526 17.6432 1.07983 16.8378 0.575037 15.8525C0.207912 15.1352 0 14.3204 0 13.455C0 11.9996 0.589085 10.6819 1.54249 9.72852C2.49589 8.77512 3.81454 8.18604 5.26899 8.18604H27.9727C28.0757 8.18604 28.16 8.27032 28.16 8.37334V31.077C28.16 32.5324 27.5709 33.8501 26.6165 34.8044L26.6175 34.8035Z" fill="#2BFF99"/>
      <path d="M9.61833 31.904C12.5118 31.904 14.8574 29.5585 14.8574 26.665C14.8574 23.7715 12.5118 21.4259 9.61833 21.4259C6.7249 21.4259 4.37926 23.7716 4.37926 26.665C4.37926 29.5583 6.72487 31.904 9.61833 31.904Z" fill="#2BFF99"/>
    </svg>
  );
}
function IconHamburger(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 4h12M2 8h12M2 12h12" />
    </svg>
  );
}
function IconBell(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4.5 7.5a4.5 4.5 0 119 0v3l1.5 2h-12l1.5-2v-3z" strokeLinejoin="round" />
      <path d="M7.5 14.5a1.5 1.5 0 003 0" strokeLinecap="round" />
    </svg>
  );
}
