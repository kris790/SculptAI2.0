'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GoalCard } from '@/components/onboarding/GoalCard';
import { ChevronRightIcon } from '@/components/icons';

const goals = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Focus on fat loss while maintaining muscle and skeletal structure.',
    icon: '⚖️',
    targetRatio: 1.4,
    timeline: [12, 16, 20],
  },
  {
    id: 'build_muscle',
    title: 'Gain Muscle',
    description: 'Build lean mass with hypertrophy focus to widen the skeletal frame.',
    icon: '💪',
    targetRatio: 1.5,
    timeline: [16, 20, 24],
  },
  {
    id: 'body_recomp',
    title: 'Body Recomposition',
    description: 'Lose fat and gain muscle simultaneously for elite symmetry refinement.',
    icon: '🔄',
    targetRatio: 1.45,
    timeline: [16, 20, 24],
  },
  {
    id: 'competition_prep',
    title: 'Competition Prep',
    description: '27-week stage-ready physique development and extreme conditioning.',
    icon: '🏆',
    targetRatio: 1.5,
    timeline: [27],
  },
];

export default function GoalsPage() {
  const router = useRouter();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<number | null>(null);

  const activeGoal = useMemo(() => goals.find(g => g.id === selectedGoalId), [selectedGoalId]);

  const handleContinue = () => {
    if (selectedGoalId && selectedTimeline) {
      localStorage.setItem('sculpt_onboarding_goal', selectedGoalId);
      localStorage.setItem('sculpt_onboarding_timeline', selectedTimeline.toString());
      router.push('/onboarding/measurements');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-['Space_Grotesk'] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4 underline decoration-indigo-500 decoration-4 underline-offset-8">Aesthetic Trajectory</h1>
          <p className="text-slate-400 font-medium text-lg">Define your primary objective to calibrate your architecture protocol.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              {...goal}
              isSelected={selectedGoalId === goal.id}
              onSelect={() => {
                setSelectedGoalId(goal.id);
                setSelectedTimeline(goal.timeline[0]);
              }}
            />
          ))}
        </div>

        {selectedGoalId && (
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 animate-fade-in">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">Phase Duration (Weeks)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeGoal?.timeline.map((weeks) => (
                <button
                  key={weeks}
                  onClick={() => setSelectedTimeline(weeks)}
                  className={`py-4 rounded-2xl font-black text-xs uppercase italic transition-all ${
                    selectedTimeline === weeks
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  {weeks} Weeks
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8">
          <button
            onClick={handleContinue}
            disabled={!selectedGoalId || !selectedTimeline}
            className="w-full bg-white text-black font-black uppercase italic tracking-[0.2em] h-20 rounded-3xl shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
          >
            Continue to Measurements
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
