'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';
import { SurveyModal } from '@/components/survey/SurveyModal';

export function Footer() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<{
    id?: string;
    linkTitle?: string;
    description?: string | null;
    questions?: Array<{
      id: string;
      question: string;
      type?: 'rating' | 'yes_no' | 'short_text' | 'long_text' | 'single_choice' | 'multi_choice';
      options?: string[] | null;
      ratingLabels?: string[] | null;
      isRequired?: boolean;
    }>;
  } | null>(null);

  React.useEffect(() => {
    fetch('/api/surveys/active', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.survey) setActiveSurvey(data.survey);
      })
      .catch(err => console.error('Failed to fetch survey', err));
  }, []);

  return (
    <>
      <footer
        className="px-4 sm:px-6 lg:px-8 py-16 md:py-20"
        style={{ backgroundColor: COLORS.headingPurple }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-8 mb-12 md:grid-cols-4">
            {/* Brand Section */}
            <motion.div
              className="col-span-2 md:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/chutney-club-logo.png"
                  alt="Chutney Club"
                  width={150}
                  height={75}
                  className="rounded-full"
                />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Bold chutneys, balanced meals, and a simpler way to eat well — every single day.
              </p>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Menu', href: '/menu' },
                  { label: 'About', href: '/about' },
                ].map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-white mb-4">Delivery Info</h4>
              <ul className="space-y-2 text-sm">
                {['Weekday Delivery', 'Weekend Delivery', 'Pick Your Day'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Connect */}
            <motion.div
              className="col-span-2 md:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-4 mb-8">
                {[
                  {
                    name: 'Instagram',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
                      </svg>
                    ),
                  },
                  {
                    name: 'X',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                        <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    name: 'Facebook',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                        <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.6.4-1 1-1Z" fill="currentColor" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <motion.a
                    key={social.name}
                    href="#"
                    aria-label={social.name}
                    className="text-gray-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>

              {activeSurvey && (
                <button
                  onClick={() => setIsSurveyOpen(true)}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all hover:bg-white/10"
                  style={{ borderColor: COLORS.primaryYellow, color: COLORS.primaryYellow }}
                >
                  <span>✨ {activeSurvey.linkTitle || 'Shape Our Future!'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              )}
            </motion.div>
          </div>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: COLORS.primaryYellow + '20' }} />

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400"
          >
            <p>&copy; 2026 Chutney Club. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
      <SurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        survey={activeSurvey}
      />
    </>
  );
}
