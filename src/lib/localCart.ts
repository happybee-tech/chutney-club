export const LOCAL_CART_KEY = 'hb_local_cart_v1';

export type LocalCartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  qty: number;
  brandId: string;
  imageUrl?: string | null;
};

export type LocalCart = {
  orderType: 'single';
  items: LocalCartItem[];
  updatedAt: string;
};

const CART_EVENT = 'hb-cart-updated';

function emitCartUpdated(detail?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail }));
}

export function getLocalCart(): LocalCart {
  if (typeof window === 'undefined') {
    return { orderType: 'single', items: [], updatedAt: new Date(0).toISOString() };
  }
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) return { orderType: 'single', items: [], updatedAt: new Date().toISOString() };
    const parsed = JSON.parse(raw) as Partial<LocalCart>;
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return {
      orderType: 'single',
      items: items
        .filter((item): item is LocalCartItem => Boolean(item?.variantId && item?.productId && item?.brandId))
        .map((item) => ({
          ...item,
          qty: Math.max(0, Number(item.qty || 0)),
          price: Number(item.price || 0),
        }))
        .filter((item) => item.qty > 0),
      updatedAt: typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return { orderType: 'single', items: [], updatedAt: new Date().toISOString() };
  }
}

function setLocalCart(cart: LocalCart, detail?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  emitCartUpdated(detail);
}

export function getLocalCartCount() {
  return getLocalCart().items.reduce((sum, item) => sum + item.qty, 0);
}

export function addToLocalCart(input: Omit<LocalCartItem, 'qty'> & { qty?: number }) {
  const qtyToAdd = Math.max(1, Number(input.qty || 1));
  const cart = getLocalCart();
  const existing = cart.items.find((item) => item.variantId === input.variantId);
  if (existing) {
    existing.qty += qtyToAdd;
    existing.price = Number(input.price);
    existing.productName = input.productName;
    existing.variantName = input.variantName;
    existing.imageUrl = input.imageUrl ?? existing.imageUrl ?? null;
  } else {
    cart.items.push({
      variantId: input.variantId,
      productId: input.productId,
      productName: input.productName,
      variantName: input.variantName,
      price: Number(input.price),
      qty: qtyToAdd,
      brandId: input.brandId,
      imageUrl: input.imageUrl ?? null,
    });
  }
  cart.updatedAt = new Date().toISOString();
  setLocalCart(cart, { source: 'local-cart' });
}

export function updateLocalCartItemQty(variantId: string, qty: number) {
  const nextQty = Math.max(0, Number(qty || 0));
  const cart = getLocalCart();
  const idx = cart.items.findIndex((item) => item.variantId === variantId);
  if (idx < 0) return;
  if (nextQty === 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].qty = nextQty;
  }
  cart.updatedAt = new Date().toISOString();
  setLocalCart(cart, { source: 'local-cart' });
}

export function clearLocalCart() {
  const empty: LocalCart = { orderType: 'single', items: [], updatedAt: new Date().toISOString() };
  setLocalCart(empty, { source: 'local-cart' });
}

export function getLocalCartItems() {
  return getLocalCart().items;
}
