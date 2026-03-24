type BulkPricingSlab = {
  min: number;
  max?: number;
  discountPct: number;
};

type BulkPricingConfig = {
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

export function calculateSinglePricing(items: CartItem[]): PricingResult {
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.priceSnapshot, 0);
  return {
    subtotal,
    discount: 0,
    total: subtotal,
    appliedSlab: null,
  };
}
