'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { DeleteIcon, EditIcon, PlusIcon, ProductIcon, ToggleIcon } from '@/components/admin/icons';
import { RightDrawer } from '@/components/admin/RightDrawer';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

type Brand = { id: string; name: string; isActive?: boolean };
type Category = { id: string; brandId: string; name: string };
type Product = {
  id: string;
  name: string;
  description?: string | null;
  sortOrder?: number;
  isActive: boolean;
  isPerishable: boolean;
  isOutOfStock?: boolean;
  brand: { id: string; name: string };
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    price: string;
    unit?: string | null;
    prepTimeMinutes?: number | null;
    cutoffTime?: string | null;
    shelfLifeHours?: number | null;
    availableDays?: string[];
    calories?: number | null;
    proteinGrams?: string | null;
    carbsGrams?: string | null;
    fatGrams?: string | null;
  }>;
  images: Array<{ id: string; url: string; sortOrder: number }>;
  categories?: Array<{ categoryId: string; category: { id: string; name: string; brandId: string } }>;
};

type VariantInput = {
  id?: string;
  sku: string;
  name: string;
  price: string;
  unit: string;
  prepTimeMinutes: string;
  cutoffTime: string;
  shelfLifeHours: string;
  availableDays: string;
  calories: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
};
type UploadedImage = { path?: string; url: string; name: string; size?: number };

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const selectedBrandId = searchParams.get('brand_id') ?? '';
  const [brands, setBrands] = useState<Brand[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingProductId, setDraggingProductId] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPerishable, setIsPerishable] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [variants, setVariants] = useState<VariantInput[]>([
    {
      sku: '',
      name: '',
      price: '',
      unit: '',
      prepTimeMinutes: '',
      cutoffTime: '',
      shelfLifeHours: '',
      availableDays: '',
      calories: '',
      proteinGrams: '',
      carbsGrams: '',
      fatGrams: '',
    },
  ]);

  const hasBrands = brands.length > 0;

  async function fetchBrands() {
    const response = await fetch('/api/admin/brands', { credentials: 'include' });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data?.error?.message ?? 'Failed to load brands');
    const items = (data.data as Brand[]).filter((b) => Boolean(b.id));
    setBrands(items);
    return items;
  }

  async function fetchCategories(brandIdFilter: string) {
    if (!brandIdFilter) {
      setCategories([]);
      return;
    }
    const response = await fetch(`/api/admin/categories?brand_id=${encodeURIComponent(brandIdFilter)}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data?.error?.message ?? 'Failed to load categories');
    setCategories((data.data as Category[]).filter((c) => Boolean(c.id)));
  }

  async function fetchProducts(brandIdFilter?: string) {
    setLoading(true);
    setError(null);

    try {
      const query = brandIdFilter ? `?brand_id=${encodeURIComponent(brandIdFilter)}` : '';
      const response = await fetch(`/api/admin/products${query}`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to load products');
        return;
      }
      setProducts((data.data.items ?? []) as Product[]);
    } catch {
      setError('Network error while loading products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        await fetchBrands();
        if (!mounted) return;
        if (!searchParams.get('brand_id')) {
          setProducts([]);
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
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    fetchProducts(selectedBrandId);
    fetchCategories(selectedBrandId);
  }, [selectedBrandId]);

  useEffect(() => {
    if (!drawerOpen || !selectedBrandId) return;
    fetchCategories(selectedBrandId).catch(() => {
      setError('Failed to load categories for selected brand');
    });
  }, [drawerOpen, selectedBrandId]);

  function setVariantField(index: number, field: keyof VariantInput, value: string) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function addVariantRow() {
    setVariants((prev) => [
      ...prev,
      {
        sku: '',
        name: '',
        price: '',
        unit: '',
        prepTimeMinutes: '',
        cutoffTime: '',
        shelfLifeHours: '',
        availableDays: '',
        calories: '',
        proteinGrams: '',
        carbsGrams: '',
        fatGrams: '',
      },
    ]);
  }

  function removeVariantRow(index: number) {
    setVariants((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function resetForm() {
    setEditId(null);
    setName('');
    setDescription('');
    setIsPerishable(false);
    setIsOutOfStock(false);
    setSelectedCategories([]);
    setUploadedImages([]);
    setUploadingImages(false);
    setVariants([
      {
        sku: '',
        name: '',
        price: '',
        unit: '',
        prepTimeMinutes: '',
        cutoffTime: '',
        shelfLifeHours: '',
        availableDays: '',
        calories: '',
        proteinGrams: '',
        carbsGrams: '',
        fatGrams: '',
      },
    ]);
  }

  function openAdd() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditId(product.id);
    setName(product.name);
    setDescription(product.description ?? '');
    setIsPerishable(product.isPerishable);
    setIsOutOfStock(Boolean(product.isOutOfStock));
    setUploadedImages(
      (product.images ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => ({ url: img.url, name: img.url.split('/').pop() || 'image' }))
    );
    setVariants(
      product.variants.length
        ? product.variants.map((v) => ({
            id: v.id,
            sku: v.sku ?? '',
            name: v.name ?? '',
            price: String(v.price ?? ''),
            unit: v.unit ?? '',
            prepTimeMinutes: v.prepTimeMinutes != null ? String(v.prepTimeMinutes) : '',
            cutoffTime: v.cutoffTime ?? '',
            shelfLifeHours: v.shelfLifeHours != null ? String(v.shelfLifeHours) : '',
            availableDays: (v.availableDays ?? []).join(', '),
            calories: v.calories != null ? String(v.calories) : '',
            proteinGrams: v.proteinGrams != null ? String(v.proteinGrams) : '',
            carbsGrams: v.carbsGrams != null ? String(v.carbsGrams) : '',
            fatGrams: v.fatGrams != null ? String(v.fatGrams) : '',
          }))
        : [
            {
              sku: '',
              name: '',
              price: '',
              unit: '',
              prepTimeMinutes: '',
              cutoffTime: '',
              shelfLifeHours: '',
              availableDays: '',
              calories: '',
              proteinGrams: '',
              carbsGrams: '',
              fatGrams: '',
            },
          ]
    );
    setSelectedCategories((product.categories ?? []).map((c) => c.categoryId));
    setDrawerOpen(true);
  }

  async function uploadProductImages(files: FileList | null) {
    if (!files || !files.length) return;
    if (!selectedBrandId) {
      setError('Select a brand first');
      return;
    }

    setError(null);
    setUploadingImages(true);

    try {
      const form = new FormData();
      form.append('brand_id', selectedBrandId);
      Array.from(files).forEach((file) => form.append('files', file));

      const response = await fetch('/api/admin/uploads/product-images', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to upload images');
        return;
      }

      const next = (data.data.uploaded as UploadedImage[]) ?? [];
      setUploadedImages((prev) => [...prev, ...next]);
    } catch {
      setError('Network error while uploading images');
    } finally {
      setUploadingImages(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedBrandId) {
      setError('Please select a brand first');
      return;
    }

    try {
      const cleanedVariants = variants
        .filter((v) => v.sku && v.name && v.price)
        .map((v) => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          price: Number(v.price),
          unit: v.unit || undefined,
          prepTimeMinutes: v.prepTimeMinutes ? Number(v.prepTimeMinutes) : undefined,
          cutoffTime: v.cutoffTime || undefined,
          shelfLifeHours: v.shelfLifeHours ? Number(v.shelfLifeHours) : undefined,
          availableDays: v.availableDays
            ? v.availableDays
                .split(',')
                .map((d) => d.trim().toLowerCase())
                .filter(Boolean)
            : [],
          calories: v.calories ? Number(v.calories) : undefined,
          proteinGrams: v.proteinGrams ? Number(v.proteinGrams) : undefined,
          carbsGrams: v.carbsGrams ? Number(v.carbsGrams) : undefined,
          fatGrams: v.fatGrams ? Number(v.fatGrams) : undefined,
        }));

      if (!cleanedVariants.length) {
        setError('At least one valid variant is required');
        return;
      }

      if (editId) {
        const ok = window.confirm('Confirm update for this product?');
        if (!ok) return;

        const response = await fetch(`/api/admin/products/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name,
            description: description || undefined,
            is_perishable: isPerishable,
            is_out_of_stock: isOutOfStock,
            category_ids: selectedCategories,
            variants: cleanedVariants,
            images: uploadedImages.map((img, index) => ({ url: img.url, sortOrder: index })),
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to update product');
          return;
        }
      } else {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            brand_id: selectedBrandId,
            name,
            description: description || undefined,
            is_perishable: isPerishable,
            is_out_of_stock: isOutOfStock,
            category_ids: selectedCategories,
            variants: cleanedVariants,
            images: uploadedImages.map((img, index) => ({ url: img.url, sortOrder: index })),
          }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to create product');
          return;
        }
      }

      setDrawerOpen(false);
      resetForm();
      fetchProducts(selectedBrandId);
    } catch {
      setError('Network error while saving product');
    }
  }

  async function toggleActive(product: Product) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !product.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to update product status');
        return;
      }
      fetchProducts(selectedBrandId);
    } catch {
      setError('Network error while updating product');
    }
  }

  async function deleteProduct(product: Product) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to delete product');
        return;
      }
      fetchProducts(selectedBrandId);
    } catch {
      setError('Network error while deleting product');
    }
  }

  async function persistProductOrder(nextProducts: Product[]) {
    if (!selectedBrandId) return;
    const response = await fetch('/api/admin/products/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        brand_id: selectedBrandId,
        product_ids: nextProducts.map((product) => product.id),
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message ?? 'Failed to reorder products');
    }
    setProducts((data.data ?? []) as Product[]);
  }

  async function handleDropProduct(targetProductId: string) {
    if (!draggingProductId || draggingProductId === targetProductId) {
      setDraggingProductId(null);
      return;
    }

    const current = [...products];
    const fromIndex = current.findIndex((product) => product.id === draggingProductId);
    const toIndex = current.findIndex((product) => product.id === targetProductId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggingProductId(null);
      return;
    }

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setProducts(current);
    setDraggingProductId(null);

    try {
      await persistProductOrder(current);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reorder products');
      fetchProducts(selectedBrandId);
    }
  }

  return (
    <AdminShell title="Products">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#667093]">{selectedBrandId ? 'Managing selected brand catalog.' : 'Select a brand from the top switcher.'}</p>

        <button
          type="button"
          onClick={openAdd}
          disabled={!hasBrands || !selectedBrandId}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" /> Add Product
        </button>
      </div>

      {!hasBrands && (
        <p className="mb-3 text-sm text-[#C7442A]">Create at least one brand first. Products are brand-specific.</p>
      )}
      {hasBrands && !selectedBrandId && (
        <p className="mb-3 text-sm text-[#C7442A]">Select a brand from the top switcher to manage products.</p>
      )}

      {error && <p className="mt-2 text-sm text-[#C7442A]">{error}</p>}

      <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#E4E9FF] bg-[#FAFBFF] px-3 py-2 text-xs font-semibold tracking-wide text-[#6C77A0] uppercase">
        <ProductIcon className="h-4 w-4" /> Catalog Composer
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E4E9FF] text-[#7A84AA]">
              <th className="py-2">Order</th>
              <th className="py-2">Product</th>
              <th className="py-2">Brand</th>
              <th className="py-2">Perishable</th>
              <th className="py-2">Variants</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-[#7A84AA]" colSpan={7}>Loading products...</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  draggable
                  onDragStart={() => setDraggingProductId(product.id)}
                  onDragEnd={() => setDraggingProductId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDropProduct(product.id)}
                  className={`border-b border-[#EEF2FF] text-[#4E5778] ${draggingProductId === product.id ? 'opacity-50' : ''}`}
                >
                  <td className="py-3 text-[#9AA3BE]" title="Drag to reorder">⋮⋮</td>
                  <td className="py-3 font-medium text-[#232B4A]">{product.name}</td>
                  <td className="py-3">{product.brand?.name ?? '-'}</td>
                  <td className="py-3">{product.isPerishable ? 'Yes' : 'No'}</td>
                  <td className="py-3">{product.variants.length}</td>
                  <td className="py-3">{product.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(product)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><EditIcon className="h-3.5 w-3.5" />Edit</button>
                      <button type="button" onClick={() => setToggleTarget(product)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778]"><ToggleIcon className="h-3.5 w-3.5" />{product.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button type="button" onClick={() => setDeleteTarget(product)} className="inline-flex items-center gap-1 rounded-md border border-[#F1C6CC] bg-white px-3 py-1 text-xs font-semibold text-[#C7442A]"><DeleteIcon className="h-3.5 w-3.5" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editId ? 'Update Product' : 'Add Product'}>
        {!hasBrands ? (
          <p className="text-sm text-[#C7442A]">Create a brand first before adding products.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Brand</label>
              <p className="w-full rounded-lg border border-[#D7DEF7] bg-[#F8FAFF] px-3 py-2 text-sm text-[#232B4A]">
                {brands.find((brand) => brand.id === selectedBrandId)?.name ?? 'Not selected'}
              </p>
            </div>

            {!selectedBrandId ? (
              <p className="rounded-lg border border-[#F1C6CC] bg-[#FFF6F7] px-3 py-2 text-sm text-[#C7442A]">
                Select a brand to continue.
              </p>
            ) : (
              <>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product name" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />

                <label className="flex items-center gap-2 text-sm text-[#5B6587]"><input checked={isPerishable} onChange={(e) => setIsPerishable(e.target.checked)} type="checkbox" />Perishable product</label>
                <label className="flex items-center gap-2 text-sm text-[#5B6587]"><input checked={isOutOfStock} onChange={(e) => setIsOutOfStock(e.target.checked)} type="checkbox" />Out of stock</label>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Product Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      uploadProductImages(e.target.files);
                      e.currentTarget.value = '';
                    }}
                    className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]"
                  />
                  <p className="mt-1 text-xs text-[#7A84AA]">You can upload multiple images. They are stored in Supabase Storage.</p>
                  {uploadingImages && <p className="mt-2 text-xs text-[#4B2E83]">Uploading images...</p>}
                  {uploadedImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {uploadedImages.map((img, index) => (
                        <div key={`${img.url}-${index}`} className="relative overflow-hidden rounded-lg border border-[#D7DEF7] bg-[#F8FAFF]">
                          <img src={img.url} alt={img.name} className="h-20 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== index))}
                            className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-[#C7442A]"
                            aria-label="Remove image"
                          >
                            <DeleteIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-[#4E5778]">Categories ({categories.length})</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categories.map((category) => {
                      const checked = selectedCategories.includes(category.id);
                      return (
                        <label key={category.id} className="flex items-center gap-2 text-sm text-[#5B6587]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedCategories((prev) =>
                                e.target.checked ? [...prev, category.id] : prev.filter((id) => id !== category.id)
                              );
                            }}
                          />
                          {category.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-[#4E5778]">Variants</p>
                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                        <div key={index} className="rounded-lg border border-[#E4E9FF] bg-[#FAFBFF] p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold tracking-[0.08em] text-[#6C77A0] uppercase">Variant {index + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeVariantRow(index)}
                              disabled={variants.length === 1}
                              className="inline-flex items-center gap-1 rounded-md border border-[#F1C6CC] bg-white px-2 py-1 text-xs font-semibold text-[#C7442A] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <DeleteIcon className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-semibold tracking-[0.08em] text-[#6C77A0] uppercase">SKU</label>
                            <input value={variant.sku} onChange={(e) => setVariantField(index, 'sku', e.target.value)} placeholder="SKU" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold tracking-[0.08em] text-[#6C77A0] uppercase">Variant Name</label>
                            <input value={variant.name} onChange={(e) => setVariantField(index, 'name', e.target.value)} placeholder="Variant name" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          </div>
                          <input value={variant.price} onChange={(e) => setVariantField(index, 'price', e.target.value)} type="number" min="0" placeholder="Price" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.unit} onChange={(e) => setVariantField(index, 'unit', e.target.value)} placeholder="Unit (optional)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.prepTimeMinutes} onChange={(e) => setVariantField(index, 'prepTimeMinutes', e.target.value)} type="number" min="0" placeholder="Prep time (mins)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.cutoffTime} onChange={(e) => setVariantField(index, 'cutoffTime', e.target.value)} placeholder="Cutoff time (e.g. 10:30)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.shelfLifeHours} onChange={(e) => setVariantField(index, 'shelfLifeHours', e.target.value)} type="number" min="0" placeholder="Shelf life (hours)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.availableDays} onChange={(e) => setVariantField(index, 'availableDays', e.target.value)} placeholder="Available days (mon,tue,...)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.calories} onChange={(e) => setVariantField(index, 'calories', e.target.value)} type="number" min="0" placeholder="Calories (kcal)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.proteinGrams} onChange={(e) => setVariantField(index, 'proteinGrams', e.target.value)} type="number" min="0" step="0.1" placeholder="Protein (g)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.carbsGrams} onChange={(e) => setVariantField(index, 'carbsGrams', e.target.value)} type="number" min="0" step="0.1" placeholder="Carbs (g)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          <input value={variant.fatGrams} onChange={(e) => setVariantField(index, 'fatGrams', e.target.value)} type="number" min="0" step="0.1" placeholder="Fat (g)" className="rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addVariantRow} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#4B2E83]"><PlusIcon className="h-4 w-4" />Add another variant</button>
                  </div>

                <button type="submit" className="w-full rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white">{editId ? 'Update Product' : 'Create Product'}</button>
              </>
            )}
          </form>
        )}
      </RightDrawer>

      <ConfirmModal
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive ? 'Deactivate Product' : 'Activate Product'}
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
        title="Delete Product"
        message={deleteTarget ? `Delete ${deleteTarget.name}? This will mark it inactive.` : ''}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await deleteProduct(target);
        }}
      />
    </AdminShell>
  );
}
