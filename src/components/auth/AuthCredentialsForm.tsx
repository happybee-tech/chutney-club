'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { COLORS } from '@/lib/constants';

type AuthCredentialsFormProps = {
  mode: 'signin' | 'signup';
};

const AUTH_BANNER_URL =
  'https://dowxxwkxuvfkqkkfmack.supabase.co/storage/v1/object/public/brand-assets-public/chutney-club/banners/healthy-vegetarian-balanced-food-concept-fresh-vegetable-salad-buddha-bowl.jpg';

export function AuthCredentialsForm({ mode }: AuthCredentialsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const isSignup = mode === 'signup';
  const signupCompleted = !isSignup && searchParams.get('signup') === 'complete';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isSignup ? { email } : { email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const errMsg = data?.error?.message || 'Request failed';
        
        // Handle Supabase 60s rate limit gracefully
        if (isSignup && errMsg.toLowerCase().includes('seconds')) {
          const match = errMsg.match(/\b(\d+)\s*seconds/i);
          setCountdown(match ? parseInt(match[1], 10) : 60);
          setMessage('An email was recently sent. Please check your inbox or wait to try again.');
          setError(null);
          return;
        }

        setError(errMsg);
        return;
      }

      if (isSignup) {
        setMessage('Check your inbox for the verification link to continue.');
        setCountdown(60);
        return;
      }

      router.push('/');
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
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm mb-6" style={{ color: COLORS.bodyText }}>
              {isSignup
                ? 'Enter your email to get started. You will set your password after verification.'
                : 'Sign in using your email and password.'}
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

              {!isSignup && (
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
                    placeholder="Your password"
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E7DCCF', color: COLORS.bodyText }}
                  />
                  <div className="mt-2 text-right">
                    <Link href="/forgot-password" className="text-sm font-medium" style={{ color: COLORS.headingPurple }}>
                      Forgot password?
                    </Link>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (isSignup && countdown > 0)}
                className="w-full rounded-xl py-3 font-semibold transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#E67E22', color: '#ffffff' }}
              >
                {loading
                  ? 'Please wait...'
                  : isSignup && countdown > 0
                  ? `Resend in ${countdown}s`
                  : isSignup
                  ? 'Sign Up'
                  : 'Sign In'}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-sm font-medium" style={{ color: COLORS.accentGreen }}>
                {message}
              </p>
            )}

            {signupCompleted && !message && !error && (
              <p className="mt-4 text-sm font-medium" style={{ color: COLORS.accentGreen }}>
                Signup completed. Please sign in with your email and password.
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm font-medium" style={{ color: COLORS.primaryOrange }}>
                {error}
              </p>
            )}

            <p className="mt-6 text-sm" style={{ color: COLORS.bodyText }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <Link
                href={isSignup ? '/signin' : '/signup'}
                className="font-semibold"
                style={{ color: COLORS.headingPurple }}
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthPageShell>
  );
}
