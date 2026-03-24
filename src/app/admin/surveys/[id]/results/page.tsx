'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { COLORS } from '@/lib/constants';

type QuestionResult = {
  id: string;
  question: string;
  type: 'rating' | 'yes_no' | 'short_text' | 'long_text' | 'single_choice' | 'multi_choice';
  sortOrder: number;
  isRequired: boolean;
  responseCount: number;
  answeredPct: number;
  averageRating: number | null;
  ratingLabels: string[] | null;
  distribution: { rating: number; count: number; percent: number }[] | null;
  optionStats: { option: string; count: number; percent: number }[] | null;
  yesNoStats: { yes: number; no: number; yesPct: number; noPct: number } | null;
  textSamples: string[] | null;
  textCount?: number | null;
};

type SurveyDetails = {
  id: string;
  name: string;
  brand: string;
  isActive: boolean;
  totalResponses: number;
};

type ResponseItem = {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  answers: Array<{
    questionId: string;
    question: string;
    type: 'rating' | 'yes_no' | 'short_text' | 'long_text' | 'single_choice' | 'multi_choice';
    rating: number | null;
    boolValue: boolean | null;
    textValue: string | null;
    optionValue: string | null;
    optionValues: string[];
  }>;
};

function PieChart({
  slices,
}: {
  slices: Array<{ label: string; value: number; color: string }>;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) {
    return <div className="h-24 w-24 rounded-full border border-[#E2E8FF] bg-[#F7FAFF]" />;
  }
  const gradient = slices
    .filter((slice) => slice.value > 0)
    .reduce(
      (acc, slice) => {
        const start = (acc.cursor / total) * 100;
        const nextCursor = acc.cursor + slice.value;
        const end = (nextCursor / total) * 100;
        acc.segments.push(`${slice.color} ${start}% ${end}%`);
        return { cursor: nextCursor, segments: acc.segments };
      },
      { cursor: 0, segments: [] as string[] }
    )
    .segments.join(', ');

  return <div className="h-24 w-24 rounded-full border border-[#E2E8FF]" style={{ background: `conic-gradient(${gradient})` }} />;
}

