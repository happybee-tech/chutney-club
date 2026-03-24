'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { COLORS } from '@/lib/constants';

const ingredients = [
  { id: 1, name: 'Spinach', emoji: '🥬', protein: 2.7, calories: 23 },
  { id: 2, name: 'Tomato', emoji: '🍅', protein: 0.9, calories: 18 },
  { id: 3, name: 'Cucumber', emoji: '🥒', protein: 0.7, calories: 16 },
  { id: 4, name: 'Carrot', emoji: '🥕', protein: 0.6, calories: 41 },
  { id: 5, name: 'Bell Pepper', emoji: '🫑', protein: 0.9, calories: 31 },
  { id: 6, name: 'Broccoli', emoji: '🥦', protein: 2.8, calories: 34 },
  { id: 7, name: 'Almonds', emoji: '🌰', protein: 6.0, calories: 164 },
  { id: 8, name: 'Chickpeas', emoji: '🫘', protein: 15.0, calories: 269 },
];

export default function MakeSaladPage() {
  const [selectedIngredients, setSelectedIngredients] = useState<typeof ingredients>([]);
  const [isMixed, setIsMixed] = useState(false);

  const toggleIngredient = (ingredient: typeof ingredients[0]) => {
    setSelectedIngredients((prev) =>
      prev.find((i) => i.id === ingredient.id)
        ? prev.filter((i) => i.id !== ingredient.id)
        : [...prev, ingredient]
    );
    setIsMixed(false);
  };

  const totalProtein = selectedIngredients.reduce((sum, ing) => sum + ing.protein, 0).toFixed(1);
  const totalCalories = selectedIngredients.reduce((sum, ing) => sum + ing.calories, 0);

  const handleMix = () => {
    setIsMixed(true);
  };

  const resetSalad = () => {
    setSelectedIngredients([]);
    setIsMixed(false);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.mainBackground }}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm" style={{ backgroundColor: COLORS.mainBackground + 'cc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold" style={{ color: COLORS.headingPurple }}>
            ← Back
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.headingPurple }}>
            Make Your Salad
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Ingredients */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.headingPurple }}>
                Pick Ingredients
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {ingredients.map((ingredient) => (
                  <motion.button
                    key={ingredient.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleIngredient(ingredient)}
                    className={`p-4 rounded-2xl transition-all border-2 ${
                      selectedIngredients.find((i) => i.id === ingredient.id)
                        ? 'border-2 scale-105'
                        : 'border-2 border-transparent'
                    }`}
                    style={{
                      background: selectedIngredients.find((i) => i.id === ingredient.id)
                        ? `${COLORS.primaryYellow}20`
                        : 'white',
                      borderColor: selectedIngredients.find((i) => i.id === ingredient.id)
                        ? COLORS.primaryYellow
                        : '#E0E0E0',
                      boxShadow: selectedIngredients.find((i) => i.id === ingredient.id)
                        ? `0 4px 12px ${COLORS.primaryYellow}40`
                        : 'none',
                    }}
                  >
                    <div className="text-3xl mb-2">{ingredient.emoji}</div>
                    <div className="text-sm font-semibold" style={{ color: COLORS.headingPurple }}>
                      {ingredient.name}
                    </div>
                    <div className="text-xs mt-1" style={{ color: COLORS.bodyText }}>
                      {ingredient.protein}g protein
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Center - Bowl */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 flex flex-col items-center justify-center"
            >
              <h2 className="text-2xl font-bold mb-8" style={{ color: COLORS.headingPurple }}>
                Your Salad
              </h2>

              {/* Bowl */}
              <motion.div
                animate={isMixed ? { rotate: [0, -5, 5, -5, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative w-48 h-40 rounded-b-3xl border-4 flex items-center justify-center overflow-hidden mb-8"
                style={{
                  backgroundColor: '#F5E6D3',
                  borderColor: COLORS.accentGreen,
                  boxShadow: `0 10px 30px ${COLORS.accentGreen}30`,
                }}
              >
                {/* Bowl ingredients display */}
                <div className="flex flex-wrap gap-2 p-4 justify-center items-center h-full overflow-hidden">
                  <AnimatePresence>
                    {selectedIngredients.length > 0 ? (
                      selectedIngredients.map((ingredient, index) => (
                        <motion.div
                          key={ingredient.id}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ delay: index * 0.1, type: 'spring' }}
                          className="text-4xl"
                        >
                          {ingredient.emoji}
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="text-5xl text-gray-300"
                      >
                        🥗
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Mix Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMix}
                disabled={selectedIngredients.length === 0}
                className="px-8 py-3 rounded-lg font-bold text-white mb-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  background: selectedIngredients.length > 0 ? COLORS.primaryYellow : '#CCC',
                  color: '#1a1a1a',
                  boxShadow: selectedIngredients.length > 0 ? `0 8px 20px ${COLORS.primaryYellow}40` : 'none',
                }}
              >
                {isMixed ? '✓ Mixed!' : 'Mix Salad'}
              </motion.button>

              {/* Reset Button */}
              {selectedIngredients.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={resetSalad}
                  className="text-sm px-6 py-2 rounded-lg font-semibold border-2"
                  style={{
                    borderColor: COLORS.accentGreen,
                    color: COLORS.accentGreen,
                  }}
                >
                  Start Over
                </motion.button>
              )}
            </motion.div>

            {/* Right - Nutrition Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.headingPurple }}>
                Nutrition Info
              </h2>

              <div
                className="p-6 rounded-2xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primaryYellow}15 0%, ${COLORS.accentGreen}15 100%)`,
                  border: `2px solid ${COLORS.accentGreen}30`,
                }}
              >
                <div className="mb-6">
                  <div className="text-sm" style={{ color: COLORS.bodyText }}>
                    Total Protein
                  </div>
                  <div className="text-4xl font-bold" style={{ color: COLORS.primaryYellow }}>
                    {totalProtein}g
                  </div>
                </div>

                <div>
                  <div className="text-sm" style={{ color: COLORS.bodyText }}>
                    Total Calories
                  </div>
                  <div className="text-4xl font-bold" style={{ color: COLORS.accentGreen }}>
                    {totalCalories}
                  </div>
                </div>
              </div>

              {/* Selected Ingredients List */}
              {selectedIngredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-6"
                >
                  <h3 className="font-bold mb-4" style={{ color: COLORS.headingPurple }}>
                    Selected Ingredients
                  </h3>
                  <div className="space-y-3">
                    {selectedIngredients.map((ingredient) => (
                      <motion.div
                        key={ingredient.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{ingredient.emoji}</span>
                          <div>
                            <div className="font-semibold" style={{ color: COLORS.headingPurple }}>
                              {ingredient.name}
                            </div>
                            <div className="text-xs" style={{ color: COLORS.bodyText }}>
                              {ingredient.protein}g protein
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => toggleIngredient(ingredient)}
                          className="text-red-500 font-bold"
                        >
                          ✕
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Add to Cart Button */}
              {isMixed && selectedIngredients.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-full mt-6 px-6 py-4 rounded-xl font-bold text-lg text-white transition-all"
                  style={{
                    background: COLORS.primaryYellow,
                    color: '#1a1a1a',
                    boxShadow: `0 12px 30px ${COLORS.primaryYellow}40`,
                  }}
                >
                  Add to Cart
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
