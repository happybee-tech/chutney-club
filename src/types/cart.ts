import type { OrderType, UUID } from './common';

export type Cart = {
  id: UUID;
  order_type: OrderType;
  brand_id?: UUID | null;
};

export type CartItem = {
  id: UUID;
  variant_id: UUID;
  qty: number;
};

export type CartValidateSummary = {
  subtotal: number;
  total: number;
};

export type CartValidateResult = {
  valid: boolean;
  messages: string[];
  summary?: CartValidateSummary;
};

export type CartCreateRequest = {
  order_type: OrderType;
  brand_id?: UUID;
};

export type CartItemCreateRequest = {
  cart_id: UUID;
  variant_id: UUID;
  qty: number;
};

export type CartItemUpdateRequest = {
  qty: number;
};

export type CartValidateRequest = {
  cart_id: UUID;
  delivery_slot_id: UUID;
};
