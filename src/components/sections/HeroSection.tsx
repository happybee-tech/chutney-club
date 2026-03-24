'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as any },
  },
};

const highlights = [
  { icon: '🏪', label: 'Curated Brands', description: 'Trusted health brands' },
  { icon: '📋', label: 'Preorder Model', description: 'Plan ahead' },
  { icon: '📦', label: 'Weekend Delivery', description: 'Saturday or Sunday' },
  { icon: '👥', label: 'Community Drop-off', description: 'Shared pickup location' },
];

export function HeroSection() {
  return (
    <section
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: COLORS.mainBackground }}
    >
      {/* Decorative background elements */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
        style={{ backgroundColor: COLORS.primaryYellow }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 0] }}
        transition={{ duration: 25, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
        style={{ backgroundColor: COLORS.primaryOrange }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start lg:items-center"
        >
          {/* Left Content */}
          <div className="space-y-6">
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold leading-tight"
              style={{ color: COLORS.headingPurple }}
            >
              Healthy food, delivered fresh to your community
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: COLORS.bodyText }}
            >
              Order from trusted health brands. Preorder today, enjoy fresh deliveries every weekend.
            </motion.p>

            {/* Highlights Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4 py-2"
            >
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  className="space-y-2"
                >
                  <div className="text-3xl">{highlight.icon}</div>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: COLORS.headingPurple }}
                  >
                    {highlight.label}
                  </h3>
                  <p className="text-xs" style={{ color: COLORS.bodyText }}>
                    {highlight.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="shadow-lg hover:shadow-xl transition-shadow">Browse Brands</Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="secondary" className="shadow-lg hover:shadow-xl transition-shadow">How Preordering Works</Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            variants={itemVariants}
            className="relative h-80 md:h-96 flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-9xl md:text-10xl"
            >
              🥗
            </motion.div>

            {/* Scattered floating ingredients */}
            {/* Tomato - top right */}
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -15, 0], rotate: [0, 45, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-2 md:right-8 text-6xl md:text-7xl"
            >
              🍅
            </motion.div>

            {/* Carrot - bottom left */}
            <motion.div
              animate={{ x: [-20, 0, -20], y: [0, 20, 0], rotate: [0, -45, -360] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute bottom-5 md:bottom-12 left-0 md:left-2 text-5xl md:text-6xl"
            >
              🥕
            </motion.div>

            {/* Spinach - left middle */}
            <motion.div
              animate={{ x: [-15, 5, -15], y: [-10, 10, -10], rotate: [45, 90, 45] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute top-1/3 -left-3 md:-left-2 text-5xl md:text-6xl"
            >
              🍃
            </motion.div>

            {/* Wheat - bottom right */}
            <motion.div
              animate={{ x: [10, -10, 10], y: [15, -5, 15], rotate: [-45, 0, -45] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
              className="absolute bottom-8 md:bottom-16 right-1 md:right-3 text-5xl md:text-6xl"
            >
              🌾
            </motion.div>

            {/* Olive oil - top left */}
            <motion.div
              animate={{ x: [-10, 15, -10], y: [-15, 5, -15], rotate: [0, -60, -360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute top-8 md:top-16 -left-2 md:left-4 text-4xl md:text-5xl"
            >
              🫒
            </motion.div>

            {/* Cucumber - right middle */}
            <motion.div
              animate={{ x: [20, -5, 20], y: [-5, 15, -5], rotate: [30, -30, 30] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute top-2/3 -right-4 md:right-0 text-4xl md:text-5xl"
            >
              🥒
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
