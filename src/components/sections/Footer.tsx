'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { COLORS } from '@/lib/constants';
import { SurveyModal } from '@/components/survey/SurveyModal';

export function Footer() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<any>(null);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/happybee-logo.png"
                  alt="Happybee"
                  width={150}
                  height={75}
                  className="rounded-full"
                />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Healthy food from trusted brands, preordered with intention, delivered to your community.
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
                {['Home', 'Brands', 'How It Works', 'About'].map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      {link}
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
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📦 Daily and scheduled delivery slots</li>
                <li>📍 Community drop-off locations</li>
                <li>⏰ Friday 6 PM / Saturday 6 PM</li>
              </ul>
            </motion.div>

            {/* Connect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-4 mb-8">
                {['Instagram', 'Twitter', 'Facebook'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    whileHover={{ scale: 1.1 }}
                  >
                    {social === 'Instagram' && '📷'}
                    {social === 'Twitter' && '𝕏'}
                    {social === 'Facebook' && '👥'}
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
            <p>&copy; 2026 Happybee. All rights reserved.</p>
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
