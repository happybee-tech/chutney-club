'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { RightDrawer } from '@/components/admin/RightDrawer';
import { CouponIcon, DeleteIcon, EditIcon, PlusIcon, ToggleIcon } from '@/components/admin/icons';

type Coupon = {
  id: string;
  code: string;
  name: string;
  discountPct: string;
  minSubtotal: string;
  maxDiscount: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export default function AdminCouponsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Coupon[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountPct, setDiscountPct] = useState('');
  const [minSubtotal, setMinSubtotal] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  async function loadCoupons() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/coupons', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to load coupons');
        return;
      }
      setItems((data.data ?? []) as Coupon[]);
    } catch {
      setError('Network error while loading coupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function resetForm() {
    setCode('');
    setName('');
    setDiscountPct('');
    setMinSubtotal('');
    setMaxDiscount('');
    setStartsAt('');
    setEndsAt('');
    setIsActive(true);
  }

  function openAdd() {
    setEditTarget(null);
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(item: Coupon) {
    setEditTarget(item);
    setCode(item.code);
    setName(item.name);
    setDiscountPct(String(Number(item.discountPct)));
    setMinSubtotal(String(Number(item.minSubtotal)));
    setMaxDiscount(item.maxDiscount == null ? '' : String(Number(item.maxDiscount)));
    setStartsAt(item.startsAt ? item.startsAt.slice(0, 16) : '');
    setEndsAt(item.endsAt ? item.endsAt.slice(0, 16) : '');
    setIsActive(item.isActive);
    setDrawerOpen(true);
  }

  async function saveCoupon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      discount_pct: Number(discountPct),
      min_subtotal: minSubtotal ? Number(minSubtotal) : 0,
      max_discount: maxDiscount ? Number(maxDiscount) : null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_active: isActive,
    };

    if (!payload.code || !payload.name || Number.isNaN(payload.discount_pct)) {
      setError('Code, campaign name, and discount % are required.');
      return;
    }

    try {
      const url = editTarget ? `/api/admin/coupons/${editTarget.id}` : '/api/admin/coupons';
      const method = editTarget ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to save coupon');
        return;
      }

      setDrawerOpen(false);
      resetForm();
      setEditTarget(null);
      loadCoupons();
    } catch {
      setError('Network error while saving coupon');
    }
  }

  async function toggleCoupon(item: Coupon) {
    try {
      const response = await fetch(`/api/admin/coupons/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !item.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to update coupon status');
        return;
      }
      loadCoupons();
    } catch {
      setError('Network error while updating coupon');
    }
  }

  async function deleteCoupon(item: Coupon) {
    try {
      const response = await fetch(`/api/admin/coupons/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to delete coupon');
        return;
      }
      loadCoupons();
    } catch {
      setError('Network error while deleting coupon');
    }
  }

  return (
    <AdminShell title="Coupons & Campaigns">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#667093]">Configure coupon codes and discount percentages.</p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white"
        >
          <PlusIcon className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-[#C7442A]">{error}</p> : null}

      <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#E4E9FF] bg-[#FAFBFF] px-3 py-2 text-xs font-semibold tracking-wide text-[#6C77A0] uppercase">
        <CouponIcon className="h-4 w-4" /> Campaign Rules
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E4E9FF] text-[#7A84AA]">
              <th className="py-2">Code</th>
              <th className="py-2">Campaign</th>
              <th className="py-2">Discount %</th>
              <th className="py-2">Min Subtotal</th>
              <th className="py-2">Max Discount</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-[#7A84AA]" colSpan={7}>
                  Loading coupons...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-4 text-[#7A84AA]" colSpan={7}>
                  No coupons created yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[#EEF2FF] text-[#4E5778]">
                  <td className="py-3 font-semibold text-[#232B4A]">{item.code}</td>
                  <td className="py-3">{item.name}</td>
                  <td className="py-3">{Number(item.discountPct)}%</td>
                  <td className="py-3">Rs {Number(item.minSubtotal)}</td>
                  <td className="py-3">{item.maxDiscount != null ? `Rs ${Number(item.maxDiscount)}` : '-'}</td>
                  <td className="py-3">{item.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><EditIcon className="h-3.5 w-3.5" />Edit</button>
                      <button type="button" onClick={() => setToggleTarget(item)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><ToggleIcon className="h-3.5 w-3.5" />{item.isActive ? 'Disable' : 'Enable'}</button>
                      <button type="button" onClick={() => setDeleteTarget(item)} className="inline-flex items-center gap-1 rounded-md border border-[#F1C6CC] bg-white px-3 py-1 text-xs font-semibold text-[#C7442A]"><DeleteIcon className="h-3.5 w-3.5" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editTarget ? 'Edit Coupon' : 'Add Coupon'}
        onClose={() => {
          setDrawerOpen(false);
          setEditTarget(null);
          resetForm();
        }}
      >
        <form onSubmit={saveCoupon} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B769E]">Coupon Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required className="w-full rounded-lg border border-[#D7DEF7] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B769E]">Campaign Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-[#D7DEF7] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B769E]">Discount %</label>
              <input type="number" min="1" max="100" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} required className="w-full rounded-lg border border-[#D7DEF7] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B769E]">Min Subtotal</label>
              <input type="number" min="0" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} className="w-full rounded-lg border border-[#D7DEF7] px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B769E]">Max Discount</label>
            <input type="number" min="0" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-[#D7DEF7] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B769E]">Starts At</label>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full rounded-lg border border-[#D7DEF7] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B769E]">Ends At</label>
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="w-full rounded-lg border border-[#D7DEF7] px-3 py-2 text-sm" />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-[#4E5778]">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <button type="submit" className="w-full rounded-lg bg-[#4B2E83] px-4 py-2.5 text-sm font-semibold text-white">
            {editTarget ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>
      </RightDrawer>

      <ConfirmModal
        open={!!toggleTarget}
        title={`${toggleTarget?.isActive ? 'Disable' : 'Enable'} coupon`}
        message={`Do you want to ${toggleTarget?.isActive ? 'disable' : 'enable'} ${toggleTarget?.code}?`}
        confirmLabel={toggleTarget?.isActive ? 'Disable' : 'Enable'}
        onClose={() => setToggleTarget(null)}
        onConfirm={async () => {
          if (!toggleTarget) return;
          await toggleCoupon(toggleTarget);
          setToggleTarget(null);
        }}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete coupon"
        message={`Do you want to delete ${deleteTarget?.code}?`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteCoupon(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </AdminShell>
  );
}
