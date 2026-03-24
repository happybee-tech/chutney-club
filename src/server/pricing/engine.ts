export type BulkPricingSlab = {
  min: number;
  max?: number;
  discountPct: number;
};

export type BulkPricingConfig = {
  slabs: BulkPricingSlab[];
};

type CartItem = {
  qty: number;
  priceSnapshot: number;
};

type PricingResult = {
  subtotal: number;
  discount: number;
  total: number;
  appliedSlab: BulkPricingSlab | null;
};

export function calculateBulkPricing(params: {
  items: CartItem[];
  bulkEnabled: boolean;
  minBulkQty: number;
  bulkPricing?: BulkPricingConfig | null;
}): { ok: true; result: PricingResult } | { ok: false; error: string } {
  if (!params.bulkEnabled) return { ok: false, error: 'BULK_NOT_ENABLED' };

  const subtotal = params.items.reduce((sum, i) => sum + i.qty * i.priceSnapshot, 0);
  const totalQty = params.items.reduce((sum, i) => sum + i.qty, 0);

  if (params.minBulkQty > 0 && totalQty < params.minBulkQty) {
    return { ok: false, error: 'MOQ_NOT_MET' };
  }

  const slabs = params.bulkPricing?.slabs ?? [];
  const slab = slabs.find((s) => totalQty >= s.min && (s.max ? totalQty <= s.max : true)) ?? null;
  const discount = slab ? (subtotal * slab.discountPct) / 100 : 0;

  return {
    ok: true,
    result: {
      subtotal,
      discount,
      total: subtotal - discount,
      appliedSlab: slab,
    },
  };
}

export function coerceBulkPricing(input: unknown): BulkPricingConfig | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const candidate = input as { slabs?: unknown };
  if (!Array.isArray(candidate.slabs)) return undefined;

  const slabs: BulkPricingSlab[] = candidate.slabs
    .map((slab) => {
      if (!slab || typeof slab !== 'object') return null;
      const raw = slab as { min?: unknown; max?: unknown; discountPct?: unknown };
      const min = Number(raw.min);
      const discountPct = Number(raw.discountPct);
      const max = raw.max == null ? undefined : Number(raw.max);
      if (Number.isNaN(min) || Number.isNaN(discountPct)) return null;
      if (max != null && Number.isNaN(max)) return null;
      return { min, max, discountPct };
    })
    .filter((slab): slab is BulkPricingSlab => Boolean(slab));

  if (!slabs.length) return undefined;
  return { slabs };
}

export function calculateSinglePricing(items: CartItem[]): PricingResult {
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.priceSnapshot, 0);
  return {
    subtotal,
    discount: 0,
    total: subtotal,
    appliedSlab: null,
  };
}
