
import React, { useMemo } from 'react';
import { useWorkouts } from '../lib/hooks/useWorkouts';
import { useProgressLogs } from '../lib/hooks/useProgressLogs';
import { LoadingSpinner } from './ui/LoadingSpinner';
import AIRecommendationsPanel from './ai/AIRecommendationsPanel';
import ProgressDashboard from './analytics/ProgressDashboard';
import { SparklesIcon } from './icons';

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

  const weeksOfConsistency = 6;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {workoutsLoading || logsLoading ? (
        <div className="flex justify-center items-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Athletic Hub</h2>
              <p className="text-slate-400 font-medium text-lg">Your foundation for an elite physique.</p>
            </div>
            <div className="bg-indigo-600/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-left">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Training Streak</p>
                <p className="text-xl font-black text-white italic">{weeksOfConsistency} WEEKS</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">🔥</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-0" />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Physique Ratio</p>
                <p className="text-5xl font-black text-white italic tracking-tighter">{currentRatio}</p>
                <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" 
                            style={{ width: `${Math.min(100, (parseFloat(currentRatio === 'N/A' ? '0' : currentRatio) / 1.5) * 100)}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1.50</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl group hover:border-emerald-500/30 transition-all">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Current Phase</p>
              <p className="text-2xl font-black text-white italic mb-4 uppercase tracking-tight">Form Foundations</p>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Program</span>
                    <span className="text-emerald-400">BEGINNER ELITE</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl hover:border-white/20 transition-all">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Training</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">{totalWorkouts}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Sessions Logged</p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl hover:border-white/20 transition-all">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Mass Tracking</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">{latestLog?.weight || '--'}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">LBS (Imperial)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <AIRecommendationsPanel />
              <ProgressDashboard />
            </div>

            <div className="space-y-8">
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-0" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 italic">Sculpting Goals</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Movement Mechanics', progress: 85, color: 'bg-indigo-500' },
                    { label: 'Symmetry Index', progress: 42, color: 'bg-indigo-400' },
                    { label: 'Lat Width Intensity', progress: 30, color: 'bg-cyan-500' },
                  ].map((goal) => (
                    <div key={goal.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">{goal.label}</span>
                        <span className="text-white">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${goal.color} shadow-[0_0_8px_rgba(99,102,241,0.3)]`} style={{ width: `${goal.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 4 Teaser: Pose Architecture */}
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 relative group overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Next Evolution</h4>
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Pose Architecture</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6">
                  Unlock AI-powered live posing feedback to maximize your frame's visual impact on stage.
                </p>
                <button className="w-full bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-400 hover:text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest transition-all">
                  Get Early Access
                </button>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 relative group overflow-hidden">
                <p className="text-sm text-indigo-200 leading-relaxed font-bold italic">
                  "Architecture before decoration. Master the compound patterns now; the aesthetic details will follow the strength."
                </p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4">— ELITE COACH CORE</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
