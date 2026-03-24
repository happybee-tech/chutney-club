'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { DeleteIcon, EditIcon, PlusIcon, ToggleIcon } from '@/components/admin/icons';
import { RightDrawer } from '@/components/admin/RightDrawer';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

type Brand = {
  id: string;
  name: string;
  description: string | null;
  minBulkQty: number;
  minBulkValue: string;
  bulkEnabled: boolean;
  isActive: boolean;
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bulkEnabled, setBulkEnabled] = useState(false);
  const [minBulkQty, setMinBulkQty] = useState('0');
  const [minBulkValue, setMinBulkValue] = useState('0');

  async function loadBrands() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/brands', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to load brands');
        return;
      }
      setBrands(data.data as Brand[]);
    } catch {
      setError('Network error while loading brands');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  function resetForm() {
    setEditId(null);
    setName('');
    setDescription('');
    setBulkEnabled(false);
    setMinBulkQty('0');
    setMinBulkValue('0');
  }

  function openAdd() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditId(brand.id);
    setName(brand.name);
    setDescription(brand.description ?? '');
    setBulkEnabled(brand.bulkEnabled);
    setMinBulkQty(String(brand.minBulkQty));
    setMinBulkValue(String(brand.minBulkValue ?? '0'));
    setDrawerOpen(true);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      name,
      description: description || undefined,
      bulk_enabled: bulkEnabled,
      min_bulk_qty: bulkEnabled ? Number(minBulkQty || '0') : 0,
      min_bulk_value: bulkEnabled ? Number(minBulkValue || '0') : 0,
    };

    try {
      if (editId) {
        const ok = window.confirm('Confirm update for this brand?');
        if (!ok) return;

        const response = await fetch(`/api/admin/brands/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to update brand');
          return;
        }
      } else {
        const response = await fetch('/api/admin/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to create brand');
          return;
        }
      }

      setDrawerOpen(false);
      resetForm();
      loadBrands();
    } catch {
      setError('Network error while saving brand');
    }
  }

  async function deleteBrand(brand: Brand) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to delete brand');
        return;
      }
      loadBrands();
    } catch {
      setError('Network error while deleting brand');
    }
  }

  async function toggleActive(brand: Brand) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !brand.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to update brand status');
        return;
      }
      loadBrands();
    } catch {
      setError('Network error while updating brand');
    }
  }

  return (
    <AdminShell title="Brands">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#667093]">Manage brand-level configuration and visibility.</p>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white">
          <PlusIcon className="h-4 w-4" /> Add Brand
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-[#C7442A]">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E4E9FF] text-[#7A84AA]">
              <th className="py-2">Name</th>
              <th className="py-2">Allow bulk order</th>
              <th className="py-2">MOQ</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-[#7A84AA]" colSpan={5}>Loading brands...</td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id} className="border-b border-[#EEF2FF] text-[#4E5778]">
                  <td className="py-3 font-medium text-[#232B4A]">{brand.name}</td>
                  <td className="py-3">{brand.bulkEnabled ? 'Yes' : 'No'}</td>
                  <td className="py-3">Qty {brand.minBulkQty} / Value {brand.minBulkValue}</td>
                  <td className="py-3">{brand.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(brand)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><EditIcon className="h-3.5 w-3.5" />Edit</button>
                      <button type="button" onClick={() => setToggleTarget(brand)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><ToggleIcon className="h-3.5 w-3.5" />{brand.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button type="button" onClick={() => setDeleteTarget(brand)} className="inline-flex items-center gap-1 rounded-md border border-[#F1C6CC] bg-white px-3 py-1 text-xs font-semibold text-[#C7442A]"><DeleteIcon className="h-3.5 w-3.5" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editId ? 'Update Brand' : 'Add Brand'}>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Brand Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. The Chutney Club" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short brand description" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#5B6587]">
            <input checked={bulkEnabled} onChange={(e) => setBulkEnabled(e.target.checked)} type="checkbox" />
            Enable Bulk Ordering for this Brand
          </label>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Minimum Bulk Quantity (MOQ)</label>
            <input
              value={minBulkQty}
              onChange={(e) => setMinBulkQty(e.target.value)}
              type="number"
              min="0"
              disabled={!bulkEnabled}
              placeholder="e.g. 50 units"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                bulkEnabled
                  ? 'border-[#D7DEF7] bg-white text-[#232B4A]'
                  : 'cursor-not-allowed border-[#E5E7EF] bg-[#F4F6FB] text-[#9AA3BE]'
              }`}
            />
            <p className="mt-1 text-xs text-[#7A84AA]">Minimum total units required to place a bulk order for this brand.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Minimum Bulk Order Value (INR)</label>
            <input
              value={minBulkValue}
              onChange={(e) => setMinBulkValue(e.target.value)}
              type="number"
              min="0"
              disabled={!bulkEnabled}
              placeholder="e.g. 5000"
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                bulkEnabled
                  ? 'border-[#D7DEF7] bg-white text-[#232B4A]'
                  : 'cursor-not-allowed border-[#E5E7EF] bg-[#F4F6FB] text-[#9AA3BE]'
              }`}
            />
            <p className="mt-1 text-xs text-[#7A84AA]">Alternative MOQ by order value. If set, bulk orders can qualify by value.</p>
          </div>

          <button type="submit" className="w-full rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white">{editId ? 'Update Brand' : 'Create Brand'}</button>
        </form>
      </RightDrawer>

      <ConfirmModal
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? 'Deactivate Brand' : 'Activate Brand'}
        message={
          toggleTarget
            ? `${toggleTarget.isActive ? 'Deactivate' : 'Activate'} ${toggleTarget.name}?`
            : ''
        }
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        onClose={() => setToggleTarget(null)}
        onConfirm={async () => {
          if (!toggleTarget) return;
          const target = toggleTarget;
          setToggleTarget(null);
          await toggleActive(target);
        }}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Brand"
        message={deleteTarget ? `Delete ${deleteTarget.name}? This will mark it inactive.` : ''}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await deleteBrand(target);
        }}
      />
    </AdminShell>
  );
}
