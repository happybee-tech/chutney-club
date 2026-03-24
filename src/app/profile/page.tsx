'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/sections/Footer';
import { COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';

type Profile = {
  name: string;
  email: string;
  phone: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data?.success) {
          setProfile({
            name: data.data.name || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
          });
        } else {
          setMessage({ type: 'error', text: 'Failed to load profile details.' });
        }
      } catch {
        setMessage({ type: 'error', text: 'Network error loading profile.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: profile.name, phone: profile.phone })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully! 🎉' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data?.error?.message || 'Failed to update profile.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error saving profile.' });
    } finally {
      setSaving(false);
    }
  };

  function handleLogout() {
     fetch('/api/auth/logout', { method: 'POST' }).then(() => {
        window.location.href = '/signin';
     });
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.mainBackground }}>
      <Header scrolled />
      <section className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
          style={{ border: `1px solid ${COLORS.primaryOrange}20` }}
        >
          {/* Header Region */}
          <div className="relative h-36 flex items-center justify-center bg-gradient-to-br from-orange-100/80 to-yellow-50/80">
            <div 
              className="absolute -bottom-12 w-28 h-28 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-extrabold text-white uppercase"
              style={{ backgroundColor: COLORS.primaryOrange }}
            >
              {profile.name ? profile.name.charAt(0) : '👤'}
            </div>
          </div>

          <div className="pt-20 pb-8 px-8 sm:px-12">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black tracking-tight" style={{ color: COLORS.headingPurple }}>
                Your Profile
              </h1>
              <p className="text-sm font-medium mt-1 text-gray-500">Manage your personal information</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.primaryOrange }}></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                      message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
                    {message.text}
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: COLORS.headingPurple }}>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium"
                    style={{ outlineColor: COLORS.primaryOrange }}
                    placeholder="E.g. Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-gray-400">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed font-medium"
                  />
                  <p className="text-xs text-gray-400 mt-2 font-medium">To change your email address, please contact support.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: COLORS.headingPurple }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium"
                    style={{ outlineColor: COLORS.primaryOrange }}
                    placeholder="E.g. +91 9876543210"
                  />
                </div>

                <div className="pt-8 mt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors w-full sm:w-auto text-center py-2"
                  >
                    Sign Out
                  </button>

                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full sm:w-auto px-10 py-3.5 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                    style={{ 
                      backgroundColor: COLORS.primaryOrange,
                      boxShadow: `0 8px 20px -4px ${COLORS.primaryOrange}80`
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </section>
      <Footer />
    </main>
  );
}
