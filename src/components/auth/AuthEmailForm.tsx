'use client';

import Link from 'next/link';
import { useState } from 'react';
import { COLORS } from '@/lib/constants';

type AuthEmailFormProps = {
  mode: 'signin' | 'signup';
};

export function AuthEmailForm({ mode }: AuthEmailFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = mode === 'signin' ? 'Sign In' : 'Create Account';
  const subtitle =
    mode === 'signin'
      ? 'Enter your email to receive a secure sign-in link.'
      : 'Enter your email to create your account with a magic link.';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/auth/email/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next: '/' }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to send magic link');
        return;
      }

      setMessage('Magic link sent. Check your email inbox.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: COLORS.mainBackground }}>
      <div className="w-full max-w-md rounded-3xl p-8 shadow-xl" style={{ backgroundColor: COLORS.cardBackground }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.headingPurple }}>
          {title}
        </h1>
        <p className="text-sm mb-6" style={{ color: COLORS.bodyText }}>
          {subtitle}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium" style={{ color: COLORS.bodyText }}>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold transition-opacity disabled:opacity-60"
            style={{ backgroundColor: COLORS.primaryYellow, color: '#1a1a1a' }}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
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
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <Link
            href={mode === 'signin' ? '/signup' : '/signin'}
            className="font-semibold"
            style={{ color: COLORS.headingPurple }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
