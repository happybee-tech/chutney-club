'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
  accentColor?: string;
  borderGradient?: boolean;
}

/**
 * ModernCard - Enhanced card with glassmorphism and gradient effects
 */
export function ModernCard({
  children,
  className = '',
  hoverable = true,
  gradient = false,
  accentColor,
  borderGradient = false,
}: ModernCardProps) {
  return (
    <motion.div
      whileHover={
        hoverable ? { y: -8, boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)' } : {}
      }
      className={`rounded-3xl p-7 transition-all duration-300 relative overflow-hidden group ${className}`}
      style={{
        background: gradient && accentColor
          ? `linear-gradient(135deg, ${accentColor}12 0%, rgba(255, 255, 255, 0.6) 100%)`
          : 'rgba(255, 255, 255, 0.8)',
        border: borderGradient && accentColor
          ? `2px solid transparent`
          : '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundClip: borderGradient ? 'padding-box' : 'unset',
      }}
    >
      {/* Gradient border effect */}
      {borderGradient && accentColor && (
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${accentColor}40 0%, transparent 100%)`,
            padding: '1px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Animated accent blob */}
      {accentColor && (
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor?: string;
}

/**
 * StatsCard - Card designed for displaying metrics or quick stats
 */
export function StatsCard({ icon, label, value, accentColor = COLORS.primaryOrange }: StatsCardProps) {
  return (
    <ModernCard gradient accentColor={accentColor}>
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.15, rotate: 10 }}
          className="text-4xl"
        >
          {icon}
        </motion.div>
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider opacity-70"
            style={{ color: COLORS.bodyText }}
          >
            {label}
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: accentColor }}
          >
            {value}
          </p>
        </div>
      </div>
    </ModernCard>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor?: string;
}

/**
 * FeatureCard - Card for feature highlights with icon and text
 */
export function FeatureCard({
  icon,
  title,
  description,
  accentColor = COLORS.primaryYellow,
}: FeatureCardProps) {
  return (
    <ModernCard gradient accentColor={accentColor}>
      <div className="space-y-3">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="text-5xl w-fit"
        >
          {icon}
        </motion.div>
        <div>
          <h3
            className="font-bold text-lg mb-1"
            style={{ color: COLORS.headingPurple }}
          >
            {title}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: COLORS.bodyText }}
          >
            {description}
          </p>
        </div>
      </div>
    </ModernCard>
  );
}
