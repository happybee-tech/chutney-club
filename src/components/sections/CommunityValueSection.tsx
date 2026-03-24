'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FeatureCard } from '../ui/ModernCard';
import { COLORS, COMMUNITY_VALUES } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
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

export function CommunityValueSection() {
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
          className="text-center mb-16 md:mb-20"
        >
          {/* Yellow bouncing dots */}
          <motion.div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS.primaryYellow }}
                animate={{ y: [-8, 0, -8] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </motion.div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: COLORS.headingPurple }}
          >
            Built for community
          </h2>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: COLORS.bodyText }}
          >
            Happybee isn't just about food—it's about creating healthier neighborhoods together.
          </p>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {COMMUNITY_VALUES.map((value, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard
                icon={value.icon}
                title={value.title}
                description={value.description}
                accentColor={
                  index === 0
                    ? COLORS.primaryYellow
                    : index === 1
                    ? COLORS.accentGreen
                    : index === 2
                    ? COLORS.primaryOrange
                    : COLORS.accentGreen
                }
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Supporting Message */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, margin: '-50px' }}
          className="mt-16 md:mt-20 relative"
        >
          {/* Decorative gradient background */}
          <div className="absolute inset-0 rounded-3xl opacity-30 blur-2xl" style={{ background: `linear-gradient(135deg, ${COLORS.primaryYellow}20, ${COLORS.accentGreen}20)` }} />
          
          {/* Main card with glassmorphism */}
          <div
            className="relative p-8 md:p-14 rounded-3xl backdrop-blur-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(247, 185, 51, 0.08) 0%, rgba(123, 174, 142, 0.08) 100%)`,
              border: `1.5px solid ${COLORS.accentGreen}30`,
              boxShadow: `0 8px 32px ${COLORS.primaryYellow}15, inset 0 1px 1px rgba(255,255,255,0.3)`,
            }}
          >
            {/* Animated gradient border shine */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primaryYellow}0, ${COLORS.accentGreen}50, ${COLORS.primaryYellow}0)`,
              }}
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 3, repeat: Infinity } as any}
            />

            {/* Top accent line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, ${COLORS.primaryYellow}, ${COLORS.accentGreen}, ${COLORS.primaryYellow})` }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity } as any}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Highlight keywords with colors */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 } as any}
                viewport={{ once: true }}
                className="text-lg md:text-2xl font-semibold leading-relaxed max-w-3xl mx-auto"
                style={{ color: COLORS.headingPurple }}
              >
                By choosing Happybee, you're{' '}
                <span style={{ color: COLORS.primaryYellow }}>supporting local health brands</span>
                , <span style={{ color: COLORS.accentGreen }}>reducing food waste</span>, and{' '}
                <span style={{ color: COLORS.primaryOrange }}>building a community</span> that values nutrition and wellness.
              </motion.p>

              {/* Bottom message */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 } as any}
                viewport={{ once: true }}
                className="text-base md:text-lg mt-6 leading-relaxed font-medium"
                style={{ color: COLORS.bodyText }}
              >
                Together, we're making{' '}
                <span style={{ color: COLORS.primaryYellow, fontWeight: 'bold' }}>healthier choices</span> accessible and{' '}
                <span style={{ color: COLORS.accentGreen, fontWeight: 'bold' }}>sustainable</span>.
              </motion.p>
            </div>

            {/* Decorative icons at corners */}
            <motion.div
              className="absolute top-6 right-6 text-4xl opacity-20"
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity } as any}
            >
              🌱
            </motion.div>
            <motion.div
              className="absolute bottom-6 left-6 text-4xl opacity-20"
              animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 } as any}
            >
              ♻️
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
