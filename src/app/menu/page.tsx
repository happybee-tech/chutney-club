'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/sections/Footer';
import { MenuShowcaseSection } from '@/components/sections/MenuShowcaseSection';
import { CartSidebar } from '@/components/cart/CartSidebar';

export default function MenuPage() {
  const [isScrolled, setIsScrolled] = useState(true);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F5EBDD_0%,#F2E6D7_100%)] text-[#1F1B17]">
      <Header scrolled={isScrolled} />
      <CartSidebar />
      <MenuShowcaseSection fullPage />
      <Footer />
    </main>
  );
}
