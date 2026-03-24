'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { COLORS } from '@/lib/constants';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

type SetPasswordFormProps = {
  forcedFlow?: 'signup' | 'recovery';
};

const AUTH_BANNER_URL =
  'https://dowxxwkxuvfkqkkfmack.supabase.co/storage/v1/object/public/brand-assets-public/chutney-club/banners/healthy-vegetarian-balanced-food-concept-fresh-vegetable-salad-buddha-bowl.jpg';

export function SetPasswordForm({ forcedFlow }: SetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowParam = searchParams.get('flow');
  const flow: 'signup' | 'recovery' = forcedFlow ?? (flowParam === 'recovery' ? 'recovery' : 'signup');
  const requiresName = flow === 'signup';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = flow === 'recovery' ? 'Set New Password' : 'Complete Signup';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (requiresName && !name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/password/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, flow }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to update password');
        return;
      }

      if (flow === 'signup') {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/signin?signup=complete');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell showTopBar={false}>
      <div className="relative min-h-screen">
        <Image src={AUTH_BANNER_URL} alt="Chutney Club" fill priority className="object-cover rotate-180" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute left-4 top-4 z-20 md:left-8 md:top-8">
          <Link href="/" className="inline-flex items-center">
            <Image src="/happybee-logo.png" alt="Happybee" width={140} height={70} priority />
          </Link>
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 md:justify-end md:pr-12">
          <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl md:p-10" style={{ backgroundColor: COLORS.cardBackground }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.headingPurple }}>
              {title}
            </h1>
            <p className="text-sm mb-6" style={{ color: COLORS.bodyText }}>
              {flow === 'signup'
                ? 'Enter your name and password to complete your account setup.'
                : 'Set a new password for your account.'}
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.bodyText }}>
                  Name {requiresName ? '' : '(optional)'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required={requiresName}
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E7DCCF', color: COLORS.bodyText }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.bodyText }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E7DCCF', color: COLORS.bodyText }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.bodyText }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E7DCCF', color: COLORS.bodyText }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 font-semibold transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#E67E22', color: '#ffffff' }}
              >
                {loading ? 'Please wait...' : 'Set Password'}
              </button>
            </form>

            {error && (
              <p className="mt-4 text-sm font-medium" style={{ color: COLORS.primaryOrange }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </AuthPageShell>
  );
}
