'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', className = '' }: ButtonProps) {
  const baseClasses = 'px-7 py-3 rounded-xl font-semibold transition-all duration-300 text-base';

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${COLORS.primaryYellow}, ${COLORS.accentGreen})`,
          color: '#1a1a1a',
          boxShadow: `0 8px 24px ${COLORS.primaryYellow}40`,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${COLORS.accentGreen}`,
          color: COLORS.accentGreen,
        };
      default:
        return {
          color: COLORS.headingPurple,
        };
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: `0 12px 32px ${COLORS.primaryYellow}60` }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${className}`}
      style={getButtonStyles()}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
  accentColor?: string;
}

export function Card({ children, className = '', hoverable = true, gradient = false, accentColor }: CardProps) {
  const baseClasses = 'rounded-3xl p-6 transition-all duration-300 relative overflow-hidden';

  const getCardBackground = () => {
    if (accentColor === COLORS.primaryYellow) {
      return `linear-gradient(135deg, rgba(247, 185, 51, 0.12) 0%, rgba(247, 185, 51, 0.03) 100%)`;
    } else if (accentColor === COLORS.accentGreen) {
      return `linear-gradient(135deg, rgba(123, 174, 142, 0.12) 0%, rgba(123, 174, 142, 0.03) 100%)`;
    }
    return `linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))`;
  };

  const getBoxShadow = () => {
    if (accentColor === COLORS.primaryYellow) {
      return `0 8px 32px ${COLORS.primaryYellow}15`;
    } else if (accentColor === COLORS.accentGreen) {
      return `0 8px 32px ${COLORS.accentGreen}15`;
    }
    return `0 8px 32px rgba(0, 0, 0, 0.08)`;
  };

  const getBorderColor = () => {
    if (accentColor === COLORS.primaryYellow) {
      return COLORS.primaryYellow + '30';
    } else if (accentColor === COLORS.accentGreen) {
      return COLORS.accentGreen + '30';
    }
    return 'rgba(255, 255, 255, 0.3)';
  };

  return (
    <motion.div
      whileHover={hoverable ? { 
        y: -8, 
        boxShadow: accentColor === COLORS.primaryYellow 
          ? `0 24px 48px ${COLORS.primaryYellow}35` 
          : accentColor === COLORS.accentGreen
          ? `0 24px 48px ${COLORS.accentGreen}35`
          : '0 24px 48px rgba(0, 0, 0, 0.15)'
      } : {}}
      className={`${baseClasses} ${className}`}
      style={{
        background: getCardBackground(),
        border: `2px solid ${getBorderColor()}`,
        backdropFilter: 'blur(20px)',
        boxShadow: getBoxShadow(),
      }}
    >
      {/* Elegant gradient glow */}
      {accentColor && (
        <>
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: accentColor }}
          />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border"
      style={{
        backgroundColor: variant === 'default' ? COLORS.primaryYellow + '25' : COLORS.accentGreen + '25',
        color: variant === 'default' ? COLORS.primaryYellow : COLORS.accentGreen,
        borderColor: variant === 'default' ? COLORS.primaryYellow + '50' : COLORS.accentGreen + '50',
      }}
    >
      {children}
    </span>
  );
}
