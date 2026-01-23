
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SparklesIcon } from '@/components/icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export default function MeasurementsPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    shoulders: '',
    waist: '',
    chest: '',
    arms: '',
    bodyFat: '',
    activityLevel: 'moderate',
    trainingExperience: 'beginner',
  });

  const currentRatio = useMemo(() => {
    const s = parseFloat(data.shoulders);
    const w = parseFloat(data.waist);
    if (s > 0 && w > 0) return (s / w).toFixed(2);
    return '0.00';
  }, [data.shoulders, data.waist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error: logError } = await supabase.from('progress_logs').insert({
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        weight: parseFloat(data.weight),
        shoulders: parseFloat(data.shoulders),
        waist: parseFloat(data.waist),
        chest: data.chest ? parseFloat(data.chest) : null,
        arms: data.arms ? parseFloat(data.arms) : null,
        body_fat_percentage: data.bodyFat ? parseFloat(data.bodyFat) : null,
        notes: `Structural scan from standalone portal. Experience: ${data.trainingExperience}.`
      });

      if (logError) throw logError;

      const { error: profileError } = await supabase.from('profiles').update({
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
        age: parseInt(data.age),
        gender: data.gender,
      }).eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      router.push('/');
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('Failed to save architectural data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-['Space_Grotesk']">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4 underline decoration-indigo-500 decoration-4 underline-offset-8">Body Metrics</h1>
          <p className="text-slate-400 font-medium text-lg">Accurate architectural measurements ensure precise AI calibration.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Biological Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Height (IN)</label>
                   <input
                    type="number" step="0.5" placeholder="72"
                    value={data.height}
                    onChange={(e) => setData({...data, height: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Weight (LBS)</label>
                   <input
                    type="number" step="0.1" placeholder="185.5"
                    value={data.weight}
                    onChange={(e) => setData({...data, weight: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age</label>
                   <input
                    type="number" placeholder="28"
                    value={data.age}
                    onChange={(e) => setData({...data, age: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                   <select
                    value={data.gender}
                    onChange={(e) => setData({...data, gender: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic outline-none"
                  >
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                    <option value="other">OTHER</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Symmetry Analytics (IN)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Shoulders*</label>
                  <input
                    type="number" step="0.1" placeholder="54.5"
                    value={data.shoulders}
                    onChange={(e) => setData({...data, shoulders: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Waist*</label>
                  <input
                    type="number" step="0.1" placeholder="32.5"
                    value={data.waist}
                    onChange={(e) => setData({...data, waist: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-center relative overflow-hidden">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current V-Taper Index</p>
                <p className="text-5xl font-black text-white italic tracking-tighter">{currentRatio}:1</p>
                {parseFloat(currentRatio) > 0 && parseFloat(currentRatio) < 1.4 && (
                  <p className="text-[10px] font-bold text-amber-500 mt-2 uppercase tracking-widest animate-pulse">
                    Focus needed on lateral development and core density reduction.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-8 italic">Training Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience Level</label>
                <select
                  value={data.trainingExperience}
                  onChange={(e) => setData({...data, trainingExperience: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic outline-none"
                >
                  <option value="beginner">BEGINNER (0-6 MONTHS)</option>
                  <option value="intermediate">INTERMEDIATE (6-24 MONTHS)</option>
                  <option value="advanced">ADVANCED (2-5 YEARS)</option>
                  <option value="elite">ELITE (5+ YEARS)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Metabolic Activity</label>
                <select
                  value={data.activityLevel}
                  onChange={(e) => setData({...data, activityLevel: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-4 text-white font-black italic outline-none"
                >
                  <option value="sedentary">SEDENTARY (OFFICE)</option>
                  <option value="light">LIGHT (1-2x WEEK)</option>
                  <option value="moderate">MODERATE (3-4x WEEK)</option>
                  <option value="active">ACTIVE (5-6x WEEK)</option>
                  <option value="very-active">EXTREME (2x DAILY)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase italic tracking-[0.2em] h-20 rounded-3xl shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Synthesizing Protocol...</span>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                Generate Elite Architecture
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
