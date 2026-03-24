'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Button';
import { COLORS, FEATURED_ITEMS } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 } as any,
  },
};

export function FeaturedItemsSection() {
  return (
    <section
      className="px-4 sm:px-6 lg:px-8 py-16 md:py-24"
      style={{ backgroundColor: COLORS.mainBackground }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Yellow trending badge */}
          <motion.div
            className="inline-block px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: COLORS.primaryYellow + '30', border: `2px solid ${COLORS.primaryYellow}` }}
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span style={{ color: COLORS.primaryYellow }} className="font-bold text-sm">✨ TRENDING THIS WEEK</span>
          </motion.div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: COLORS.headingPurple }}
          >
            Popular this week
          </h2>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: COLORS.bodyText }}
          >
            Check out what the community is loving right now.
          </p>
        </motion.div>

        {/* Items Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {FEATURED_ITEMS.map((item, index) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card hoverable accentColor={index % 2 === 0 ? COLORS.primaryYellow : COLORS.accentGreen}>
                <div className="space-y-3 flex-1 flex flex-col">
                  {/* Item Image Container with elegant design */}
                  <div
                    className="w-full aspect-square rounded-2xl flex items-center justify-center text-6xl mb-2 transition-all duration-300"
                    style={{
                      background: index % 2 === 0 
                        ? `linear-gradient(135deg, ${COLORS.primaryYellow}25 0%, ${COLORS.primaryYellow}08 100%)`
                        : `linear-gradient(135deg, ${COLORS.accentGreen}25 0%, ${COLORS.accentGreen}08 100%)`,
                      border: `2px dashed ${index % 2 === 0 ? COLORS.primaryYellow + '50' : COLORS.accentGreen + '50'}`,
                    }}
                  >
                    {item.image}
                  </div>

                  {/* Item Name */}
                  <h3
                    className="font-bold text-lg leading-tight"
                    style={{ color: COLORS.headingPurple }}
                  >
                    {item.name}
                  </h3>

                  {/* Brand with accent */}
                  <p
                    className="text-xs font-medium opacity-75"
                    style={{ color: COLORS.bodyText }}
                  >
                    by <span style={{ color: COLORS.accentGreen }}>{item.brand}</span>
                  </p>

                  {/* Calories with modern badge */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit"
                    style={{
                      background: index % 2 === 0 ? `${COLORS.primaryYellow}25` : `${COLORS.accentGreen}25`,
                      color: index % 2 === 0 ? COLORS.primaryYellow : COLORS.accentGreen,
                      border: `1px solid ${index % 2 === 0 ? COLORS.primaryYellow + '50' : COLORS.accentGreen + '50'}`,
                    }}
                  >
                    <span>🔥</span>
                    <span>{item.calories} kcal</span>
                  </div>

                  {/* Ingredients */}
                  <p
                    className="text-xs leading-relaxed flex-1"
                    style={{ color: COLORS.bodyText }}
                  >
                    <span className="font-semibold" style={{ color: COLORS.headingPurple }}>
                      Ingredients:
                    </span>
                    {' ' + item.ingredients}
                  </p>

                  {/* Add to Cart Button - individual colors */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all mt-3"
                    style={{
                      background: index % 2 === 0 ? COLORS.primaryYellow : COLORS.accentGreen,
                      boxShadow: index % 2 === 0 ? `0 6px 20px ${COLORS.primaryYellow}40` : `0 6px 20px ${COLORS.accentGreen}40`,
                      color: '#1a1a1a',
                    }}
                  >
                    + Add to cart
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
