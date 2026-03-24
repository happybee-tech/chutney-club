'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

const salads = [
  {
    name: 'Sprouts Power Bowl',
    image: '/sprouts-mix.png',
    subtitle: 'Moong sprouts, cucumber, carrot, lemon dressing',
    price: 'From Rs 179',
  },
  {
    name: 'Rainbow Veg Salad',
    image: '/gut-health.jpg',
    subtitle: 'Seasonal vegetables, seeds, olive oil, herbs',
    price: 'From Rs 199',
  },
  {
    name: 'Protein Crunch Salad',
    image: '/nuts-seeds-mix.png',
    subtitle: 'Nuts, seeds, greens, house-made masala mix',
    price: 'From Rs 229',
  },
];

export function BrandsShowcaseSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 60%, ${COLORS.primaryYellow}40, transparent 50%)`,
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 70% 40%, ${COLORS.accentGreen}40, transparent 50%)`,
        }}
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: COLORS.headingPurple }}>
            Daily Salads
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: COLORS.bodyText }}>
            Freshly prepared salads you can order or subscribe to every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {salads.map((salad) => (
            <motion.div
              key={salad.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: '-100px' }}
              whileHover={{ y: -8 }}
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: '#fff',
                border: `1px solid ${COLORS.primaryYellow}40`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              }}
            >
              <div className="relative h-52 w-full">
                <Image src={salad.image} alt={salad.name} fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.headingPurple }}>
                  {salad.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: COLORS.bodyText }}>
                  {salad.subtitle}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: COLORS.primaryOrange }}>
                    {salad.price}
                  </span>
                  <Link
                    href="/daily-salads"
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: '#5B821F', color: '#fff' }}
                  >
                    View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16 md:mt-20"
        >
          <Link
            href="/daily-salads"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg"
            style={{ backgroundColor: '#5B821F', color: '#fff' }}
          >
            View All Salads
            <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
