'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, PREORDER_RULES } from '@/lib/constants';

export function PreorderRulesBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      className="px-4 sm:px-6 lg:px-8 py-8 md:py-12"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl p-8 md:p-12 relative overflow-hidden"
          style={{ backgroundColor: COLORS.mainBackground, border: `2px solid ${COLORS.primaryYellow}` }}
        >
          {/* Yellow accent top border */}
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ background: `linear-gradient(90deg, ${COLORS.primaryYellow}, ${COLORS.primaryOrange})` }}
          />
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center text-2xl md:text-3xl font-bold mb-8"
            style={{ color: COLORS.headingPurple }}
          >
            📅 Weekend Deliveries Only
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PREORDER_RULES.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 text-center"
              >
                <span className="text-4xl block mb-3">{rule.icon}</span>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ color: COLORS.headingPurple }}
                >
                  {rule.day}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: COLORS.bodyText }}
                >
                  <span className="font-medium text-base" style={{ color: COLORS.primaryOrange }}>
                    {rule.cutoff}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8 text-sm md:text-base"
            style={{ color: COLORS.bodyText }}
          >
            Orders placed after the cutoff time will be processed for the following delivery window.
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
}
