'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, type: 'spring', stiffness: 100 } as any,
  },
};

export function CTASection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative overflow-hidden">
      {/* Animated background gradients */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${COLORS.primaryYellow}40, transparent 50%)`,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity } as any}
      />
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 80% 50%, ${COLORS.accentGreen}40, transparent 50%)`,
        }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 } as any}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center"
        >
          {/* Main Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ color: COLORS.headingPurple }}
          >
            Ready to <span style={{ color: COLORS.primaryYellow }}>eat healthier</span>?
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto"
            style={{ color: COLORS.bodyText }}
          >
            Join thousands of community members getting fresh, local, health-focused food delivered every weekend.
          </motion.p>

          {/* Stats/Social Proof */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 md:gap-10 mb-16 md:mb-20"
          >
            {[
              { number: '2500+', label: 'Happy Members' },
              { number: '50+', label: 'Local Brands' },
              { number: '98%', label: 'Satisfaction' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-6 rounded-2xl backdrop-blur-lg"
                style={{
                  background: index === 0
                    ? `linear-gradient(135deg, rgba(247, 185, 51, 0.15) 0%, rgba(247, 185, 51, 0.05) 100%)`
                    : index === 1
                    ? `linear-gradient(135deg, rgba(123, 174, 142, 0.15) 0%, rgba(123, 174, 142, 0.05) 100%)`
                    : `linear-gradient(135deg, rgba(225, 94, 63, 0.15) 0%, rgba(225, 94, 63, 0.05) 100%)`,
                  border: `1.5px solid ${
                    index === 0
                      ? COLORS.primaryYellow + '30'
                      : index === 1
                      ? COLORS.accentGreen + '30'
                      : COLORS.primaryOrange + '30'
                  }`,
                }}
              >
                <div
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{
                    color: index === 0
                      ? COLORS.primaryYellow
                      : index === 1
                      ? COLORS.accentGreen
                      : COLORS.primaryOrange,
                  }}
                >
                  {stat.number}
                </div>
                <div style={{ color: COLORS.bodyText }} className="text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            {/* Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-xl font-bold text-lg transition-all relative group overflow-hidden"
              style={{
                background: COLORS.primaryYellow,
                color: '#1a1a1a',
                boxShadow: `0 12px 32px ${COLORS.primaryYellow}40`,
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity } as any}
              />
              <span className="relative z-10 flex items-center gap-2">
                Start Shopping Now
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity } as any}
                >
                  →
                </motion.span>
              </span>
            </motion.button>

            {/* Secondary CTA */}
            <motion.button
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-xl font-bold text-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${COLORS.accentGreen}15, ${COLORS.accentGreen}05)`,
                color: COLORS.accentGreen,
                border: `2.5px solid ${COLORS.accentGreen}`,
                boxShadow: `0 8px 24px ${COLORS.accentGreen}20`,
              }}
            >
              <span className="flex items-center gap-2">
                Learn More
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 } as any}
                >
                  ↓
                </motion.span>
              </span>
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm"
            style={{ color: COLORS.bodyText }}
          >
            <span>✓ Free to join</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Cancel anytime</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ 100% secure</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
