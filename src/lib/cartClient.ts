const SINGLE_CART_KEY = 'hb_single_cart_id';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string };
};

type CartResponse = { id: string };

async function postJson<T>(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  return { response, data };
}

async function createSingleCart(brandId?: string) {
  const { response, data } = await postJson<CartResponse>('/api/cart', {
    order_type: 'single',
    ...(brandId ? { brand_id: brandId } : {}),
  });

  if (!response.ok || !data.success || !data.data?.id) {
    const code = data.error?.code ?? 'CART_CREATE_FAILED';
    throw new Error(code);
  }

  localStorage.setItem(SINGLE_CART_KEY, data.data.id);
  window.dispatchEvent(new CustomEvent('hb-cart-updated', { detail: { cartId: data.data.id } }));
  return data.data.id;
}

export async function addVariantToSingleCart(input: { variantId: string; brandId?: string; qty?: number }) {
  const qty = input.qty ?? 1;
  let cartId = localStorage.getItem(SINGLE_CART_KEY);
  if (!cartId) {
    cartId = await createSingleCart(input.brandId);
  }

  const addItem = async (id: string) =>
    postJson('/api/cart/items', {
      cart_id: id,
      variant_id: input.variantId,
      qty,
    });

  let result = await addItem(cartId);
  if (!result.response.ok && result.data.error?.code === 'CART_NOT_FOUND') {
    localStorage.removeItem(SINGLE_CART_KEY);
    cartId = await createSingleCart(input.brandId);
    result = await addItem(cartId);
  }

  if (!result.response.ok || !result.data.success) {
    const code = result.data.error?.code ?? 'ADD_TO_CART_FAILED';
    throw new Error(code);
  }

  window.dispatchEvent(new CustomEvent('hb-cart-updated', { detail: { cartId } }));
  return { cartId };
}
