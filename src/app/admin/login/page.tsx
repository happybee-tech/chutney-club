'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const signInData = await signInResponse.json();

      if (!signInResponse.ok || !signInData.success) {
        setError(signInData?.error?.message ?? 'Sign in failed');
        return;
      }

      const sessionResponse = await fetch('/api/admin/session', { credentials: 'include' });
      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.success) {
        setError('You are signed in but not authorized as admin.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6EFE7] px-4 py-20">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[#D9CFBF] bg-white p-8 shadow-lg">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#8B836F] uppercase">Admin Portal</p>
        <h1 className="mt-2 text-3xl font-black text-[#1B1915]">Admin Sign In</h1>
        <p className="mt-2 text-sm text-[#5A554C]">Use your admin account credentials.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#39352E]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#D9CFBF] px-4 py-3 outline-none focus:ring-2 focus:ring-[#4B2E83]/30"
              placeholder="admin@yourdomain.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#39352E]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#D9CFBF] px-4 py-3 outline-none focus:ring-2 focus:ring-[#4B2E83]/30"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#4B2E83] px-4 py-3 font-semibold text-white disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm font-medium text-[#C7442A]">{error}</p>}

        <p className="mt-6 text-sm text-[#5A554C]">
          Back to{' '}
          <Link href="/" className="font-semibold text-[#4B2E83]">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