export default function SurveyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [survey, setSurvey] = useState<SurveyDetails | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [responses, setResponses] = useState<ResponseItem[]>([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/admin/surveys/${resolvedParams.id}/results`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to load results');
          return;
        }

        setSurvey(data.data.survey);
        setResults(data.data.results);
        setResponses(data.data.responses ?? []);
      } catch {
        setError('Network error while loading results');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [resolvedParams.id]);

  return (
    <AdminShell title="Survey Results">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/admin/surveys')}
          className="text-sm font-medium text-[#6B769E] hover:text-[#4B2E83] inline-flex items-center gap-1"
        >
          <span>←</span> Back to Surveys
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#7A84AA]">Loading results...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      ) : survey && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E2E8FF] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#7A84AA] uppercase tracking-wider mb-1">Survey</p>
              <p className="text-lg font-bold text-[#232B4A]">{survey.name}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8FF] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#7A84AA] uppercase tracking-wider mb-1">Brand</p>
              <p className="text-lg font-bold text-[#232B4A]">{survey.brand}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8FF] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#7A84AA] uppercase tracking-wider mb-1">Total Responses</p>
              <p className="text-lg font-bold text-[#232B4A]">{survey.totalResponses}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8FF] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#7A84AA] uppercase tracking-wider mb-1">Status</p>
              <div className="mt-1">
                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${survey.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                   {survey.isActive ? 'Active' : 'Disabled'}
                 </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8FF] p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#232B4A] mb-8">Question Breakdown</h3>
            
            <div className="space-y-8">
              {results.map((result, idx) => (
                <div key={result.id} className="border-b border-[#EEF2FF] pb-6 last:border-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                    <h4 className="text-[15px] font-semibold text-[#4E5778] max-w-2xl leading-relaxed">
                      <span className="text-[#9AA3BE] mr-2">{idx + 1}.</span>
                      {result.question}
                    </h4>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A84AA]">{result.type.replace('_', ' ')}</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#9AA3BE]">
                        {result.isRequired ? 'Required' : 'Optional'} • {result.responseCount} answers ({result.answeredPct}%)
                      </p>
                    </div>
                  </div>

                  {result.type === 'rating' ? (
                    <>
                      <div className="flex flex-col items-end mb-3">
                        <div className="text-2xl font-black" style={{ color: COLORS.primaryOrange }}>
                          {(result.averageRating ?? 0).toFixed(1)} <span className="text-sm font-medium text-[#7A84AA]">/ 5</span>
                        </div>
                        <p className="text-xs text-[#9AA3BE] mt-1">{result.responseCount} ratings</p>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${((result.averageRating ?? 0) / 5) * 100}%`,
                            backgroundColor: COLORS.primaryYellow,
                          }}
                        />
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                          {(result.distribution ?? []).map((row) => {
                            const label = result.ratingLabels?.[row.rating - 1] || `Rating ${row.rating}`;
                            return (
                              <div key={row.rating} className="flex items-center gap-3">
                                <div className="w-28 text-xs text-[#7A84AA]">{row.rating}★</div>
                                <div className="h-2 flex-1 rounded-full bg-[#EEF2FF]">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${row.percent}%`,
                                      backgroundColor: COLORS.primaryOrange,
                                    }}
                                  />
                                </div>
                                <div className="w-16 text-right text-xs text-[#7A84AA]">{row.count}</div>
                                <div className="hidden min-w-[160px] text-xs text-[#9AA3BE] sm:block">{label}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-center">
                          <PieChart
                            slices={(result.distribution ?? []).map((row, index) => ({
                              label: `${row.rating}★`,
                              value: row.count,
                              color: ['#3B2466', '#4B2E83', '#6B4CA9', '#8A6BC0', '#B39AD9'][index % 5],
                            }))}
                          />
                        </div>
                      </div>
                    </>
                  ) : null}

                  {result.type === 'yes_no' && result.yesNoStats ? (
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-[#E2E8FF] bg-[#F7FAFF] p-3">
                          Yes: <strong>{result.yesNoStats.yes}</strong> ({result.yesNoStats.yesPct}%)
                        </div>
                        <div className="rounded-lg border border-[#E2E8FF] bg-[#F7FAFF] p-3">
                          No: <strong>{result.yesNoStats.no}</strong> ({result.yesNoStats.noPct}%)
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <PieChart
                          slices={[
                            { label: 'Yes', value: result.yesNoStats.yes, color: '#4B2E83' },
                            { label: 'No', value: result.yesNoStats.no, color: '#C8D3F5' },
                          ]}
                        />
                      </div>
                    </div>
                  ) : null}

                  {(result.type === 'single_choice' || result.type === 'multi_choice') && result.optionStats ? (
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        {result.optionStats.length ? (
                          result.optionStats.map((option) => (
                            <div key={option.option} className="rounded-lg border border-[#E2E8FF] bg-[#F7FAFF] p-3 text-sm">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="font-semibold text-[#232B4A]">{option.option}</span>
                                <span className="text-xs text-[#7A84AA]">
                                  {option.count} ({option.percent}%)
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[#E7EDFF]">
                                <div
                                  className="h-full rounded-full bg-[#4B2E83]"
                                  style={{ width: `${Math.min(100, option.percent)}%` }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[#7A84AA]">No responses yet.</p>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <PieChart
                          slices={(result.optionStats ?? []).slice(0, 6).map((option, index) => ({
                            label: option.option,
                            value: option.count,
                            color: ['#4B2E83', '#6B4CA9', '#8A6BC0', '#A58AD6', '#C1A8E8', '#DDD0F3'][index % 6],
                          }))}
                        />
                      </div>
                    </div>
                  ) : null}

                  {(result.type === 'short_text' || result.type === 'long_text') && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A84AA]">
                        Text Responses: {result.textCount ?? result.textSamples?.length ?? 0}
                      </p>
                      {result.textSamples?.length ? (
                        result.textSamples.map((sample, sampleIndex) => (
                          <p key={sampleIndex} className="rounded-lg border border-[#E2E8FF] bg-[#F7FAFF] p-3 text-sm text-[#4E5778]">
                            {sample}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-[#7A84AA]">No responses yet.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {results.length === 0 && (
                <p className="text-[#7A84AA] italic">No questions found for this survey.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2E8FF] p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#232B4A] mb-2">Who Said What</h3>
            <p className="mb-6 text-sm text-[#7A84AA]">Latest 50 responses with user identity when available.</p>
            <div className="space-y-4">
              {responses.length ? (
                responses.map((response) => (
                  <div key={response.id} className="rounded-xl border border-[#E2E8FF] bg-[#FAFCFF] p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#232B4A]">
                          {response.user?.name || response.user?.email || 'Guest User'}
                        </p>
                        <p className="text-xs text-[#7A84AA]">{response.user?.email || 'No email available'}</p>
                      </div>
                      <p className="text-xs text-[#7A84AA]">{new Date(response.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="space-y-2">
                      {response.answers.map((answer) => {
                        const value =
                          answer.type === 'rating'
                            ? `${answer.rating ?? '-'} / 5`
                            : answer.type === 'yes_no'
                              ? answer.boolValue === null
                                ? '-'
                                : answer.boolValue
                                  ? 'Yes'
                                  : 'No'
                              : answer.type === 'single_choice'
                                ? answer.optionValue || '-'
                                : answer.type === 'multi_choice'
                                  ? answer.optionValues?.join(', ') || '-'
                                  : answer.textValue || '-';
                        return (
                          <div key={answer.questionId} className="rounded-lg border border-[#E9EEFF] bg-white p-3">
                            <p className="text-xs font-semibold text-[#667093]">{answer.question}</p>
                            <p className="mt-1 text-sm text-[#232B4A]">{value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#7A84AA] italic">No responses yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
