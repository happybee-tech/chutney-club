'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { OrdersIcon } from '@/components/admin/icons';

type OrderStatus =
  | 'created'
  | 'paid'
  | 'accepted'
  | 'preparing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

type Order = {
  id: string;
  orderNo?: string | null;
  orderType: 'single' | 'bulk';
  status: OrderStatus;
  total: string;
  brandId: string | null;
  createdAt: string;
};

const STATUS_OPTIONS: OrderStatus[] = [
  'created',
  'paid',
  'accepted',
  'preparing',
  'dispatched',
  'delivered',
  'cancelled',
  'refunded',
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const selectedBrandId = searchParams.get('brand_id') ?? '';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!selectedBrandId) {
        setOrders([]);
        setLoading(false);
        setError('Select a brand from the top switcher to view orders.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/orders?brand_id=${encodeURIComponent(selectedBrandId)}`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to load orders');
          return;
        }
        setOrders((data.data.items ?? []) as Order[]);
      } catch {
        setError('Network error while loading orders');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [selectedBrandId]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    if (!selectedBrandId) {
      setError('Select a brand from the top switcher first.');
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, brand_id: selectedBrandId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to update status');
        return;
      }

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch {
      setError('Network error while updating order status');
    }
  }

  return (
    <AdminShell title="Orders">
      <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#E4E9FF] bg-[#FAFBFF] px-3 py-2 text-xs font-semibold tracking-wide text-[#6C77A0] uppercase">
        <OrdersIcon className="h-4 w-4" /> Lifecycle Management
      </div>
      {error && <p className="mt-3 text-sm text-[#C7442A]">{error}</p>}

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E4E9FF] text-[#7A84AA]">
              <th className="py-2">Order ID</th>
              <th className="py-2">Type</th>
              <th className="py-2">Brand</th>
              <th className="py-2">Total</th>
              <th className="py-2">Created</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-[#7A84AA]" colSpan={6}>Loading orders...</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-[#EEF2FF] text-[#4E5778]">
                  <td className="py-3 font-medium text-[#232B4A]">{order.orderNo ?? `${order.id.slice(0, 8)}...`}</td>
                  <td className="py-3 uppercase">{order.orderType}</td>
                  <td className="py-3">{order.brandId ? order.brandId.slice(0, 8) : '-'}</td>
                  <td className="py-3">Rs {order.total}</td>
                  <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="rounded-md border border-[#D7DEF7] bg-white px-2 py-1 text-xs text-[#232B4A]"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
