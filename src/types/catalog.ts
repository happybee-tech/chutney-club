import type { UUID } from './common';

export type Brand = {
  id: UUID;
  name: string;
  description?: string | null;
  min_bulk_qty?: number;
  min_bulk_value?: number;
  bulk_enabled?: boolean;
  bulk_pricing?: {
    slabs: Array<{ min: number; max?: number; discountPct: number }>;
  } | null;
};

export type ProductVariant = {
  id: UUID;
  name: string;
  price: number;
  sku?: string;
};

export type Product = {
  id: UUID;
  brand_id: UUID;
  name: string;
  description?: string | null;
  is_perishable: boolean;
  variants: ProductVariant[];
  images?: string[];
  categories?: Category[];
};

export type Category = {
  id: UUID;
  name: string;
  slug: string;
  description?: string | null;
};

export type ProductList = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
};
