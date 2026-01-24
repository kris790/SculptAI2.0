'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAsyncAction } from '@/lib/hooks/useAsyncAction';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SparklesIcon } from '@/components/icons';
import { generateTrainingProgram } from '@/lib/ai/program-generator';

export default function ProgramGenerationPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { execute, loading } = useAsyncAction();
  const [protocol, setProtocol] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(true);

  useEffect(() => {
    const synthesize = async () => {
      const goal = localStorage.getItem('sculpt_onboarding_goal');
      const timeline = localStorage.getItem('sculpt_onboarding_timeline');
      const measurementsRaw = localStorage.getItem('sculpt_onboarding_measurements');
      const ratio = localStorage.getItem('sculpt_onboarding_ratio');

      if (!goal || !measurementsRaw || !user) {
        router.push('/onboarding/goals');
        return;
      }

      const measurements = JSON.parse(measurementsRaw);
      
      const aiData = {
        goal,
        currentRatio: ratio || '0.00',
        targetRatio: 1.61, // Aesthetic gold standard
        timelineWeeks: parseInt(timeline || '12'),
        bio: {
          gender: measurements.gender,
          age: measurements.age,
          height: measurements.height,
          weight: measurements.weight,
          experience: measurements.trainingExperience,
        }
      };

      const result = await generateTrainingProgram(aiData as any);
      setProtocol(result);
      setIsSynthesizing(false);
    };

    synthesize();
  }, [user, router]);

  const handleFinalize = async () => {
    if (!user || !protocol) return;

    await execute(async () => {
      const goal = localStorage.getItem('sculpt_onboarding_goal');
      const measurementsRaw = localStorage.getItem('sculpt_onboarding_measurements');
      const measurements = JSON.parse(measurementsRaw || '{}');

      // Update Profile
      await supabase.from('profiles').update({
        full_name: user.email?.split('@')[0] || 'Aesthetic Architect',
        fitness_goal: goal,
        age: parseInt(measurements.age),
        height: parseFloat(measurements.height),
        weight: parseFloat(measurements.weight),
        gender: measurements.gender,
      }).eq('id', user.id);

      // Update Social Profile
      await supabase.from('user_profiles').update({
        experience_level: (measurements.trainingExperience || 'beginner').charAt(0).toUpperCase() + measurements.trainingExperience.slice(1),
        bio: protocol
      }).eq('id', user.id);

      // Log initial scan
      await supabase.from('progress_logs').insert({
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        weight: parseFloat(measurements.weight),
        shoulders: parseFloat(measurements.shoulders),
        waist: parseFloat(measurements.waist),
        notes: `Initial Protocol Synthesis.`
      });

      // Clear onboarding storage
      localStorage.removeItem('sculpt_onboarding_goal');
      localStorage.removeItem('sculpt_onboarding_timeline');
      localStorage.removeItem('sculpt_onboarding_measurements');
      localStorage.removeItem('sculpt_onboarding_ratio');

      await refreshProfile();
      router.push('/');
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-['Space_Grotesk'] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        {isSynthesizing ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-8 animate-pulse">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)]">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Synthesizing Protocol</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI Architecture Engine v4.1 calibrating...</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-12 pb-20">
            <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Protocol Deployment</h1>
                <p className="text-indigo-400 font-black tracking-widest uppercase text-xs">Architectural Blueprint Ready</p>
              </div>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-5 rounded-2xl uppercase tracking-widest italic shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Deploy Architecture'}
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden prose prose-invert max-w-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-0" />
              <div className="relative z-10 leading-relaxed font-medium text-slate-300">
                {protocol?.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
