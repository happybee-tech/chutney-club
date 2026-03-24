'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { DeleteIcon, EditIcon, PlusIcon, ToggleIcon, OverviewIcon } from '@/components/admin/icons';
import { RightDrawer } from '@/components/admin/RightDrawer';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

type Survey = {
  id: string;
  brandId: string;
  name: string;
  linkTitle: string;
  description: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  _count?: { responses: number };
  questions?: { id?: string; question: string; sortOrder: number }[];
};

export default function AdminSurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Survey | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null);

  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState([{ question: '' }]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [surveysRes, brandsRes] = await Promise.all([
        fetch('/api/admin/surveys', { credentials: 'include' }),
        fetch('/api/admin/brands', { credentials: 'include' })
      ]);
      const sData = await surveysRes.json();
      const bData = await brandsRes.json();
      
      if (sData.success) setSurveys(sData.data);
      if (bData.success) setBrands(bData.data);
    } catch {
      setError('Network error while loading data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditId(null);
    setBrandId('');
    setName('');
    setLinkTitle('');
    setDescription('');
    setIsActive(false);
    setStartDate(new Date().toISOString().split('T')[0]);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth.toISOString().split('T')[0]);
    
    setQuestions([{ question: '' }]);
  }

  function openAdd() {
    resetForm();
    if (brands.length > 0) setBrandId(brands[0].id);
    setDrawerOpen(true);
  }

  async function openEdit(survey: Survey) {
    resetForm();
    try {
      const res = await fetch(`/api/admin/surveys/${survey.id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        setEditId(s.id);
        setBrandId(s.brandId);
        setName(s.name);
        setLinkTitle(s.linkTitle);
        setDescription(s.description || '');
        setIsActive(s.isActive);
        setStartDate(s.startDate.split('T')[0]);
        setEndDate(s.endDate.split('T')[0]);
        if (s.questions && s.questions.length > 0) {
          setQuestions(s.questions);
        }
        setDrawerOpen(true);
      }
    } catch {
      setError('Failed to fetch survey details');
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      brandId,
      name,
      linkTitle,
      description,
      isActive,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      questions: questions.filter(q => q.question.trim() !== '')
    };

    if (payload.questions.length === 0) {
      setError('You must add at least one question.');
      return;
    }

    try {
      const url = editId ? `/api/admin/surveys/${editId}` : '/api/admin/surveys';
      const method = editId ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data?.error?.message ?? 'Failed to save survey');
        return;
      }

      setDrawerOpen(false);
      resetForm();
      loadData();
    } catch {
      setError('Network error while saving survey');
    }
  }

  async function deleteSurvey(survey: Survey) {
    try {
      await fetch(`/api/admin/surveys/${survey.id}`, { method: 'DELETE', credentials: 'include' });
      loadData();
    } catch {
      setError('Failed to delete');
    }
  }

  async function toggleActive(survey: Survey) {
    try {
      await fetch(`/api/admin/surveys/${survey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !survey.isActive }),
      });
      loadData();
    } catch {
      setError('Failed to update status');
    }
  }

  function addQuestion() {
    setQuestions([...questions, { question: '' }]);
  }
  function updateQuestion(index: number, val: string) {
    const newQ = [...questions];
    newQ[index].question = val;
    setQuestions(newQ);
  }
  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  return (
    <AdminShell title="Surveys">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#667093]">Manage brand feedback surveys and questions.</p>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B2E83] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3D256B]">
          <PlusIcon className="h-4 w-4" /> Create Survey
        </button>
      </div>

      {error && <p className="mt-2 mb-4 text-sm text-[#C7442A] bg-[#FFF7F8] p-3 rounded-lg border border-[#F1C6CC]">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E4E9FF] text-[#7A84AA]">
              <th className="py-2">Survey Name</th>
              <th className="py-2">Brand</th>
              <th className="py-2">Status</th>
              <th className="py-2">Responses</th>
              <th className="py-2">Timeline</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="py-4 text-[#7A84AA]" colSpan={6}>Loading surveys...</td></tr>
            ) : surveys.length === 0 ? (
              <tr><td className="py-4 text-[#7A84AA]" colSpan={6}>No surveys found.</td></tr>
            ) : (
              surveys.map((survey) => {
                const brand = brands.find(b => b.id === survey.brandId);
                return (
                  <tr key={survey.id} className="border-b border-[#EEF2FF] text-[#4E5778]">
                    <td className="py-3 font-medium text-[#232B4A]">{survey.name}</td>
                    <td className="py-3">{brand?.name || 'Unknown'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${survey.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {survey.isActive ? 'Active' : 'Draft/Disabled'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">{survey._count?.responses || 0}</td>
                    <td className="py-3">
                      {new Date(survey.startDate).toLocaleDateString()} - {new Date(survey.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => router.push(`/admin/surveys/${survey.id}/results`)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4B2E83] hover:bg-purple-50">
                          <OverviewIcon className="h-3.5 w-3.5" /> Results
                        </button>
                        <button type="button" onClick={() => openEdit(survey)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778] hover:bg-gray-50">
                          <EditIcon className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => setToggleTarget(survey)} className="inline-flex items-center gap-1 rounded-md border border-[#D7DEF7] bg-white px-3 py-1 text-xs font-semibold text-[#4E5778] hover:bg-gray-50">
                          <ToggleIcon className="h-3.5 w-3.5" /> {survey.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(survey)} className="inline-flex items-center gap-1 rounded-md border border-[#F1C6CC] bg-white px-3 py-1 text-xs font-semibold text-[#C7442A] hover:bg-red-50">
                          <DeleteIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editId ? 'Edit Survey' : 'Create Survey'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Brand</label>
            <select value={brandId} onChange={e => setBrandId(e.target.value)} required className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]">
              <option value="" disabled>Select Brand</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Internal Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Q1 Freshness Survey" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Footer Link Title</label>
            <input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} required placeholder="e.g. 🥗 Rate Your Recent Salad" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
            <p className="mt-1 text-xs text-[#7A84AA]">This is what users will see on the site button.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Intro Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Optional message inside the modal" className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4E5778]">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#4E5778]">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#5B6587] font-semibold mt-2">
            <input checked={isActive} onChange={(e) => setIsActive(e.target.checked)} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#4B2E83] focus:ring-[#4B2E83]" />
            Publish Survey (Active)
          </label>

          <div className="pt-4 border-t border-[#E4E9FF]">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-[#4E5778]">Questions</label>
              <button type="button" onClick={addQuestion} className="text-xs font-semibold text-[#4B2E83] hover:underline">+ Add Question</button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-bold text-[#7A84AA] w-4">{i + 1}.</span>
                  <input 
                    value={q.question} 
                    onChange={e => updateQuestion(i, e.target.value)} 
                    placeholder="Enter question text..." 
                    className="flex-1 rounded-lg border border-[#D7DEF7] bg-white px-3 py-2 text-sm text-[#232B4A]" 
                    required 
                  />
                  <button type="button" onClick={() => removeQuestion(i)} className="mt-2 text-[#C7442A] hover:opacity-70 p-1" title="Remove question">
                    <DeleteIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full rounded-lg bg-[#4B2E83] px-4 py-3 text-sm font-bold text-white shadow hover:bg-[#3D256B] transition-colors">
              {editId ? 'Save Changes' : 'Create Survey'}
            </button>
          </div>
        </form>
      </RightDrawer>

      <ConfirmModal 
         open={Boolean(toggleTarget)} 
         title={toggleTarget?.isActive ? 'Disable Survey' : 'Enable Survey'} 
         message={`Change status of ${toggleTarget?.name}?`} 
         confirmLabel={toggleTarget?.isActive ? 'Disable' : 'Enable'} 
         onClose={() => setToggleTarget(null)} 
         onConfirm={async () => {
           if (!toggleTarget) return;
           const target = toggleTarget;
           setToggleTarget(null);
           await toggleActive(target);
         }} 
      />
      <ConfirmModal 
         open={Boolean(deleteTarget)} 
         title="Delete Survey" 
         message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`} 
         confirmLabel="Delete" 
         onClose={() => setDeleteTarget(null)} 
         onConfirm={async () => {
           if (!deleteTarget) return;
           const target = deleteTarget;
           setDeleteTarget(null);
           await deleteSurvey(target);
         }} 
      />

    </AdminShell>
  );
}
