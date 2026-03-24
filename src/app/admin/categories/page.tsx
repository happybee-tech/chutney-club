'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { DeleteIcon, EditIcon, PlusIcon, ToggleIcon } from '@/components/admin/icons';
import { RightDrawer } from '@/components/admin/RightDrawer';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

type Brand = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  brand?: { id: string; name: string };
};

export default function AdminCategoriesPage() {
  const searchParams = useSearchParams();
  const selectedBrandId = searchParams.get('brand_id') ?? '';
  const [brands, setBrands] = useState<Brand[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');

  const hasBrands = brands.length > 0;

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const brandLabel = useMemo(
    () => brands.find((b) => b.id === selectedBrandId)?.name ?? 'All Brands',
    [brands, selectedBrandId]
  );

  async function loadBrands() {
    const response = await fetch('/api/admin/brands', { credentials: 'include' });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message ?? 'Failed to load brands');
    }
    const fetched = (data.data as Brand[]).filter((b) => Boolean(b.id));
    setBrands(fetched);
    return fetched;
  }

  async function loadCategories(brandIdFilter?: string) {
    setLoading(true);
    setError(null);
    try {
      const query = brandIdFilter ? `?brand_id=${encodeURIComponent(brandIdFilter)}` : '';
      const response = await fetch(`/api/admin/categories${query}`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to load categories');
        return;
      }
      setCategories(data.data as Category[]);
    } catch {
      setError('Network error while loading categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        await loadBrands();
        if (!mounted) return;
        if (!searchParams.get('brand_id')) {
          setCategories([]);
          setLoading(false);
        }
      } catch (e: unknown) {
        if (!mounted) return;
        const message = e instanceof Error ? e.message : 'Failed to load initial data';
        setError(message);
        setLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!selectedBrandId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    loadCategories(selectedBrandId);
  }, [selectedBrandId]);

  function resetForm() {
    setEditId(null);
    setName('');
    setSlug('');
    setSlugTouched(false);
    setDescription('');
  }

  function openAdd() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(category: Category) {
    setEditId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setSlugTouched(true);
    setDescription(category.description ?? '');
    setDrawerOpen(true);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedBrandId) {
      setError('Please select a brand first');
      return;
    }

    const payload = { brand_id: selectedBrandId, name, slug, description: description || undefined };

    try {
      if (editId) {
        const ok = window.confirm('Confirm update for this category?');
        if (!ok) return;

        const response = await fetch(`/api/admin/categories/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to update category');
          return;
        }
      } else {
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to create category');
          return;
        }
      }

      setDrawerOpen(false);
      resetForm();
      loadCategories(selectedBrandId);
    } catch {
      setError('Network error while saving category');
    }
  }

  async function toggleActive(category: Category) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !category.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to update category status');
        return;
      }
      loadCategories(selectedBrandId);
    } catch {
      setError('Network error while updating category');
    }
  }

  async function deleteCategory(category: Category) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to delete category');
        return;
      }
      loadCategories(selectedBrandId);
    } catch {
      setError('Network error while deleting category');
    }
  }

  return (
    <AdminShell title="Categories">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#667093]">Manage categories for the active brand.</p>

        <button
          type="button"
          onClick={openAdd}
          disabled={!hasBrands || !selectedBrandId}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" /> Add Category
        </button>
      </div>

      {!hasBrands && (
        <p className="mb-3 text-sm text-[#C7442A]">
          Create at least one brand first. Categories are brand-specific.
        </p>
      )}
      {hasBrands && !selectedBrandId && (
        <p className="mb-3 text-sm text-[#C7442A]">
          Select a brand from the top switcher to manage categories.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-[#C7442A]">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E4E9FF] text-[#7A84AA]">
              <th className="py-2">Name</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Brand</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-[#7A84AA]" colSpan={5}>Loading categories...</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-[#EEF2FF] text-[#4E5778]">
                  <td className="py-3 font-medium text-[#232B4A]">{category.name}</td>
                  <td className="py-3">{category.slug}</td>
                  <td className="py-3">{category.brand?.name ?? brandLabel}</td>
                  <td className="py-3">{category.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(category)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><EditIcon className="h-3.5 w-3.5" />Edit</button>
                      <button type="button" onClick={() => setToggleTarget(category)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><ToggleIcon className="h-3.5 w-3.5" />{category.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button type="button" onClick={() => setDeleteTarget(category)} className="inline-flex items-center gap-1 rounded-md border border-[#F1C6CC] bg-white px-3 py-1 text-xs font-semibold text-[#C7442A]"><DeleteIcon className="h-3.5 w-3.5" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editId ? 'Update Category' : 'Add Category'}>
        {!hasBrands ? (
          <p className="text-sm text-[#C7442A]">Create a brand first before adding categories.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Brand</label>
              <p className="w-full rounded-lg border border-[#D7DEF7] bg-[#F8FAFF] px-3 py-2 text-sm text-[#232B4A]">
                {brandLabel}
              </p>
            </div>

            {!selectedBrandId ? (
              <p className="rounded-lg border border-[#F1C6CC] bg-[#FFF6F7] px-3 py-2 text-sm text-[#C7442A]">
                Select a brand to continue.
              </p>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Category Name</label>
                  <input
                    value={name}
                    onChange={(e) => {
                      const next = e.target.value;
                      setName(next);
                      if (!slugTouched) {
                        setSlug(slugify(next));
                      }
                    }}
                    required
                    placeholder="e.g. Salads"
                    className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Slug</label>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    required
                    placeholder="e.g. salads"
                    className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Description</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short category description" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                </div>

                <button type="submit" className="w-full rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white">{editId ? 'Update Category' : 'Create Category'}</button>
              </>
            )}
          </form>
        )}
      </RightDrawer>

      <ConfirmModal
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? 'Deactivate Category' : 'Activate Category'}
        message={toggleTarget ? `${toggleTarget.isActive ? 'Deactivate' : 'Activate'} ${toggleTarget.name}?` : ''}
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
        title="Delete Category"
        message={deleteTarget ? `Delete ${deleteTarget.name}? This will mark it inactive.` : ''}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await deleteCategory(target);
        }}
      />
    </AdminShell>
  );
}
