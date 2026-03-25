'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { getLocalCartCount } from '@/lib/localCart';

interface HeaderProps {
  scrolled?: boolean;
}

export function Header({ scrolled = false }: HeaderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
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

  useEffect(() => {
    let mounted = true;

    const loadCartCount = () => {
      if (!mounted) return;
      setCartCount(getLocalCartCount());
    };

    const onCartUpdated = () => {
      loadCartCount();
    };
    const onFocus = () => loadCartCount();

    loadCartCount();
    window.addEventListener('hb-cart-updated', onCartUpdated as EventListener);
    window.addEventListener('storage', onCartUpdated);
    window.addEventListener('focus', onFocus);

    return () => {
      mounted = false;
      window.removeEventListener('hb-cart-updated', onCartUpdated as EventListener);
      window.removeEventListener('storage', onCartUpdated);
      window.removeEventListener('focus', onFocus);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Link href="/" aria-label="Go to home page" className="inline-flex cursor-pointer">
              <Image
                src="/chutney-club-logo.png"
                alt="Chutney Club"
                width={144}
                height={64}
                className="h-14 w-auto cursor-pointer rounded-md"
                priority
              />
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'Menu', href: '/menu' },
              { label: 'About', href: '/about' },
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
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#EEF5E2]"
                      style={{ color: COLORS.bodyText }}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#EEF5E2]"
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
                  style={{ backgroundColor: '#5B821F', color: '#ffffff' }}
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-xl border border-white/40 bg-gradient-to-br from-white/20 to-white/5 p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-colors hover:from-white/30 hover:to-white/10"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-white">
                <path d="M3 5h2l.4 2M7 13h10l3-6H6.4M7 13l-1.1 5h12.2M7 13H6.4M10 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
              </svg>
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: COLORS.primaryOrange }}
              >
                {cartCount}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </motion.header>
  );
}
