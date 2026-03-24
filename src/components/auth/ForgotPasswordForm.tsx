'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { COLORS } from '@/lib/constants';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

const AUTH_BANNER_URL =
  'https://dowxxwkxuvfkqkkfmack.supabase.co/storage/v1/object/public/brand-assets-public/chutney-club/banners/healthy-vegetarian-balanced-food-concept-fresh-vegetable-salad-buddha-bowl.jpg';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Request failed');
        return;
      }

      setMessage('A password reset link has been sent to your email.');
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
            <Image src="/chutney-club-logo.png" alt="Chutney Club" width={140} height={70} priority />
          </Link>
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 md:justify-end md:pr-12">
          <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl md:p-10" style={{ backgroundColor: COLORS.cardBackground }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.headingPurple }}>
              Reset Password
            </h1>
            <p className="text-sm mb-6" style={{ color: COLORS.bodyText }}>
              Enter your email and we will send a password reset link.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.bodyText }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E7DCCF', color: COLORS.bodyText }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 font-semibold transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#5B821F', color: '#ffffff' }}
              >
                {loading ? 'Please wait...' : 'Send Reset Link'}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-sm font-medium" style={{ color: COLORS.accentGreen }}>
                {message}
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm font-medium" style={{ color: COLORS.primaryOrange }}>
                {error}
              </p>
            )}

            <p className="mt-6 text-sm" style={{ color: COLORS.bodyText }}>
              Remembered your password?{' '}
              <Link href="/signin" className="font-semibold" style={{ color: COLORS.headingPurple }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthPageShell>
  );
}
