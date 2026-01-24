'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SparklesIcon, ChevronRightIcon } from '@/components/icons';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { useDummyData } from '@/context/DummyDataContext';

export default function MeasurementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentUser } = useDummyData();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<string | null>(null);
  
  const latestDummyStats = currentUser.measurements[currentUser.measurements.length - 1];

  useEffect(() => {
    const savedGoal = localStorage.getItem('sculpt_onboarding_goal');
    if (!savedGoal) {
      router.push('/onboarding/goals');
    } else {
      setGoal(savedGoal);
    }
  }, [router]);

  const [data, setData] = useState({
    height: '72',
    weight: latestDummyStats.weight.toString(),
    age: '28',
    gender: 'male',
    shoulders: latestDummyStats.shoulders.toString(),
    waist: latestDummyStats.waist.toString(),
    chest: '45.0',
    arms: '16.5',
    bodyFat: '12.0',
    activityLevel: 'moderate',
    trainingExperience: 'beginner',
  });

  const currentRatio = useMemo(() => {
    const s = parseFloat(data.shoulders);
    const w = parseFloat(data.waist);
    if (s > 0 && w > 0) return (s / w).toFixed(2);
    return '0.00';
  }, [data.shoulders, data.waist]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save current measurements to local storage for the program generation step
    localStorage.setItem('sculpt_onboarding_measurements', JSON.stringify(data));
    localStorage.setItem('sculpt_onboarding_ratio', currentRatio);
    router.push('/onboarding/program');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-['Space_Grotesk'] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4 underline decoration-indigo-500 decoration-4 underline-offset-8">Architectural Scan</h1>
          <p className="text-slate-400 font-medium text-lg">Precision metrics are mandatory for calibrated architecture.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Biological Baseline</h3>
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
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Symmetry Metrics (IN)</h3>
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
                {parseFloat(currentRatio) < 1.4 && parseFloat(currentRatio) > 0 && (
                  <p className="text-[10px] font-bold text-amber-400 mt-2 uppercase tracking-widest">
                    Trajectory focus: Lateral width expansion.
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-black uppercase italic tracking-[0.2em] h-20 rounded-3xl shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            Review Blueprint
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
