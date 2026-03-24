'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/lib/constants';

type SurveyQuestion = {
  id: string;
  question: string;
  type?: 'rating' | 'yes_no' | 'short_text' | 'long_text' | 'single_choice' | 'multi_choice';
  options?: string[] | null;
  ratingLabels?: string[] | null;
  isRequired?: boolean;
};

type SurveyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  survey?: {
    id?: string;
    description?: string | null;
    questions?: SurveyQuestion[];
  };
};

type SurveyAnswer = {
  questionId: string;
  rating?: number;
  boolValue?: boolean;
  textValue?: string;
  optionValue?: string;
  optionValues?: string[];
};

function isAnswerValid(question: SurveyQuestion, answer?: SurveyAnswer) {
  if (!question.isRequired) return true;
  const type = question.type ?? 'rating';
  if (!answer) return false;
  if (type === 'rating') return typeof answer.rating === 'number' && answer.rating > 0;
  if (type === 'yes_no') return typeof answer.boolValue === 'boolean';
  if (type === 'short_text' || type === 'long_text') return Boolean(answer.textValue?.trim());
  if (type === 'single_choice') return Boolean(answer.optionValue);
  if (type === 'multi_choice') return Boolean(answer.optionValues?.length);
  return false;
}

export function SurveyModal({ isOpen, onClose, survey }: SurveyModalProps) {
  const questions = survey?.questions || [];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAnswers({});
      setIsSubmitted(false);
      setHoveredStar(0);
      setSubmitError(null);
    }
  }, [isOpen, questions.length]);

  const currentQuestion = questions[currentStep];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const canProceed = currentQuestion ? isAnswerValid(currentQuestion, currentAnswer) : false;
  const ratingLabels = useMemo(() => {
    const labels = Array.isArray(currentQuestion?.ratingLabels) ? currentQuestion?.ratingLabels : [];
    return [
      labels?.[0] ?? 'Very Poor',
      labels?.[1] ?? '',
      labels?.[2] ?? '',
      labels?.[3] ?? '',
      labels?.[4] ?? 'Excellent',
    ];
  }, [currentQuestion?.ratingLabels]);
  const activeRating = hoveredStar || currentAnswer?.rating || 0;
  const edgeRatingLabels = useMemo(() => {
    const left = ratingLabels[0]?.split('-')[0]?.trim() || ratingLabels[0] || 'Not Good';
    const right = ratingLabels[4]?.split('-')[0]?.trim() || ratingLabels[4] || 'Excellent';
    return { left, right };
  }, [ratingLabels]);

  const setAnswer = (questionId: string, patch: Partial<SurveyAnswer>) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        ...prev[questionId],
        ...patch,
      },
    }));
  };

  const submitSurvey = async () => {
    if (!survey?.id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/surveys/${survey.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: Object.values(answers) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        setSubmitError(data?.error ?? data?.message ?? 'Unable to submit feedback right now.');
        return;
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit survey', error);
      setSubmitError('Network error while submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    if (!canProceed) return;
    if (currentStep < questions.length - 1) {
      setCurrentStep((value) => value + 1);
      return;
    }
    await submitSurvey();
  };
  const handleBack = () => {
    if (currentStep <= 0) return;
    setCurrentStep((value) => value - 1);
  };

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentStep + 1) / questions.length) * 100;
  }, [currentStep, questions.length]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(0);
      setAnswers({});
      setIsSubmitted(false);
      setHoveredStar(0);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-8 shadow-2xl"
        style={{ backgroundColor: COLORS.cardBackground }}
      >
        {!isSubmitted && (
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gray-100">
            <motion.div className="h-full rounded-r-full" style={{ backgroundColor: COLORS.primaryOrange }} initial={{ width: `${progress}%` }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        )}

        <button onClick={handleClose} className="absolute right-6 top-6 z-10 text-gray-400 transition-colors hover:text-gray-600">
          ✕
        </button>

        <AnimatePresence mode="wait">
          <motion.div key={isSubmitted ? 'success' : currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            {isSubmitted ? (
              <div className="py-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }} className="mb-6 text-6xl">
                  🎉
                </motion.div>
                <h3 className="mb-3 text-3xl font-bold" style={{ color: COLORS.headingPurple }}>
                  Thank You!
                </h3>
                <p className="mx-auto mb-8 max-w-xs text-gray-600">Your feedback helps us improve every order experience.</p>
                <button onClick={handleClose} className="rounded-xl px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: COLORS.primaryOrange }}>
                  Close
                </button>
              </div>
            ) : (
              <div className="py-4">
                <div className="mb-5 text-sm font-semibold uppercase tracking-wider" style={{ color: COLORS.primaryOrange }}>
                  Question {currentStep + 1} of {questions.length}
                </div>
                {survey?.description && currentStep === 0 && <p className="mb-4 text-sm text-gray-500">{survey.description}</p>}
                <h3 className="mb-6 text-2xl font-bold leading-snug" style={{ color: COLORS.headingPurple }}>
                  {currentQuestion?.question}
                </h3>

                {currentQuestion?.type === 'yes_no' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setAnswer(currentQuestion.id, { boolValue: true })} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${currentAnswer?.boolValue === true ? 'border-[#4B2E83] bg-[#EFE8FF] text-[#4B2E83]' : 'border-[#DCE2F8] bg-white text-[#4E5778]'}`}>
                      Yes
                    </button>
                    <button type="button" onClick={() => setAnswer(currentQuestion.id, { boolValue: false })} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${currentAnswer?.boolValue === false ? 'border-[#4B2E83] bg-[#EFE8FF] text-[#4B2E83]' : 'border-[#DCE2F8] bg-white text-[#4E5778]'}`}>
                      No
                    </button>
                  </div>
                ) : null}

                {currentQuestion?.type === 'short_text' || currentQuestion?.type === 'long_text' ? (
                  <textarea
                    rows={currentQuestion.type === 'long_text' ? 5 : 2}
                    value={currentAnswer?.textValue ?? ''}
                    onChange={(e) => setAnswer(currentQuestion.id, { textValue: e.target.value })}
                    placeholder="Type your response..."
                    className="w-full rounded-xl border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]"
                  />
                ) : null}

                {currentQuestion?.type === 'single_choice' ? (
                  <div className="space-y-2">
                    {(currentQuestion.options ?? []).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswer(currentQuestion.id, { optionValue: option })}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium ${currentAnswer?.optionValue === option ? 'border-[#4B2E83] bg-[#EFE8FF] text-[#4B2E83]' : 'border-[#DCE2F8] bg-white text-[#4E5778]'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}

                {currentQuestion?.type === 'multi_choice' ? (
                  <div className="space-y-2">
                    {(currentQuestion.options ?? []).map((option) => {
                      const selected = (currentAnswer?.optionValues ?? []).includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            const currentValues = currentAnswer?.optionValues ?? [];
                            const nextValues = selected ? currentValues.filter((item) => item !== option) : [...currentValues, option];
                            setAnswer(currentQuestion.id, { optionValues: nextValues });
                          }}
                          className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium ${selected ? 'border-[#4B2E83] bg-[#EFE8FF] text-[#4B2E83]' : 'border-[#DCE2F8] bg-white text-[#4E5778]'}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {!currentQuestion?.type || currentQuestion?.type === 'rating' ? (
                  <>
                    <div className="mb-3 min-h-5 text-center text-sm font-semibold text-[#6B769E]">
                      {activeRating > 0 ? ratingLabels[activeRating - 1] || `Rating ${activeRating}` : 'Select a rating'}
                    </div>
                    <div className="mb-4 flex justify-center gap-2 sm:gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setAnswer(currentQuestion.id, { rating: star })}
                          className="text-4xl sm:text-5xl focus:outline-none"
                        >
                          <span
                            style={{
                              color: (hoveredStar || currentAnswer?.rating || 0) >= star ? COLORS.primaryYellow : '#E5E7EB',
                            }}
                          >
                            ★
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    <div className="flex w-full items-center justify-between px-4 text-sm font-semibold text-gray-500">
                      <span className="flex-1 text-left">{edgeRatingLabels.left}</span>
                      <span className="flex-1 text-right">{edgeRatingLabels.right}</span>
                    </div>
                  </>
                ) : null}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 0 || submitting}
                    className="rounded-xl border border-[#D7DEF7] bg-white px-4 py-2.5 text-sm font-semibold text-[#4E5778] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-2">
                    {currentQuestion && !currentQuestion.isRequired ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={submitting}
                        className="rounded-xl border border-[#D7DEF7] bg-white px-4 py-2.5 text-sm font-semibold text-[#4E5778] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {currentStep === questions.length - 1 ? 'Skip & Submit' : 'Skip'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceed || submitting}
                      className="rounded-xl bg-[#4B2E83] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {currentStep === questions.length - 1 ? (submitting ? 'Submitting...' : 'Submit') : 'Next'}
                    </button>
                  </div>
                </div>
                {submitError ? <p className="mt-3 text-sm text-red-600">{submitError}</p> : null}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
