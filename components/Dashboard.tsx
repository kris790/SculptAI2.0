import React, { useMemo } from 'react';
import { useWorkouts } from '../lib/hooks/useWorkouts';
import { useProgressLogs } from '../lib/hooks/useProgressLogs';
import { LoadingSpinner } from './ui/LoadingSpinner';
import AIRecommendationsPanel from './ai/AIRecommendationsPanel';
import ProgressDashboard from './analytics/ProgressDashboard';

export default function Dashboard() {
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { logs, loading: logsLoading } = useProgressLogs();

  const totalWorkouts = workouts.length;
  const latestLog = logs.length > 0 ? logs[0] : null;
  
  const currentRatio = useMemo(() => {
    if (latestLog && latestLog.shoulders && latestLog.waist) {
      return (latestLog.shoulders / latestLog.waist).toFixed(2);
    }
    return 'N/A';
  }, [latestLog]);

  // Phase logic: Mocking 20 weeks to competition
  const weeksToComp = 18;
  const currentPhase = useMemo(() => {
    if (weeksToComp > 15) return { name: 'Muscle Building', target: 1.40, color: 'indigo' };
    if (weeksToComp > 4) return { name: 'The Cut', target: 1.48, color: 'emerald' };
    return { name: 'Peak Week', target: 1.50, color: 'amber' };
  }, [weeksToComp]);

  if (workoutsLoading || logsLoading) return <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Aesthetic HQ</h2>
          <p className="text-slate-400 text-sm">Quantifying your path to the stage.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comp Countdown</p>
          <p className="text-2xl font-black text-white">{weeksToComp} <span className="text-sm text-slate-500">Weeks</span></p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* V-TAPER RATIO CARD */}
        <div className="bg-slate-800/50 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">V-Taper Ratio</p>
            <p className="text-5xl font-black text-white">{currentRatio}</p>
            <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-indigo-500 h-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" 
                        style={{ width: `${Math.min(100, (parseFloat(currentRatio === 'N/A' ? '0' : currentRatio) / 1.5) * 100)}%` }}
                    ></div>
                </div>
                <span className="text-[10px] font-bold text-indigo-400">Target 1.50</span>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all"></div>
        </div>

        {/* PHASE STATUS CARD */}
        <div className={`bg-slate-800/50 border border-${currentPhase.color}-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden`}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Phase</p>
          <p className={`text-xl font-black text-${currentPhase.color}-400 mb-2`}>{currentPhase.name}</p>
          <div className="space-y-1">
             <p className="text-xs text-slate-300 font-medium flex justify-between">
                <span>Focus:</span>
                <span className="text-white">Hypertrophy</span>
             </p>
             <p className="text-xs text-slate-300 font-medium flex justify-between">
                <span>Calorie Delta:</span>
                <span className="text-white">+300 Surplus</span>
             </p>
          </div>
        </div>

        {/* TRAINING STATS */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Training</p>
          <p className="text-4xl font-black text-white">{totalWorkouts}</p>
          <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tighter">Workouts Completed</p>
        </div>

        {/* RECENT WEIGHT */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latest Weight</p>
          <p className="text-4xl font-black text-white">{latestLog?.weight || '--'} <span className="text-sm font-normal text-slate-500">lbs</span></p>
          <p className="text-xs text-emerald-400 mt-2 font-bold uppercase tracking-tighter">
            {latestLog && latestLog.body_fat_percentage ? `${latestLog.body_fat_percentage}% Body Fat` : 'BF% Not Logged'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AIRecommendationsPanel />
          <ProgressDashboard />
        </div>

        <div className="space-y-6">
          {/* Competition Benchmarks Sidebar */}
          <div className="bg-slate-800/80 rounded-2xl shadow-xl p-6 border border-slate-700">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="text-amber-500">🏆</span> Standard Ratios
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Beginner', ratio: '1.20 - 1.30', color: 'slate-500' },
                { label: 'Intermediate', ratio: '1.30 - 1.45', color: 'indigo-400' },
                { label: 'Classic Pro', ratio: '1.45 - 1.55', color: 'emerald-400' },
                { label: 'Golden Ratio', ratio: '1.618', color: 'amber-400' },
              ].map((b) => (
                <div key={b.label} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                  <span className="text-xs font-bold text-slate-400">{b.label}</span>
                  <span className={`text-sm font-black text-${b.color}`}>{b.ratio}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl shadow-xl p-6 border border-slate-700">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Recent Sessions</h3>
            {workouts.slice(0, 3).length === 0 ? (
              <p className="text-slate-500 text-center py-4 text-xs italic">No sessions logged.</p>
            ) : (
              <div className="space-y-3">
                {workouts.slice(0, 3).map((workout) => (
                  <div key={workout.id} className="p-3 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-indigo-500/50 transition-colors cursor-pointer group">
                    <p className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">{workout.workout_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                      {new Date(workout.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}