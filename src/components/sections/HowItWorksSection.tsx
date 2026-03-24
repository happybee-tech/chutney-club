'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, HOW_IT_WORKS_STEPS } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

const numberCircleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, type: 'spring', stiffness: 100 } as any,
  },
  hover: {
    scale: 1.15,
    rotate: 360,
    transition: { duration: 0.6 } as any,
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, type: 'spring' } as any,
  },
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: { duration: 0.3 } as any,
  },
};

const connectorVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, delay: 0.2 } as any,
  },
};

export function HowItWorksSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16 md:mb-20"
        >
          {/* Yellow underline accent */}
          <motion.div
            className="h-1 w-24 mx-auto mb-6 rounded-full"
            style={{ backgroundColor: COLORS.primaryYellow }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: COLORS.headingPurple }}
          >
            How it works
          </h2>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: COLORS.bodyText }}
          >
            Four simple steps to get fresh, healthy food delivered to your community.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const stepColors = [
              COLORS.primaryYellow,
              COLORS.accentGreen,
              COLORS.primaryOrange,
              COLORS.primaryYellow,
            ];
            const stepColor = stepColors[index];

            return (
              <motion.div key={step.number} variants={itemVariants} className="relative group">
                {/* Connector Line (hidden on mobile) */}
                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <motion.div
                    variants={connectorVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="hidden lg:block absolute top-20 left-[60%] w-[40%] h-1 origin-left rounded-full"
                    style={{ backgroundColor: stepColor + '40' }}
                  />
                )}

                {/* Step Card */}
                <motion.div 
                  className="relative z-10 p-6 md:p-8 rounded-3xl backdrop-blur-lg border overflow-hidden h-full flex flex-col"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 } as any}
                  style={{
                    background: `linear-gradient(135deg, rgba(${stepColor === COLORS.primaryYellow ? '247, 185, 51' : stepColor === COLORS.accentGreen ? '123, 174, 142' : '225, 94, 63'}, 0.12) 0%, rgba(${stepColor === COLORS.primaryYellow ? '247, 185, 51' : stepColor === COLORS.accentGreen ? '123, 174, 142' : '225, 94, 63'}, 0.03) 100%)`,
                    border: `1.5px solid ${stepColor}30`,
                    boxShadow: `0 8px 32px ${stepColor}15`,
                  }}
                >
                  {/* Gradient top accent */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${stepColor}, transparent)`,
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity } as any}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      {/* Step Number Circle */}
                      <motion.div
                        variants={numberCircleVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileHover="hover"
                        viewport={{ once: true }}
                        className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white relative cursor-pointer flex-shrink-0"
                        style={{ backgroundColor: stepColor }}
                      >
                        {/* Glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-60"
                          style={{ backgroundColor: stepColor }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity } as any}
                        />
                        <span className="relative z-10">{step.number}</span>
                      </motion.div>

                      {/* Step Icon */}
                      <motion.span
                        variants={iconVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileHover="hover"
                        viewport={{ once: true }}
                        className="text-4xl cursor-pointer"
                      >
                        {step.icon}
                      </motion.span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-grow">
                      <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 } as any}
                        viewport={{ once: true }}
                        className="text-lg font-bold mb-3"
                        style={{ color: COLORS.headingPurple }}
                      >
                        {step.title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 } as any}
                        viewport={{ once: true }}
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.bodyText }}
                      >
                        {step.description}
                      </motion.p>
                    </div>

                    {/* Step badge at bottom */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 } as any}
                      viewport={{ once: true }}
                      className="mt-6 pt-4 border-t"
                      style={{ borderColor: stepColor + '30' }}
                    >
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: stepColor + '15',
                          color: stepColor,
                        }}
                      >
                        Step {step.number} of 4
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16 md:mt-20"
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 } as any}
            viewport={{ once: true }}
            className="text-lg mb-6"
            style={{ color: COLORS.bodyText }}
          >
            Ready to get started?
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 } as any}
            viewport={{ once: true }}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all relative group overflow-hidden"
            style={{
              background: COLORS.primaryYellow,
              boxShadow: `0 8px 24px ${COLORS.primaryYellow}40`,
              color: '#1a1a1a',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity } as any}
            />
            <span className="relative z-10">Browse Brands Now</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
