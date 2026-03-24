import type { SlotCategory, UUID } from './common';

export type DeliverySlot = {
  id: UUID;
  slot_date: string;
  start_time: string;
  end_time: string;
  category: SlotCategory;
  cutoff_time: string;
  capacity: number;
};
