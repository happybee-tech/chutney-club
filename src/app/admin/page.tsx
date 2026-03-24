'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { BrandIcon, CategoryIcon, OrdersIcon, ProductIcon, UsersIcon, PlusIcon } from '@/components/admin/icons';

type Analytics = {
  brands: number;
  activeBrands: number;
  categories: number;
  activeCategories: number;
  products: number;
  activeProducts: number;
  orders: number;
  users: number;
};

const EMPTY: Analytics = {
  brands: 0,
  activeBrands: 0,
  categories: 0,
  activeCategories: 0,
  products: 0,
  activeProducts: 0,
  orders: 0,
  users: 0,
};

export default function AdminHomePage() {
  const [analytics, setAnalytics] = useState<Analytics>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasBrands = analytics.brands > 0;

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/analytics', { credentials: 'include' });
        const data = await response.json();

        if (!mounted) return;

        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to load analytics');
          return;
        }

        setAnalytics(data.data as Analytics);
      } catch {
        if (mounted) setError('Network error while loading analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { label: 'Brands', value: analytics.brands, sub: `${analytics.activeBrands} active`, href: '/admin/brands', Icon: BrandIcon },
    { label: 'Categories', value: analytics.categories, sub: `${analytics.activeCategories} active`, href: '/admin/categories', Icon: CategoryIcon },
    { label: 'Products', value: analytics.products, sub: `${analytics.activeProducts} active`, href: '/admin/products', Icon: ProductIcon },
    { label: 'Orders', value: analytics.orders, sub: 'All order states', href: '/admin/orders', Icon: OrdersIcon },
    { label: 'Users', value: analytics.users, sub: 'Signed-up users', href: '/admin', Icon: UsersIcon },
  ];

  return (
    <AdminShell title="Overview">
      <p className="text-sm text-[#667093]">Operational snapshot across your multibrand platform.</p>
      {error && <p className="mt-3 text-sm text-[#C7442A]">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl border border-[#E4E9FF] bg-[#FAFBFF] p-4 hover:bg-[#F4F7FF]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#7A84AA] uppercase">{card.label}</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF1FF] text-[#4B2E83]">
                <card.Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-3xl font-black text-[#232B4A]">{loading ? '-' : card.value}</p>
            <p className="mt-1 text-xs text-[#6A7392]">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E4E9FF] bg-[#FAFBFF] p-4">
          <p className="text-sm font-semibold text-[#232B4A]">Quick Actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/admin/brands" className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-3 py-2 text-xs font-semibold text-white">
              <PlusIcon className="h-3.5 w-3.5" /> Add Brand
            </Link>
            {hasBrands ? (
              <Link href="/admin/categories" className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-3 py-2 text-xs font-semibold text-white">
                <PlusIcon className="h-3.5 w-3.5" /> Add Category
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Create a brand first"
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-[#B8C0DE] px-3 py-2 text-xs font-semibold text-white opacity-80"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Add Category
              </button>
            )}
            {hasBrands ? (
              <Link href="/admin/products" className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-3 py-2 text-xs font-semibold text-white">
                <PlusIcon className="h-3.5 w-3.5" /> Add Product
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Create a brand first"
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-[#B8C0DE] px-3 py-2 text-xs font-semibold text-white opacity-80"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Add Product
              </button>
            )}
          </div>
          {!hasBrands && (
            <p className="mt-3 text-xs text-[#C7442A]">Create your first brand to unlock categories and products.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#E4E9FF] bg-[#FAFBFF] p-4">
          <p className="text-sm font-semibold text-[#232B4A]">System Notes</p>
          <ul className="mt-3 space-y-1 text-sm text-[#5A6486]">
            <li>Single auth system with role-based admin access.</li>
            <li>Bulk rules are enforced per brand at checkout.</li>
            <li>Use module pages for create/update/status controls.</li>
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
