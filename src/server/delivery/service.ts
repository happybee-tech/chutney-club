import { prisma } from '../_shared/db/prisma';

export async function listDeliverySlots(params: { category?: 'perishable' | 'non_perishable' | 'both'; date?: string }) {
  const where = {
    ...(params.category ? { category: params.category } : {}),
    ...(params.date ? { slotDate: new Date(params.date) } : {}),
  } as const;

  return prisma.deliverySlot.findMany({
    where,
    orderBy: [{ slotDate: 'asc' }, { startTime: 'asc' }],
  });
}
