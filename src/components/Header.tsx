'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface HeaderProps {
  scrolled?: boolean;
}

export function Header({ scrolled = false }: HeaderProps) {
  const [cartCount] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerTextColor = '#ffffff';

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' });
        const data = await response.json();
        if (!mounted) return;
        if (response.ok && data?.success) {
          const name = data.data?.name || 'User';
          setUserName(name);
        } else {
          setUserName(null);
        }
      } catch {
        if (mounted) setUserName(null);
      }
    };
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUserName(null);
    setMenuOpen(false);
    window.location.href = '/signin';
  };

  return (
    <motion.header
      initial={{ backgroundColor: 'transparent', boxShadow: 'none' }}
      animate={{
        backgroundColor: scrolled ? 'rgba(18, 17, 14, 0.88)' : 'rgba(18, 17, 14, 0.48)',
        boxShadow: scrolled ? '0 8px 18px rgba(0, 0, 0, 0.22)' : 'none',
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
              src="/happybee-logo.png"
              alt="Happybee"
              width={150}
              height={75}
              className="rounded-full"
              priority
            />
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'Daily Salads', href: '/daily-salads' },
              { label: 'Subscriptions', href: '/subscriptions' },
              { label: 'Make Your Salad', href: '/make-salad' },
            ].map((link) => (
              <motion.div key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-medium transition-colors"
                  style={{ color: headerTextColor }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = COLORS.primaryOrange;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = headerTextColor;
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Auth & Cart */}
          <div className="flex items-center gap-4">
            {userName ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: headerTextColor }}
                >
                  <span>{userName}</span>
                  <span aria-hidden>▾</span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg border bg-white p-2"
                    style={{ borderColor: '#E7DCCF' }}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-orange-50"
                      style={{ color: COLORS.bodyText }}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-orange-50"
                      style={{ color: COLORS.primaryOrange }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/signin"
                  className="px-3 py-2 rounded-lg text-sm font-medium border bg-white/10"
                  style={{ color: headerTextColor, borderColor: 'rgba(255,255,255,0.5)' }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: '#E67E22', color: '#ffffff' }}
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: COLORS.primaryOrange }}
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
