import type { OrderStatus, UUID } from './common';

export type Order = {
  id: UUID;
  status: OrderStatus;
  total: number;
  created_at: string;
};

export type OrderItem = {
  variant_id: UUID;
  qty: number;
  price_snapshot: number;
  is_perishable: boolean;
};

export type OrderDetail = {
  id: UUID;
  status: OrderStatus;
  total: number;
  delivery_slot_id?: UUID;
  address?: {
    id: UUID;
    line1: string;
    area?: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
};
