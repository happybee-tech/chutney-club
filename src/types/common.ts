export type UUID = string;

export type OrderType = 'single' | 'bulk';
export type OrderStatus =
  | 'created'
  | 'paid'
  | 'accepted'
  | 'preparing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type SlotCategory = 'perishable' | 'non_perishable' | 'both';
