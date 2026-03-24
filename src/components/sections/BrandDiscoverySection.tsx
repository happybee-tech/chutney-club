'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { COLORS, BRANDS } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 } as any,
  },
};

export function BrandDiscoverySection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Yellow accent dots */}
          <motion.div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS.primaryYellow }}
                animate={{ scale: [0.5, 1, 0.5] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </motion.div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: COLORS.headingPurple }}
          >
            Choose a brand you love
          </h2>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: COLORS.bodyText }}
          >
            Explore our curated selection of health-focused brands and discover your new favorites.
          </p>
        </motion.div>

        {/* Brand Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {BRANDS.map((brand, index) => (
            <motion.div key={brand.id} variants={itemVariants}>
              <Card hoverable accentColor={index % 2 === 0 ? COLORS.primaryYellow : COLORS.accentGreen}>
                <div className="space-y-4">
                  {/* Brand Icon with modern background */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${brand.color}30 0%, ${brand.color}10 100%)`,
                      border: `2px solid ${brand.color}20`,
                    }}
                  >
                    {brand.id === 'the-chutney-club' && '🫙'}
                    {brand.id === 'urthwise' && '🫒'}
                    {brand.id === 'leafy-greens' && '🥗'}
                    {brand.id === 'sprout-power' && '🌱'}
                    {brand.id === 'nutty-bites' && '🥜'}
                    {brand.id === 'whole-grain-co' && '🌾'}
                  </motion.div>

                  {/* Brand Info */}
                  <div>
                    <h3
                      className="text-xl font-bold mb-1"
                      style={{ color: COLORS.headingPurple }}
                    >
                      {brand.name}
                    </h3>
                    <p
                      className="text-sm mb-3"
                      style={{ color: COLORS.bodyText }}
                    >
                      {brand.tagline}
                    </p>
                  </div>

                  {/* Category Badge with elegant styling */}
                  <Badge variant={index % 2 === 0 ? 'default' : 'accent'}>{brand.category}</Badge>

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: COLORS.bodyText }}
                  >
                    {brand.description}
                  </p>

                  {/* CTA Button - alternating colors */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all mt-4"
                    style={{
                      background: index % 2 === 0 ? COLORS.primaryYellow : COLORS.accentGreen,
                      boxShadow: index % 2 === 0 ? `0 6px 20px ${COLORS.primaryYellow}40` : `0 6px 20px ${COLORS.accentGreen}40`,
                      color: '#1a1a1a',
                    }}
                  >
                    View Menu →
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
