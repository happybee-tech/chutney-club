import { addToLocalCart } from './localCart';

export async function addVariantToSingleCart(input: {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  imageUrl?: string | null;
  brandId: string;
  qty?: number;
}) {
  addToLocalCart({
    variantId: input.variantId,
    productId: input.productId,
    productName: input.productName,
    variantName: input.variantName,
    price: input.price,
    imageUrl: input.imageUrl ?? null,
    brandId: input.brandId,
    qty: input.qty ?? 1,
  });
}
