'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { COLORS } from '@/lib/constants';

type QuestionResult = {
  id: string;
  question: string;
  sortOrder: number;
  responseCount: number;
  averageRating: number;
};

type SurveyDetails = {
  id: string;
  name: string;
  brand: string;
  isActive: boolean;
  totalResponses: number;
};

export default function SurveyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [survey, setSurvey] = useState<SurveyDetails | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/admin/surveys/${resolvedParams.id}/results`, { credentials: 'include' });
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          setError(data?.error?.message ?? 'Failed to load results');
          return;
        }

        setSurvey(data.data.survey);
        setResults(data.data.results);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="flex flex-col items-end shrink-0">
                      <div className="text-2xl font-black" style={{ color: COLORS.primaryOrange }}>
                        {result.averageRating.toFixed(1)} <span className="text-sm font-medium text-[#7A84AA]">/ 5</span>
                      </div>
                      <p className="text-xs text-[#9AA3BE] mt-1">{result.responseCount} ratings</p>
                    </div>
                  </div>
                  
                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(result.averageRating / 5) * 100}%`,
                        backgroundColor: COLORS.primaryYellow 
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {results.length === 0 && (
                <p className="text-[#7A84AA] italic">No questions found for this survey.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
