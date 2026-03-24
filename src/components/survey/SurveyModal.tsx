import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/constants';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey?: any;
}

export function SurveyModal({ isOpen, onClose, survey }: SurveyModalProps) {
  const questions = survey?.questions || [];
  const [currentStep, setCurrentStep] = useState(0);
  const [ratings, setRatings] = useState<any[]>([]);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setRatings(new Array(questions.length).fill(0).map(() => ({ questionId: '', rating: 0 })));
      setIsSubmitted(false);
      setHoveredStar(0);
    }
  }, [isOpen, questions.length]);

  const handleRate = (rating: number) => {
    if (!questions[currentStep]) return;
    const questionId = questions[currentStep].id;
    const newRatings = [...ratings];
    newRatings[currentStep] = { questionId, rating };
    setRatings(newRatings);
    
    // Auto advance after a brief pause
    setTimeout(async () => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(c => c + 1);
        setHoveredStar(0);
      } else {
        setIsSubmitted(true);
        if (survey?.id) {
          try {
            await fetch(`/api/surveys/${survey.id}/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ratings: newRatings })
            });
          } catch (error) {
            console.error('Failed to submit survey', error);
          }
        }
      }
    }, 400);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(0);
      setRatings(new Array(questions.length).fill(0).map(() => ({ questionId: '', rating: 0 })));
      setIsSubmitted(false);
      setHoveredStar(0);
    }, 300); // reset after animation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <motion.div
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, y: -20 }}
         transition={{ duration: 0.3, ease: 'easeOut' }}
         className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
         style={{ backgroundColor: COLORS.cardBackground }}
      >
        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
             <motion.div 
               className="h-full rounded-r-full" 
               style={{ backgroundColor: COLORS.primaryOrange }}
               initial={{ width: `${(currentStep / questions.length) * 100}%` }}
               animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
               transition={{ duration: 0.3 }}
             />
          </div>
        )}

        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          <motion.div
             key={isSubmitted ? 'success' : currentStep}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {isSubmitted ? (
              <div className="text-center py-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                  className="text-6xl mb-6"
                >
                  🎉
                </motion.div>
                <h3 className="text-3xl font-bold mb-3" style={{ color: COLORS.headingPurple }}>
                  Thank You!
                </h3>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                  Your feedback helps us make Happybee better for everyone. We truly appreciate it!
                </p>
                <button
                  onClick={handleClose}
                  className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: COLORS.primaryOrange }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="py-4">
                <div className="text-sm font-semibold tracking-wider uppercase mb-5" style={{ color: COLORS.primaryOrange }}>
                  Question {currentStep + 1} of {questions.length}
                </div>
                {survey?.description && currentStep === 0 && (
                  <p className="text-sm text-gray-500 mb-4">{survey.description}</p>
                )}
                
                <motion.h3 
                  className="text-2xl font-bold mb-10 leading-snug"
                  style={{ color: COLORS.headingPurple }}
                >
                  {questions[currentStep]?.question}
                </motion.h3>

                <div className="flex justify-center gap-2 sm:gap-4 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => handleRate(star)}
                      className="text-4xl sm:text-5xl focus:outline-none transition-colors"
                    >
                      <span 
                        style={{ 
                          color: (hoveredStar || ratings[currentStep]?.rating) >= star 
                            ? COLORS.primaryYellow 
                            : '#E5E7EB',
                          textShadow: (hoveredStar || ratings[currentStep]?.rating) >= star 
                            ? `0 0 12px ${COLORS.primaryYellow}80` 
                            : 'none',
                        }}
                      >
                        ★
                      </span>
                    </motion.button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium px-4">
                  <span>Not Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
