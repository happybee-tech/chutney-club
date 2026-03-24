'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const logout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch {
        // no-op, redirect regardless
      } finally {
        if (mounted) {
          router.replace('/admin/login');
          router.refresh();
        }
      }
    };
    logout();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F6EFE7] flex items-center justify-center px-4">
      <p className="text-sm font-medium text-[#5A554C]">Session expired. Logging out...</p>
    </main>
  );
}
