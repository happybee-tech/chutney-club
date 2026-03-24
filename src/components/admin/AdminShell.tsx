'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  OverviewIcon,
  BrandIcon,
  CategoryIcon,
  ProductIcon,
  OrdersIcon,
  LogoutIcon,
  SurveyIcon,
  CouponIcon,
} from '@/components/admin/icons';

type AdminShellProps = {
  title: string;
  children: React.ReactNode;
};

type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: 'admin' | 'customer' | 'vendor';
};

type NavItem = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
};

type BrandOption = {
  id: string;
  name: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Overview', Icon: OverviewIcon },
  { href: '/admin/brands', label: 'Brands', Icon: BrandIcon },
  { href: '/admin/categories', label: 'Categories', Icon: CategoryIcon },
  { href: '/admin/products', label: 'Products', Icon: ProductIcon },
  { href: '/admin/orders', label: 'Orders', Icon: OrdersIcon },
  { href: '/admin/coupons', label: 'Coupons', Icon: CouponIcon },
  { href: '/admin/surveys', label: 'Surveys', Icon: SurveyIcon },
];

export function AdminShell({ title, children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('hb_admin_nav_collapsed') : null;
    setCollapsed(stored === '1');
  }, []);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/session', { credentials: 'include' });
        const data = await response.json();

        if (!mounted) return;
        if (!response.ok || !data.success) {
          router.replace('/admin/logout');
          return;
        }

        setUser(data.data.user as AdminUser);
      } catch {
        if (mounted) router.replace('/admin/logout');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function loadBrands() {
      try {
        const response = await fetch('/api/admin/brands', { credentials: 'include' });
        const data = await response.json();
        if (!mounted || !response.ok || !data.success) return;
        setBrands((data.data as BrandOption[]) ?? []);
      } catch {
        if (mounted) setBrands([]);
      }
    }

    loadBrands();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const queryBrand = searchParams.get('brand_id') ?? '';
    if (queryBrand) {
      setSelectedBrandId(queryBrand);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hb_admin_brand_id', queryBrand);
      }
      return;
    }

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('hb_admin_brand_id') ?? '';
      if (stored) setSelectedBrandId(stored);
    }
  }, [searchParams]);

  async function handleLogout() {
    router.replace('/admin/logout');
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hb_admin_nav_collapsed', next ? '1' : '0');
      }
      return next;
    });
  }

  function applyBrand(brandId: string) {
    setSelectedBrandId(brandId);
    if (typeof window !== 'undefined') {
      if (brandId) {
        window.localStorage.setItem('hb_admin_brand_id', brandId);
      } else {
        window.localStorage.removeItem('hb_admin_brand_id');
      }
    }

    const params = new URLSearchParams(searchParams.toString());
    if (brandId) {
      params.set('brand_id', brandId);
    } else {
      params.delete('brand_id');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function navHref(href: string) {
    if (!selectedBrandId || href === '/admin/brands') return href;
    return `${href}?brand_id=${encodeURIComponent(selectedBrandId)}`;
  }

  const showBrandSwitcher = pathname !== '/admin/login' && pathname !== '/admin/brands';
  const selectedBrandName = brands.find((b) => b.id === selectedBrandId)?.name ?? null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#e8e4ff_0%,#f4f7ff_42%,#eef2ff_100%)]">
      <div className="flex min-h-screen gap-5 p-4 sm:p-6">
        <aside
          className={`sticky top-4 h-[calc(100vh-2rem)] shrink-0 rounded-3xl border border-[#E2E8FF] bg-white shadow-[0_18px_40px_rgba(76,64,170,0.10)] transition-all duration-200 ${
            collapsed ? 'w-[88px]' : 'w-[272px]'
          }`}
        >
          <div className="flex h-full flex-col p-4">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#7B86AB] uppercase">Happybee</p>
                  <p className="text-xl font-black text-[#232B4A]">Admin OS</p>
                </div>
              )}
              <button
                type="button"
                onClick={toggleCollapsed}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8FF] bg-[#F7F9FF] text-[#4B2E83] shadow-sm"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  {collapsed ? (
                    <>
                      <path d="M9 6l6 6-6 6" />
                      <path d="M5 6l6 6-6 6" />
                    </>
                  ) : (
                    <>
                      <path d="M15 18l-6-6 6-6" />
                      <path d="M19 18l-6-6 6-6" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {showBrandSwitcher && !collapsed && (
              <div className="mt-4 rounded-xl border border-[#E2E8FF] bg-[#F8FAFF] p-3">
                <label className="mb-1.5 block text-[11px] font-semibold tracking-[0.1em] text-[#6B769E] uppercase">
                  Active Brand
                </label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => applyBrand(e.target.value)}
                  className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]"
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <nav className="mt-6 space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={navHref(item.href)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-[linear-gradient(135deg,#4B2E83_0%,#6D4FC2_100%)] text-white shadow-[0_14px_28px_rgba(75,46,131,0.25)]'
                        : 'text-[#4B5477] hover:bg-[#F5F7FF]'
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                        active ? 'bg-white/20' : 'bg-[#EFF3FF] text-[#6B77A4]'
                      }`}
                    >
                      <item.Icon className="h-4 w-4" />
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-[#E2E8FF] bg-[#F8FAFF] p-3">
              {!collapsed && (
                <>
                  <p className="text-xs text-[#7B86AB]">Signed in as</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#242E52]">{user?.name || user?.email || 'Admin'}</p>
                </>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E3D9FF] bg-white px-3 py-2 text-xs font-semibold text-[#C34E5D] hover:bg-[#FFF7F8]"
              >
                <LogoutIcon className="h-3.5 w-3.5" />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-3">
          <header className="mb-5 rounded-3xl border border-[#E2E8FF] bg-white/90 px-6 py-5 shadow-[0_14px_30px_rgba(76,64,170,0.08)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-black text-[#232B4A]">{title}</h1>
              {showBrandSwitcher && (
                <p className="rounded-lg border border-[#E2E8FF] bg-[#F8FAFF] px-3 py-2 text-xs font-semibold tracking-[0.04em] text-[#5A668E] uppercase">
                  Brand: {selectedBrandName ?? 'Not selected'}
                </p>
              )}
            </div>
          </header>
          <section className="rounded-3xl border border-[#E2E8FF] bg-white p-6 shadow-[0_16px_34px_rgba(76,64,170,0.08)] sm:p-7">
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="flex items-center gap-2 text-[#6A7392]">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#4B2E83]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#6D4FC2] [animation-delay:120ms]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#9A86DA] [animation-delay:240ms]" />
                </div>
              </div>
            ) : (
              children
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
